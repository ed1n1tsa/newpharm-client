import type { SupabaseClient } from "@supabase/supabase-js";
import {
  detectCategory,
  fetchOnecCatalog,
  type NormalizedOnecProduct,
} from "@/lib/onec-catalog";

const PLACEHOLDER_IMAGE = "/images/product.png";
const PRODUCT_CHUNK = 200;
const STOCK_CHUNK = 500;

export type SyncCatalogOptions = {
  dryRun?: boolean;
  /** Soft-deactivate products that have external_id_1c but are missing from 1C */
  deactivateMissing?: boolean;
  /** Also refresh product_stocks by matching warehouse names */
  syncWarehouseStocks?: boolean;
  /** Pass full raw JSON into update_stocks_from_1c RPC when available */
  callStocksRpc?: boolean;
};

export type SyncCatalogResult = {
  ok: boolean;
  dryRun: boolean;
  onecRawCount: number;
  onecUniqueCount: number;
  onecDuplicateIdGroups: number;
  toInsert: number;
  toUpdate: number;
  toDeactivate: number;
  inserted: number;
  updated: number;
  deactivated: number;
  stocksUpserted: number;
  stocksRpc: "skipped" | "ok" | "error" | "dry_run";
  stocksRpcError?: string;
  sampleInserts: string[];
  sampleUpdates: string[];
  sampleDeactivates: string[];
  error?: string;
};

