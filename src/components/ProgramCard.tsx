"use client";

import Link from "next/link";
import { memo } from "react";
import type { Program } from "@/data/programs";

type ProgramCardProps = {
  program: Program;
};

const tagStyles = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-slate-100 text-slate-700",
];

function ProgramCardBase({ program }: ProgramCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/program/${program.id}`} className="block p-5">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-500">
            {program.university} · {program.faculty}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            {program.name_cn}
          </h3>
          <p className="text-sm text-slate-500">{program.name_en}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {program.tags.map((tag, index) => (
            <span key={tag} className={`rounded-full px-3 py-1 text-xs font-medium ${tagStyles[index % tagStyles.length]}`}>
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <div className="border-t border-slate-100 px-5 py-4">
        <Link
          href={`/program/${program.id}`}
          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          查看详情
        </Link>
      </div>
    </article>
  );
}

export const ProgramCard = memo(ProgramCardBase);
