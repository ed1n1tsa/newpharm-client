import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { syncCatalogFromOnec } from "@/lib/onec-catalog-sync";
import { authorizeOnecSync } from "@/lib/onec-sync-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Safe 1C → Supabase catalog sync.
 *
 * GET /api/1c/sync-catalog
 * GET /api/1c/sync-catalog?dry_run=1
 *
 * Auth (any one):
 * - header x-onec-secret / ?secret = ONE_C_SECRET
 * - Authorization: Bearer CRON_SECRET | ONE_C_SECRET
 * - CMS admin cookie
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin не настроен" },
      { status: 503 }
    );
  }

  const auth = await authorizeOnecSync(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
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
