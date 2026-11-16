import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { syncCatalogFromOnec } from "@/lib/onec-catalog-sync";
import { authorizeOnecSync } from "@/lib/onec-sync-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Legacy admin entrypoint «Обновить из 1С».
 * Delegates to the safe catalog sync (preserves image_url).
 * Prefer /api/1c/sync-catalog going forward.
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

  const result = await syncCatalogFromOnec(supabaseAdmin, {
    dryRun,
    deactivateMissing: true,
    syncWarehouseStocks: true,
    callStocksRpc: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ...result, ok: false, error: result.error || "Sync failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    safe_sync: true,
    products: result.onecUniqueCount,
    categories: null,
    inserted: result.inserted,
    updated: result.updated,
    deactivated: result.deactivated,
    dryRun: result.dryRun,
    details: result,
  });
}
