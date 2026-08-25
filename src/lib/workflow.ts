import { FUND_WINDOW_DAYS, LIMITATION_YEARS } from "./legal-data";

export type InjuryLevel = "none" | "minor" | "severe" | "death";
export type TriBool = boolean | null;

export type PlanInput = {
  accidentDate: string; // ISO yyyy-mm-dd
  injuries: InjuryLevel;
  otherPartyInsured: TriBool;
  policeReportDone: TriBool;
};

export type TaskId =
  | "police_report"
  | "no_police_risk"
  | "medical_exam"
  | "heirs_docs"
  | "notify_insurer"
  | "submit_docs"
  | "payment_deadline"
  | "follow_up"
  | "escalation_cbj"
  | "limitation_warning"
  | "fund_window_warning";

export type PlanItem = {
  id: TaskId;
  dueDate: string; // ISO date
  critical?: boolean;
};

const addDays = (iso: string, days: number): string => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Static, deterministic rules engine (PRD §5.1.2) — no AI.
 * Deadlines grounded in Civil Code Art. 932 (3y), Motor Accidents Fund (1y),
 * and CBJ payment timelines (5/10 working days ≈ 7/14 calendar days buffer).
 */
export function generatePlan(input: PlanInput): PlanItem[] {
  const d = input.accidentDate;
  if (!d) return [];
  const items: PlanItem[] = [];

  items.push({ id: "police_report", dueDate: d, critical: true });
  if (input.policeReportDone === false) {
    items.push({ id: "no_police_risk", dueDate: addDays(d, 1), critical: true });
  }

  if (input.injuries === "minor" || input.injuries === "severe") {
    items.push({ id: "medical_exam", dueDate: addDays(d, 3), critical: true });
  }
  if (input.injuries === "severe") {
    items.push({ id: "limitation_warning", dueDate: addDays(d, 1), critical: true });
  }
  if (input.injuries === "death") {
    items.push({ id: "medical_exam", dueDate: addDays(d, 3), critical: true });
    items.push({ id: "heirs_docs", dueDate: addDays(d, 30), critical: true });
    items.push({ id: "limitation_warning", dueDate: addDays(d, 1), critical: true });
  }

  if (input.otherPartyInsured !== false) {
    items.push({ id: "notify_insurer", dueDate: addDays(d, 7), critical: true });
    items.push({ id: "submit_docs", dueDate: addDays(d, 21) });
    // Approval typically follows docs; payment deadline ~ approval + 5/10 wd.
    items.push({ id: "payment_deadline", dueDate: addDays(d, 45) });
    items.push({ id: "follow_up", dueDate: addDays(d, 35) });
    items.push({ id: "escalation_cbj", dueDate: addDays(d, 60) });
  }
  if (input.otherPartyInsured === false || input.otherPartyInsured === null) {
    items.push({
      id: "fund_window_warning",
      dueDate: addDays(d, FUND_WINDOW_DAYS - 30),
      critical: true,
    });
  }

  items.push({ id: "limitation_warning", dueDate: addDays(d, LIMITATION_YEARS * 365 - 90), critical: true });

  return items
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .filter((it, i, arr) => i === 0 || arr[i - 1].id !== it.id);
}

export type TaskStatus = "overdue" | "today" | "upcoming";

export function statusOf(iso: string, now = new Date()): TaskStatus {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
    .toISOString()
    .slice(0, 10);
  if (iso < today) return "overdue";
  if (iso === today) return "today";
  return "upcoming";
}

function fmtIcsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

/** Build a downloadable .ics calendar file from the plan. */
export function buildIcs(items: PlanItem[], titles: Record<TaskId, string>): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Haqqi//Action Plan//AR",
    "CALSCALE:GREGORIAN",
  ];
  items.forEach((it, idx) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:haqqi-${it.id}-${fmtIcsDate(it.dueDate)}-${idx}@calendar.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${fmtIcsDate(it.dueDate)}`,
      `SUMMARY:${titles[it.id] ?? it.id}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
