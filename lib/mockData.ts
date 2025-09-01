// lib/mockData.ts
export type Category = {
    id: string;
    name: string;
  };
  
  export type Product = {
    id: string;
    title: string;
    price: number;
    image: string; // /images/product.png
    categoryId: string;
  };
  
  export const categories: Category[] = [
    { id: "meds", name: "Лекарственные средства" },
    { id: "vitamins", name: "Витамины и БАДы" },
    { id: "cosmetics", name: "Косметика и уход" },
    { id: "hygiene", name: "Личная гигиена" },
    { id: "kids", name: "Товары для детей" },
    { id: "devices", name: "Медицинские приборы" },
  ];
  
  const make6 = (prefix: string, categoryId: string, price = 2290): Product[] =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: `${categoryId}-${i + 1}`,
      title: `${prefix} 1% 15 г — крем в тубе`,
      price,
      image: "/images/product.png",
      categoryId,
    }));
  
  export const products: Product[] = [
    ...make6("Терфалин", "meds"),
    ...make6("Витамин C", "vitamins", 1590),
    ...make6("Крем увлажняющий", "cosmetics", 3590),
    ...make6("Зубная паста", "hygiene", 1290),
    ...make6("Пюре детское", "kids", 790),
    ...make6("Тонометр", "devices", 12990),
  ];
  