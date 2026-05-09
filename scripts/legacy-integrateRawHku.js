/**
 * 从旧流程迁出：原先误放在 raw_hku.json 里的脚本逻辑。
 * 新项目请用：node scripts/transformData.js（读取根目录 raw_hku.json 纯 JSON）
 *
 * 若仍要写入 schools.json（旧字段），在项目根执行：
 *   node scripts/legacy-integrateRawHku.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const rawDataPath = path.join(ROOT, "raw_hku.json");

function integrateLocalData() {
  console.log("🚀 启动数据清洗引擎：目标 [香港大学全量专业]...");

  if (!fs.existsSync(rawDataPath)) {
    console.error("❌ 错误：找不到 raw_hku.json 文件！");
    console.log("💡 请在项目根目录放置纯 JSON 的 raw_hku.json（如 { \"data\": { \"data\": [...] } }）。");
    return;
  }

  try {
    const rawJson = JSON.parse(fs.readFileSync(rawDataPath, "utf8"));
    const list = rawJson.data.data;

    const allPrograms = [];

    list.forEach((item, index) => {
      allPrograms.push({
        id: `hku-${item.id || index}`,
        stage: item.name_zh.includes("博士") ? "博士" : "硕士",
        schoolName: item.schoolname || "香港大学",
        faculty: item.department || "各院系",
        majorCategory: item.name_zh,
        specificMajor: item.distinctive || "授课型项目 (TPg)",
        programName: item.name_en,
        tuition: item.tuition_fee ? `HK$ ${item.tuition_fee.toLocaleString()}` : "以官网为准",
        languageRequirement: "雅思 6.0/6.5",
        gpaRequirement: "综合评估",
        duration: `${item.intake || 2026}年${item.intake_month || 9}月`,
        tags: item.tags || ["港大名校", "26Fall"],
        deadline: "尽早申请",
      });
    });

    const dirPath = path.join(ROOT, "src", "data");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, "schools.json");
    fs.writeFileSync(filePath, JSON.stringify(allPrograms, null, 2), "utf-8");

    console.log(`\n🎉 成功！已将 ${allPrograms.length} 条港大专业数据写入 src/data/schools.json`);
  } catch (e) {
    console.error("❌ 解析或处理失败:", e.message);
  }
}

integrateLocalData();
