// ui/Providers.tsx
"use client";

import ToastProvider from "@/ui/Toast";
import AuthProvider from "@/ui/AuthContext";
import CartProvider from "@/ui/CartContext";
import AuthModal from "@/ui/AuthModal";
import { CityProvider } from "@/ui/CityProvider";
import { LocaleProvider } from "@/ui/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export default function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <ToastProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <AuthProvider>
          <CartProvider>
            <CityProvider>
              {children}
              <AuthModal />
            </CityProvider>
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </ToastProvider>
  );
}
