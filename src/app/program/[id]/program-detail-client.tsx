'use client';

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CalendarClock,
  FileText,
  Globe,
  Layers3,
  Library,
} from "lucide-react";
import { programs } from "@/data/programs";
import { useState, useEffect, useRef } from "react";

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'curriculum'>('overview');
  const [program, setProgram] = useState<typeof programs[0] | null>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<typeof programs>([]);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  const overviewRef = useRef<HTMLDivElement>(null);
  const requirementsRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setResolvedParams({ id });
      const found = programs.find((item) => item.id === id);
      if (!found) {
        notFound();
        return;
      }
      setProgram(found);
      const related = programs
        .filter((item) => item.university === found.university && item.id !== found.id)
        .slice(0, 4);
      setRelatedPrograms(related);
    });
  }, [params]);

  useEffect(() => {
    if (!program) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'section-overview') setActiveTab('overview');
            if (id === 'section-requirements') setActiveTab('requirements');
            if (id === 'section-curriculum') setActiveTab('curriculum');
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    const targets = [
      overviewRef.current,
      requirementsRef.current,
      curriculumRef.current,
    ].filter(Boolean) as Element[];

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [program]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tab: 'overview' | 'requirements' | 'curriculum') => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItemClass = (tab: 'overview' | 'requirements' | 'curriculum') =>
    `cursor-pointer border-b-2 pb-3 transition ${
      activeTab === tab
        ? 'border-blue-900 text-blue-900'
        : 'border-transparent hover:text-slate-700'
    }`;

  if (!program || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6 lg:px-8">
          <div className="text-sm text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <section className="bg-blue-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </div>

          <div className="max-w-3xl">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="text-blue-100 transition hover:text-white">
                首页
              </Link>
              <span>&gt;</span>
              <span>{program.university}</span>
              <span>&gt;</span>
              <span>{program.faculty}</span>
              <span>&gt;</span>
              <span>{program.name_cn}</span>
            </nav>
            <p className="text-sm font-medium text-blue-100">
              {program.university} · {program.faculty}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              {program.name_cn}
            </h1>
            <p className="mt-3 text-base text-blue-100 md:text-lg">{program.name_en}</p>
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:px-8">
        <section className="flex-1 space-y-6 lg:w-[70%]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div
              ref={navRef}
              className="sticky top-0 z-10 flex items-center gap-6 border-b border-slate-200 bg-white pb-0 pt-1 text-sm font-medium text-slate-500"
            >
              <button
                type="button"
                className={navItemClass('overview')}
                onClick={() => scrollToSection(overviewRef, 'overview')}
              >
                专业介绍
              </button>
              <button
                type="button"
                className={navItemClass('requirements')}
                onClick={() => scrollToSection(requirementsRef, 'requirements')}
              >
                录取要求
              </button>
              <button
                type="button"
                className={navItemClass('curriculum')}
                onClick={() => scrollToSection(curriculumRef, 'curriculum')}
              >
                课程
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div id="section-overview" ref={overviewRef}>
                <h2 className="text-lg font-semibold text-slate-950">专业介绍</h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{program.desc}</p>
              </div>

              <div id="section-requirements" ref={requirementsRef} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <FileText className="h-5 w-5 text-blue-900" />
                    背景要求
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.requirements.background}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Globe className="h-5 w-5 text-blue-900" />
                    语言要求
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.requirements.language}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <BookOpen className="h-5 w-5 text-blue-900" />
                    标准化考试
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.requirements.standardized}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Briefcase className="h-5 w-5 text-blue-900" />
                    其他要求
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.requirements.others}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <CalendarClock className="h-5 w-5 text-blue-900" />
                    申请时间线
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.requirements.timeline}</p>
                </div>
              </div>

              <div id="section-curriculum" ref={curriculumRef}>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Library className="h-5 w-5 text-blue-900" />
                    课程设置
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{program.curriculum}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">同校推荐</h2>
                <p className="mt-1 text-sm text-gray-500">同一院校的其他相关专业</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {relatedPrograms.length > 0 ? (
                relatedPrograms.map((item) => (
                  <Link
                    key={item.id}
                    href={`/program/${item.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.name_cn}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.name_en}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl bg-gray-50 p-6 text-sm text-gray-500">暂无同校推荐</div>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:w-[30%]">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <Layers3 className="h-5 w-5 text-blue-900" />
              学费参考
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{program.tuition}</p>
            <h2 className="mt-8 text-lg font-semibold text-slate-950">案例分析</h2>
            <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-sm leading-7 text-gray-500">
              该专业暂无成功案例 / 案例库正在更新中
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              联系顾问获取详细数据
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
