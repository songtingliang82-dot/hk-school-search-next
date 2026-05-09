const fs = require('fs');
const path = require('path');

// 1. 找数据源
const dataPath = path.join(__dirname, 'src', 'data', 'schools.json');

if (!fs.existsSync(dataPath)) {
    console.error("❌ 找不到 schools.json 文件！");
    process.exit(1);
}

const schoolsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 2. 建文件夹
const outputDir = path.join(__dirname, 'SchoolData'); 
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 3. 开始生成
schoolsData.forEach(school => {
    let yamlFrontmatter = `---\n`;
    for (const [key, value] of Object.entries(school)) {
        if (Array.isArray(value)) {
            yamlFrontmatter += `${key}: [${value.join(', ')}]\n`;
        } else {
            yamlFrontmatter += `${key}: ${value}\n`;
        }
    }
    yamlFrontmatter += `---`;

    const markdownBody = `\n## 📝 核心申请要求\n- **个人陈述 (PS)**：待补充...\n- **面试要求**：待补充...\n\n## 💡 历年录取数据\n此处记录往年数据...\n`;

    const fileContent = yamlFrontmatter + markdownBody;
    const fileName = `${school.schoolName}-${school.specificMajor || school.stage}.md`.replace(/\//g, '-'); 
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ 成功生成笔记: ${fileName}`);
});

console.log('\n🎉 所有笔记生成完毕！快去左边看看有没有多出 SchoolData 文件夹吧！');