'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category_id: number;
}

const ProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  const router = useRouter();

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Товар не найден');

      setProduct(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Неизвестная ошибка');
      }
      console.error('Ошибка при получении товара:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setId(searchParams.get('id'));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleOrderClick = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      alert('Вы не авторизованы');
      return;
    }

    router.push(`/checkout?product=${product?.id}&quantity=1`);
  };

  if (isLoading) return <div className="text-white text-center">Загрузка...</div>;
  if (!product) return <div className="text-white text-center">Товар не найден</div>;

  return (
    <div className="max-w-4xl mx-auto bg-[#1E1E1E] p-6 rounded-xl">
      {/* Галерея изображений */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        <Image
          src={`/phones/${product.id}.jpeg`}
          alt={product.title}
          width={500}
          height={500}
          className="w-full h-64 object-contain rounded-md shadow-md"
          onError={(e) => {
            e.currentTarget.src = '/phones/fallback-image.png';
          }}
        />
      </div>

      {/* Название и цена */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">{product.title}</h1>
        <p className="text-lg font-bold text-white">{product.price} ₸</p>
      </div>

      {/* Характеристики */}
      <div className="mb-4 text-white">
        <h2 className="text-xl font-semibold mb-3">Характеристики</h2>
        <div className="text-sm space-y-2">
          {product.description.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      {/* Кнопка оформления заказа */}
      <div className="text-center mt-6">
        <button
          className="bg-[#FF0000] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#e63946]"
          onClick={handleOrderClick}
        >
          Оформить заказ
        </button>
      </div>

      {/* Ошибка */}
      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
    </div>
  );
};

export default ProductPage;
