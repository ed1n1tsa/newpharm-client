import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

import Header from "@/ui/Header";
import Footer from "@/ui/Footer";
import MobileNav from "@/ui/MobileNav";
import Providers from "@/ui/Providers"; // ✅ единый провайдер

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewPharm",
  description: "Онлайн-аптека",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="bg-background text-text min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <MobileNav />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
