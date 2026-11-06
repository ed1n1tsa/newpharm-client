import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@/styles/globals.css";

import Providers from "@/ui/Providers";
import { SupabaseListener } from "@/lib/supabase-listener";
import LayoutContent from "@/ui/LayoutContent";
import {
  defaultLocale,
  localeHtmlLang,
  LOCALE_COOKIE,
  normalizeLocale,
} from "@/lib/i18n";

export const metadata: Metadata = {
  title: "NewPharm — лекарства и здоровье",
  description: "Онлайн-аптека NewPharm: лекарства, консультации врачей, аптеки рядом",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const lang = localeHtmlLang[locale] || localeHtmlLang[defaultLocale];

  return (
    <html lang={lang}>
      <body className="antialiased">
        <Providers initialLocale={locale}>
          <SupabaseListener />
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
