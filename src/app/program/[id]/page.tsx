import { programs } from "@/data/programs";
import ProgramDetailClient from "./program-detail-client";

export async function generateStaticParams() {
  return programs.map((p) => ({ id: p.id }));
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProgramDetailClient params={params} />;
}
