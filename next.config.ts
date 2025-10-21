import type { NextConfig } from 'next'

const nextConfig: NextConfig = { // включаем экспорт в /out
  images: {
    unoptimized: true, // чтобы изображения работали при экспорте
  },
}

export default nextConfig
