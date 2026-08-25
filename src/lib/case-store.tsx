"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "./supabase";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CaseRole = "owner" | "family_rep" | "lawyer" | "viewer";

export type HaqqiCase = {
  id: string;
  label: string;
  accident_date: string | null;
  injuries: "none" | "minor" | "severe" | "death";
  status: "active" | "closed" | "archived";
  stage: string;
  created_at: string;
};

export type AccessEntry = {
  id: string;
  case_id: string;
  user_id: string | null;
  email: string;
  role: CaseRole;
  status: "pending_invite" | "active" | "revoked";
};

export type DeadlineKind = "limitation_3y" | "fund_1y" | "payment_window" | "custom";

export type DeadlineRow = {
  id: string;
  case_id: string;
  kind: DeadlineKind;
  title: string | null;
  due_date: string;
  completed_at: string | null;
};

export type EvidenceMeta = {
  id: string;
  case_id: string;
  original_name: string;
  size_bytes: number;
  mime_type: string;
  sha256: string;
  uploaded_at: string;
};

const LS_CASES = "haqqi_demo_cases_v1";
const LS_ACCESS = "haqqi_demo_case_access_v1";
const LS_DEADLINES = "haqqi_demo_deadlines_v1";
const LS_EVIDENCE = "haqqi_demo_evidence_v1";
const LS_NOTIF_READ = "haqqi_demo_notif_read_v1";

function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const sb = getBrowserSupabase();
  if (!sb) return {};
  const { data } = await sb.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {};
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Hard legal deadlines generated at case creation (Civil Code Art. 932 etc.). */
export function generateDeadlines(caseId: string, accidentDate: string): Omit<DeadlineRow, "id">[] {
  return [
    {
      case_id: caseId,
      kind: "limitation_3y",
      title: null,
      due_date: addDays(accidentDate, 3 * 365),
      completed_at: null,
    },
    {
      case_id: caseId,
      kind: "fund_1y",
      title: null,
      due_date: addDays(accidentDate, 365),
      completed_at: null,
    },
  ];
}

export async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type PlatformValue = {
  ready: boolean;
  mode: "supabase" | "demo";
  cases: HaqqiCase[];
  active: HaqqiCase | null;
  access: AccessEntry[];
  invitesForMe: AccessEntry[];
  deadlines: DeadlineRow[];
  evidence: EvidenceMeta[];
  notifications: { id: string; urgent: boolean; text: string; href: string }[];
  unreadCount: number;
  markNotificationsRead: () => void;
  setActive: (id: string) => void;
  createCase: (input: {
    label: string;
    accident_date: string;
    injuries: HaqqiCase["injuries"];
  }) => Promise<void>;
  inviteMember: (email: string, role: CaseRole) => Promise<void>;
  acceptInvite: (entryId: string) => Promise<void>;
  revokeMember: (entryId: string) => Promise<void>;
  addCustomDeadline: (title: string, due_date: string) => Promise<void>;
  toggleDeadline: (id: string) => Promise<void>;
  addEvidence: (file: File) => Promise<void>;
};

const Ctx = createContext<PlatformValue | null>(null);

