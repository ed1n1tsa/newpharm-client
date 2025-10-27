'use client'

import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const videos = ['/videos/reel1.mp4', '/videos/reel2.mp4', '/videos/reel3.mp4']

export default function NewsReels() {
  const [isMuted, setIsMuted] = useState(true)
  const videoRefs = useRef<HTMLVideoElement[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // 🔊 Переключение звука
  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    videoRefs.current.forEach((v) => {
      if (v) v.muted = newMuted
    })
  }

  // 🔄 При смене слайда
  const handleSlideChange = (swiper: any) => {
    const newIndex = swiper.realIndex
    setActiveIndex(newIndex)

    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === newIndex) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }

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

        {/* Видео справа */}
        <div className="relative w-[345px] h-[684px] mx-auto">
          <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden rounded-[32px]">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={0}
              slidesPerView={1}
              loop
              className="w-full h-full"
              onSlideChange={handleSlideChange}
              onSwiper={() => {
                // При инициализации запускаем первое видео
                setTimeout(() => {
                  const first = videoRefs.current[0]
                  if (first) first.play().catch(() => {})
                }, 300)
              }}
            >
              {videos.map((src, i) => (
                <SwiperSlide key={i}>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el!
                    }}
                    src={src}
                    muted={isMuted}
                    controls={false}
                    loop={false}
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                    autoPlay={i === activeIndex}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Кнопка звука */}
          <button
            onClick={toggleMute}
            className="absolute bottom-5 right-5 z-20 bg-white/70 backdrop-blur-md rounded-full p-3 shadow-md hover:bg-white transition"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9l6 6m0-6l-6 6M15 5v14m-4-4H5a2 2 0 01-2-2V9a2 2 0 012-2h6V5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5L6 9H3v6h3l5 4V5zm10.54 2.46a9 9 0 010 9.08M17.73 8.27a5 5 0 010 7.46"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
