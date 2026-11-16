import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { syncCatalogFromOnec } from "@/lib/onec-catalog-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Safe 1C → Supabase catalog sync.
 *
 * GET /api/1c/sync-catalog
 * GET /api/1c/sync-catalog?dry_run=1
 * GET /api/1c/sync-catalog?deactivate=0
 *
 * Optional cron auth: header x-onec-secret or ?secret= must match ONE_C_SECRET when set.
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin не настроен" },
      { status: 503 }
    );
  }

  const expected =
    process.env.ONE_C_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (expected) {
    const auth = req.headers.get("authorization") || "";
    const bearer = auth.toLowerCase().startsWith("bearer ")
      ? auth.slice(7).trim()
      : "";
    const got =
      req.headers.get("x-onec-secret") ||
      req.nextUrl.searchParams.get("secret") ||
      bearer ||
      "";
    if (got !== expected) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const dryRun =
    req.nextUrl.searchParams.get("dry_run") === "1" ||
    req.nextUrl.searchParams.get("dryRun") === "true";
  const deactivateMissing = req.nextUrl.searchParams.get("deactivate") !== "0";
  const syncWarehouseStocks = req.nextUrl.searchParams.get("stocks") !== "0";
  const callStocksRpc = req.nextUrl.searchParams.get("rpc") !== "0";

  const result = await syncCatalogFromOnec(supabaseAdmin, {
    dryRun,
    deactivateMissing,
    syncWarehouseStocks,
    callStocksRpc,
  });

  const status = result.ok ? 200 : 500;
  return NextResponse.json(result, { status });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
