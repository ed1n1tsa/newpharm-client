import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  CartLine,
  WarehouseInfo,
  WarehouseStock,
  autoSelectWarehouse,
  rankWarehouses,
} from "@/lib/pharmacy";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cart: CartLine[] = Array.isArray(body.items)
      ? body.items.map((i: any) => ({
          productId: String(i.productId || i.product_id),
          qty: Math.max(1, Number(i.qty || i.quantity) || 1),
        }))
      : [];

    if (!cart.length) {
      return NextResponse.json({ ok: false, error: "Корзина пуста" }, { status: 400 });
    }

    const productIds = [...new Set(cart.map((c) => c.productId))];

    const { data: warehouses, error: whErr } = await supabaseAdmin
      .from("warehouses")
      .select("id, name, address, phone, is_active")
      .eq("is_active", true)
      .order("name");

    if (whErr) throw whErr;

    const { data: stocks, error: stErr } = await supabaseAdmin
      .from("product_stocks")
      .select("warehouse_id, product_id, quantity")
      .in("product_id", productIds);

    if (stErr) throw stErr;

    const wh = (warehouses || []) as WarehouseInfo[];
    const st = (stocks || []) as WarehouseStock[];
    const ranked = rankWarehouses(wh, cart, st);
    const selected = autoSelectWarehouse(wh, cart, st);

    return NextResponse.json({
      ok: true,
      warehouses: ranked,
      recommendedWarehouseId: selected?.warehouse.id ?? null,
    });
  } catch (err: any) {
    console.error("pharmacies/availability", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка остатков" },
      { status: 500 }
    );
  }
}
