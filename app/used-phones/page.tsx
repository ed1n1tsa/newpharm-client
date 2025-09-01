'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link' // Импортируем Link для роутинга
const categoryId = 3
const categoryTitle = 'Б/У Телефоны'

interface Product {
  id: number
  title: string
  price: number
}

export default function PhonesPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price')
        .eq('category_id', categoryId)

      if (error) {
        console.error('Ошибка при загрузке товаров:', error)
        return
      }

      setProducts(data || [])
    }

    fetchProducts()
  }, [])

  return (
    <main className="bg-[#0d0d0d] min-h-screen text-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">{categoryTitle}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#1c1c1c] rounded-xl p-5 flex flex-col items-center"
            >
              <div className="w-[110px] h-[110px] relative mb-3">
                <Image
                  src={`/phones/${product.id}.jpeg`}
                  alt={product.title}
                  width={90}
                  height={90}
                  className="object-contain rounded"
                />
              </div>
              <p className="text-white text-sm font-semibold mb-1">{product.price.toLocaleString()} тг</p>
              <p className="text-xs text-center mb-3 px-1">{product.title}</p>
              <Link href={`/ProductPage?id=${product.id}`}>
                <button className="bg-[#FF0000] hover:bg-[#e60000] text-white text-sm py-1 px-6 rounded-full transition">
                  Купить
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
