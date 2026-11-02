import Image from 'next/image'
import Link from 'next/link'
import { phoneToWhatsAppLink } from '@/lib/phone'

const MAIN_WA = '77759849959'

export default function Footer() {
  return (
    <footer className="bg-[#0f3d2e] text-emerald-50 mt-auto">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-9 grid gap-7 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="NewPharm" width={34} height={34} className="object-contain" />
            <span className="text-[15px] font-bold text-white">NewPharm</span>
          </div>
          <p className="text-[12px] text-emerald-100/80 leading-relaxed">
            Онлайн-аптека и телемедицина в Атырау
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white text-[13px] mb-2.5">Покупателям</h4>
          <ul className="space-y-1.5 text-[12px] text-emerald-100/85">
            <li><Link href="/catalog" className="hover:text-white">Как сделать заказ</Link></li>
            <li><Link href="/cart" className="hover:text-white">Оплата и возврат</Link></li>
            <li><Link href="/branches" className="hover:text-white">Доставка и самовывоз</Link></li>
            <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white text-[13px] mb-2.5">Компания</h4>
          <ul className="space-y-1.5 text-[12px] text-emerald-100/85">
            <li><Link href="/" className="hover:text-white">О нас</Link></li>
            <li><Link href="/branches" className="hover:text-white">Контакты</Link></li>
            <li><Link href="/branches" className="hover:text-white">Филиалы</Link></li>
            <li><Link href="/doctors" className="hover:text-white">Вакансии</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white text-[13px] mb-2.5">Свяжитесь с нами</h4>
          <ul className="space-y-1.5 text-[12px] text-emerald-100/85 mb-3">
            <li>
              <a href="tel:+77759849959" className="hover:text-white">
                +7 775 984 99 59
              </a>
            </li>
            <li>
              <a href="mailto:support@newpharm.kz" className="hover:text-white">
                support@newpharm.kz
              </a>
            </li>
          </ul>
          <div className="flex gap-2.5 items-center">
            <a
              href="https://www.instagram.com/newpharm.kz/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20"
            >
              <Image
                src="/home/social-instagram.png"
                alt=""
                width={18}
                height={18}
                className="object-contain brightness-0 invert"
                unoptimized
              />
            </a>
            <a
              href={phoneToWhatsAppLink(MAIN_WA)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20"
            >
              <Image
                src="/home/social-whatsapp.png"
                alt=""
                width={18}
                height={18}
                className="object-contain brightness-0 invert"
                unoptimized
              />
            </a>
            <a
              href="https://t.me/newpharm_kz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold"
            >
              TG
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1120px] mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-[11px] text-emerald-200/60">
          <span>© {new Date().getFullYear()} NewPharm. Все права защищены.</span>
          <div className="flex gap-4">
            <span>Политика конфиденциальности</span>
            <span>Условия использования</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
