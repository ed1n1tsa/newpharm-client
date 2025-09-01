'use client';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from 'next/image';
import { useRef } from 'react';

const banners = [
  {
    id: 1,
    image: '/banners/banner1.png',
    alt: 'Баннер 1',
  },
  {
    id: 2,
    image: '/banners/banner2.png',
    alt: 'Баннер 2',
  },
];

export default function BannerSlider() {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: 'performance',
    drag: true,
    created(s) {
      timer.current = setInterval(() => {
        s.next();
      }, 3000);
    },
    destroyed() {
      if (timer.current) clearInterval(timer.current);
    },
  });

  return (
    <div className="w-full flex justify-center">
      <div
        ref={sliderRef}
        className="keen-slider w-full max-w-[920px] aspect-[2.42] overflow-hidden rounded-xl"
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="keen-slider__slide relative w-full h-full"
          >
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
}
