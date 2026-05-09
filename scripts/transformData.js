/**
 * 将根目录 raw_hku.json 转为前端 src/data/programs.ts 中的 programs 数组。
 *
 * 运行：node scripts/transformData.js
 *
 * 支持：任意层级中出现的「对象数组」；嵌套 requirements；顶层/扁平字段混合。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw_hku.json");
const OUT_PATH = path.join(ROOT, "src", "data", "programs.ts");

const TYPES_HEADER = `export type ProgramRequirements = {
  background: string;
  language: string;
  standardized: string;
  others: string;
  timeline: string;
};

export type Program = {
  id: string;
  name_cn: string;
  name_en: string;
  university: string;
  faculty: string;
  tuition: string;
  tags: string[];
  desc: string;
  requirements: ProgramRequirements;
  curriculum: string;
};

`;

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function pick(obj, keys, fallback = "") {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      if (Array.isArray(v)) return v.map((x) => String(x)).join("；");
    }
  }
  return fallback;
}

function pickNum(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined || v === null || v === "") continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

/** 收集 JSON 树中所有 Array 节点（含嵌套） */
function collectAllArrays(node, out = []) {
  if (node === null || node === undefined) return out;
  if (Array.isArray(node)) {
    out.push(node);
    for (const el of node) collectAllArrays(el, out);
    return out;
  }
  if (isPlainObject(node)) {
    for (const v of Object.values(node)) collectAllArrays(v, out);
  }
  return out;
}

function isRecordArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every((x) => x !== null && typeof x === "object" && !Array.isArray(x));
}

/** 更像「专业一条记录」的数组打分（用于在多个数组里择优） */
function scoreRecordArray(arr) {
  const sample = arr[0];
  if (!sample || typeof sample !== "object") return -1;
  const keys = Object.keys(sample);
  let s = Math.min(keys.length, 30);
  const hints = [
    "name_zh",
    "name_en",
    "name_cn",
    "programName",
    "program_name_zh",
    "program_name_en",
    "schoolname",
    "school_name",
    "university",
    "department",
    "faculty",
    "tuition_fee",
    "tuition",
    "id",
    "requirements",
    "distinctive",
    "description",
  ];
  for (const h of hints) {
    if (Object.prototype.hasOwnProperty.call(sample, h)) s += 12;
  }
  return s + arr.length * 0.0001;
}

/**
 * 从任意深度找出「对象数组」作为专业列表：
 * 1) 根为数组且元素为对象 → 直接用
 * 2) 否则遍历整棵树收集所有数组，筛掉非对象数组、空数组，按 score 取最优
 */
function extractList(raw) {
  if (Array.isArray(raw) && isRecordArray(raw)) return raw;

  const allArrays = collectAllArrays(raw, []);
  const candidates = allArrays.filter(isRecordArray).filter((a) => a.length > 0);

  if (candidates.length === 0) return [];

  candidates.sort((a, b) => scoreRecordArray(b) - scoreRecordArray(a));
  return candidates[0];
}

