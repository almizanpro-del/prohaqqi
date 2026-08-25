import { CBJ_CONTACT } from "./legal-data";

export type ComplaintTarget = "insurer" | "cbj";
export type LetterLocale = "ar" | "en";
export type IssueKey =
  | "delay"
  | "lowball"
  | "denial"
  | "docs_loop"
  | "intimidation"
  | "silence";
export type RemedyKey = "pay" | "review" | "written_reasons" | "compensation_diff";

export type ComplaintData = {
  target: ComplaintTarget;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  insurerName: string;
  claimNumber: string;
  accidentDate: string;
  accidentLocation: string;
  policeReportNo: string;
  claimAmount: string;
  offeredAmount: string;
  paidAmount: string;
  approvalDate: string;
  issues: IssueKey[];
  chronology: string;
  remedy: RemedyKey;
  style: "legal" | "plain";
};

const todayStr = () => new Date().toLocaleDateString("en-GB");

const num = (v: string) => (v.trim() ? v.trim() : "—");

/* ---------- Arabic labels used inside generated letters ---------- */

const ISSUE_AR: Record<IssueKey, string> = {
  delay: "التأخر في سداد المطالبة بعد الموافقة",
  lowball: "عرض مبلغ لا يتناسب مع قيمة المطالبة الموثقة",
  denial: "رفض المطالبة دون تبرير واضح",
  docs_loop: "الطلب المتكرر لمستندات جديدة بعد اكتمال الملف",
  intimidation: "ضغط أو ترهيب لدفعني لقبول تسوية سريعة غير عادلة",
  silence: "عدم الرد على المراسلات الرسمية",
};
const ISSUE_EN: Record<IssueKey, string> = {
  delay: "Delayed payment after approval",
  lowball: "Unreasonably low settlement offer",
  denial: "Denial without clear justification",
  docs_loop: "Repeated requests for new documents after file completion",
  intimidation: "Pressure and intimidation to accept a quick unfair settlement",
  silence: "No response to official correspondence",
};

const REMEDY_AR: Record<RemedyKey, string> = {
  pay: "سداد كامل المبلغ المستحق خلال سبعة (7) أيام من تاريخ هذا الخطاب",
  review: "إعادة النظر في القرار مع إخطاري كتابيًا بالمبررات",
  written_reasons: "تزويدي بتبرير كتابي مفصّل لقرار الرفض",
  compensation_diff: "سداد الفرق بين المبلغ المعروض والمبلغ المستحق وفق المستندات المرفقة",
};
const REMEDY_EN: Record<RemedyKey, string> = {
  pay: "Full payment of the due amount within seven (7) days of this letter's date",
  review: "Re-review of the decision with written notification of the reasons",
  written_reasons: "Providing detailed written reasons for the denial decision",
  compensation_diff: "Payment of the gap between the offered and due amounts per attached documents",
};

/* ---------- Builders ---------- */

export function buildLetter(data: ComplaintData, locale: LetterLocale): string {
  return locale === "ar" ? buildAr(data) : buildEn(data);
}

function headerAr(d: ComplaintData): string[] {
  return [
    `التاريخ: ${todayStr()}`,
    "",
    d.target === "cbj"
      ? `إلى: ${CBJ_CONTACT.unitAr}`
      : `إلى: شركة ${num(d.insurerName)} — قسم تسوية مطالبات التأمين الإلزامي`,
    d.address ? `من: ${d.fullName} — ${d.address}` : `من: ${d.fullName}`,
    `الموضوع: شكوى بشأن مطالبة تعويض رقم ${num(d.claimNumber)} عن حادث مروري بتاريخ ${num(d.accidentDate)}`,
    "السلام عليكم ورحمة الله وبركاته،",
    "",
  ];
}

function factsAr(d: ComplaintData): string[] {
  return [
    "أولاً – الوقائع:",
    `في تاريخ ${num(d.accidentDate)} وقع حادث مروري في ${num(d.accidentLocation)} بموجب محضر الشرطة رقم ${num(d.policeReportNo)}.`,
    d.chronology.trim() ? d.chronology.trim() : "",
    "",
    "ثانيًا – بيانات المطالبة:",
    `• شركة التأمين: ${num(d.insurerName)}`,
    `• رقم المطالبة/الوثيقة: ${num(d.claimNumber)}`,
    `• المبلغ المطالب به: ${num(d.claimAmount)} دينار أردني`,
    d.offeredAmount ? `• المبلغ المعروض: ${num(d.offeredAmount)} دينار` : null,
    d.paidAmount ? `• المبلغ المسدد حتى الآن: ${num(d.paidAmount)} دينار` : null,
    d.approvalDate ? `• تاريخ موافقة الشركة على المطالبة: ${num(d.approvalDate)}` : null,
    "",
    "ثالثًا – طبيعة الشكوى:",
    ...d.issues.map((k) => `• ${ISSUE_AR[k]}`),
    "",
  ].filter(Boolean) as string[];
}

