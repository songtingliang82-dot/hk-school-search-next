"use client";

import Link from "next/link";
import type { University } from "@/data/programs";
import { UniversityLogo } from "@/components/UniversityLogo";
import { getUniversityAsset } from "@/lib/university-assets";

type UniversityCardProps = {
  university: University;
};

export function UniversityCard({ university }: UniversityCardProps) {
  const asset = getUniversityAsset(university.name_cn);
  const rank = asset.qsRank || String(university.qs_rank || "/");

  return (
    <Link
      href={`/university/${encodeURIComponent(university.name_cn)}`}
      className="block rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:px-7 md:py-5"
    >
      <article className="grid grid-cols-[60px_1fr] items-center gap-4 md:grid-cols-[72px_1fr_auto_auto] md:gap-5">
        <UniversityLogo
          universityId={university.id}
          nameCn={university.name_cn}
          logoUrl={asset.logoUrl || university.logo_url}
          className="h-14 w-14 object-contain md:h-[60px] md:w-[60px]"
        />

        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-950 md:text-xl">{university.name_cn}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-600 md:mt-1 md:text-base">{asset.nameEn}</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-950 md:mt-1 md:text-base">中国香港</p>
        </div>

        <div className="hidden w-16 text-center md:block">
          <p className="text-2xl font-bold text-red-600">{university.programs_count}</p>
          <p className="mt-2 text-base text-gray-950">专业数</p>
        </div>

        <div className="hidden w-20 text-center md:block">
          <p className="text-2xl font-bold text-red-600">
            {rank === "/" || rank === "N/A" ? "未上榜" : rank}
          </p>
          <p className="mt-2 text-base text-gray-950">QS排名</p>
        </div>
      </article>
    </Link>
  );
}
