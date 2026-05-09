import { Suspense } from "react";
import HomeClient from "./home-client";

function HomeFallback() {
  return <div className="min-h-screen bg-slate-50" aria-busy />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient />
    </Suspense>
  );
}
