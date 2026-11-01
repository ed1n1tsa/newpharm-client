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

  // отключаем общий layout для админки и клиентской зоны
  const isAdmin = pathname?.startsWith("/admin");
  const isClient = pathname?.startsWith("/client");
  // Checkout/cart use their own sticky CTAs — hide bottom nav there
  const hideMobileNav =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout");

  return (
    <div className="bg-background text-text min-h-screen flex flex-col">
      {/* если НЕ admin и НЕ client — показываем общий header/footer */}
      {!isAdmin && !isClient && <Header />}

      <main className="flex-grow">{children}</main>

      {!isAdmin && !isClient && !hideMobileNav && <MobileNav />}
      {!isAdmin && !isClient && <Footer />}
    </div>
  );
}
