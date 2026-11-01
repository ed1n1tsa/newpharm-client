"use client";

import { useEffect, useRef, useState } from "react";
import type { WarehouseFit } from "@/lib/pharmacy";

type Line = { productId: string; qty: number };

/**
 * Debounced pharmacy availability fetch — avoids StrictMode/double-mount duplicates.
 */
export function usePharmacyAvailability(
  lines: Line[],
  opts?: { onError?: (msg: string) => void }
) {
  const [fits, setFits] = useState<WarehouseFit[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const seq = useRef(0);
  const key = JSON.stringify(
    lines.map((l) => ({ productId: l.productId, qty: l.qty }))
  );

  useEffect(() => {
    if (!lines.length) {
      setFits([]);
      setRecommendedId(null);
      return;
    }

    const my = ++seq.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pharmacies/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lines }),
        });
        const data = await res.json();
        if (my !== seq.current) return;
        if (!res.ok || !data.ok) {
          opts?.onError?.(data.error || "Ошибка остатков");
          return;
        }
        setFits(data.warehouses || []);
        setRecommendedId(data.recommendedWarehouseId || null);
      } catch (err: any) {
        if (my !== seq.current) return;
        opts?.onError?.(err?.message || "Не удалось загрузить аптеки");
      } finally {
        if (my === seq.current) setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { fits, loading, recommendedId };
}
