"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AuthError } from "@/lib/auth";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ERR: Record<AuthError, string> = {
    invalid_credentials: t.auth.errInvalidCreds,
    not_verified: t.auth.errNotVerified,
    email_taken: t.auth.errTaken,
    weak_password: t.auth.errWeakPassword,
    generic: t.common.errorGeneric,
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold text-brand-950">{t.auth.loginTitle}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.auth.loginSubtitle}</p>

      <form
        className="card mt-6 grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setBusy(true);
          setError(null);
          try {
            await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
            router.push("/workflow");
          } catch (err) {
            setError(ERR[(err as AuthError) ?? "generic"] ?? t.common.errorGeneric);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block">
          <span className="label">{t.auth.email}</span>
          <input name="email" type="email" required dir="ltr" className="input" autoComplete="email" />
        </label>
        <label className="block">
          <span className="label">{t.auth.password}</span>
          <input
            name="password"
            type="password"
            required
            dir="ltr"
            className="input"
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error === t.auth.errNotVerified ? (
              <>
                {error}{" "}
                <Link href="/auth/verify" className="underline">
                  {t.auth.verifyTitle}
                </Link>
              </>
            ) : (
              error
            )}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? t.auth.working : t.auth.btnLogin}
        </button>

        <p className="text-center text-sm text-stone-500">
          {t.auth.noAccount}{" "}
          <Link href="/auth/register" className="font-bold text-brand-700 hover:underline">
            {t.auth.goRegister}
          </Link>
        </p>
      </form>
    </div>
  );
}
