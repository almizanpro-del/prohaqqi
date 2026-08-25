export const LEGAL_META = {
  version: 1,
  effectiveFrom: "2025-01-01",
  lastUpdated: null as string | null,
  lastReviewedByLawyer: null as string | null,
};

/** Compensation ceilings — Compulsory Motor Insurance Bylaw No. 52/2024 + CBJ instructions. */
export const CEILINGS = [
  { id: "death_total", jod: 20000 },
  { id: "temp_disability", weeklyJod: 100, maxWeeks: 39 },
  { id: "medical", minJod: 7500, maxJod: 10000 },
] as const;

/** Payment timelines after claim approval (CBJ Financial Consumer Protection). */
export const PAYMENT_TIMELINES = [
  { upToJod: 3000, workingDays: 5 },
  { aboveJod: 3000, workingDays: 10 },
] as const;

export const LATE_PAYMENT_FINE_MAX_JOD = 10000;

export const LIMITATION_YEARS = 3; // Civil Code Art. 932
export const FUND_WINDOW_DAYS = 365; // Motor Accidents Compensation Fund

export const CBJ_CONTACT = {
  unitAr: "وحدة حماية المستهلك المالي — البنك المركزي الأردني",
  unitEn: "Financial Consumer Protection Unit — Central Bank of Jordan",
  email: "fcp@cbj.gov.jo",
  phone: "+962 6 463 0301",
  website: "www.cbj.gov.jo",
};

/**
 * Major Jordanian insurers. Contact details intentionally left blank until
 * verified by the admin/legal team (PRD §5.1.3) — do not publish guesses.
 */
export type InsurerEntry = {
  id: string;
  nameAr: string;
  nameEn: string;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
};

export const INSURERS: InsurerEntry[] = [
  { id: "manara", nameAr: "شركة المنارة للتأمين", nameEn: "Al Manara Insurance", verified: false },
  { id: "nisr", nameAr: "شركة النسر العربي للتأمين", nameEn: "Al-Nisr Al-Arabi Insurance", verified: false },
  { id: "jfic", nameAr: "الجوردانية الفرنسية للتأمين (جرفي)", nameEn: "Jordan French Insurance Co. (JFIC)", verified: false },
  { id: "ajig", nameAr: "مجموعة التأمين العربية الأردنية", nameEn: "Arab Jordanian Insurance Group (AJIG)", verified: false },
  { id: "first", nameAr: "شركة التأمين الأولى", nameEn: "First Insurance Co.", verified: false },
  { id: "islamic", nameAr: "شركة التأمين الإسلامي", nameEn: "Islamic Insurance Co.", verified: false },
  { id: "euromed", nameAr: "يوروميد للتأمين", nameEn: "Euro-Med Insurance", verified: false },
];
