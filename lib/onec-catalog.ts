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

const DEFAULT_TIMEOUT_MS = 120_000;

/** HTTPS GET with optional rejectUnauthorized scoped to this request only. */
function httpsGetJson(
  url: string,
  headers: Record<string, string>,
  opts: { timeoutMs: number; rejectUnauthorized: boolean }
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    import("node:https")
      .then((https) => {
        const u = new URL(url);
        const req = https.request(
          {
            protocol: u.protocol,
            hostname: u.hostname,
            port: u.port || 443,
            path: `${u.pathname}${u.search}`,
            method: "GET",
            headers,
            rejectUnauthorized: opts.rejectUnauthorized,
            timeout: opts.timeoutMs,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
            res.on("end", () =>
              resolve({
                status: res.statusCode || 0,
                body: Buffer.concat(chunks).toString("utf8"),
              })
            );
          }
        );
        req.on("timeout", () => {
          req.destroy();
          reject(new Error(`Таймаут запроса к 1С (${opts.timeoutMs} мс)`));
        });
        req.on("error", reject);
        req.end();
      })
      .catch(reject);
  });
}

export async function fetchOnecCatalog(opts?: {
  baseUrl?: string;
  user?: string;
  pass?: string;
  timeoutMs?: number;
}): Promise<{ rawCount: number; products: NormalizedOnecProduct[]; raw: OnecRawItem[] }> {
  const baseUrl = (opts?.baseUrl || process.env.ONEC_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  const user = opts?.user || process.env.ONEC_USER || "";
  const pass = opts?.pass || process.env.ONEC_PASS || "";
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!baseUrl || !user || !pass) {
    throw new Error("ONEC_BASE_URL / ONEC_USER / ONEC_PASS не заданы");
  }

  const url = `${baseUrl}/counterparties/counterparties_list`;
  const headers = { Authorization: basicAuthHeader(user, pass) };

  let status = 0;
  let body = "";

  // Prefer verifying TLS; fall back to request-scoped insecure only on cert errors.
  try {
    const res = await httpsGetJson(url, headers, {
      timeoutMs,
      rejectUnauthorized: true,
    });
    status = res.status;
    body = res.body;
  } catch (err: any) {
    const msg = String(err?.message || err);
    const certIssue =
      /certificate|CERT_|UNABLE_TO_VERIFY|self.signed|unable to verify/i.test(
        msg
      );
    if (!certIssue) throw err;
    const res = await httpsGetJson(url, headers, {
      timeoutMs,
      rejectUnauthorized: false,
    });
    status = res.status;
    body = res.body;
  }

  if (status < 200 || status >= 300) {
    throw new Error(`Ошибка 1С (${status}): ${body.slice(0, 500)}`);
  }

  let raw: OnecRawItem[];
  try {
    raw = JSON.parse(body) as OnecRawItem[];
  } catch {
    throw new Error("Ответ 1С не является JSON");
  }
  if (!Array.isArray(raw)) {
    throw new Error("Ответ 1С не является массивом");
  }

  return {
    rawCount: raw.length,
    products: mergeOnecItems(raw),
    raw,
  };
}