function normalizeTags(item, nameCn) {
  let tags = item.tags;
  if (typeof tags === "string") {
    tags = tags
      .split(/[,，;；|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(tags)) tags = [];

  const inferred = [];
  const n = nameCn || pick(item, ["name_zh", "name_cn", "majorCategory", "programName"]);
  const en = pick(item, ["name_en", "programName"]);
  if (/博士/.test(n)) inferred.push("博士");
  if (/硕士|理学硕士|文学硕士|工商|MBA|MSc|MA\b|LLM/i.test(n + en)) inferred.push("硕士");
  if (/学士|本科|Bachelor|BSc|BA\b|BEng/i.test(n + en)) inferred.push("本科");

  const fac = pick(item, ["department", "faculty", "college"]);
  if (fac && fac !== "各院系") inferred.push(fac);

  const merged = [...tags, ...inferred].map((t) => String(t).trim()).filter(Boolean);
  return [...new Set(merged)].slice(0, 10);
}

function formatTuition(item) {
  const rawStr = pick(item, ["tuition", "tuition_fee_text", "fee", "学费", "tuitionText"]);
  if (rawStr) return rawStr;

  const fee = pickNum(item, ["tuition_fee", "tuitionFee", "fee_hkd", "fee", "price"]);
  if (fee !== null) return `HK$ ${fee.toLocaleString("en-HK")} / 年`;
  return "以官网为准";
}

function makeId(item, index) {
  if (item.id !== undefined && item.id !== null && String(item.id).trim() !== "") {
    return `hku-${String(item.id).replace(/\s+/g, "-")}`;
  }
  const slug = pick(item, ["name_en", "name_zh", "name_cn", "programName"])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `hku-pg-${slug || "program"}-${index}`;
}

function buildTimeline(item, nestedReq) {
  const src = nestedReq && isPlainObject(nestedReq) ? nestedReq : null;
  return (
    pick(src, ["timeline", "apply_time", "deadline", "application_deadline"]) ||
    pick(item, [
      "timeline",
      "apply_time",
      "apply_deadline",
      "deadline",
      "application_deadline",
      "申请时间",
      "申请截止",
    ]) ||
    (item.intake || item.intake_month
      ? `${item.intake || ""} 年 ${item.intake_month || ""} 月入学节点（请以官网为准）`.replace(/^\s*年/, "年")
      : "请查阅官网最新申请时间线")
  );
}

/** 扁平 + 嵌套 requirements 安全合并（嵌套优先） */
function buildRequirements(item) {
  const nested = isPlainObject(item.requirements) ? item.requirements : null;

  const background =
    pick(nested, ["background", "bg_requirement", "admission_background", "entry_requirement"]) ||
    pick(item, ["background", "bg_requirement", "admission_background", "entry_requirement", "背景要求"]);

  const language =
    pick(nested, ["language", "languageRequirement", "language_requirement", "ielts", "ielts_toefl"]) ||
    pick(item, [
      "languageRequirement",
      "language_requirement",
      "language",
      "ielts",
      "ielts_toefl",
      "语言要求",
    ]);

  const standardized =
    pick(nested, ["standardized", "exam_requirement", "gre_gmat", "gmat", "gre"]) ||
    pick(item, ["standardized", "exam_requirement", "gre_gmat", "标化", "标准化"]);

  const others =
    pick(nested, ["others", "other_requirements", "remark", "notes"]) ||
    pick(item, ["others", "other_requirements", "remark", "notes", "gpaRequirement", "其他要求"]);

  const timeline =
    pick(nested, ["timeline", "apply_time", "deadline"]) || buildTimeline(item, nested);

  return {
    background: background || "以官网或招生简章为准。",
    language: language || "以官网语言要求为准。",
    standardized: standardized || "以官网标化要求为准。",
    others: others || "以官网其他说明为准。",
    timeline: timeline || "请查阅官网最新申请时间线。",
  };
}

function mapItem(item, index) {
  const name_cn = pick(item, [
    "name_zh",
    "name_cn",
    "majorCategory",
    "title_zh",
    "program_name_zh",
    "chinese_name",
  ]);
  const name_en = pick(item, ["name_en", "programName", "title_en", "program_name_en", "english_name"]);
  const university = pick(item, ["schoolname", "school_name", "university", "school", "学校"], "香港大学");
  const faculty = pick(item, ["department", "faculty", "college", "学院", "院系"], "各院系");

  const desc =
    pick(item, ["description", "desc", "summary", "intro", "overview", "distinctive", "简介"]) ||
    "暂无简介，请以官网为准。";

  const requirements = buildRequirements(item);

  const curriculum =
    pick(isPlainObject(item.curriculum) ? item.curriculum : null, ["summary", "text", "desc"]) ||
    pick(item, [
      "curriculum",
      "courses_text",
      "course_list",
      "courses",
      "课程",
      "课程设置",
    ]) ||
    (typeof item.curriculum === "string" ? item.curriculum : "");

  return {
    id: makeId(item, index),
    name_cn: name_cn || `专业-${index + 1}`,
    name_en: name_en || "",
    university,
    faculty,
    tuition: formatTuition(item),
    tags: normalizeTags(item, name_cn),
    desc,
    requirements,
    curriculum: curriculum || "课程设置请查阅官网。",
  };
}

function preserveUniversitiesTail(existingContent) {
  const marker = "\n\nexport type University";
  const idx = existingContent.indexOf(marker);
  if (idx === -1) {
    console.warn("⚠️ 未在 programs.ts 中找到 University 段落，将只写入 types + programs（请手动补 universities）。");
    return "";
  }
  return existingContent.slice(idx);
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error("❌ 找不到", RAW_PATH);
    process.exit(1);
  }

  const rawText = fs.readFileSync(RAW_PATH, "utf8").trim();
  if (rawText.startsWith("const ") || rawText.startsWith("function ") || rawText.startsWith("//")) {
    console.error(
      "❌ raw_hku.json 当前内容不是合法 JSON（检测到 JS 代码）。请将爬虫输出保存为纯 JSON 后再运行本脚本。",
    );
    process.exit(1);
  }

  let raw;
  try {
    raw = JSON.parse(rawText);
  } catch (e) {
    console.error("❌ JSON.parse 失败:", e.message);
    process.exit(1);
  }

  const list = extractList(raw);

  if (list.length === 0) {
    const hasEmptyDataData =
      isPlainObject(raw) &&
      isPlainObject(raw.data) &&
      Array.isArray(raw.data.data) &&
      raw.data.data.length === 0;
    console.warn(
      hasEmptyDataData
        ? "⚠️ 已识别结构为 { data: { data: [] } }，但数组为空。请把爬虫抓到的专业列表粘贴进 data.data 后再运行。"
        : "⚠️ 在 JSON 全树中未找到任何「非空的对象数组」。请确认专业列表是否为数组，且元素为对象（含 name_zh / name_en 等字段）。仍将写入 programs: []。",
    );
  } else {
    console.log(`ℹ️ 已锁定专业列表数组，共 ${list.length} 条（自任意层级自动识别）。`);
  }

  const programs = list.map((item, i) => mapItem(item, i));

  let tail = "";
  if (fs.existsSync(OUT_PATH)) {
    tail = preserveUniversitiesTail(fs.readFileSync(OUT_PATH, "utf8"));
  }

  const programsBlock = `export const programs: Program[] = ${JSON.stringify(programs, null, 2)};`;

  const out = `${TYPES_HEADER}${programsBlock}${tail || "\n"}`;
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, out, "utf8");

  console.log(`✅ 已写入 ${programs.length} 条记录 → ${path.relative(ROOT, OUT_PATH)}`);
}

main();
