"use client";

type FilterCheckboxProps = {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  small?: boolean;
};

export function FilterCheckbox({ label, count, checked, onChange, small = false }: FilterCheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-slate-50 ${
        small ? "text-[13px]" : "text-sm"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
      />
      <span className={`flex-1 ${small ? "text-slate-500" : "text-slate-700"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs font-medium text-slate-400">{count}</span>
      )}
    </label>
  );
}
