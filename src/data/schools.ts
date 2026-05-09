// 定义与你的 page.tsx 逻辑完全匹配的类型
export type SchoolItem = {
  id: string;
  schoolName: string;      // 对应 item.schoolName
  programName: string;     // 对应 item.programName
  faculty: string;         // 对应 item.faculty
  stage: string;           // 对应 item.stage (必须是 stagePreset 里的值)
  schoolType: string;      // 对应 item.schoolType
  majorCategory: string;   // 对应 item.majorCategory
  specificMajor: string;   // 对应 item.specificMajor
  tags: string[];          // 对应 item.tags
  tuition: string;         // 供卡片展示
  duration: string;        // 供卡片展示
  languageRequirement?: string;
  gpaRequirement?: string;
  deadline?: string;
};

// 必须导出 schoolsData 这个变量名，因为你的 page.tsx 里是这么 import 的
export const schoolsData: SchoolItem[] = [
  {
    id: "hku-bba-1",
    schoolName: "香港大学",
    programName: "Bachelor of Business Administration",
    faculty: "经管学院",
    stage: "本科",
    schoolType: "公立",
    majorCategory: "金融学",
    specificMajor: "工商管理学士",
    tags: ["UGC资助", "QS #17", "4年全日制", "英语授课"],
    tuition: "HK$ 182,000",
    duration: "4年",
    languageRequirement: "英语要求请参考官网",
    gpaRequirement: "综合评估",
    deadline: "尽早申请"
  },
  {
    id: "hku-cs-2",
    schoolName: "香港大学",
    programName: "MSc in Computer Science",
    faculty: "工程学院",
    stage: "硕士",
    schoolType: "公立",
    majorCategory: "计算机科学",
    specificMajor: "理学硕士（计算机科学）",
    tags: ["Top 50", "热门专业", "1年制"],
    tuition: "HK$ 334,800",
    duration: "1年",
    languageRequirement: "英语要求请参考官网",
    gpaRequirement: "综合评估",
    deadline: "尽早申请"
  }
];