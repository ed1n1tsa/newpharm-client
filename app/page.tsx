import GuestHome from '@/ui/home/GuestHome'
import { readHomepageCms } from '@/lib/cms-store'
import { loadCatalogProducts } from '@/lib/catalog-products'
import { DEFAULT_HOMEPAGE_CMS } from '@/lib/homepage-cms'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let cms = DEFAULT_HOMEPAGE_CMS
  try {
    cms = await readHomepageCms()
  } catch (e) {
    console.error('homepage cms', e)
  }

  let products: { id: string; name: string; price: number; image_url: string | null }[] = []
  try {
    const loaded = await loadCatalogProducts()
    products = (loaded.products || []).slice(0, 24).map((p) => ({
      id: String(p.id),
      name: p.name || 'Товар',
      price: Number(p.price) || 0,
      image_url: p.image_url || null,
    }))
  } catch (e) {
    console.error('homepage products', e)
  }

  return <GuestHome initialCms={cms} initialProducts={products} />
}
