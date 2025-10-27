import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Контакты и соцсети */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Контакты</h4>
            <p className="text-slate-800 mt-1">+7 777 777 77 77</p>
            <p className="text-slate-800">+7 777 777 77 77</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-slate-900">Социальные сети</h4>
            <div className="flex gap-4 mt-2 items-center">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/instagram.png" alt="Instagram" width={32} height={32} />
              </a>
              <a href="https://wa.me/77777777777" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/whatsapp.png" alt="WhatsApp" width={32} height={32} />
              </a>
              <a href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/telegram.png" alt="Telegram" width={32} height={32} />
              </a>
            </div>
          </div>
        </div>

        {/* Карта */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Мы на карте:</h4>

          <div className="relative w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-md">
            <iframe
              src="https://yandex.kz/map-widget/v1/?ll=51.867512%2C47.115214&z=16&oid=105830064578"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              style={{ border: 0 }}
              loading="lazy"
              title="Карта NYU FARM"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Низ футера */}
      <div className="mt-10 border-t pt-4 text-center text-sm text-slate-500">
        © 2025 НЬЮ-ФАРМ. Все права защищены.
      </div>
    </footer>
  )
}
