export type HomeFilterState = {
  universities: string[];
  subjects: string[];
  degrees: string[];
};

export type SortMode = "推荐" | "字母排序" | "大学优先";

export type ViewMode = "programs" | "universities";
