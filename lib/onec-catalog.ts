/**
 * Safe 1C catalog helpers: fetch, dedupe, normalize.
 * Price/stock rules for duplicate Ids: max price, sum stock, merge warehouses.
 */

export type OnecWarehouseStock = {
  Id?: string;
  Sklad?: string;
  Ostatok?: number;
};

export type OnecRawItem = {
  Id?: string;
  Name?: string;
  Price?: number | string;
  Склады?: OnecWarehouseStock[];
};

export type NormalizedWarehouseQty = {
  onecWarehouseId: string | null;
  name: string;
  quantity: number;
};

export type NormalizedOnecProduct = {
  externalId: string;
  name: string;
  price: number;
  stock: number;
  warehouses: NormalizedWarehouseQty[];
  duplicateRows: number;
};

export function basicAuthHeader(user: string, pass: string) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("таб") || lower.includes("амп") || lower.includes("мг"))
    return "Лекарственные средства";
  if (
    lower.includes("витамин") ||
    lower.includes("b12") ||
    lower.includes("b6") ||
    lower.includes("омега")
  )
    return "Витамины и БАДы";
  if (
    lower.includes("спрей") ||
    lower.includes("раствор") ||
    lower.includes("мазь") ||
    lower.includes("капли")
  )
    return "Медицинские препараты";
  if (lower.includes("масло") || lower.includes("гель") || lower.includes("уход"))
    return "Косметика и уход";
  if (
    lower.includes("дет") ||
    lower.includes("пустышка") ||
    lower.includes("пеленк") ||
    lower.includes("нагрудник")
  )
    return "Товары для детей";
  if (
    lower.includes("тест") ||
    lower.includes("термометр") ||
    lower.includes("тонометр")
  )
    return "Медицинские приборы";
  if (lower.includes("трав") || lower.includes("чай") || lower.includes("каркаде"))
    return "Травы и сборы";
  return "Прочее";
}

function warehouseKey(w: OnecWarehouseStock): string {
  const id = String(w.Id ?? "").trim();
  const name = String(w.Sklad ?? "").trim();
  return id || name || "_unknown";
}

/** Merge duplicate 1C rows for the same Id: max price, sum stocks, merge warehouses. */
export function mergeOnecItems(items: OnecRawItem[]): NormalizedOnecProduct[] {
  const byId = new Map<
    string,
    {
      name: string;
      price: number;
      warehouses: Map<string, NormalizedWarehouseQty>;
      duplicateRows: number;
    }
  >();

  for (const item of items) {
    const externalId = String(item.Id ?? "").trim();
    if (!externalId) continue;

    const name = String(item.Name ?? "").trim() || "Без названия";
    const price = Number(item.Price ?? 0) || 0;
    const rows = Array.isArray(item.Склады) ? item.Склады : [];

    let entry = byId.get(externalId);
    if (!entry) {
      entry = {
        name,
        price,
        warehouses: new Map(),
        duplicateRows: 0,
      };
      byId.set(externalId, entry);
    } else {
      entry.duplicateRows += 1;
      if (name && name !== "Без названия") entry.name = name;
      if (price > entry.price) entry.price = price;
    }

    for (const w of rows) {
      const key = warehouseKey(w);
      const qty = Number(w.Ostatok ?? 0) || 0;
      const prev = entry.warehouses.get(key);
      if (prev) {
        prev.quantity += qty;
      } else {
        entry.warehouses.set(key, {
          onecWarehouseId: w.Id != null ? String(w.Id) : null,
          name: String(w.Sklad ?? "").trim() || key,
          quantity: qty,
        });
      }
    }
  }

  const out: NormalizedOnecProduct[] = [];
  for (const [externalId, entry] of byId) {
    const warehouses = Array.from(entry.warehouses.values());
    const stock = warehouses.reduce((sum, w) => sum + w.quantity, 0);
    out.push({
      externalId,
      name: entry.name,
      price: entry.price,
      stock,
      warehouses,
      duplicateRows: entry.duplicateRows,
    });
  }
  return out;
}

export async function fetchOnecCatalog(opts?: {
  baseUrl?: string;
  user?: string;
  pass?: string;
}): Promise<{ rawCount: number; products: NormalizedOnecProduct[]; raw: OnecRawItem[] }> {
  const baseUrl = (opts?.baseUrl || process.env.ONEC_BASE_URL || "").replace(/\/$/, "");
  const user = opts?.user || process.env.ONEC_USER || "";
  const pass = opts?.pass || process.env.ONEC_PASS || "";

  if (!baseUrl || !user || !pass) {
    throw new Error("ONEC_BASE_URL / ONEC_USER / ONEC_PASS не заданы");
  }

  const url = `${baseUrl}/counterparties/counterparties_list`;
  // 1C host may use a cert chain that Node rejects in some envs
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: basicAuthHeader(user, pass) },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка 1С (${res.status}): ${text.slice(0, 500)}`);
    }
    const raw = (await res.json()) as OnecRawItem[];
    if (!Array.isArray(raw)) {
      throw new Error("Ответ 1С не является массивом");
    }
    return {
      rawCount: raw.length,
      products: mergeOnecItems(raw),
      raw,
    };
  } finally {
    if (prevTls === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
  }
}
