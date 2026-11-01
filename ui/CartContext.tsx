"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToast } from "./Toast";
import {
  CartItem,
  GUEST_CART_KEY,
  cartCount,
  cartTotal,
} from "@/lib/cart-types";
import { supabase } from "@/lib/supabase-browser";

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (product: {
    id: string;
    name?: string;
    title?: string;
    price: number;
    image_url?: string | null;
    image?: string | null;
  }, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  refresh: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider/>");
  return ctx;
};

function readGuest(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuest(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("np-cart-changed"));
  }
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toast = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setItems(readGuest());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY) refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("np-cart-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("np-cart-changed", onCustom);
    };
  }, [refresh]);

  const persist = useCallback((next: CartItem[]) => {
    writeGuest(next);
    setItems(next);
  }, []);

  const add: CartContextType["add"] = useCallback(
    (product, qty = 1) => {
      const name = product.name || product.title || "Товар";
      const image_url = product.image_url || product.image || null;
      setItems((prev) => {
        const next = [...prev];
        const i = next.findIndex((it) => it.productId === product.id);
        if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + qty };
        else {
          next.push({
            productId: product.id,
            qty,
            name,
            price: Number(product.price) || 0,
            image_url,
          });
        }
        writeGuest(next);
        return next;
      });
      toast.show("Товар добавлен в корзину");
    },
    [toast]
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      setItems((prev) => {
        const next =
          qty < 1
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) =>
                i.productId === productId ? { ...i, qty } : i
              );
        writeGuest(next);
        return next;
      });
    },
    []
  );

  const remove = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      writeGuest(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeGuest([]);
    setItems([]);
  }, []);

  // After login: sync guest cart into Supabase carts once (best-effort).
  useEffect(() => {
    let cancelled = false;
    let syncedFor: string | null = null;

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (!user || cancelled || syncedFor === user.id) return;
      const guest = readGuest();
      if (!guest.length) return;
      syncedFor = user.id;

      try {
        let { data: cart } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (!cart) {
          const { data: created, error } = await supabase
            .from("carts")
            .insert({ user_id: user.id, status: "active" })
            .select("id")
            .single();
          if (error) throw error;
          cart = created;
        }

        for (const item of guest) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cart!.id)
            .eq("product_id", item.productId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("cart_items")
              .update({ quantity: item.qty, price: item.price })
              .eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({
              cart_id: cart!.id,
              product_id: item.productId,
              quantity: item.qty,
              price: item.price,
            });
          }
        }
      } catch (err) {
        console.warn("Не удалось синхронизировать корзину с сервером", err);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: cartCount(items),
      total: cartTotal(items),
      ready,
      add,
      setQty,
      remove,
      clear,
      refresh,
    }),
    [items, ready, add, setQty, remove, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
