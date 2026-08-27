"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CountUp, Reveal } from "@/components/motion";

/* Calm line icons — no bouncing emojis */
function IconUnderstand(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M14 3v6h6" />
      <path d="M8 14h8M8 17h5" />
    </svg>
  );
}
function IconOrganize(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  );
}
function IconEscalate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20h16" />
      <path d="m6 16 5-7 4 5 4-7" />
      <path d="M19 7h-3M19 7v3" />
    </svg>
  );
}
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}
function IconArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconLock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
function IconScale(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="m6 8-3 6h6l-3-6Z" />
      <path d="m18 8-3 6h6l-3-6Z" />
    </svg>
  );
}

const STEP_ICONS = [IconUnderstand, IconOrganize, IconEscalate];

export default function HomePage() {
  const { t, locale } = useI18n();

  const words = t.home.heroTitle.split(" ");
  const trustBadges = [t.home.trustBadge1, t.home.trustBadge2, t.home.trustBadge3];

  return (
    <div className="grid gap-24 pb-10 [&>*]:min-w-0 lg:gap-28">
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden rounded-[2rem] border border-ink-100 bg-white">
        {/* Calm aurora — single soft wash, slow drift */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 start-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl animate-hero-aurora" />
          <div className="absolute top-20 -end-24 h-[22rem] w-[22rem] rounded-full bg-brand-100/60 blur-3xl animate-hero-aurora [animation-delay:-8s]" />
        </div>

        {/* Subtle grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 lp-grid-bg [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_85%)]" />

        <div className="relative px-6 pb-20 pt-16 sm:px-10 lg:px-14 lg:pb-24 lg:pt-20">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left / main column */}
            <div className="lg:col-span-7">
              <Reveal>
                <p className="lp-eyebrow">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {t.home.heroKicker}
                </p>
              </Reveal>

              <h1 className="lp-display mt-5 max-w-2xl text-4xl text-ink-900 sm:text-5xl lg:text-[3.5rem]">
                {words.map((w, i) => (
                  <span
                    key={`${w}-${i}`}
                    className="inline-block animate-fade-up"
                    style={{ animationDelay: `${0.08 + i * 0.06}s` }}
                  >
                    {i === words.length - 1 ? (
                      <span className="gradient-text">{w}</span>
                    ) : (
                      w
                    )}
                    {"\u00A0"}
                  </span>
                ))}
              </h1>

              <Reveal delay={120}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
                  {t.home.heroSubtitle}
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/workflow" className="lp-btn-primary lp-btn-primary-lg shine">
                    {t.home.ctaPlan}
                    <IconArrow className="h-4 w-4" />
                  </Link>
                  <Link href="/rights" className="lp-btn-ghost lp-btn-ghost-lg">
                    {t.home.ctaRights}
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-ink-500">
                  {trustBadges.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 text-brand-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Right / quiet preview card */}
            <div className="lg:col-span-5">
              <Reveal delay={180}>
                <div className="relative">
                  {/* Outer card */}
                  <div className="lp-panel relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="lp-eyebrow text-ink-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                        {locale === "ar" ? "معاينة خطتك" : "Your plan preview"}
                      </p>
                      <span className="lp-tag">{locale === "ar" ? "تجريبي" : "Preview"}</span>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      {t.home.howSteps.map((s, i) => {
                        const Icon = STEP_ICONS[i];
                        return (
                          <div
                            key={s.title}
                            className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3.5 py-3"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-700">
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-ink-800">
                                {s.title}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-500">
                                {s.body}
                              </p>
                            </div>
                            <IconCheck className="ms-auto h-4 w-4 shrink-0 text-brand-600" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Hairline footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-[12px] text-ink-500">
                      <span className="flex items-center gap-1.5">
                        <IconLock className="h-3.5 w-3.5" />
                        {locale === "ar" ? "تسجيل + تأكيد بريد" : "Sign-in + email confirm"}
                      </span>
                      <span className="font-mono tabular-nums text-ink-400">
                        JOD 30 / case
                      </span>
                    </div>
                  </div>

                  {/* Soft floating stat — kept calm */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -end-6 hidden lg:block"
                    style={{ animation: "float 10s ease-in-out infinite" }}
                  >
                    <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-soft">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                        {locale === "ar" ? "موعد نهائي" : "Deadline"}
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold text-ink-800">
                        3 {locale === "ar" ? "سنوات تقادم" : "years · limitation"}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BAD-PRACTICE MARQUEE (calm) ===================== */}
      <section aria-hidden className="min-w-0 select-none overflow-hidden">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
          {locale === "ar" ? "المشاكل التي نعالجها" : "Bad practices we help you counter"}
        </p>
        <div className="overflow-hidden border-y border-ink-100 bg-white py-3.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max items-center gap-10 animate-marquee will-change-transform">
            {Object.values(t.complaints.issueOptions).flatMap((p, i) => {
              const item = (
                <span
                  key={`${p}-${i}`}
                  className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold text-ink-500"
                  dir="auto"
                >
                  <span className="text-ink-400 line-through decoration-ink-300 decoration-[1.5px]">
                    {p}
                  </span>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-[10px] text-brand-700">
                    <IconCheck className="h-3 w-3" />
                  </span>
                </span>
              );
              return [item, item];
            })}
          </div>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section aria-labelledby="how-title" className="relative">
        <Reveal>
          <div className="max-w-2xl">
            <p className="lp-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {locale === "ar" ? "الخطوات" : "Process"}
            </p>
            <h2
              id="how-title"
              className="lp-display mt-4 text-3xl text-ink-900 sm:text-4xl"
            >
              {t.home.howTitle}
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          {t.home.howSteps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Reveal key={s.title} delay={i * 120}>
                <div className="lp-card lp-card-hover h-full">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold tracking-wider text-ink-400">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[17px] font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ====================== KEY NUMBERS (count-up) ====================== */}
      <section aria-labelledby="nums-title">
        <Reveal>
          <div className="lp-panel-dark relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50">
              <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
              <div className="absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />
            </div>

            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                  {locale === "ar" ? "أرقام جوهرية" : "Reference numbers"}
                </p>
                <h2
                  id="nums-title"
                  className="lp-display mt-4 text-2xl text-white sm:text-3xl"
                >
                  {t.home.ceilingsTeaserTitle}
                </h2>
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-ink-300">
                  {t.home.ceilingsTeaserNote}
                </p>
                <Link
                  href="/rights"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-200"
                >
                  {t.common.seeMore}
                  <IconArrow className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-8">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    {locale === "ar" ? "سقف الوفاة / العجز الكلي" : "Death / TTD cap"}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    ≈ <CountUp to={20000} locale={locale} />
                  </p>
                  <p className="mt-1 text-[12px] text-ink-400">
                    {locale === "ar" ? "دينار أردني" : "JOD"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    {locale === "ar" ? "عجز مؤقت" : "Temporary disability"}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    ≈ <CountUp to={100} locale={locale} />
                  </p>
                  <p className="mt-1 text-[12px] text-ink-400">
                    JOD / {locale === "ar" ? "أسبوع" : "week"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    {locale === "ar" ? "موعد السداد" : "Payment window"}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl" dir="ltr">
                    5–10
                  </p>
                  <p className="mt-1 text-[12px] text-ink-400">
                    {t.common.workingDays}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======================== PRICING TEASER ======================== */}
      <section aria-labelledby="pricing-teaser">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="lp-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {locale === "ar" ? "التسعير" : "Pricing"}
            </p>
            <h2
              id="pricing-teaser"
              className="lp-display mt-4 text-3xl text-ink-900 sm:text-4xl"
            >
              {t.home.pricingTeaserTitle}
            </h2>
            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-800 transition hover:text-brand-700"
            >
              {t.home.pricingCta}
              <IconArrow className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid gap-4 md:col-span-7 sm:grid-cols-2">
            <Reveal>
              <div className="lp-card lp-card-hover h-full">
                <p className="lp-tag">{locale === "ar" ? "مجاني" : "Free"}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">
                  {t.home.pricingTeaserFree}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-ink-500">
                  <IconCheck className="h-4 w-4 text-brand-600" />
                  {locale === "ar" ? "بعد التسجيل" : "After sign-up"}
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="lp-card lp-card-hover relative h-full border-ink-900/10 bg-ink-50/40">
                <div className="flex items-center justify-between">
                  <p className="lp-tag border-ink-900/20 bg-white text-ink-800">
                    CliQ · {t.pricing.paidPrice}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    {locale === "ar" ? "لكل حالة" : "per case"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">
                  {t.home.pricingTeaserPaid}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-ink-500">
                  <IconShield className="h-4 w-4 text-brand-600" />
                  {locale === "ar" ? "دفع آمن عبر CliQ" : "Secure CliQ payment"}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================= CORRUPTION ALERT ======================= */}
      <section aria-labelledby="corr-title">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50/60 p-7 sm:p-8">
            <div className="flex items-start gap-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white text-ink-800">
                <IconScale className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  {locale === "ar" ? "تنبيه" : "Advisory"}
                </p>
                <h2
                  id="corr-title"
                  className="mt-1.5 text-[19px] font-bold text-ink-900 sm:text-xl"
                >
                  {t.home.corruptionAlertTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-[14px] leading-loose text-ink-700">
                  {t.home.corruptionAlertBody}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ========================= STORIES TEASER ========================= */}
      <section aria-labelledby="stories-teaser">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal dir="left" className="md:col-span-5">
            <div className="relative">
              <div className="lp-panel">
                <p className="lp-eyebrow text-ink-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  {locale === "ar" ? "من المجتمع" : "Community"}
                </p>
                <div className="mt-5 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-ink-100 bg-white p-4"
                    >
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                        <span className="h-2 w-12 rounded-full bg-ink-200" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-ink-100" />
                        <div className="h-2 w-5/6 rounded-full bg-ink-100" />
                        <div className="h-2 w-2/3 rounded-full bg-brand-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal dir="right" delay={120} className="md:col-span-7">
            <div>
              <h2
                id="stories-teaser"
                className="lp-display text-3xl text-ink-900 sm:text-4xl"
              >
                {t.home.storiesTeaserTitle}
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-600">
                {t.home.storiesTeaserBody}
              </p>
              <Link
                href="/stories"
                className="lp-btn-ghost mt-7"
              >
                {t.nav.stories}
                <IconArrow className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== FINAL CTA ========================== */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-ink-900 bg-ink-900 px-6 py-16 text-center text-white sm:px-12">
            {/* Soft brand wash, not a rainbow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -top-24 start-1/3 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
              <div className="absolute -bottom-24 end-1/4 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
            </div>

            <p className="relative inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
              {locale === "ar" ? "ابدأ الآن" : "Get started"}
            </p>
            <h2 className="lp-display relative mx-auto mt-4 max-w-2xl text-3xl text-white sm:text-4xl">
              {t.home.heroTitle}
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-ink-300">
              {t.home.heroSubtitle}
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-ink-900 shadow-soft-sm transition duration-200 ease-smooth hover:bg-ink-100"
              >
                {t.pricing.ctaStart}
                <IconArrow className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[15px] font-semibold text-white transition duration-200 ease-smooth hover:bg-white/[0.08]"
              >
                {t.home.pricingCta}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
