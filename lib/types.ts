// Типы коллекций из Directus

export interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    images: string[];      // file IDs (Directus)
    category: number;      // ID категории
    slug: string;
  }
  