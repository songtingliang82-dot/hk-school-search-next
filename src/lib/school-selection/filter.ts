import type { Program, University } from "@/data/programs";
import { FACULTY_TO_SUBJECT_FILTER, UNIVERSITY_SHORT_NAMES } from "@/lib/school-selection/maps";
import type { HomeFilterState, SortMode } from "@/lib/school-selection/types";
import { normalizeKeywords } from "@/lib/school-selection/utils";

export function degreeLabelFromTags(tags: string[]): string {
  if (tags.some((tag) => tag.includes("授课型"))) return "授课型硕士";
  if (tags.some((tag) => tag.includes("研究型"))) return "研究型硕士/博士";
  return "";
}

export function filterAndSortPrograms(
  programs: Program[],
  filter: HomeFilterState,
  search: string,
  sortMode: SortMode,
): Program[] {
  const q = search.trim().toLowerCase();

  const filtered = programs.filter((program) => {
    const universityLabel = UNIVERSITY_SHORT_NAMES[program.university as keyof typeof UNIVERSITY_SHORT_NAMES];
    const subjectLabel = FACULTY_TO_SUBJECT_FILTER[program.faculty as keyof typeof FACULTY_TO_SUBJECT_FILTER];
    const degreeLabel = degreeLabelFromTags(program.tags);

    const universityPass =
      filter.universities.length === 0 ||
      filter.universities.includes(program.university) ||
      (universityLabel !== undefined && filter.universities.includes(universityLabel));
    const subjectPass =
      filter.subjects.length === 0 ||
      filter.subjects.some((subject) =>
        normalizeKeywords(program.name_cn, program.name_en, program.faculty, ...program.tags).includes(subject.toLowerCase()),
      ) ||
      (subjectLabel !== undefined && filter.subjects.includes(subjectLabel));
    const degreePass = filter.degrees.length === 0 || (degreeLabel !== "" && filter.degrees.includes(degreeLabel));
    const searchPass =
      q.length === 0 ||
      normalizeKeywords(program.name_cn, program.name_en, program.university, program.faculty, ...program.tags).includes(q);

    return universityPass && subjectPass && degreePass && searchPass;
  });

  if (sortMode === "字母排序") {
    return [...filtered].sort((a, b) => a.name_en.localeCompare(b.name_en));
  }
  if (sortMode === "大学优先") {
    return [...filtered].sort((a, b) => a.university.localeCompare(b.university));
  }
  return filtered;
}

export function filterUniversities(
  universities: University[],
  selectedUniversityLabels: string[],
  search: string,
): University[] {
  const q = search.trim().toLowerCase();
  return universities.filter((university) => {
    const matchSearch =
      q.length === 0 ||
      normalizeKeywords(university.name_cn, university.name_en, university.location, university.logo_url).includes(q);
    const shortName = UNIVERSITY_SHORT_NAMES[university.name_cn as keyof typeof UNIVERSITY_SHORT_NAMES];
    const matchUniversityFilter =
      selectedUniversityLabels.length === 0 ||
      selectedUniversityLabels.includes(university.name_cn) ||
      (shortName !== undefined && selectedUniversityLabels.includes(shortName));
    return matchSearch && matchUniversityFilter;
  });
}
