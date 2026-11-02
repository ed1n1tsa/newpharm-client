import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { products as mockProducts } from '@/lib/mockData'

export const dynamic = 'force-dynamic'

function normalize(q: string) {
  return q.trim().replace(/\s+/g, ' ')
}

/** Soft brand line under the title — Latin brand prefix, else category. */
function brandOf(name: string, category?: string | null) {
  const m = name
    .trim()
    .match(/^([A-Za-z][A-Za-z0-9'’.\-]*(?:\s+[A-Za-z][A-Za-z0-9'’.\-]*){0,2})/)
  if (m?.[1]) return m[1]
  if (category?.trim()) return category.trim()
  return ''
}

export async function GET(req: NextRequest) {
  const q = normalize(req.nextUrl.searchParams.get('q') || '')
  const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 5)))

  if (q.length < 2) {
    return NextResponse.json({ q, total: 0, items: [] })
  }

  try {
    const { data, error, count } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url, category, short_desc', { count: 'exact' })
      .eq('is_active', true)
      .ilike('name', `%${q}%`)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) throw error

    if (data?.length) {
      return NextResponse.json({
        q,
        total: count ?? data.length,
        items: data.map((p) => ({
          id: String(p.id),
          name: p.name,
          brand: brandOf(p.name, p.category),
          price: Number(p.price) || 0,
          image_url: p.image_url || null,
        })),
      })
    }
  } catch (err: any) {
    console.error('products/search:', err?.message || err)
  }

  // Fallback: mock catalog for empty DB / offline
  const lower = q.toLowerCase()
  const matched = mockProducts.filter((p) => p.title.toLowerCase().includes(lower))
  return NextResponse.json({
    q,
    total: matched.length,
    items: matched.slice(0, limit).map((p) => ({
      id: String(p.id),
      name: p.title,
      brand: brandOf(p.title),
      price: p.price,
      image_url: p.image || null,
    })),
  })
}
