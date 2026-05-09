const fs = require('fs');
const path = require('path');

function integrateLocalData() {
    console.log("🚀 启动数据清洗引擎：目标 [香港大学全量专业]...");

    // 1. 读取你之前发的那个 158 条数据的原始文件
    // 注意：请确保你根目录下有一个名为 raw_hku.json 的文件，里面存着你发的那个长 JSON
    const rawDataPath = path.join(__dirname, 'raw_hku.json');
    
    if (!fs.existsSync(rawDataPath)) {
        console.error("❌ 错误：找不到 raw_hku.json 文件！");
        console.log("💡 解决办法：在项目根目录新建一个 raw_hku.json，把你刚才发给我的那一大长串 JSON 粘贴进去并保存。");
        return;
    }

    try {
        const rawJson = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
        const list = rawJson.data.data; 

        let allPrograms = [];

        // 2. 核心转换逻辑：对接你的高级 UI 字段
        list.forEach((item, index) => {
            allPrograms.push({
                id: `hku-${item.id || index}`,
                stage: item.name_zh.includes("博士") ? "博士" : "硕士",
                schoolName: item.schoolname || "香港大学",
                faculty: item.department || "各院系",
                majorCategory: item.name_zh, // 对接 UI 的专业名
                specificMajor: item.distinctive || "授课型项目 (TPg)", 
                programName: item.name_en, // 英文名
                tuition: item.tuition_fee ? `HK$ ${item.tuition_fee.toLocaleString()}` : "以官网为准",
                languageRequirement: "雅思 6.0/6.5",
                gpaRequirement: "综合评估",
                duration: `${item.intake || 2026}年${item.intake_month || 9}月`,
                tags: item.tags || ["港大名校", "26Fall"],
                deadline: "尽早申请"
            });
        });

        // 3. 写入 schools.json 让 Next.js 读取
        const dirPath = path.join(__dirname, 'src', 'data');
        if (!fs.existsSync(dirPath)) { fs.mkdirSync(dirPath, { recursive: true }); }
        
        const filePath = path.join(dirPath, 'schools.json');
        fs.writeFileSync(filePath, JSON.stringify(allPrograms, null, 2), 'utf-8');

        console.log(`\n🎉 成功！已将 ${allPrograms.length} 条港大专业数据写入 schools.json`);
    } catch (e) {
        console.error("❌ 解析 JSON 失败，请检查 raw_hku.json 格式是否正确:", e.message);
    }
}

integrateLocalData();