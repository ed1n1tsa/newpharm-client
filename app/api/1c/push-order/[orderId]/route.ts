import { NextRequest, NextResponse } from 'next/server'
import { sbAdmin } from '@/lib/supabase-admin'

function basicAuth() {
  const token = Buffer.from(
    `${process.env.ONEC_USER}:${process.env.ONEC_PASS}`
  ).toString('base64')
  return `Basic ${token}`
}

export async function POST(_req: NextRequest, context: any) {
  const orderId = context?.params?.orderId
  const sb = sbAdmin // ✅ без скобок

  // 📦 Получаем заказ из Supabase
  const { data: order, error } = await sb
    .from('orders')
    .select(`
      id, phone, address_json,
      items:order_items(
        qty, price,
        variant:product_variants(
          barcode,
          product:products(name, external_id_1c)
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order)
    return NextResponse.json({ ok: false, error }, { status: 404 })

  // 🧾 Формируем товары
  const items = (order.items ?? []).map((oi: any) => ({
    Name: oi.variant.product.name,
    Id: oi.variant.barcode || oi.variant.product.external_id_1c,
    Количество: oi.qty,
    Цена: Number(oi.price),
  }))

  const payload = [
    {
      Контрагент: 'KaspyDentKZ',
      ЮрАдрес:
        order.address_json?.legalAddress ??
        order.address_json?.addressLine ??
        '—',
      Склад: 'Склад Алмагул',
      Телефон: order.phone ?? '',
      Товары: items,
    },
  ]

  // 📡 Отправляем заказ в 1С
  const res = await fetch(`${process.env.ONEC_BASE_URL}/counterparties/create_doc`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()

  if (!res.ok) {
    await sb.from('integration_1c_queue').insert({
      direction: 'out',
      kind: 'order',
      status: 'error',
      payload_json: payload,
      last_error: `HTTP ${res.status}: ${text}`,
    })

    return NextResponse.json(
      { ok: false, status: res.status, error: text },
      { status: 500 }
    )
  }

  // ✅ Успешный экспорт
  await sb.from('integration_1c_queue').insert({
    direction: 'out',
    kind: 'order',
    status: 'exported',
    payload_json: payload,
  })

  await sb.from('orders').update({ status: 'exported_to_1c' }).eq('id', orderId)

  return NextResponse.json({ ok: true, response: text })
}
