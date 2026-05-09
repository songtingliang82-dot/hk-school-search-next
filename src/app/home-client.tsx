"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { ProgramCard } from "@/components/ProgramCard";
import { SearchInput } from "@/components/SearchInput";
import { UniversityCard } from "@/components/UniversityCard";
import { programs, universities } from "@/data/programs";
import {
  buildHomeUrl,
  filterAndSortPrograms,
  filterUniversities,
  sameStringArray,
  splitParam,
  type HomeFilterState,
  type SortMode,
  type ViewMode,
} from "@/lib/school-selection";

export default function HomeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [sortMode, setSortMode] = useState<SortMode>((searchParams.get("sort") as SortMode) ?? "推荐");
  const [viewMode, setViewMode] = useState<ViewMode>(
    searchParams.get("view") === "programs" ? "programs" : "universities",
  );
  const [filterState, setFilterState] = useState<HomeFilterState>({
    universities: splitParam(searchParams.get("uni")),
    subjects: splitParam(searchParams.get("sub")),
    degrees: splitParam(searchParams.get("deg")),
  });

  const lastReplacedUrl = useRef<string | null>(null);

  useEffect(() => {
    lastReplacedUrl.current = null;
  }, [pathname]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const sort = (searchParams.get("sort") as SortMode) ?? "推荐";
    const view: ViewMode = searchParams.get("view") === "programs" ? "programs" : "universities";
    const nextFilter: HomeFilterState = {
      universities: splitParam(searchParams.get("uni")),
      subjects: splitParam(searchParams.get("sub")),
      degrees: splitParam(searchParams.get("deg")),
    };

    setSearch((prev) => (prev === q ? prev : q));
    setSortMode((prev) => (prev === sort ? prev : sort));
    setViewMode((prev) => (prev === view ? prev : view));
    setFilterState((prev) =>
      sameStringArray(prev.universities, nextFilter.universities) &&
      sameStringArray(prev.subjects, nextFilter.subjects) &&
      sameStringArray(prev.degrees, nextFilter.degrees)
        ? prev
        : nextFilter,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextUrl = buildHomeUrl(pathname, { search, sortMode, viewMode, filter: filterState });
    if (lastReplacedUrl.current === nextUrl) return;
    lastReplacedUrl.current = nextUrl;
    router.replace(nextUrl, { scroll: false });
  }, [filterState, pathname, router, search, sortMode, viewMode]);

  const filteredPrograms = useMemo(
    () => filterAndSortPrograms(programs, filterState, search, sortMode),
    [filterState, search, sortMode],
  );

  const filteredUniversities = useMemo(
    () => filterUniversities(universities, filterState.universities, search),
    [filterState.universities, search],
  );

  return (
    <main className="min-h-screen bg-white px-8 py-8 text-gray-950">
      <div className="mx-auto max-w-[1680px]">
        <header>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setViewMode("universities")}
              className={`group relative flex items-center gap-2 rounded-2xl px-8 py-4 text-xl font-bold transition-all duration-300 ${
                viewMode === "universities"
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {viewMode === "universities" && (
                <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-white/40" />
              )}
              🏛️ 院校库
            </button>
            <button
              type="button"
              onClick={() => setViewMode("programs")}
              className={`group relative flex items-center gap-2 rounded-2xl px-8 py-4 text-xl font-bold transition-all duration-300 ${
                viewMode === "programs"
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {viewMode === "programs" && (
                <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-white/40" />
              )}
              📚 专业库
            </button>
          </div>

          <div className="mt-8 flex items-center gap-6">
            <span className="text-sm font-medium text-gray-500">搜索</span>
            <div className="flex flex-1 max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={viewMode === "universities" ? "请输入学校关键字" : "请输入专业关键字"}
                  className="rounded-full"
                />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-500">地区</span>
            <span className="rounded-full bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">
              🇨🇳 中国香港
            </span>
          </div>
        </header>

        {viewMode === "universities" ? (
          filteredUniversities.length > 0 ? (
            <section className="mt-11 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUniversities.map((university) => (
                <UniversityCard key={university.id} university={university} />
              ))}
            </section>
          ) : (
            <EmptyState message="暂无符合条件的院校，请尝试调整搜索条件" />
          )
        ) : filteredPrograms.length > 0 ? (
          <section className="mt-11 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </section>
        ) : (
          <EmptyState />
        )}

        <div className="mt-12 flex items-center justify-center gap-8 text-lg">
          <button type="button" className="text-gray-300">
            ‹
          </button>
          <button type="button" className="rounded-lg border border-red-500 px-4 py-2 text-red-600">
            1
          </button>
          <button type="button">2</button>
          <button type="button">›</button>
          <span className="ml-6">跳至</span>
          <input className="h-10 w-16 rounded-md border border-gray-200" />
          <span>页</span>
        </div>
      </div>
    </main>
  );
}
