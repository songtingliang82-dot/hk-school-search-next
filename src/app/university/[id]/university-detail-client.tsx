"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ProgramCard } from "@/components/ProgramCard";
import { UniversityLogo } from "@/components/UniversityLogo";
import { getUniversityAsset } from "@/lib/university-assets";
import type { Program, University } from "@/data/programs";

type FacultyTab = { faculty: string; count: number };

type Props = {
  university: University;
  /** 已由服务端按院校中文名校验筛选后的专业列表 */
  programsOfUniversity: Program[];
};

export function UniversityDetailClient({ university, programsOfUniversity }: Props) {
  const facultyTabs = useMemo<FacultyTab[]>(() => {
    const counts = new Map<string, number>();
    for (const p of programsOfUniversity) {
      counts.set(p.faculty, (counts.get(p.faculty) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([faculty, count]) => ({ faculty, count }))
      .sort((a, b) => a.faculty.localeCompare(b.faculty, "zh-CN"));
  }, [programsOfUniversity]);

  const [activeFaculty, setActiveFaculty] = useState<string>(() => facultyTabs[0]?.faculty ?? "");
  const [search, setSearch] = useState("");

  const filteredPrograms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programsOfUniversity.filter((p) => {
      const facultyOk = !activeFaculty || p.faculty === activeFaculty;
      const searchOk =
        q.length === 0 ||
        `${p.name_cn} ${p.name_en} ${p.faculty}`.toLowerCase().includes(q);
      return facultyOk && searchOk;
    });
  }, [programsOfUniversity, activeFaculty, search]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-gray-900 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-lg">
              <UniversityLogo
                universityId={university.id}
                nameCn={university.name_cn}
                logoUrl={getUniversityAsset(university.name_cn).logoUrl || university.logo_url}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{university.name_cn}</h1>
              <p className="mt-2 text-lg text-blue-100 md:text-xl">{university.name_en}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{university.location}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center rounded-2xl border-2 border-white/20 bg-black/30 px-8 py-5 text-center shadow-xl backdrop-blur-sm md:items-end md:text-right">
            <p className="text-4xl font-black tabular-nums text-red-500 md:text-5xl">
              {university.qs_rank === "N/A" ? "未上榜" : `#${university.qs_rank}`}
            </p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-blue-100">QS排名</p>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一级
          </Link>
          <div className="relative max-w-md flex-1 sm:min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="输入专业名称搜索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none ring-blue-100 transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">学院</p>
          <div className="flex flex-wrap gap-2">
            {facultyTabs.length === 0 ? (
              <span className="text-sm text-slate-500">暂无学院数据</span>
            ) : (
              facultyTabs.map((tab) => {
                const active = tab.faculty === activeFaculty;
                return (
                  <button
                    key={tab.faculty}
                    type="button"
                    onClick={() => setActiveFaculty(tab.faculty)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tab.faculty} ({tab.count})
                  </button>
                );
              })
            )}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">专业列表</h2>
          {filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}
