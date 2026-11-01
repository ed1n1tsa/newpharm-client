"use client";

import { usePathname } from "next/navigation";
import Header from "@/ui/Header";
import Footer from "@/ui/Footer";
import MobileNav from "@/ui/MobileNav";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/admin");
  const isClient = pathname?.startsWith("/client");
  // Cart/checkout have their own sticky CTA — hide site chrome that fights them
  const isPurchaseFlow =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout");

  return (
    <div className="bg-background text-text min-h-screen flex flex-col">
      {!isAdmin && !isClient && <Header />}

      <main className="flex-grow">{children}</main>

      {!isAdmin && !isClient && !isPurchaseFlow && <MobileNav />}
      {!isAdmin && !isClient && !isPurchaseFlow && <Footer />}
    </div>
  );
}
