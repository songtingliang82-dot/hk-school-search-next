"use client";

import { useState } from "react";
import { UNIVERSITY_SHORT_NAMES } from "@/lib/school-selection/maps";

type UniversityLogoProps = {
  universityId: string;
  nameCn: string;
  logoUrl: string;
  className?: string;
};

/**
 * 本地 /public 校徽优先；外链若失败（429、地区网络等）则显示缩略字。
 */
export function UniversityLogo({ universityId, nameCn, logoUrl, className }: UniversityLogoProps) {
  const [broken, setBroken] = useState(false);
  // 优先用 UNIVERSITY_SHORT_NAMES（支持所有13所大学），兜底用 universityId 的前2字
  const abbr = UNIVERSITY_SHORT_NAMES[nameCn as keyof typeof UNIVERSITY_SHORT_NAMES] ?? nameCn.slice(0, 2);

  if (broken) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 ${className ?? ""}`}
      >
        {abbr}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}
