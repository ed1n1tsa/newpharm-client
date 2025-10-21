'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    imageFile: null as File | null,
  })

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, category, price, stock, image_url')
      .order('updated_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Введите название товара')

    let image_url = editing?.image_url || '/images/product.png'
    if (form.imageFile) {
      const path = `photo_products/${Date.now()}_${form.imageFile.name}`
      const { error: uploadErr } = await supabase.storage
        .from('products')
        .upload(path, form.imageFile, { upsert: true })
      if (!uploadErr) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url,
      updated_at: new Date().toISOString(),
    }

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    setEditing(null)
    setForm({ name: '', category: '', price: '', stock: '', imageFile: null })
    await loadProducts()
  }

  const handleEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      imageFile: null,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    await supabase.from('products').delete().eq('id', id)
    await loadProducts()
  }

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-700 text-center sm:text-left">
        Управление товарами
      </h1>

      {/* 🧾 Форма */}
      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 max-w-md mx-auto sm:mx-0">
        <input
          type="text"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          placeholder="Категория"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="number"
          placeholder="Цена"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="number"
          placeholder="Остаток"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, imageFile: e.target.files?.[0] || null })
          }
          className="w-full text-sm border p-2 rounded-md"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            {editing ? 'Сохранить изменения' : 'Добавить товар'}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null)
                setForm({
                  name: '',
                  category: '',
                  price: '',
                  stock: '',
                  imageFile: null,
                })
              }}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Отмена
            </button>
          )}
        </div>
      </div>

      {/* 📱 Мобильная таблица — карточки */}
      <div className="grid grid-cols-1 sm:hidden gap-3">
        {loading ? (
          <p className="text-gray-500 text-center">Загрузка...</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm"
            >
              <img
                src={p.image_url || '/images/product.png'}
                alt={p.name}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 mb-1">
                  {p.category || 'Без категории'}
                </p>
                <p className="text-sm text-teal-600 font-medium">
                  {p.price} ₸ • {p.stock} шт
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-blue-500 text-sm"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 text-sm"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 Десктопная таблица */}
      <div className="hidden sm:block overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Фото</th>
              <th className="p-3 text-left">Название</th>
              <th className="p-3 text-left">Категория</th>
              <th className="p-3 text-right">Цена</th>
              <th className="p-3 text-right">Остаток</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b text-sm hover:bg-gray-50">
                <td className="p-3">
                  <img
                    src={p.image_url || '/images/product.png'}
                    alt={p.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category || '—'}</td>
                <td className="p-3 text-right">{p.price} ₸</td>
                <td className="p-3 text-right">{p.stock}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Ред.
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