type ExistingProduct = {
  id: string;
  external_id_1c: string | null;
  is_active: boolean | null;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeWhName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^склад\s+/i, "")
    .replace(/^аптека\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadAllProducts(
  sb: SupabaseClient
): Promise<ExistingProduct[]> {
  const pageSize = 1000;
  let from = 0;
  const all: ExistingProduct[] = [];
  for (;;) {
    const { data, error } = await sb
      .from("products")
      .select("id, external_id_1c, is_active")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data || []) as ExistingProduct[];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function loadWarehouses(
  sb: SupabaseClient
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await sb
    .from("warehouses")
    .select("id, name")
    .eq("is_active", true);
  if (error) throw error;
  return (data || []) as { id: string; name: string }[];
}

function matchWarehouseId(
  onecName: string,
  warehouses: { id: string; name: string }[]
): string | null {
  const key = normalizeWhName(onecName);
  if (!key) return null;
  for (const wh of warehouses) {
    if (normalizeWhName(wh.name) === key) return wh.id;
  }
  // loose contains
  for (const wh of warehouses) {
    const n = normalizeWhName(wh.name);
    if (n.includes(key) || key.includes(n)) return wh.id;
  }
  return null;
}

export async function syncCatalogFromOnec(
  sb: SupabaseClient,
  options: SyncCatalogOptions = {}
): Promise<SyncCatalogResult> {
  const dryRun = Boolean(options.dryRun);
  const deactivateMissing = options.deactivateMissing !== false;
  const syncWarehouseStocks = options.syncWarehouseStocks !== false;
  const callStocksRpc = options.callStocksRpc !== false;

  const empty: SyncCatalogResult = {
    ok: false,
    dryRun,
    onecRawCount: 0,
    onecUniqueCount: 0,
    onecDuplicateIdGroups: 0,
    toInsert: 0,
    toUpdate: 0,
    toDeactivate: 0,
    inserted: 0,
    updated: 0,
    deactivated: 0,
    stocksUpserted: 0,
    stocksRpc: "skipped",
    sampleInserts: [],
    sampleUpdates: [],
    sampleDeactivates: [],
  };

  try {
    const { rawCount, products, raw } = await fetchOnecCatalog();
    const onecDuplicateIdGroups = products.filter((p) => p.duplicateRows > 0).length;

    const existing = await loadAllProducts(sb);
    const byExternal = new Map<string, ExistingProduct>();
    for (const row of existing) {
      if (row.external_id_1c) byExternal.set(String(row.external_id_1c), row);
    }

    const onecIds = new Set(products.map((p) => p.externalId));
    const toInsert: NormalizedOnecProduct[] = [];
    const toUpdate: { product: NormalizedOnecProduct; id: string }[] = [];

    for (const p of products) {
      const found = byExternal.get(p.externalId);
      if (found) toUpdate.push({ product: p, id: found.id });
      else toInsert.push(p);
    }

    const toDeactivate = deactivateMissing
      ? existing.filter(
          (r) =>
            r.external_id_1c &&
            !onecIds.has(String(r.external_id_1c)) &&
            r.is_active !== false
        )
      : [];

    const result: SyncCatalogResult = {
      ...empty,
      ok: true,
      onecRawCount: rawCount,
      onecUniqueCount: products.length,
      onecDuplicateIdGroups,
      toInsert: toInsert.length,
      toUpdate: toUpdate.length,
      toDeactivate: toDeactivate.length,
      sampleInserts: toInsert.slice(0, 8).map((p) => `${p.externalId} · ${p.name}`),
      sampleUpdates: toUpdate
        .slice(0, 8)
        .map((u) => `${u.product.externalId} · ${u.product.name}`),
      sampleDeactivates: toDeactivate
        .slice(0, 8)
        .map((r) => String(r.external_id_1c)),
    };

    if (dryRun) {
      result.stocksRpc = callStocksRpc ? "dry_run" : "skipped";
      return result;
    }

    const now = new Date().toISOString();

    // Inserts — include placeholder image only for NEW rows
    for (const batch of chunk(toInsert, PRODUCT_CHUNK)) {
      const rows = batch.map((p) => ({
        external_id_1c: p.externalId,
        name: p.name,
        category: detectCategory(p.name),
        price: p.price,
        stock: p.stock,
        image_url: PLACEHOLDER_IMAGE,
        is_active: true,
        updated_at: now,
      }));
      const { error } = await sb.from("products").insert(rows);
      if (error) throw error;
      result.inserted += rows.length;
    }

    // Updates by id — never touch image_url / descriptions
    for (const batch of chunk(toUpdate, 50)) {
      const outcomes = await Promise.all(
        batch.map(({ product: p, id }) =>
          sb
            .from("products")
            .update({
              name: p.name,
              price: p.price,
              stock: p.stock,
              is_active: true,
              updated_at: now,
            })
            .eq("id", id)
        )
      );
      for (const { error } of outcomes) {
        if (error) throw error;
      }
      result.updated += batch.length;
    }

    // Soft-deactivate missing from 1C
    for (const batch of chunk(toDeactivate, PRODUCT_CHUNK)) {
      const ids = batch.map((r) => r.id);
      const { error } = await sb
        .from("products")
        .update({ is_active: false, updated_at: now })
        .in("id", ids);
      if (error) throw error;
      result.deactivated += ids.length;
    }

    // Refresh id map after inserts for stock rows
    let productIdByExternal = byExternal;
    if (toInsert.length > 0 || syncWarehouseStocks) {
      const refreshed = await loadAllProducts(sb);
      productIdByExternal = new Map();
      for (const row of refreshed) {
        if (row.external_id_1c)
          productIdByExternal.set(String(row.external_id_1c), row);
      }
    }

    if (syncWarehouseStocks) {
      const warehouses = await loadWarehouses(sb);
      const stockRows: {
        product_id: string;
        warehouse_id: string;
        quantity: number;
        updated_at: string;
      }[] = [];

      for (const p of products) {
        const prod = productIdByExternal.get(p.externalId);
        if (!prod) continue;
        for (const w of p.warehouses) {
          const warehouseId = matchWarehouseId(w.name, warehouses);
          if (!warehouseId) continue;
          stockRows.push({
            product_id: prod.id,
            warehouse_id: warehouseId,
            quantity: w.quantity,
            updated_at: now,
          });
        }
      }

      for (const batch of chunk(stockRows, STOCK_CHUNK)) {
        const { error } = await sb.from("product_stocks").upsert(batch, {
          onConflict: "product_id,warehouse_id",
        });
        if (error) throw error;
        result.stocksUpserted += batch.length;
      }
    }

    if (callStocksRpc) {
      const { error } = await sb.rpc("update_stocks_from_1c", { json_data: raw });
      if (error) {
        result.stocksRpc = "error";
        result.stocksRpcError = error.message;
      } else {
        result.stocksRpc = "ok";
      }
    }

    await sb.from("integration_1c_queue").insert({
      direction: "in",
      kind: "catalog",
      status: "imported",
      payload_json: {
        safe_sync: true,
        dry_run: false,
        onec_raw: result.onecRawCount,
        onec_unique: result.onecUniqueCount,
        inserted: result.inserted,
        updated: result.updated,
        deactivated: result.deactivated,
        stocks_upserted: result.stocksUpserted,
        stocks_rpc: result.stocksRpc,
        stocks_rpc_error: result.stocksRpcError ?? null,
      },
    });

    return result;
  } catch (err: any) {
    const message = err?.message || String(err);
    try {
      await sb.from("integration_1c_queue").insert({
        direction: "in",
        kind: "catalog",
        status: "error",
        last_error: message,
        payload_json: { safe_sync: true, dry_run: dryRun, error: message },
      });
    } catch {
      // ignore logging failure
    }
    return { ...empty, ok: false, error: message };
  }
}
