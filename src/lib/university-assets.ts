export type UniversityAsset = {
  logoUrl: string;
  nameEn: string;
  qsRank: string;
};

export const UNIVERSITY_ASSETS: Record<string, UniversityAsset> = {
  香港大学: {
    logoUrl: "/logos/hku.svg",
    nameEn: "The University of Hong Kong",
    qsRank: "11",
  },
  香港中文大学: {
    logoUrl: "/logos/cuhk.svg",
    nameEn: "The Chinese University of Hong Kong",
    qsRank: "32",
  },
  香港科技大学: {
    logoUrl: "/logos/hkust.svg",
    nameEn: "The Hong Kong University of Science and Technology",
    qsRank: "44",
  },
  香港城市大学: {
    logoUrl: "/logos/cityu.svg",
    nameEn: "City University of Hong Kong",
    qsRank: "63",
  },
  香港理工大学: {
    logoUrl: "/logos/polyu.svg",
    nameEn: "Hong Kong Polytechnic University",
    qsRank: "54",
  },
  香港浸会大学: {
    logoUrl: "/logos/hkbu.svg",
    nameEn: "Hong Kong Baptist University",
    qsRank: "244",
  },
  岭南大学: {
    logoUrl: "/logos/ln.svg",
    nameEn: "Lingnan University",
    qsRank: "701-710",
  },
  香港教育大学: {
    logoUrl: "/logos/eduhk.svg",
    nameEn: "The Education University of Hong Kong",
    qsRank: "530",
  },
  香港都会大学: {
    logoUrl: "/logos/hkmu.svg",
    nameEn: "Hong Kong Metropolitan University",
    qsRank: "781-790",
  },
  香港恒生大学: {
    logoUrl: "/logos/hsu.svg",
    nameEn: "Hang Seng University of Hong Kong",
    qsRank: "/",
  },
  香港树仁大学: {
    logoUrl: "/logos/hksyu.svg",
    nameEn: "Hong Kong Shue Yan University",
    qsRank: "/",
  },
  香港珠海学院: {
    logoUrl: "/logos/chc.svg",
    nameEn: "Hong Kong Chu Hai College",
    qsRank: "/",
  },
  香港演艺学院: {
    logoUrl: "/logos/hkapa.svg",
    nameEn: "The Hong Kong Academy for Performing Arts",
    qsRank: "/",
  },
};

export function getUniversityAsset(nameCn: string): UniversityAsset {
  return (
    UNIVERSITY_ASSETS[nameCn] ?? {
      logoUrl: "",
      nameEn: nameCn,
      qsRank: "/",
    }
  );
}
