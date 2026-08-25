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
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "./supabase";

export type HaqqiUser = {
  id: string;
  email: string;
  name: string | null;
  verified: boolean;
};

export type AuthError =
  | "invalid_credentials"
  | "email_taken"
  | "not_verified"
  | "weak_password"
  | "generic";

type Mode = "supabase" | "demo";

const LS_USERS = "haqqi_demo_users_v1"; // { [email]: { id,name,password,verified } }
const LS_SESSION = "haqqi_demo_session_v1"; // { id,email,name,verified }

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

type AuthValue = {
  user: HaqqiUser | null;
  ready: boolean;
  mode: Mode;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsVerify: boolean }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  demoVerifyEmail: () => void;
};

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HaqqiUser | null>(null);
  const [ready, setReady] = useState(false);
  const mode: Mode = getBrowserSupabase() ? "supabase" : "demo";

  useEffect(() => {
    let unsub = () => {};
    if (mode === "supabase") {
      const sb = getBrowserSupabase()!;
      sb.auth
        .getSession()
        .then(({ data }) => setUser(mapSession(data.session)))
        .finally(() => setReady(true));
      const sub = sb.auth.onAuthStateChange((_e, s) => setUser(mapSession(s)));
      unsub = () => sub.data.subscription.unsubscribe();
    } else {
      setUser(readLS<HaqqiUser | null>(LS_SESSION, null));
      setReady(true);
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ needsVerify: boolean }> => {
      if (password.length < 8) throw "weak_password" as AuthError;
      const mail = email.trim().toLowerCase();

      if (mode === "supabase") {
        const sb = getBrowserSupabase()!;
        const { data, error } = await sb.auth.signUp({
          email: mail,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) throw "email_taken" as AuthError;
          throw "generic" as AuthError;
        }
        const verified = Boolean(data.session);
        if (data.user && !verified) return { needsVerify: true };
        setUser(mapSession(data.session));
        return { needsVerify: false };
      }

      const users = readLS<Record<string, DemoUserRecord>>(LS_USERS, {});
      if (users[mail]) throw "email_taken" as AuthError;
      users[mail] = {
        id: crypto.randomUUID(),
        name: name.trim(),
        password,
        verified: false,
      };
      writeLS(LS_USERS, users);
      const session: HaqqiUser = {
        id: users[mail].id,
        email: mail,
        name: users[mail].name,
        verified: false,
      };
      writeLS(LS_SESSION, session);
      setUser(session);
      return { needsVerify: true };
    },
    [mode]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const mail = email.trim().toLowerCase();

      if (mode === "supabase") {
        const sb = getBrowserSupabase()!;
        const { data, error } = await sb.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (error) throw "invalid_credentials" as AuthError;
        const u = mapSession(data.session);
        if (!u?.verified) {
          await sb.auth.signOut();
          throw "not_verified" as AuthError;
        }
        setUser(u);
        return;
      }

      const users = readLS<Record<string, DemoUserRecord>>(LS_USERS, {});
      const rec = users[mail];
      if (!rec || rec.password !== password) throw "invalid_credentials" as AuthError;
      if (!rec.verified) {
        // refresh session to reflect any pending verification
        const session = readLS<HaqqiUser | null>(LS_SESSION, null);
        if (!(session && session.email === mail && session.verified)) {
          writeLS(
            LS_SESSION,
            { id: rec.id, email: mail, name: rec.name, verified: false } satisfies HaqqiUser
          );
          throw "not_verified" as AuthError;
        }
      }
      writeLS(LS_SESSION, { id: rec.id, email: mail, name: rec.name, verified: true } satisfies HaqqiUser);
      setUser({ id: rec.id, email: mail, name: rec.name, verified: true });
    },
    [mode]
  );

  const logout = useCallback(async () => {
    if (mode === "supabase") await getBrowserSupabase()!.auth.signOut();
    try {
      localStorage.removeItem(LS_SESSION);
    } catch {}
    setUser(null);
  }, [mode]);

  const demoVerifyEmail = useCallback(() => {
    const session = readLS<HaqqiUser | null>(LS_SESSION, null);
    if (!session) return;
    session.verified = true;
    writeLS(LS_SESSION, session);
    const users = readLS<Record<string, DemoUserRecord>>(LS_USERS, {});
    if (users[session.email]) {
      users[session.email].verified = true;
      writeLS(LS_USERS, users);
    }
    setUser(session);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, mode, register, login, logout, demoVerifyEmail }),
    [user, ready, mode, register, login, logout, demoVerifyEmail]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

type DemoUserRecord = { id: string; name: string; password: string; verified: boolean };

function mapSession(s: Session | null): HaqqiUser | null {
  if (!s?.user) return null;
  const meta = (s.user.user_metadata ?? {}) as { full_name?: string };
  return {
    id: s.user.id,
    email: s.user.email ?? "",
    name: meta.full_name ?? null,
    verified: Boolean(s.user.email_confirmed_at),
  };
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Case access — paid toolkit unlock (JOD 30 per case, CliQ only)      */
/* ------------------------------------------------------------------ */

const CASE_KEY_PREFIX = "haqqi_case_paid_v1_";

export type CaseAccess = {
  paid: boolean;
  loading: boolean;
  /** Demo mode only: simulate the admin confirming a CliQ transfer. */
  demoConfirmPayment: () => void;
};

export function useCaseAccess(): CaseAccess {
  const { user, mode, ready } = useAuth();
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user || !user.verified) {
      setPaid(false);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function check() {
      if (mode === "demo") {
        setPaid(readLS<boolean>(CASE_KEY_PREFIX + user!.id, false));
        setLoading(false);
        return;
      }
      try {
        const sb = getBrowserSupabase()!;
        const { data } = await sb.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch("/api/payments", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (!cancelled) {
          setPaid(
            Array.isArray(json.payments) &&
              json.payments.some((p: { status: string }) => p.status === "confirmed")
          );
        }
      } catch {
        if (!cancelled) setPaid(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [user, mode, ready]);

  function demoConfirmPayment() {
    if (mode !== "demo" || !user) return;
    writeLS(CASE_KEY_PREFIX + user.id, true);
    setPaid(true);
  }

  return { paid, loading, demoConfirmPayment };
}
