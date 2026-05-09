"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "搜索专业中文名或英文名", className }: SearchInputProps) {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => onChange(innerValue), 300);
    return () => window.clearTimeout(timer);
  }, [innerValue, onChange]);

  return (
    <div className="relative w-full flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${className ?? ""}`}
      />
    </div>
  );
}
