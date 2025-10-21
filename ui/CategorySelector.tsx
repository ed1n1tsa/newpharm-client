'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-admin';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // 👈 добавили useRouter

interface CategoryTranslations {
  [key: string]: string;
}

const categoryTranslations: CategoryTranslations = {
  "Смартфоны": "phones",
  "Смарт-часы": "smartwatches",
  "Apple iPad": "ipad",
  "Apple MacBook": "macbook",
  "Самокаты": "scooters",
  "Телевизор": "tv",
  "Б/У Телефоны": "used-phones",
};

export default function CategorySelector() {
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter(); // 👈 хук для навигации

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');

        if (error) throw error;

        const filteredCategories = data?.filter((cat: any) =>
          [1, 4, 5, 6].includes(cat.id)
        );

        setCategories(filteredCategories);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="bg-[#222222] rounded-[20px] p-6 w-full max-w-[920px]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map((category) => {
            const translatedTitle =
              categoryTranslations[category.title] ||
              category.title.toLowerCase();

            return (
              <div key={category.id} className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-black">
                  <Image
                    src={`/categories/${translatedTitle}.png`}
                    alt={category.title}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-sm text-white text-center font-medium">
                  {category.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Кнопка Все категории с переходом на /category */}
        <div className="text-center mt-10 mb-10">
          <button
            onClick={() => router.push('/category')} // 👈 переход
            className="bg-[#FF0000] text-white hover:bg-[#e60000] py-2 px-6 rounded-lg font-medium"
          >
            Все категории
          </button>
        </div>
      </div>
    </div>
  );
}
