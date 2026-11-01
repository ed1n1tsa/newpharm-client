// ui/Providers.tsx
"use client";

import ToastProvider from "@/ui/Toast";
import AuthProvider from "@/ui/AuthContext";
import CartProvider from "@/ui/CartContext";
import AuthModal from "@/ui/AuthModal";
import { CityProvider } from "@/ui/CityProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <CityProvider>
            {children}
            <AuthModal />
          </CityProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
