'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { navItems } from './navItems'

export default function MobileNavClient() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const mainItems = navItems.filter((i) => i.mobile)
  const extraItems = navItems.filter((i) => !i.mobile)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm md:hidden">
        <div className="flex justify-around items-center h-16">
          {mainItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <button
                key={href}
                onClick={() => {
                  if (href === '/client/more') setShowMore(!showMore)
                  else window.location.href = href
                }}
                className="flex flex-col items-center text-xs text-gray-600 hover:text-emerald-600 transition"
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-emerald-600' : 'text-gray-400'}
                />
                <span className={isActive ? 'text-emerald-600 font-medium' : ''}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Popup меню “Ещё” */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-end pb-20"
          onClick={() => setShowMore(false)}
        >
          <div
            className="bg-white w-[90%] max-w-sm rounded-2xl p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-semibold text-gray-800 mb-3">
              Дополнительные разделы
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {extraItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <Icon size={22} className="text-emerald-600 mb-1" />
                  <span className="text-xs text-center">{label}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowMore(false)}
              className="mt-4 w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  )
}
