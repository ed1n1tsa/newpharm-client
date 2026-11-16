import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { fetchOnecCatalog } from "@/lib/onec-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Refresh stocks from 1C via RPC update_stocks_from_1c.
 * Uses ONEC_* env (no hardcoded credentials).
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { success: false, error: "Supabase admin не настроен" },
      { status: 503 }
    );
  }

  const expected = process.env.ONE_C_SECRET?.trim();
  if (expected) {
    const got =
      req.headers.get("x-onec-secret") ||
      req.nextUrl.searchParams.get("secret") ||
      "";
    if (got !== expected) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { rawCount, raw } = await fetchOnecCatalog();
    const { error } = await supabaseAdmin.rpc("update_stocks_from_1c", {
      json_data: raw,
    });
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Обновление остатков завершено (${rawCount} позиций из 1С).`,
      count: rawCount,
    });
  } catch (err: any) {
    console.error("update-stocks:", err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
