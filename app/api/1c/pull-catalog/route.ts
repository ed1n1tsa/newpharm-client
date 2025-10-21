import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import OpenAI from "openai";
import https from "https";

// 🔐 Базовая авторизация для 1С
function basicAuth() {
  const token = Buffer.from(`${process.env.ONEC_USER}:${process.env.ONEC_PASS}`).toString("base64");
  return `Basic ${token}`;
}

// 🧩 Определяем категорию по названию
function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("таб") || lower.includes("амп") || lower.includes("мг")) return "Лекарственные средства";
  if (lower.includes("витамин") || lower.includes("омега")) return "Витамины и БАДы";
  if (lower.includes("спрей") || lower.includes("мазь") || lower.includes("капли")) return "Медицинские препараты";
  if (lower.includes("масло") || lower.includes("гель") || lower.includes("уход")) return "Косметика и уход";
  if (lower.includes("дет")) return "Товары для детей";
  if (lower.includes("тест") || lower.includes("термометр")) return "Медицинские приборы";
  if (lower.includes("трав")) return "Травы и сборы";
  return "Прочее";
}

// 🧠 Инициализация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 🚀 Основной маршрут импорта из 1С (по 1000 товаров)
export async function GET() {
  const url = `${process.env.ONEC_BASE_URL}/counterparties/counterparties_list`;
  const sb = supabaseAdmin;

  try {
    console.log("🔄 Получаем данные из 1С:", url);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 👈 отключаем проверку SSL

    const res = await fetch(url, {
      headers: { Authorization: basicAuth() },
      cache: "no-store",
    });
    

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Ошибка 1С (${res.status}): ${txt}`);
    }

    const data = await res.json();
    console.log(`📦 Получено из 1С: ${data.length} товаров`);

    // Убираем дубликаты по Id
    const unique = new Map<string, any>();
    for (const item of data) {
      if (!unique.has(item.Id)) unique.set(item.Id, item);
    }

    const allProducts = Array.from(unique.values());
    const batchSize = 1000;

    // ✅ Проверяем, сколько уже обработано
    const { data: processedRows } = await sb
      .from("products")
      .select("external_id_1c");

    const processedSet = new Set(processedRows?.map(p => p.external_id_1c));

    // 🧩 Фильтруем только те, которых ещё нет
    const remaining = allProducts.filter(it => !processedSet.has(String(it.Id)));

    // 🧮 Берём первую 1000ку
    const batch = remaining.slice(0, batchSize);
    console.log(`🚀 Обрабатываем ${batch.length} товаров из ${remaining.length} оставшихся...`);

    const products = [];

    for (const it of batch) {
      const name = it.Name ?? "Без названия";
      const category = detectCategory(name);
      const price = Number(it.Price ?? 0);
      const stock = it.Склады?.reduce((sum: number, s: any) => sum + (s.Ostatok || 0), 0) || 0;

      let short_desc = null;
      let full_desc = null;

      // Генерация описания через GPT
      try {
        const prompt = `Ты — копирайтер интернет-аптеки. Напиши короткое и полное описание для товара "${name}". Пиши на русском языке.`;

        const ai = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
        });

        const text = ai.choices[0].message?.content || "";
        const [short, ...rest] = text.split(". ");
        short_desc = short + ".";
        full_desc = text;

        console.log(`✨ GPT описал товар: ${name}`);
      } catch (err: any) {
        console.warn(`⚠️ Не удалось сгенерировать описание для ${name}: ${err.message}`);
      }

      products.push({
        external_id_1c: String(it.Id),
        name,
        category,
        price,
        stock,
        image_url: "/images/product.png",
        updated_at: new Date().toISOString(),
        is_active: true,
        short_desc,
        full_desc,
      });
    }

    // 💾 Сохраняем товары в Supabase
    const { error } = await sb.from("products").upsert(products, { onConflict: "external_id_1c" });
    if (error) throw error;

    console.log(`✅ Успешно обновлено ${products.length} товаров`);

    // Логируем результат
    await sb.from("integration_1c_queue").insert({
      direction: "in",
      kind: "catalog",
      status: "imported",
      payload_json: {
        imported_now: products.length,
        remaining: remaining.length - products.length,
        ai_generated: true,
      },
    });

    return NextResponse.json({
      ok: true,
      imported_now: products.length,
      remaining: remaining.length - products.length,
    });
  } catch (err: any) {
    console.error("❌ Ошибка при синхронизации:", err.message);

    await sb.from("integration_1c_queue").insert({
      direction: "in",
      kind: "catalog",
      status: "error",
      payload_json: { error: err.message },
    });

    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}