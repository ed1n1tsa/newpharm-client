import type { Metadata } from "next";
import "@/styles/globals.css";

import Providers from "@/ui/Providers";
import { SupabaseListener } from "@/lib/supabase-listener";
import LayoutContent from "@/ui/LayoutContent";

export const metadata: Metadata = {
  title: "NewPharm — лекарства и здоровье",
  description: "Онлайн-аптека NewPharm: лекарства, консультации врачей, аптеки рядом",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <Providers>
          <SupabaseListener />
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
