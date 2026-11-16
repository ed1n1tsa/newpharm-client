import type { SupabaseClient } from "@supabase/supabase-js";
import {
  detectCategory,
  fetchOnecCatalog,
  type NormalizedOnecProduct,
} from "@/lib/onec-catalog";

const PLACEHOLDER_IMAGE = "/images/product.png";
const PRODUCT_CHUNK = 200;
const STOCK_CHUNK = 500;
/** Refuse deactivate/stock wipe if 1C unique catalog is suspiciously small */
const MIN_CATALOG_FOR_DEACTIVATE = 50;

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
  stocksZeroed: number;
  stocksRpc: "skipped" | "ok" | "error" | "dry_run";
  stocksRpcError?: string;
  queueLogError?: string;
  legacyIdMatches: number;
  sampleInserts: string[];
  sampleUpdates: string[];
  sampleDeactivates: string[];
  error?: string;
  partial?: boolean;
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

function looksLikeOnecCode(id: string): boolean {
  if (!id) return false;
  // Standard UUID → site PK, not a 1C code
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return false;
  }
  return true;
}

/** In-process mutex so overlapping syncs on one instance don't race. */
let syncLock: Promise<void> | null = null;

async function withSyncLock<T>(fn: () => Promise<T>): Promise<T> {
  while (syncLock) {
    try {
      await syncLock;
    } catch {
      /* previous failed — continue */
    }
  }
  let release!: () => void;
  syncLock = new Promise<void>((r) => {
    release = r;
  });
  try {
    return await fn();
  } finally {
    release();
    syncLock = null;
  }
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
      .order("id", { ascending: true })
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

/** Exact normalized name only — skip ambiguous / partial matches. */
function matchWarehouseId(
  onecName: string,
  warehouses: { id: string; name: string }[]
): string | null {
  const key = normalizeWhName(onecName);
  if (!key) return null;
  const exact = warehouses.filter((wh) => normalizeWhName(wh.name) === key);
  if (exact.length === 1) return exact[0].id;
  return null;
}

function emptyResult(dryRun: boolean): SyncCatalogResult {
  return {
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
    stocksZeroed: 0,
    stocksRpc: "skipped",
    legacyIdMatches: 0,
    sampleInserts: [],
    sampleUpdates: [],
    sampleDeactivates: [],
  };
}

export async function syncCatalogFromOnec(
  sb: SupabaseClient,
  options: SyncCatalogOptions = {}
): Promise<SyncCatalogResult> {
  return withSyncLock(() => syncCatalogFromOnecUnlocked(sb, options));
}

async function syncCatalogFromOnecUnlocked(
  sb: SupabaseClient,
  options: SyncCatalogOptions = {}
): Promise<SyncCatalogResult> {
  const dryRun = Boolean(options.dryRun);
  const deactivateMissing = options.deactivateMissing !== false;
  const syncWarehouseStocks = options.syncWarehouseStocks !== false;
  const callStocksRpc = options.callStocksRpc !== false;

  const result = emptyResult(dryRun);

  try {
    const { rawCount, products, raw } = await fetchOnecCatalog();
    result.onecRawCount = rawCount;
    result.onecUniqueCount = products.length;
    result.onecDuplicateIdGroups = products.filter((p) => p.duplicateRows > 0)
      .length;

    if (products.length === 0) {
      result.error =
        "Пустой каталог 1С — sync прерван (deactivate/update не выполнялись)";
      return result;
    }

    const existing = await loadAllProducts(sb);
    const byExternal = new Map<string, ExistingProduct>();
    const byLegacyId = new Map<string, ExistingProduct>();
    for (const row of existing) {
      if (row.external_id_1c) byExternal.set(String(row.external_id_1c), row);
      // Legacy dangerous sync used 1C Id as products.id (not a UUID)
      if (row.id && looksLikeOnecCode(row.id)) {
        byLegacyId.set(String(row.id), row);
      }
    }

    const onecIds = new Set(products.map((p) => p.externalId));
    const toInsert: NormalizedOnecProduct[] = [];
    const toUpdate: {
      product: NormalizedOnecProduct;
      id: string;
      backfillExternalId?: boolean;
    }[] = [];

    for (const p of products) {
      const found = byExternal.get(p.externalId);
      if (found) {
        toUpdate.push({ product: p, id: found.id });
        continue;
      }
      const legacy = byLegacyId.get(p.externalId);
      if (legacy) {
        result.legacyIdMatches += 1;
        toUpdate.push({
          product: p,
          id: legacy.id,
          backfillExternalId: !legacy.external_id_1c,
        });
        // Prevent treating as missing later if external_id was empty
        byExternal.set(p.externalId, legacy);
        continue;
      }
      toInsert.push(p);
    }

    const catalogReliable = products.length >= MIN_CATALOG_FOR_DEACTIVATE;
    const toDeactivate =
      deactivateMissing && catalogReliable
        ? existing.filter((r) => {
            const ext = r.external_id_1c ? String(r.external_id_1c) : "";
            if (ext) {
              return !onecIds.has(ext) && r.is_active !== false;
            }
            // Legacy row keyed by id=1C code
            if (looksLikeOnecCode(r.id)) {
              return !onecIds.has(r.id) && r.is_active !== false;
            }
            return false;
          })
        : [];

    result.toInsert = toInsert.length;
    result.toUpdate = toUpdate.length;
    result.toDeactivate = toDeactivate.length;
    result.sampleInserts = toInsert
      .slice(0, 8)
      .map((p) => `${p.externalId} · ${p.name}`);
    result.sampleUpdates = toUpdate
      .slice(0, 8)
      .map((u) => `${u.product.externalId} · ${u.product.name}`);
    result.sampleDeactivates = toDeactivate
      .slice(0, 8)
      .map((r) => String(r.external_id_1c || r.id));
    result.ok = true;

    if (!catalogReliable && deactivateMissing) {
      result.queueLogError = `deactivate skipped: unique catalog ${products.length} < ${MIN_CATALOG_FOR_DEACTIVATE}`;
    }

    if (dryRun) {
      result.stocksRpc = callStocksRpc ? "dry_run" : "skipped";
      return result;
    }

    const now = new Date().toISOString();

    // Inserts — conflict-safe (concurrent sync / race → DO NOTHING)
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
      const { error } = await sb
        .from("products")
        .upsert(rows, { onConflict: "external_id_1c", ignoreDuplicates: true });
      if (error) throw error;
      result.inserted += rows.length;
    }

    // Updates by id — never touch image_url / descriptions
    for (const batch of chunk(toUpdate, 50)) {
      const outcomes = await Promise.all(
        batch.map(({ product: p, id, backfillExternalId }) => {
          const payload: Record<string, unknown> = {
            name: p.name,
            price: p.price,
            stock: p.stock,
            is_active: true,
            updated_at: now,
          };
          if (backfillExternalId) payload.external_id_1c = p.externalId;
          return sb.from("products").update(payload).eq("id", id);
        })
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
    const refreshed = await loadAllProducts(sb);
    const productIdByExternal = new Map<string, ExistingProduct>();
    for (const row of refreshed) {
      if (row.external_id_1c)
        productIdByExternal.set(String(row.external_id_1c), row);
      if (looksLikeOnecCode(row.id))
        productIdByExternal.set(String(row.id), row);
    }

    if (syncWarehouseStocks && catalogReliable) {
      const warehouses = await loadWarehouses(sb);
      const stockMap = new Map<
        string,
        {
          product_id: string;
          warehouse_id: string;
          quantity: number;
          updated_at: string;
        }
      >();

      const syncedProductIds = new Set<string>();

      for (const p of products) {
        const prod = productIdByExternal.get(p.externalId);
        if (!prod) continue;
        syncedProductIds.add(prod.id);
        for (const w of p.warehouses) {
          const warehouseId = matchWarehouseId(w.name, warehouses);
          if (!warehouseId) continue;
          const key = `${prod.id}::${warehouseId}`;
          const prev = stockMap.get(key);
          if (prev) prev.quantity += w.quantity;
          else
            stockMap.set(key, {
              product_id: prod.id,
              warehouse_id: warehouseId,
              quantity: w.quantity,
              updated_at: now,
            });
        }
      }

      // Clear stale positive stock for synced products, then upsert current
      const syncedIds = Array.from(syncedProductIds);
      for (const batch of chunk(syncedIds, STOCK_CHUNK)) {
        const { error, count } = await sb
          .from("product_stocks")
          .update({ quantity: 0, updated_at: now }, { count: "exact" })
          .in("product_id", batch)
          .gt("quantity", 0);
        if (error) throw error;
        result.stocksZeroed += count ?? 0;
      }

      const stockRows = Array.from(stockMap.values());
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

    const { error: queueErr } = await sb.from("integration_1c_queue").insert({
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
        stocks_zeroed: result.stocksZeroed,
        stocks_rpc: result.stocksRpc,
        stocks_rpc_error: result.stocksRpcError ?? null,
        legacy_id_matches: result.legacyIdMatches,
      },
    });
    if (queueErr) {
      result.queueLogError = queueErr.message;
      console.error("integration_1c_queue insert failed:", queueErr.message);
    }

    return result;
  } catch (err: any) {
    const message = err?.message || String(err);
    result.ok = false;
    result.error = message;
    result.partial =
      result.inserted > 0 ||
      result.updated > 0 ||
      result.deactivated > 0 ||
      result.stocksUpserted > 0;
    try {
      await sb.from("integration_1c_queue").insert({
        direction: "in",
        kind: "catalog",
        status: "error",
        last_error: message,
        payload_json: {
          safe_sync: true,
          dry_run: dryRun,
          error: message,
          partial: result.partial,
          inserted: result.inserted,
          updated: result.updated,
          deactivated: result.deactivated,
        },
      });
    } catch {
      // ignore logging failure
    }
    return result;
  }
}
