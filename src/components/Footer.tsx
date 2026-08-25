"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CBJ_CONTACT } from "@/lib/legal-data";

export default function Footer() {
  const { t, locale } = useI18n();
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white print:hidden">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-brand-800">{t.meta.brand}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-600">{t.footer.about}</p>
        </div>
        <nav aria-label={t.footer.quickLinks}>
          <p className="mb-3 text-sm font-bold text-stone-900">{t.footer.quickLinks}</p>
          <ul className="grid gap-2 text-sm">
            <li><Link className="text-stone-600 hover:text-brand-700" href="/pricing">{t.nav.pricing}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/rights">{t.nav.rights}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/workflow">{t.nav.workflow}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/complaints">{t.nav.complaints}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/stories">{t.nav.stories}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/privacy">{t.nav.privacy}</Link></li>
            <li><Link className="text-stone-600 hover:text-brand-700" href="/terms">{t.footer.termsLink}</Link></li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-sm font-bold text-stone-900">{t.footer.legalRefs}</p>
          <ul className="grid list-disc gap-1.5 ps-5 text-xs leading-relaxed text-stone-600">
            {t.footer.refs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-brand-700">
            CBJ: {CBJ_CONTACT.email} · {CBJ_CONTACT.phone}
          </p>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-center text-xs text-stone-500 sm:flex-row sm:text-start">
          <p>
            © {new Date().getFullYear()} {t.meta.brand}. {t.footer.copyright}{" "}
            <Link href="/terms" className="font-semibold text-brand-700 hover:underline">
              {t.footer.termsLink}
            </Link>
          </p>
          <p className="font-semibold text-stone-600">{t.footer.emergencyLine}</p>
        </div>
      </div>
    </footer>
  );
}
