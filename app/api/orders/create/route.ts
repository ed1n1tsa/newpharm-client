import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizePhone } from "@/lib/phone";
import {
  CartLine,
  WarehouseStock,
  WarehouseInfo,
  autoSelectWarehouse,
} from "@/lib/pharmacy";

export const runtime = "nodejs";

async function getUserFromAuthHeader(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Creates an order WITHOUT online payment.
 * Does not mutate product_stocks (1C sync owns stock levels).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Требуется вход по телефону" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const items: { productId: string; qty: number; price?: number; name?: string }[] =
      Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ ok: false, error: "Корзина пуста" }, { status: 400 });
    }

    const deliveryType = body.delivery_type === "delivery" ? "delivery" : "pickup";
    const customerName = String(body.customer_name || "").trim();
    const customerPhone =
      normalizePhone(String(body.customer_phone || body.phone || "")) ||
      normalizePhone(String(user.user_metadata?.phone || user.phone || "")) ||
      null;
    const deliveryAddress = String(body.delivery_address || "").trim();
    let warehouseId = body.warehouse_id ? String(body.warehouse_id) : null;
    const deliveryCost =
      deliveryType === "delivery" ? Number(body.delivery_cost ?? 1000) || 1000 : 0;

    if (!customerPhone) {
      return NextResponse.json(
        { ok: false, error: "Укажите телефон" },
        { status: 400 }
      );
    }
    if (deliveryType === "delivery" && !deliveryAddress) {
      return NextResponse.json(
        { ok: false, error: "Укажите адрес доставки" },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price")
      .in("id", productIds);
    if (pErr) throw pErr;

    const productMap = new Map((products || []).map((p) => [p.id, p]));
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { ok: false, error: `Товар не найден: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    const cartLines: CartLine[] = items.map((i) => ({
      productId: i.productId,
      qty: Math.max(1, Number(i.qty) || 1),
    }));

    const { data: warehouses } = await supabaseAdmin
      .from("warehouses")
      .select("id, name, address, phone, is_active")
      .eq("is_active", true);

    const { data: stocks } = await supabaseAdmin
      .from("product_stocks")
      .select("warehouse_id, product_id, quantity")
      .in("product_id", productIds);

    const ranked = autoSelectWarehouse(
      (warehouses || []) as WarehouseInfo[],
      cartLines,
      (stocks || []) as WarehouseStock[]
    );

    if (!warehouseId) {
      warehouseId = ranked?.warehouse.id ?? null;
    }

    if (!warehouseId) {
      return NextResponse.json(
        { ok: false, error: "Нет доступных аптек" },
        { status: 400 }
      );
    }

    // Validate stock for chosen warehouse; surface shortfalls instead of inventing stock.
    const stockMap = new Map<string, number>();
    for (const s of stocks || []) {
      if (s.warehouse_id === warehouseId) {
        stockMap.set(s.product_id, Number(s.quantity) || 0);
      }
    }
    const shortfalls = cartLines
      .map((line) => {
        const available = stockMap.get(line.productId) ?? 0;
        return {
          productId: line.productId,
          name: productMap.get(line.productId)?.name,
          requested: line.qty,
          available,
          shortfall: Math.max(0, line.qty - available),
        };
      })
      .filter((l) => l.shortfall > 0);

    if (shortfalls.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "Некоторые позиции недоступны в выбранной аптеке",
          shortfalls,
          recommendedWarehouseId: ranked?.warehouse.id ?? null,
        },
        { status: 409 }
      );
    }

    const lines = items.map((i) => {
      const p = productMap.get(i.productId)!;
      const qty = Math.max(1, Number(i.qty) || 1);
      const price = Number(p.price) || 0;
      return {
        product_id: p.id,
        quantity: qty,
        price,
        total: price * qty,
      };
    });

    const goodsTotal = lines.reduce((s, l) => s + l.total, 0);
    const total = goodsTotal + deliveryCost;

    // Ensure / refresh profile phone
    await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        phone: customerPhone,
        full_name: customerName || user.user_metadata?.full_name || null,
        role: "client",
        email: user.email,
        ...(deliveryType === "delivery"
          ? { address: deliveryAddress }
          : {}),
      },
      { onConflict: "id" }
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        phone: customerPhone,
        customer_phone: customerPhone,
        customer_name: customerName || null,
        warehouse_id: warehouseId,
        delivery_type: deliveryType,
        delivery_address:
          deliveryType === "delivery" ? deliveryAddress : null,
        delivery_cost: deliveryCost,
        total,
        currency: "KZT",
        // No online payment in stage 1
        payment_status: "unpaid",
        status: "new",
        address_json:
          deliveryType === "delivery"
            ? { addressLine: deliveryAddress }
            : { pickup: true, warehouse_id: warehouseId },
      })
      .select("id, status, payment_status, total, warehouse_id, delivery_type")
      .single();

    if (orderErr || !order) throw orderErr || new Error("order insert failed");

    // `order_items.total` is a generated column — do not send it.
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product_id,
        quantity: l.quantity,
        price: l.price,
      }))
    );
    if (itemsErr) throw itemsErr;

    return NextResponse.json({
      ok: true,
      order,
      message: "Заказ создан. Оплата онлайн не требуется.",
    });
  } catch (err: any) {
    console.error("orders/create", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка создания заказа" },
      { status: 500 }
    );
  }
}
