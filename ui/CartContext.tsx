"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./Toast";           // 🔹 добавили
import type { Product } from "@/lib/mockData";

type CartItem = { productId: string; qty: number };
type CartContextType = { items: CartItem[]; add: (p: Product, qty?: number) => void };

const CartContext = createContext<CartContextType | null>(null);
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider/>");
  return ctx;
};

const key = (uid: string) => `np_cart_${uid}`;

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuth } = useAuth();
  const toast = useToast();                    // 🔹 добавили
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    try {
      const raw = localStorage.getItem(key(user.id));
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [user]);

  const persist = (list: CartItem[]) => {
    if (!user) return;
    localStorage.setItem(key(user.id), JSON.stringify(list));
  };

  const add = (p: Product, qty = 1) => {
    if (!user) { openAuth(() => add(p, qty)); return; }
    setItems((prev) => {
      const next = [...prev];
      const i = next.findIndex((it) => it.productId === p.id);
      if (i >= 0) next[i].qty += qty;
      else next.push({ productId: p.id, qty });
      persist(next);
      return next;
    });
    toast.show("Товар добавлен в корзину");    // 🔹 тост на 3 сек
  };

  const value = useMemo(() => ({ items, add }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