export function CasePlatformProvider({ children }: { children: ReactNode }) {
  const { user, mode, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [cases, setCases] = useState<HaqqiCase[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [access, setAccess] = useState<AccessEntry[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineRow[]>([]);
  const [evidence, setEvidence] = useState<EvidenceMeta[]>([]);
  const [readNotifs, setReadNotifs] = useState<string[]>([]);

  /* ---------------- load ---------------- */
  useEffect(() => {
    if (!authReady) return;
    if (!user || !user.verified) {
      setReady(true);
      return;
    }
    let cancelled = false;

    (async () => {
      if (mode === "demo") {
        const cs = lsGet<HaqqiCase[]>(LS_CASES, []); // demo: single-browser ownership
        setCases(cs);
        const savedActive = localStorage.getItem("haqqi_demo_active_case");
        setActiveId(savedActive ?? cs[0]?.id ?? null);
        setDeadlines(lsGet<DeadlineRow[]>(LS_DEADLINES, []));
        setEvidence(lsGet<EvidenceMeta[]>(LS_EVIDENCE, []));
        setReadNotifs(lsGet<string[]>(LS_NOTIF_READ, []));
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const headers = await authHeaders();
        const res = await fetch("/api/cases", { headers });
        const json = await res.json();
        if (cancelled) return;
        const cs: HaqqiCase[] = json.cases ?? [];
        setCases(cs);
        const savedActive = localStorage.getItem("haqqi_active_case");
        setActiveId(savedActive ?? cs[0]?.id ?? null);
      } catch {
        /* offline: leave empty */
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id, mode]);

  /* ------- load per-case detail (access/deadlines/evidence) ------- */
  useEffect(() => {
    if (!activeId || !user?.verified) return;
    localStorage.setItem(mode === "demo" ? "haqqi_demo_active_case" : "haqqi_active_case", activeId);
    let cancelled = false;

    (async () => {
      if (mode === "demo") {
        setAccess(lsGet<AccessEntry[]>(LS_ACCESS, []).filter((a) => a.case_id === activeId));
        setDeadlines(lsGet<DeadlineRow[]>(LS_DEADLINES, []).filter((d) => d.case_id === activeId));
        setEvidence(lsGet<EvidenceMeta[]>(LS_EVIDENCE, []).filter((e) => e.case_id === activeId));
        return;
      }
      try {
        const headers = await authHeaders();
        const q = `case_id=${activeId}`;
        const [acc, dl, ev] = await Promise.all([
          fetch(`/api/cases/access?${q}`, { headers }).then((r) => r.json()),
          fetch(`/api/cases/deadlines?${q}`, { headers }).then((r) => r.json()),
          fetch(`/api/cases/documents?${q}`, { headers }).then((r) => r.json()),
        ]);
        if (!cancelled) {
          setAccess(acc.access ?? []);
          setDeadlines(dl.deadlines ?? []);
          setEvidence(ev.documents ?? []);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId, mode, user?.verified]);

  /* ---------------- mutations ---------------- */

  const createCase = useCallback(
    async (input: { label: string; accident_date: string; injuries: HaqqiCase["injuries"] }) => {
      if (mode === "demo") {
        const id = crypto.randomUUID();
        const c: HaqqiCase = {
          id,
          label: input.label.trim(),
          accident_date: input.accident_date,
          injuries: input.injuries,
          status: "active",
          stage: "intake",
          created_at: new Date().toISOString(),
        };
        setCases((prev) => {
          const next = [...prev, c];
          lsSet(LS_CASES, next);
          return next;
        });
        setAccess((prev) => {
          const next = [
            ...prev,
            {
              id: crypto.randomUUID(),
              case_id: id,
              user_id: user!.id,
              email: user!.email,
              role: "owner" as CaseRole,
              status: "active" as const,
            },
          ];
          lsSet(LS_ACCESS, next);
          return next;
        });
        const gen = generateDeadlines(id, input.accident_date).map((d) => ({
          ...d,
          id: crypto.randomUUID(),
        }));
        setDeadlines((prev) => {
          const next = [...prev, ...gen];
          lsSet(LS_DEADLINES, next);
          return next;
        });
        setActiveId(id);
        return;
      }

      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      const res = await fetch("/api/cases", {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.case) {
        setCases((prev) => [...prev, json.case]);
        setActiveId(json.case.id);
      }
    },
    [mode, user]
  );

  const inviteMember = useCallback(
    async (email: string, role: CaseRole) => {
      if (!activeId) return;
      const mail = email.trim().toLowerCase();
      if (mode === "demo") {
        setAccess((prev) => {
          const next = [
            ...prev,
            {
              id: crypto.randomUUID(),
              case_id: activeId,
              user_id: null,
              email: mail,
              role,
              status: "pending_invite" as const,
            },
          ];
          lsSet(LS_ACCESS, next);
          return next;
        });
        return;
      }
      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      await fetch("/api/cases/access", {
        method: "POST",
        headers,
        body: JSON.stringify({ case_id: activeId, email: mail, role }),
      });
      setAccess((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, case_id: activeId, user_id: null, email: mail, role, status: "pending_invite" },
      ]);
    },
    [activeId, mode]
  );

  const patchAccess = useCallback(
    async (entryId: string, action: "accept" | "revoke") => {
      if (mode === "demo") {
        setAccess((prev) => {
          const next = prev.map((a) =>
            a.id === entryId
              ? {
                  ...a,
                  status: (action === "accept" ? "active" : "revoked") as AccessEntry["status"],
                  user_id: action === "accept" ? user!.id : a.user_id,
                  email: action === "accept" ? user!.email : a.email,
                }
              : a
          );
          lsSet(LS_ACCESS, next);
          return next;
        });
        return;
      }
      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      await fetch("/api/cases/access", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id: entryId, action }),
      });
      setAccess((prev) =>
        prev.map((a) =>
          a.id === entryId
            ? { ...a, status: (action === "accept" ? "active" : "revoked") as AccessEntry["status"] }
            : a
        )
      );
    },
    [mode, user]
  );

  const addCustomDeadline = useCallback(
    async (title: string, due_date: string) => {
      if (!activeId) return;
      if (mode === "demo") {
        setDeadlines((prev) => {
          const next = [
            ...prev,
            { id: crypto.randomUUID(), case_id: activeId, kind: "custom" as const, title, due_date, completed_at: null },
          ];
          lsSet(LS_DEADLINES, next);
          return next;
        });
        return;
      }
      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      const res = await fetch("/api/cases/deadlines", {
        method: "POST",
        headers,
        body: JSON.stringify({ case_id: activeId, title, due_date }),
      });
      const json = await res.json();
      if (json.deadline) setDeadlines((prev) => [...prev, json.deadline]);
    },
    [activeId, mode]
  );

  const toggleDeadline = useCallback(
    async (id: string) => {
      const target = deadlines.find((d) => d.id === id);
      const completed = Boolean(target?.completed_at);
      const stamp = completed ? null : new Date().toISOString();
      setDeadlines((prev) => {
        const next = prev.map((d) => (d.id === id ? { ...d, completed_at: stamp } : d));
        if (mode === "demo") lsSet(LS_DEADLINES, next);
        return next;
      });
      if (mode !== "demo") {
        const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
        await fetch("/api/cases/deadlines", {
          method: "PATCH",
          headers,
          body: JSON.stringify({ id, completed: !completed }),
        });
      }
    },
    [deadlines, mode]
  );

  const addEvidence = useCallback(
    async (file: File) => {
      if (!activeId) return;
      const sha = await sha256Hex(file);
      const meta = {
        case_id: activeId,
        original_name: file.name,
        size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
        sha256: sha,
      };
      if (mode === "demo") {
        setEvidence((prev) => {
          const next = [
            ...prev,
            { ...meta, id: crypto.randomUUID(), uploaded_at: new Date().toISOString() },
          ];
          lsSet(LS_EVIDENCE, next);
          return next;
        });
        return;
      }
      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      const res = await fetch("/api/cases/documents", {
        method: "POST",
        headers,
        body: JSON.stringify(meta),
      });
      const json = await res.json();
      if (json.document) setEvidence((prev) => [...prev, json.document]);
    },
    [activeId, mode]
  );

  /* ---------------- derived: notifications ---------------- */

  const active = useMemo(() => cases.find((c) => c.id === activeId) ?? null, [cases, activeId]);

  const notifications = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const items: { id: string; urgent: boolean; text: string; href: string }[] = [];
    deadlines
      .filter((d) => !d.completed_at)
      .forEach((d) => {
        const daysLeft = Math.ceil(
          (new Date(d.due_date + "T00:00:00Z").getTime() - new Date(today + "T00:00:00Z").getTime()) /
            86400000
        );
        if (daysLeft < 0) {
          items.push({
            id: `${d.id}:overdue`,
            urgent: true,
            text: `⚠️ ${d.title ?? d.kind} — ${Math.abs(daysLeft)} ${localeDaySuffix(daysLeft)}`,
            href: "/dashboard?tab=deadlines",
          });
        } else if (daysLeft <= 30) {
          items.push({
            id: `${d.id}:soon`,
            urgent: false,
            text: `📆 ${d.title ?? d.kind} — ${daysLeft}`,
            href: "/dashboard?tab=deadlines",
          });
        }
      });
    return items.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  }, [deadlines]);

  const unreadCount = notifications.filter((n) => !readNotifs.includes(n.id)).length;

  const markNotificationsRead = useCallback(() => {
    setReadNotifs((prev) => {
      const next = Array.from(new Set([...prev, ...notifications.map((n) => n.id)]));
      lsSet(LS_NOTIF_READ, next);
      return next;
    });
  }, [notifications]);

  const value = useMemo<PlatformValue>(
    () => ({
      ready,
      mode,
      cases,
      active,
      access,
      invitesForMe: access.filter((a) => a.status === "pending_invite"),
      deadlines,
      evidence,
      notifications,
      unreadCount,
      markNotificationsRead,
      setActive: setActiveId,
      createCase,
      inviteMember,
      acceptInvite: (id) => patchAccess(id, "accept"),
      revokeMember: (id) => patchAccess(id, "revoke"),
      addCustomDeadline,
      toggleDeadline,
      addEvidence,
    }),
    [
      ready, mode, cases, active, access, deadlines, evidence,
      notifications, unreadCount, markNotificationsRead,
      createCase, inviteMember, patchAccess, addCustomDeadline, toggleDeadline, addEvidence,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function localeDaySuffix(_n: number): string {
  return "يوم"; // rendered text refined at UI layer where locale is available
}

export function useCasePlatform(): PlatformValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCasePlatform must be used inside CasePlatformProvider");
  return ctx;
}
