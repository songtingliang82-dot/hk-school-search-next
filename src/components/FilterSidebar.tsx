"use client";

import { FilterCheckbox, FilterCollapsible } from "@/components/ui";

type OptionCount = { label: string; count: number };

type MajorCategoryGroup = {
  category: string;
  total: number;
  children: OptionCount[];
};

type FilterSidebarProps = {
  schoolTypeOptions: OptionCount[];
  facultyOptions: OptionCount[];
  majorGroups: MajorCategoryGroup[];
  selectedSchoolTypes: Set<string>;
  selectedFaculties: Set<string>;
  selectedMajorCategories: Set<string>;
  selectedSpecificMajors: Set<string>;
  expandedCategories: Set<string>;
  onToggleSchoolType: (value: string) => void;
  onToggleFaculty: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onToggleSpecificMajor: (category: string, specificMajor: string) => void;
  onToggleExpanded: (value: string) => void;
};

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  const {
    schoolTypeOptions,
    facultyOptions,
    majorGroups,
    selectedSchoolTypes,
    selectedFaculties,
    selectedMajorCategories,
    selectedSpecificMajors,
    expandedCategories,
    onToggleSchoolType,
    onToggleFaculty,
    onToggleCategory,
    onToggleSpecificMajor,
    onToggleExpanded,
  } = props;

  return (
    <div className="space-y-4">
      <FilterCard title="院校类型">
        {schoolTypeOptions.map((option) => (
          <FilterCheckbox
            key={option.label}
            label={option.label}
            count={option.count}
            checked={selectedSchoolTypes.has(option.label)}
            onChange={() => onToggleSchoolType(option.label)}
          />
        ))}
      </FilterCard>

      <FilterCard title="学院类别">
        {facultyOptions.map((option) => (
          <FilterCheckbox
            key={option.label}
            label={option.label}
            count={option.count}
            checked={selectedFaculties.has(option.label)}
            onChange={() => onToggleFaculty(option.label)}
          />
        ))}
      </FilterCard>

      <FilterCard title="专业大类">
        {majorGroups.map((group) => {
          const expanded = expandedCategories.has(group.category);
          const parentChecked = selectedMajorCategories.has(group.category);
          return (
            <FilterCollapsible
              key={group.category}
              title={group.category}
              defaultOpen={expanded}
              headerRight={
                <span className="text-xs font-medium text-slate-400">{group.total}</span>
              }
            >
              {group.children.map((child) => (
                <div key={`${group.category}-${child.label}`} className="pl-8">
                  <FilterCheckbox
                    label={child.label}
                    count={child.count}
                    checked={selectedSpecificMajors.has(child.label)}
                    onChange={() => onToggleSpecificMajor(group.category, child.label)}
                    small
                  />
                </div>
              ))}
            </FilterCollapsible>
          );
        })}
      </FilterCard>
    </div>
  );
}
