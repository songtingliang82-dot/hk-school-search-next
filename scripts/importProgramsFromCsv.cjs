const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const csv = require("csvtojson");

const DEFAULT_SOURCE = "all_hk_programs.xlsx - all_hk_programs.csv";
const DEFAULT_DESCRIPTION =
  "该专业面向希望拓展香港高校学习与职业发展机会的申请者，课程信息请以院校官网最新公布为准。";
const DEFAULT_CURRICULUM =
  "课程设置、选修方向及毕业要求请参考项目官方网站的最新说明。";

const UNIVERSITY_NAME_MAP = [
  { patterns: ["香港大学", "the university of hong kong", "hku"], name: "香港大学" },
  { patterns: ["香港中文大学", "the chinese university of hong kong", "cuhk"], name: "香港中文大学" },
  { patterns: ["香港科技大学", "hong kong university of science and technology", "hkust"], name: "香港科技大学" },
  { patterns: ["香港理工大学", "the hong kong polytechnic university", "polyu"], name: "香港理工大学" },
  { patterns: ["香港城市大学", "city university of hong kong", "cityu"], name: "香港城市大学" },
  { patterns: ["香港浸会大学", "hong kong baptist university", "hkbu"], name: "香港浸会大学" },
  { patterns: ["岭南大学", "lingnan university", "lingnan"], name: "岭南大学" },
  { patterns: ["香港教育大学", "the education university of hong kong", "eduhk"], name: "香港教育大学" },
];

const WEBSITE_RULES = [
  {
    university: "香港大学",
    url: "https://www.hku.hk/",
    faculties: [
      { patterns: ["architecture", "建筑学院"], url: "https://www.arch.hku.hk/" },
      { patterns: ["business", "经管学院", "商学院", "港大经管学院"], url: "https://www.hkubs.hku.hk/" },
      { patterns: ["education", "教育学院"], url: "https://web.edu.hku.hk/" },
      { patterns: ["engineering", "工程学院"], url: "https://engg.hku.hk/" },
      { patterns: ["law", "法律学院"], url: "https://www.law.hku.hk/" },
      { patterns: ["medicine", "李嘉诚医学院", "医学院"], url: "https://www.med.hku.hk/" },
      { patterns: ["science", "理学院"], url: "https://www.sci.hku.hk/" },
      { patterns: ["social sciences", "社会科学学院", "社会科学院"], url: "https://www.socsc.hku.hk/" },
    ],
  },
  {
    university: "香港中文大学",
    url: "https://www.cuhk.edu.hk/",
    faculties: [
      { patterns: ["business", "商学院", "工商管理学院"], url: "https://www.bschool.cuhk.edu.hk/" },
      { patterns: ["engineering", "工程学院"], url: "https://www.erg.cuhk.edu.hk/" },
    ],
  },
  {
    university: "香港科技大学",
    url: "https://hkust.edu.hk/",
    faculties: [{ patterns: ["business", "商学院", "工商管理"], url: "https://bm.hkust.edu.hk/" }],
  },
  { university: "香港理工大学", url: "https://www.polyu.edu.hk/", faculties: [] },
  { university: "香港城市大学", url: "https://www.cityu.edu.hk/", faculties: [] },
  { university: "香港浸会大学", url: "https://www.hkbu.edu.hk/", faculties: [] },
  { university: "岭南大学", url: "https://www.ln.edu.hk/", faculties: [] },
  { university: "香港教育大学", url: "https://www.eduhk.hk/", faculties: [] },
];

const SUBJECT_RULES = [
  { tag: "商科", patterns: ["商科", "商业", "商务", "会计", "金融", "经济", "管理", "marketing", "business", "finance", "account", "economics", "management"] },
  { tag: "计算机", patterns: ["计算机", "数据", "人工智能", "信息技术", "computer", "data", "ai", "artificial intelligence", "information technology"] },
  { tag: "教育", patterns: ["教育", "teaching", "education", "tesol"] },
  { tag: "工程", patterns: ["工程", "engineering", "mechanical", "civil", "electronic", "electrical"] },
  { tag: "艺术", patterns: ["艺术", "设计", "传媒", "创意", "art", "design", "media", "creative"] },
  { tag: "理学", patterns: ["理学", "科学", "物理", "化学", "数学", "science", "physics", "chemistry", "mathematics", "biology"] },
  { tag: "法学", patterns: ["法律", "法学", "law", "legal"] },
  { tag: "社会科学", patterns: ["社会科学", "社会", "心理", "公共政策", "social", "psychology", "policy"] },
];

