import Image from 'next/image'
import {
  phoneToWhatsAppLink,
  formatPhoneDisplay,
  phoneDigits,
  normalizePhone,
} from '@/lib/phone'

const PHARMACIES = [
  { name: 'Аптека Алмагул', phone: '7759849959' },
  { name: 'Аптека Нурсая', phone: '77757470939' },
  { name: 'Аптека Привокзальный', phone: '7020326902' },
]

const MAIN_WA = '77759849959'

export default function Footer() {
  return (
    <footer className="border-t bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Номера аптек</h4>
            <ul className="mt-2 space-y-1 text-slate-800">
              {PHARMACIES.map((p) => {
                const e164 = normalizePhone(p.phone) || `+${phoneDigits(p.phone)}`
                return (
                  <li key={p.phone}>
                    <span className="text-slate-500 mr-2">{p.name}:</span>
                    <a href={`tel:${e164}`} className="hover:text-emerald-600">
                      {formatPhoneDisplay(p.phone)}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-slate-900">Социальные сети</h4>
            <div className="flex gap-4 mt-2 items-center">
              <a
                href="https://www.instagram.com/newpharm.kz/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram NewPharm"
              >
                <Image src="/icons/instagram.png" alt="Instagram" width={32} height={32} />
              </a>
              <a
                href={phoneToWhatsAppLink(MAIN_WA)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp NewPharm"
              >
                <Image src="/icons/whatsapp.png" alt="WhatsApp" width={32} height={32} />
              </a>
              <a
                href="https://t.me/newpharm_kz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram NewPharm"
              >
                <Image src="/icons/telegram.png" alt="Telegram" width={32} height={32} />
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Мы на карте:</h4>
          <div className="relative w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-md">
            <iframe
              src="https://yandex.kz/map-widget/v1/?ll=51.867512%2C47.115214&z=16&oid=105830064578"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              style={{ border: 0 }}
              loading="lazy"
              title="Карта NewPharm"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} NewPharm. Все права защищены.
      </div>
    </footer>
  )
}
