import { notFound } from "next/navigation";
import { programs, universities } from "@/data/programs";
import { UniversityDetailClient } from "./university-detail-client";

export async function generateStaticParams() {
  return universities.map((u) => ({ id: u.id }));
}

/**
 * 查找逻辑：
 * 1. 用动态路由 id 在 universities 中找到当前院校；
 * 2. 用院校的 name_cn（与 programs.university 字段一致）从全局 programs 中筛出本校专业。
 */
export default async function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const university = universities.find((u) => u.id === decodedId || u.name_cn === decodedId);
  if (!university) notFound();

  const programsOfUniversity = programs.filter((p) => p.university === university.name_cn);

  return <UniversityDetailClient university={university} programsOfUniversity={programsOfUniversity} />;
}
