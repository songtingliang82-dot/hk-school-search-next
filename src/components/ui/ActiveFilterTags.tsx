"use client";

type ActiveFilterTag = {
  group: string;
  value: string;
  label: string;
};

type ActiveFilterTagsProps = {
  tags: ActiveFilterTag[];
  onRemove: (group: string, value: string) => void;
  onClearAll?: () => void;
};

export function ActiveFilterTags({ tags, onRemove, onClearAll }: ActiveFilterTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {tags.map((tag) => (
        <button
          key={`${tag.group}-${tag.value}`}
          type="button"
          onClick={() => onRemove(tag.group, tag.value)}
          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
        >
          <span>{tag.label}</span>
          <span className="text-blue-400">×</span>
        </button>
      ))}
      {onClearAll && tags.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
        >
          清空全部
        </button>
      )}
    </div>
  );
}