function includesAny(value, patterns) {
  const normalized = String(value ?? "").toLowerCase();
  return patterns.some((pattern) => normalized.includes(String(pattern).toLowerCase()));
}

function normalizeUniversity(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "香港高校";
  const match = UNIVERSITY_NAME_MAP.find((item) => includesAny(raw, item.patterns));
  return match?.name ?? raw;
}

function normalizeHeader(value) {
  return String(value ?? "").replace(/^\uFEFF/, "").trim().toLowerCase();
}

function getValue(row, aliases) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const key = Object.keys(row).find((item) => normalizeHeader(item) === normalizedAlias);
    const value = key ? row[key] : undefined;
    if (value !== undefined && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function splitTags(value) {
  return String(value ?? "")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTuition(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "学费暂未公布";
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return raw;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return raw;
  return `HK$ ${Math.round(amount).toLocaleString("en-US")}`;
}

function getDegreeTag(nameEn) {
  const name = String(nameEn ?? "").toLowerCase();
  if (/\b(phd|mphil)\b/.test(name)) return "研究型硕士/博士";
  if (/\b(msc|ma|med)\b/.test(name)) return "授课型硕士";
  return "";
}

function getSubjectTag(discipline, faculty, nameCn, nameEn) {
  if (includesAny(discipline, ["社会科学", "social science", "social sciences"])) {
    return "社会科学";
  }

  const disciplineMatch = SUBJECT_RULES.find((rule) => includesAny(discipline, rule.patterns));
  if (disciplineMatch) return disciplineMatch.tag;

  const fallbackText = [faculty, nameCn, nameEn].filter(Boolean).join(" ");
  return SUBJECT_RULES.find((rule) => includesAny(fallbackText, rule.patterns))?.tag ?? "";
}

function getOfficialWebsite(university, faculty) {
  const universityRule = WEBSITE_RULES.find((rule) => rule.university === university);
  if (!universityRule) return "";
  const facultyRule = universityRule.faculties.find((rule) => includesAny(faculty, rule.patterns));
  return facultyRule?.url ?? universityRule.url;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function decodeXml(value) {
  return String(value ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function getZipEntries(buffer) {
  const entries = new Map();
  let eocdOffset = -1;

  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) throw new Error("Invalid XLSX file: cannot find zip directory.");

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end && buffer.readUInt32LE(offset) === 0x02014b50) {
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    entries.set(name, { method, compressedSize, localHeaderOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  function readEntry(name) {
    const entry = entries.get(name);
    if (!entry) return "";
    const localOffset = entry.localHeaderOffset;
    const fileNameLength = buffer.readUInt16LE(localOffset + 26);
    const extraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + fileNameLength + extraLength;
    const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);

    if (entry.method === 0) return compressed.toString("utf8");
    if (entry.method === 8) return zlib.inflateRawSync(compressed).toString("utf8");
    throw new Error(`Unsupported zip compression method ${entry.method} for ${name}`);
  }

  return { readEntry };
}

function extractXmlText(xml) {
  return [...String(xml ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
    .map((match) => decodeXml(match[1]))
    .join("");
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((match) => extractXmlText(match[1]));
}

function columnIndex(cellRef) {
  const letters = String(cellRef ?? "").replace(/\d+/g, "");
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + letter.toUpperCase().charCodeAt(0) - 64;
  }
  return index - 1;
}

function parseWorksheet(xml, sharedStrings) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/\br="([^"]+)"/)?.[1] ?? "";
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? "";
      const index = ref ? columnIndex(ref) : row.length;
      const raw = body.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "";
      const value = type === "inlineStr" ? extractXmlText(body) : type === "s" ? sharedStrings[Number(raw)] ?? "" : decodeXml(raw);
      row[index] = value;
    }
    rows.push(row.map((value) => value ?? ""));
  }
  return rows.filter((items) => items.some((item) => String(item).trim() !== ""));
}

function xlsxRowsToObjects(rows) {
  const headers = rows[0].map((header) => String(header ?? "").trim());
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function parseXlsx(filePath) {
  const zip = getZipEntries(fs.readFileSync(filePath));
  const workbook = zip.readEntry("xl/workbook.xml");
  const rels = zip.readEntry("xl/_rels/workbook.xml.rels");
  const sharedStrings = parseSharedStrings(zip.readEntry("xl/sharedStrings.xml"));
  const firstSheetRelId = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1];
  if (!firstSheetRelId) throw new Error("No worksheet found in workbook.");

  const relPattern = new RegExp(`<Relationship[^>]*Id="${firstSheetRelId}"[^>]*Target="([^"]+)"[^>]*/>`);
  const target = rels.match(relPattern)?.[1];
  if (!target) throw new Error(`No worksheet relationship found for ${firstSheetRelId}.`);

  const worksheetPath = path.posix.normalize(`xl/${target}`);
  return xlsxRowsToObjects(parseWorksheet(zip.readEntry(worksheetPath), sharedStrings));
}

function toProgram(row, index) {
  const nameCn = getValue(row, ["NameZH", "专业名称"]) || "未命名专业";
  const nameEn = getValue(row, ["NameEN", "英文名称"]) || "Unnamed Programme";
  const university = normalizeUniversity(getValue(row, ["University", "School", "SchoolName", "SchoolAlias", "学校", "院校"]));
  const faculty = getValue(row, ["Department", "Faculty", "学院"]) || "未公布学院";
  const discipline = getValue(row, ["Discipline", "学科", "专业方向"]);
  const intake = getValue(row, ["Intake", "入学时间", "开学时间"]);
  const degreeTag = getDegreeTag(nameEn);
  const subjectTag = getSubjectTag(discipline, faculty, nameCn, nameEn);

  return {
    id: `hk-prog-${index + 1}`,
    name_cn: nameCn,
    name_en: nameEn,
    university,
    faculty,
    tuition: formatTuition(getValue(row, ["TuitionHKD", "Tuition", "学费"])),
    tags: unique([...splitTags(getValue(row, ["Tags", "标签"])), degreeTag, subjectTag]),
    official_website: getOfficialWebsite(university, faculty),
    desc: getValue(row, ["Distinctive", "特色", "项目特色"]) || DEFAULT_DESCRIPTION,
    requirements: {
      background: discipline ? `学科背景：${discipline}` : "暂无明确学科背景要求",
      language: "通常要求雅思 6.0 或 托福 80",
      standardized: "部分热门专业建议提交 GMAT/GRE",
      others: "需提供PS、CV及两封推荐信",
      timeline: intake ? `入学时间：${intake}` : "具体申请轮次及截止日期请以官网为准",
    },
    curriculum: DEFAULT_CURRICULUM,
  };
}

function serializePrograms(programs) {
  return `export const programs = ${JSON.stringify(programs, null, 2)};

export type Program = (typeof programs)[number];

export type University = {
  id: string;
  name_cn: string;
  name_en: string;
  location: string;
  logo_url: string;
  qs_rank: number | string;
  programs_count: number;
  official_website: string;
};

function slugifyUniversity(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\\u4e00-\\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const universities: University[] = Array.from(
  programs.reduce((items, program) => {
    const current = items.get(program.university);
    if (current) {
      current.programs_count += 1;
      if (!current.official_website && program.official_website) {
        current.official_website = program.official_website;
      }
      return items;
    }

    items.set(program.university, {
      id: slugifyUniversity(program.university) || \`hk-university-\${items.size + 1}\`,
      name_cn: program.university,
      name_en: program.university,
      location: "Hong Kong",
      logo_url: "",
      qs_rank: "N/A",
      programs_count: 1,
      official_website: program.official_website,
    });

    return items;
  }, new Map<string, University>()).values(),
);
`;
}

async function readSource(sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (extension === ".csv") {
    return csv({ trim: true }).fromFile(sourcePath);
  }
  if (extension === ".xlsx") {
    return parseXlsx(sourcePath);
  }
  throw new Error(`Unsupported source extension: ${extension}. Use .csv or .xlsx.`);
}

async function main() {
  const sourcePath = path.resolve(process.cwd(), process.argv[2] || DEFAULT_SOURCE);
  const outputPath = path.resolve(process.cwd(), "src/data/programs.ts");

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    console.error(`Usage: node scripts/importProgramsFromCsv.cjs "${DEFAULT_SOURCE}"`);
    process.exit(1);
  }

  const rows = await readSource(sourcePath);
  const programs = rows.map((row, index) => toProgram(row, index));
  fs.writeFileSync(outputPath, serializePrograms(programs), "utf8");
  console.log(`Wrote ${programs.length} programs to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
