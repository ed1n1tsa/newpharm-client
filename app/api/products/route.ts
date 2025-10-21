import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin"; // серверный клиент Supabase

function getAuthHeader() {
  const token = Buffer.from(`${process.env.ONEC_USER}:${process.env.ONEC_PASS}`).toString("base64");
  return `Basic ${token}`;
}

// 🧠 Автоопределение категории по названию
function detectCategory(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("таб") || lower.includes("амп") || lower.includes("мг")) return "Лекарственные средства";
  if (lower.includes("витамин") || lower.includes("b12") || lower.includes("b6") || lower.includes("омега")) return "Витамины и БАДы";
  if (lower.includes("спрей") || lower.includes("раствор") || lower.includes("мазь") || lower.includes("капли")) return "Медицинские препараты";
  if (lower.includes("масло") || lower.includes("гель") || lower.includes("уход")) return "Косметика и уход";
  if (lower.includes("дет") || lower.includes("пустышка") || lower.includes("пеленк") || lower.includes("нагрудник")) return "Товары для детей";
  if (lower.includes("тест") || lower.includes("термометр") || lower.includes("тонометр")) return "Медицинские приборы";
  if (lower.includes("трав") || lower.includes("чай") || lower.includes("каркаде")) return "Травы и сборы";

  return "Прочее";
}

export async function GET() {
  const url = `${process.env.ONEC_BASE_URL}/counterparties/counterparties_list`;
  console.log("🔗 Запрос к 1С:", url);

  try {
    // ❗ Временно отключаем SSL-проверку (альтернатива https.Agent)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: getAuthHeader() },
      cache: "no-store",
    });

    console.log("📡 Статус:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("⚠️ Ошибка 1С:", text);
      return NextResponse.json({ error: `Ошибка 1С: ${res.status}`, details: text }, { status: res.status });
    }

    const data = await res.json();

    // 🧩 Убираем дубликаты
    const uniqueMap = new Map<string, any>();
    for (const item of data) {
      if (!uniqueMap.has(item.Id)) {
        uniqueMap.set(item.Id, item);
      }
    }

    const uniqueProducts = Array.from(uniqueMap.values());

    // 🧩 Категории и товары
    const categoriesMap = new Map<string, { id: string; name: string }>();
    const products = uniqueProducts.map((item: any) => {
      const categoryName = detectCategory(item.Name);
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, "-");

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, { id: categoryId, name: categoryName });
      }

      const stock = item.Склады?.reduce((sum: number, s: any) => sum + (s.Ostatok || 0), 0) || 0;

      return {
        id: item.Id,
        name: item.Name,
        price: Number(item.Price ?? 0),
        image_url: "/images/product.png",
        category: categoryName,
        stock,
        updated_at: new Date().toISOString(),
      };
    });

    console.log(`✅ Загружено ${products.length} товаров (${categoriesMap.size} категорий)`);

    // 💾 Сохраняем категории в Supabase
    const { error: catError } = await supabaseAdmin
      .from("categories")
      .upsert(Array.from(categoriesMap.values()), { onConflict: "id" });

    if (catError) console.error("⚠️ Ошибка при сохранении категорий:", catError);

    // 💾 Сохраняем товары в Supabase
    const { error: prodError } = await supabaseAdmin
      .from("products")
      .upsert(products, { onConflict: "id" });

    if (prodError) console.error("⚠️ Ошибка при сохранении товаров:", prodError);

    return NextResponse.json({
      ok: true,
      categories: categoriesMap.size,
      products: products.length,
    });
  } catch (err: any) {
    console.error("❌ Ошибка соединения с 1С:", err.message);
    return NextResponse.json({ error: "Ошибка соединения с 1С", details: err.message }, { status: 500 });
  }
}
