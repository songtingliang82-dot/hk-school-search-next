"use client";

import { type ReactNode, useState } from "react";

type FilterCollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  headerRight?: ReactNode;
};

export function FilterCollapsible({ title, defaultOpen = false, children, headerRight }: FilterCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
        <span className="flex-1 text-sm font-medium text-slate-700">{title}</span>
        {headerRight}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-slate-100 px-2 pb-2 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
