'use client'

import { FormEvent, useEffect, useState } from 'react'
import type { HomepageCms, HomeBanner, HomeNews, FeaturedProduct } from '@/lib/homepage-cms'

const emptyCms: HomepageCms = { featured: [], banners: [], news: [] }

export default function AdminHomepagePage() {
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState('admin')
  const [password, setPassword] = useState('')
  const [cms, setCms] = useState<HomepageCms>(emptyCms)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadCms() {
    const r = await fetch('/api/cms/homepage')
    const data = await r.json()
    setCms(data)
  }

  useEffect(() => {
    loadCms()
  }, [])

  async function login(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    const r = await fetch('/api/cms/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password }),
    })
    if (!r.ok) {
      setMsg('Неверный логин или пароль')
      return
    }
    setAuthed(true)
    setPassword('')
    await loadCms()
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const r = await fetch('/api/cms/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cms),
    })
    setSaving(false)
    if (r.status === 401) {
      setAuthed(false)
      setMsg('Сессия истекла — войдите снова')
      return
    }
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      setMsg(err.error || 'Ошибка сохранения')
      return
    }
    setMsg('Сохранено')
  }

  function updateBanner(i: number, patch: Partial<HomeBanner>) {
    setCms((c) => ({
      ...c,
      banners: c.banners.map((b, idx) => (idx === i ? { ...b, ...patch } : b)),
    }))
  }

  function updateNews(i: number, patch: Partial<HomeNews>) {
    setCms((c) => ({
      ...c,
      news: c.news.map((n, idx) => (idx === i ? { ...n, ...patch } : n)),
    }))
  }

  function addFeatured() {
    const productId = prompt('UUID товара из каталога:')
    if (!productId) return
    const label = (prompt('Метка: popular / new / discount', 'popular') ||
      'popular') as FeaturedProduct['label']
    setCms((c) => ({
      ...c,
      featured: [
        ...c.featured,
        { productId: productId.trim(), label, sort: c.featured.length },
      ],
    }))
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-1">Контент главной</h1>
        <p className="text-sm text-gray-500 mb-4">
          Войдите, чтобы редактировать баннеры, новости и популярные товары.
        </p>
        <form onSubmit={login} className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Логин"
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button type="submit" className="w-full rounded-lg bg-teal-600 text-white py-2.5 font-semibold">
            Войти
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Главная страница</h1>
          <p className="text-sm text-gray-500">Баннеры, новости, популярные товары</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 font-semibold disabled:opacity-60"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
      {msg && <p className="text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2">{msg}</p>}

      <section className="bg-white border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Популярные / новинки / скидки</h2>
          <button type="button" onClick={addFeatured} className="text-sm text-teal-700 font-semibold">
            + Добавить товар
          </button>
        </div>
        {!cms.featured.length && (
          <p className="text-sm text-gray-500">Пока пусто — на сайте покажутся первые товары каталога.</p>
        )}
        <ul className="space-y-2">
          {cms.featured.map((f, i) => (
            <li key={`${f.productId}-${i}`} className="flex flex-wrap gap-2 items-center text-sm border rounded-lg p-2">
              <code className="bg-gray-50 px-2 py-1 rounded">{f.productId}</code>
              <select
                value={f.label || 'popular'}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    featured: c.featured.map((x, idx) =>
                      idx === i ? { ...x, label: e.target.value } : x
                    ),
                  }))
                }
                className="border rounded px-2 py-1"
              >
                <option value="popular">Популярные</option>
                <option value="new">Новинки</option>
                <option value="discount">Со скидкой</option>
              </select>
              <button
                type="button"
                className="text-red-600 ml-auto"
                onClick={() =>
                  setCms((c) => ({
                    ...c,
                    featured: c.featured.filter((_, idx) => idx !== i),
                  }))
                }
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400">
          UUID товара можно скопировать из карточки в каталоге (из URL ProductPage?id=…).
        </p>
      </section>

      <section className="bg-white border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-lg">Баннеры</h2>
        {cms.banners.map((b, i) => (
          <div key={b.id} className="border rounded-xl p-3 space-y-2">
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={b.title}
              onChange={(e) => updateBanner(i, { title: e.target.value })}
              placeholder="Заголовок"
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                className="border rounded-lg px-3 py-2"
                value={b.subtitle || ''}
                onChange={(e) => updateBanner(i, { subtitle: e.target.value })}
                placeholder="Подпись (Акция / …)"
              />
              <input
                className="border rounded-lg px-3 py-2"
                value={b.href}
                onChange={(e) => updateBanner(i, { href: e.target.value })}
                placeholder="Ссылка"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={b.active}
                onChange={(e) => updateBanner(i, { active: e.target.checked })}
              />
              Активен
            </label>
          </div>
        ))}
      </section>

      <section className="bg-white border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Новости</h2>
          <button
            type="button"
            className="text-sm text-teal-700 font-semibold"
            onClick={() =>
              setCms((c) => ({
                ...c,
                news: [
                  ...c.news,
                  {
                    id: `news-${Date.now()}`,
                    title: 'Новая новость',
                    date: new Date().toISOString().slice(0, 10),
                    image: '/home/news-immunity.png',
                    href: '/catalog',
                    active: true,
                    sort: c.news.length,
                  },
                ],
              }))
            }
          >
            + Новость
          </button>
        </div>
        {cms.news.map((n, i) => (
          <div key={n.id} className="border rounded-xl p-3 space-y-2">
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={n.title}
              onChange={(e) => updateNews(i, { title: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                value={n.date.slice(0, 10)}
                onChange={(e) => updateNews(i, { date: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                value={n.href}
                onChange={(e) => updateNews(i, { href: e.target.value })}
                placeholder="Ссылка"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={n.active}
                  onChange={(e) => updateNews(i, { active: e.target.checked })}
                />
                Активна
              </label>
              <button
                type="button"
                className="text-red-600 text-sm ml-auto"
                onClick={() =>
                  setCms((c) => ({
                    ...c,
                    news: c.news.filter((_, idx) => idx !== i),
                  }))
                }
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
