'use client'

import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const videos = [
  '/videos/reel1.mp4',
  '/videos/reel2.mp4',
  '/videos/reel3.mp4',
]

export default function NewsReels() {
  return (
    <section className="bg-white py-20 px-4 overflow-hidden" id="news">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        {/* Текст слева */}
        <div>
          <h2 className="text-3xl font-bold text-[#001759] mb-4">Новости</h2>
          <p className="text-lg text-[#001759] max-w-md">
            Следи за нашими новостями, чтобы первым узнавать про акции, конкурсы и советы от наших фармацевтов!
          </p>
        </div>

        {/* Видео внутри телефона */}
        <div className="relative w-[345px] h-[684px] mx-auto">
          {/* Видео-слайдер — размер точно под макет */}
          <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden rounded-[32px]">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={0}
              slidesPerView={1}
              loop
              className="w-full h-full"
            >
              {videos.map((src, index) => (
                <SwiperSlide key={index}>
                  <video
                    src={src}
                    controls={false}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Изображение телефона поверх */}
         
        </div>
      </div>
    </section>
  )
}
