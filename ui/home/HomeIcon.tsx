'use client'

import Image from 'next/image'

type Props = {
  src: string
  alt: string
  size?: number
  className?: string
  /** Green/white line icons on black → knock out black */
  knockout?: boolean
}

export default function HomeIcon({
  src,
  alt,
  size = 40,
  className = '',
  knockout = false,
}: Props) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain ${knockout ? 'mix-blend-screen' : ''}`}
        unoptimized
      />
    </span>
  )
}
