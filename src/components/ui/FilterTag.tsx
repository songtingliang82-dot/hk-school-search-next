"use client";

type FilterTagProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
};

export function FilterTag({ label, active, onClick, small = false }: FilterTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 transition ${
        small ? "text-xs" : "text-sm"
      } ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-900"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
      }`}
    >
      {label}
    </button>
  );
}
