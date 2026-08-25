import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider, type Locale } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";

function readLocale(): Locale {
  const v = cookies().get("haqqi_locale")?.value;
  return v === "en" ? "en" : "ar";
}

export function generateMetadata(): Metadata {
  return {
    title: {
      default: "حَقّي | حقوقك بعد حادث السيارة في الأردن",
      template: "%s | حَقّي",
    },
    description:
      "منصة أردنية مجانية تساعد ضحايا حوادث السيارات على معرفة حقوقهم وتحرير شكاوى التأمين والتصعيد للبنك المركزي.",
    openGraph: {
      title: "حَقّي — حقوقك بعد حادث السيارة في الأردن",
      description:
        "خطوات واضحة، مواعيد نهائية، ونماذج شكاوى جاهزة — بلغة بسيطة وبالمجان.",
      locale: "ar_JO",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = readLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider initialLocale={locale}>
          <AuthProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-white focus:p-3 focus:shadow"
            >
              {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
            </a>
            <Header />
            <Disclaimer />
            <main id="main" className="container-page min-h-[60vh] py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
