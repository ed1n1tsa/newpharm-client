'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// Тип для категории
interface Category {
  id: number
  title: string
  description?: string
  icon?: string | null
}

// Словарь перевода для названий категорий (используется для slug и картинок)
const categoryTranslations: { [key: string]: string } = {
  "Смартфоны": "phones",
  "Смарт-часы": "smartwatches",
  "Apple iPad": "ipad",
  "Apple MacBook": "macbook",
  "Самокаты": "scooters",
  "Телевизор": "tv",
  "Б/У Телефоны": "used-phones",
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Ошибка загрузки категорий:', error)
        return
      }

      setCategories(data || [])
    }

    fetchCategories()
  }, [])

  return (
    <main className="bg-[#0d0d0d] min-h-screen text-white px-4 md:px-10 py-12">
      <h1 className="text-3xl font-bold mb-10 text-center">Категории товаров</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {categories.map((category) => {
          const slug = categoryTranslations[category.title] || category.title.toLowerCase()

          return (
            <Link
              href={`/${slug}`}
              key={category.id}
              className="flex flex-col items-center bg-[#1c1c1c] rounded-xl p-4 hover:scale-105 transition"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-black mb-3">
                <Image
                  src={`/categories/${slug}.png`}
                  alt={category.title}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm text-white font-medium text-center">{category.title}</span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
