import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ONE_C_URL =
  'https://ws3.smartsystem.kz/APT_NEWPHARM/hs/counterparties/counterparties_list'
const ONE_C_AUTH =
  'Basic ' + Buffer.from('bot_ai:40zuduH').toString('base64')

export async function GET() {
  try {
    console.log('📡 Загружаем данные из 1С...')
    const res = await fetch(ONE_C_URL, { headers: { Authorization: ONE_C_AUTH } })
    if (!res.ok) throw new Error(`Ошибка запроса: ${res.statusText}`)

    const json = await res.json()
    console.log(`📦 Получено ${json.length} товаров от 1С`)

    // 💾 Вызываем твою SQL-функцию
    const { error } = await supabaseAdmin.rpc('update_stocks_from_1c', { json_data: json })
    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `✅ Обновление успешно завершено (${json.length} позиций).`,
    })
  } catch (err: any) {
    console.error('❌ Ошибка обновления:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
