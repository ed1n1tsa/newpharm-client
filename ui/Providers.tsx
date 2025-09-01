// ui/Providers.tsx
"use client";

import ToastProvider from "@/ui/Toast";
import AuthProvider from "@/ui/AuthContext";
import CartProvider from "@/ui/CartContext";
import AuthModal from "@/ui/AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <AuthModal />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