function legalAr(d: ComplaintData, plain: boolean): string[] {
  if (plain) {
    return [
      "المسافة القانونية باختصار: قانون التأمين الإلزامي يلزم الشركة بالسداد خلال أيام عمل قليلة بعد الموافقة، وتعليمات البنك المركزي تغرّم الشركة المتأخرة.",
      "",
    ];
  }
  return [
    "رابعًا – الأساس القانوني:",
    "• لائحة التأمين الإلزامي على المركبات رقم (52) لسنة 2024 وتعليمات البنك المركزي الأردني النافذة في 1/1/2025، والتي تلزم شركة التأمين بسداد التعويضات خلال خمسة (5) أيام عمل للمطالبات حتى 3,000 دينار، وعشرة (10) أيام عمل لما يزيد عنها من تاريخ الموافقة، مع غرامة تصل إلى 10,000 دينار عند التأخر.",
    "• تعليمات حماية المستهلك المالي الصادرة عن البنك المركزي الأردني بشأن معالجة الشكاوى والاستجابة لها خلال المهلة المقررة.",
    "• المادة (256) من القانون المدني الأردني رقم (43) لسنة 1976 فيما يخص المسؤولية عن الأعمال الضارة.",
    "",
  ];
}

function demandAr(d: ComplaintData): string[] {
  return [
    d.target === "cbj"
      ? "أرجو التكرم بالتدخل لإلزام شركة التأمين بما يلي:"
      : "بناءً عليه، أطالبكم بما يلي:",
    `• ${REMEDY_AR[d.remedy]}.`,
    "• تزويدي بالرد كتابيًا على العنوان/البريد الإلكتروني المذكور أعلاه.",
    "",
    "وأفيدكم بأنني محتفظ بكامل المستندات المؤيدة (محضر الشرطة، التقارير الطبية، الفواتير، المراسلات)، وأحتفظ بحقي في اتخاذ كافة الإجراءات القانونية.",
    "",
    "وتفضلوا بقبول فائق الاحترام والتقدير،،",
    "",
    `الاسم: ${d.fullName}`,
    d.nationalId ? `رقم الهوية: ${d.nationalId}` : null,
    `الهاتف: ${num(d.phone)}`,
  ]
    .filter(Boolean)
    .map((x) => x as string);
}

function buildAr(d: ComplaintData): string {
  return [...headerAr(d), ...factsAr(d), ...legalAr(d, d.style === "plain"), ...demandAr(d)]
    .join("\n")
    .trim();
}

/* ---------------- English ---------------- */

function buildEn(d: ComplaintData): string {
  const head = [
    `Date: ${todayStr()}`,
    "",
    d.target === "cbj"
      ? `To: ${CBJ_CONTACT.unitEn}`
      : `To: ${num(d.insurerName)} — Compulsory Insurance Claims Department`,
    d.address ? `From: ${d.fullName} — ${d.address}` : `From: ${d.fullName}`,
    `Subject: Complaint regarding insurance claim No. ${num(d.claimNumber)} for a traffic accident dated ${num(d.accidentDate)}`,
    "Dear Sir/Madam,",
    "",
  ];

  const facts = [
    "1) Facts:",
    `On ${num(d.accidentDate)}, a traffic accident occurred at ${num(d.accidentLocation)}, documented under police report No. ${num(d.policeReportNo)}.`,
    d.chronology.trim() || "",
    "",
    "2) Claim details:",
    `• Insurer: ${num(d.insurerName)}`,
    `• Claim/policy No.: ${num(d.claimNumber)}`,
    `• Amount claimed: JOD ${num(d.claimAmount)}`,
    d.offeredAmount ? `• Amount offered: JOD ${num(d.offeredAmount)}` : null,
    d.paidAmount ? `• Amount paid to date: JOD ${num(d.paidAmount)}` : null,
    d.approvalDate ? `• Claim approval date: ${num(d.approvalDate)}` : null,
    "",
    "3) Nature of complaint:",
    ...d.issues.map((k) => `• ${ISSUE_EN[k]}`),
    "",
  ].filter(Boolean);

  const legal = [
    "4) Legal basis:",
    "• Compulsory Motor Insurance Bylaw No. (52) of 2024 and CBJ instructions effective 1 Jan 2025 require insurers to pay within five (5) working days for claims up to JOD 3,000 and ten (10) working days above that, counted from approval, with fines up to JOD 10,000 for late payment.",
    "• Central Bank of Jordan Financial Consumer Protection Instructions on complaint handling and response deadlines.",
    "• Article (256) of the Jordanian Civil Code No. (43) of 1976 (liability for injurious acts).",
    "",
  ];

  const demand = [
    d.target === "cbj"
      ? "I kindly request your intervention to compel the insurer to:"
      : "Accordingly, I demand that you:",
    `• ${REMEDY_EN[d.remedy]}.`,
    "• Provide me with a written response to the address/email stated above.",
    "",
    "Please note that I retain all supporting documents (police report, medical reports, invoices, correspondence) and reserve my right to pursue all legal remedies.",
    "",
    "Respectfully yours,",
    "",
    `Name: ${d.fullName}`,
    d.nationalId ? `National ID: ${d.nationalId}` : null,
    `Phone: ${num(d.phone)}`,
  ].filter(Boolean);

  return [...head, ...facts, ...legal, ...demand].join("\n").trim();
}
