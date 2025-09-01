import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // включаем экспорт в /out
  images: {
    unoptimized: true, // чтобы изображения работали при экспорте
  },
}

export default nextConfig
