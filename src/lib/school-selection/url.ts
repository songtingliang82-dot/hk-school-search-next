import type { HomeFilterState, SortMode, ViewMode } from "@/lib/school-selection/types";

export function buildHomeUrl(pathname: string, args: { search: string; sortMode: SortMode; viewMode: ViewMode; filter: HomeFilterState }): string {
  const params = new URLSearchParams();
  const q = args.search.trim();
  if (q) params.set("q", q);
  if (args.sortMode !== "推荐") params.set("sort", args.sortMode);
  if (args.viewMode !== "universities") params.set("view", args.viewMode);
  if (args.filter.universities.length) params.set("uni", args.filter.universities.join(","));
  if (args.filter.subjects.length) params.set("sub", args.filter.subjects.join(","));
  if (args.filter.degrees.length) params.set("deg", args.filter.degrees.join(","));
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}
