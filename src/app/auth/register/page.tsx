"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AuthError } from "@/lib/auth";

export default function RegisterPage() {
  const { t } = useI18n();
  const { register, mode } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ERR: Record<AuthError, string> = {
    email_taken: t.auth.errTaken,
    weak_password: t.auth.errWeakPassword,
    invalid_credentials: t.auth.errInvalidCreds,
    not_verified: t.auth.errNotVerified,
    generic: t.common.errorGeneric,
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold text-brand-950">{t.auth.registerTitle}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.auth.registerSubtitle}</p>

      <form
        className="card mt-6 grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setBusy(true);
          setError(null);
          try {
            await register(
              String(fd.get("name") ?? ""),
              String(fd.get("email") ?? ""),
              String(fd.get("password") ?? "")
            );
            router.push("/auth/verify");
          } catch (err) {
            setError(ERR[(err as AuthError) ?? "generic"] ?? t.common.errorGeneric);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block">
          <span className="label">{t.auth.name} <span className="text-red-600">*</span></span>
          <input name="name" required maxLength={120} className="input" autoComplete="name" />
        </label>
        <label className="block">
          <span className="label">{t.auth.email} <span className="text-red-600">*</span></span>
          <input name="email" type="email" required dir="ltr" className="input" autoComplete="email" />
        </label>
        <label className="block">
          <span className="label">
            {t.auth.password} <span className="text-red-600">*</span>{" "}
            <span className="text-xs font-normal text-stone-400">({t.auth.passwordMin})</span>
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            dir="ltr"
            className="input"
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? t.auth.working : t.auth.btnRegister}
        </button>

        <p className="text-center text-sm text-stone-500">
          {t.auth.haveAccount}{" "}
          <Link href="/auth/login" className="font-bold text-brand-700 hover:underline">
            {t.auth.goLogin}
          </Link>
        </p>
      </form>
    </div>
  );
}
