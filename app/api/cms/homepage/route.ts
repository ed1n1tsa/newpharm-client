import { NextResponse } from 'next/server'
import { requireCmsAdmin } from '@/lib/cms-auth'
import { readHomepageCms, writeHomepageCms } from '@/lib/cms-store'
import type { HomepageCms } from '@/lib/homepage-cms'

export async function GET() {
  const cms = await readHomepageCms()
  return NextResponse.json(cms)
}

export async function PUT(req: Request) {
  const ok = await requireCmsAdmin()
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as HomepageCms | null
  if (!body || !Array.isArray(body.banners) || !Array.isArray(body.news)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  try {
    await writeHomepageCms({
      featured: body.featured || [],
      banners: body.banners,
      news: body.news,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Save failed' },
      { status: 500 }
    )
  }
}
