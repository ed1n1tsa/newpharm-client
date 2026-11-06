import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase-admin'
import {
  CMS_BUCKET,
  CMS_OBJECT,
  DEFAULT_HOMEPAGE_CMS,
  type HomepageCms,
} from '@/lib/homepage-cms'

export async function readHomepageCms(): Promise<HomepageCms> {
  try {
    if (!isSupabaseAdminConfigured()) return DEFAULT_HOMEPAGE_CMS
    const { data, error } = await supabaseAdmin.storage
      .from(CMS_BUCKET)
      .download(CMS_OBJECT)
    if (error || !data) return DEFAULT_HOMEPAGE_CMS
    const text = await data.text()
    const parsed = JSON.parse(text) as HomepageCms
    return {
      ...DEFAULT_HOMEPAGE_CMS,
      ...parsed,
      banners: parsed.banners?.length ? parsed.banners : DEFAULT_HOMEPAGE_CMS.banners,
      news: parsed.news?.length ? parsed.news : DEFAULT_HOMEPAGE_CMS.news,
      featured: parsed.featured || [],
    }
  } catch {
    return DEFAULT_HOMEPAGE_CMS
  }
}

export async function writeHomepageCms(cms: HomepageCms): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('CMS write requires Supabase admin credentials')
  }
  const payload = {
    ...cms,
    updatedAt: new Date().toISOString(),
  }
  const body = JSON.stringify(payload, null, 2)
  const blob = new Blob([body], { type: 'application/json' })
  const { error } = await supabaseAdmin.storage
    .from(CMS_BUCKET)
    .upload(CMS_OBJECT, blob, { upsert: true, contentType: 'application/json' })
  if (error) throw new Error(error.message)
}
