/** Soft brand line under the title — Latin brand prefix, else category. */
export function brandOf(name: string, category?: string | null) {
  const m = name
    .trim()
    .match(/^([A-Za-z][A-Za-z0-9'’.\-]*(?:\s+[A-Za-z][A-Za-z0-9'’.\-]*){0,2})/)
  if (m?.[1]) return m[1]
  if (category?.trim()) return category.trim()
  return ''
}

export function pluralProducts(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'товар'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара'
  return 'товаров'
}
