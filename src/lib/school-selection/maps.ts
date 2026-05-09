/** 数据里的中文校名 → 侧栏筛选用短名 */
export const UNIVERSITY_SHORT_NAMES = {
  香港大学: "港大",
  香港中文大学: "中大",
  香港科技大学: "科大",
  香港城市大学: "城大",
  香港理工大学: "理大",
  香港浸会大学: "浸大",
  岭南大学: "岭大",
  香港教育大学: "教大",
  香港都会大学: "都大",
  香港恒生大学: "恒大",
  香港树仁大学: "树仁",
  香港珠海学院: "珠海",
  香港演艺学院: "演艺",
} as const;

/** 专业所属学院 → 侧栏「学科」选项 */
export const FACULTY_TO_SUBJECT_FILTER = {
  商学院: "商科",
  理学院: "计算机",
  教育学院: "教育",
} as const;

/** 院校 id → 校徽加载失败时的文字缩略 */
export const UNIVERSITY_ID_ABBR: Record<string, string> = {
  hku: "港大",
  cuhk: "中大",
  hkust: "科大",
  cityu: "城大",
  polyu: "理大",
};

/** 侧栏院校分组：label 用于展示，value 用于筛选匹配数据里的完整校名 */
export const SIDEBAR_UNIVERSITY_GROUPS = [
  {
    groupName: "公立八大",
    options: [
      { label: "港大", value: "香港大学" },
      { label: "中大", value: "香港中文大学" },
      { label: "科大", value: "香港科技大学" },
      { label: "城大", value: "香港城市大学" },
      { label: "理大", value: "香港理工大学" },
      { label: "浸大", value: "香港浸会大学" },
      { label: "岭大", value: "岭南大学" },
      { label: "教大", value: "香港教育大学" },
    ],
  },
  {
    groupName: "更多优质院校",
    options: [
      { label: "都大", value: "香港都会大学" },
      { label: "恒大", value: "香港恒生大学" },
      { label: "树仁", value: "香港树仁大学" },
      { label: "珠海", value: "香港珠海学院" },
      { label: "演艺", value: "香港演艺学院" },
    ],
  },
] as const;

export const SIDEBAR_SUBJECTS = ["商科", "计算机", "教育"] as const;
export const SIDEBAR_DEGREES = ["授课型硕士", "研究型硕士"] as const;

export const TOP_FILTER_DISCIPLINE_GROUPS = [
  {
    groupName: "商科方向",
    options: [
      { label: "商科", value: "商科" },
      { label: "金融", value: "金融" },
      { label: "会计", value: "会计" },
      { label: "管理", value: "管理" },
    ],
  },
  {
    groupName: "工科方向",
    options: [
      { label: "计算机", value: "计算机" },
      { label: "工程", value: "工程" },
      { label: "理学", value: "理学" },
    ],
  },
  {
    groupName: "文社科方向",
    options: [
      { label: "教育", value: "教育" },
      { label: "法学", value: "法学" },
      { label: "社会科学", value: "社会科学" },
      { label: "艺术", value: "艺术" },
    ],
  },
] as const;

export const TOP_FILTER_MORE_GROUPS = [
  {
    groupName: "学位类型",
    options: [
      { label: "授课型", value: "授课型硕士" },
      { label: "研究型", value: "研究型硕士/博士" },
    ],
  },
] as const;
