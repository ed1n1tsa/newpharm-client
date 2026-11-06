"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { useLocale } from "@/ui/LocaleProvider";

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

/** Persist without broadcasting (avoids same-window refresh races). */
function writeGuestSilent(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toast = useToast();
  const { t } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);
  const addLock = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const refresh = useCallback(() => {
    const next = readGuest();
    itemsRef.current = next;
    setItems(next);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    // Cross-tab only — do NOT listen to same-window custom events
    // (those caused double setState / race with add).
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const add: CartContextType["add"] = useCallback(
    (product, qty = 1) => {
      if (!product?.id) return;
      // Guard against double-fires (StrictMode/event duplication)
      if (addLock.current) return;
      addLock.current = true;
      queueMicrotask(() => {
        addLock.current = false;
      });

      const name = product.name || product.title || "Товар";
      const image_url = product.image_url || product.image || null;
      const amount = Math.max(1, Number(qty) || 1);

      const prev = itemsRef.current;
      const next = [...prev];
      const i = next.findIndex((it) => it.productId === product.id);
      if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + amount };
      else {
        next.push({
          productId: String(product.id),
          qty: amount,
          name,
          price: Number(product.price) || 0,
          image_url,
        });
      }
      itemsRef.current = next;
      writeGuestSilent(next);
      setItems(next);
      toast.show(t("cart.added"));
    },
    [toast, t]
  );

  const setQty = useCallback((productId: string, qty: number) => {
    const prev = itemsRef.current;
    const next =
      qty < 1
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i));
    itemsRef.current = next;
    writeGuestSilent(next);
    setItems(next);
  }, []);

  const remove = useCallback((productId: string) => {
    const next = itemsRef.current.filter((i) => i.productId !== productId);
    itemsRef.current = next;
    writeGuestSilent(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    itemsRef.current = [];
    writeGuestSilent([]);
    setItems([]);
  }, []);

  // After login: sync guest cart into Supabase carts once (best-effort).
  useEffect(() => {
    let cancelled = false;
    let syncedFor: string | null = null;

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip noisy INITIAL_SESSION duplicates where possible
        if (event !== "SIGNED_IN" && event !== "TOKEN_REFRESHED" && event !== "INITIAL_SESSION") {
          return;
        }
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
              // Set absolute qty from guest cart — do not add again
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
      }
    );

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
