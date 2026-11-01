export type DeliveryType = "pickup" | "delivery";

export type CheckoutPrefs = {
  deliveryType: DeliveryType;
  warehouseId: string | null;
  address: string;
};

const KEY = "np_checkout_prefs_v1";

export function readCheckoutPrefs(): CheckoutPrefs {
  if (typeof window === "undefined") {
    return { deliveryType: "pickup", warehouseId: null, address: "" };
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { deliveryType: "pickup", warehouseId: null, address: "" };
    const parsed = JSON.parse(raw);
    return {
      deliveryType: parsed.deliveryType === "delivery" ? "delivery" : "pickup",
      warehouseId: parsed.warehouseId || null,
      address: String(parsed.address || ""),
    };
  } catch {
    return { deliveryType: "pickup", warehouseId: null, address: "" };
  }
}

export function writeCheckoutPrefs(prefs: Partial<CheckoutPrefs>) {
  if (typeof window === "undefined") return;
  const next = { ...readCheckoutPrefs(), ...prefs };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

/** Extract volume/pack size from product name when no separate field exists. */
export function extractVolume(name: string): string | null {
  const m = String(name || "").match(
    /(\d+(?:[.,]\d+)?\s*(?:мл|мг|г|кг|л|шт\.?|таб(?:леток|летки)?|капс(?:ул)?\.?|саше))/i
  );
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

export function pluralItems(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return `${n} товаров`;
  if (last === 1) return `${n} товар`;
  if (last >= 2 && last <= 4) return `${n} товара`;
  return `${n} товаров`;
}

export function formatMoney(n: number): string {
  return `${(n || 0).toLocaleString("ru-RU")} ₸`;
}
