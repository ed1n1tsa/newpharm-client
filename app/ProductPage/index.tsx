import dynamic from 'next/dynamic';

// Динамическая загрузка компонента ProductPage с отключением SSR
const ProductPage = dynamic(() => import('./page'), {
  ssr: false, // Отключаем серверный рендеринг для этого компонента
});

export default ProductPage;
