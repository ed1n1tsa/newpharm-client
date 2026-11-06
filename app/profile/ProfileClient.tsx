'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HelpCircle, LogOut, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import { phoneToWhatsAppLink } from '@/lib/phone'
import { useAuth } from '@/ui/AuthContext'
import { useT } from '@/ui/LocaleProvider'

type Props = {
  fullName: string
  email: string
  phone: string
  registeredAt: string
}

const SUPPORT_WA = '77759849959'

export default function ProfileClient({
  fullName,
  email,
  phone,
  registeredAt,
}: Props) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(fullName)
  const [newPhone, setNewPhone] = useState(phone === '—' ? '' : phone)
  const [newEmail, setNewEmail] = useState(email === '—' ? '' : email)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMessage(t('profile.errUser'))
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name, phone: newPhone })
      .eq('id', user.id)

    if (updateError) {
      setMessage(t('profile.errSave'))
      setLoading(false)
      return
    }

    if (newEmail && newEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      })
      if (emailError) {
        setMessage(t('profile.errEmail', { msg: emailError.message }))
        setLoading(false)
        return
      }
    }

    if (newPassword.trim().length >= 6) {
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (passError) {
        setMessage(t('profile.errPass', { msg: passError.message }))
        setLoading(false)
        return
      }
    }

    setEditing(false)
    setLoading(false)
    setMessage(t('profile.saved'))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const whatsappUrl = phoneToWhatsAppLink(SUPPORT_WA, t('profile.waText'))

  return (
    <section className="min-h-[70vh] bg-[#f9fafb] py-8 px-4 pb-24 md:pb-10">
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-white shadow-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-slate-100">
            <Image
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email || fullName)}`}
              alt={t('profile.avatar')}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-800 truncate">{fullName}</h1>
            <p className="text-sm text-gray-500 truncate">{email}</p>
            {registeredAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {t('profile.since', { date: registeredAt })}
              </p>
            )}
          </div>
        </div>

        {!editing ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm divide-y text-gray-700">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="block w-full text-left px-5 py-3.5 hover:bg-gray-50 transition"
              >
                {t('profile.edit')}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3.5 hover:bg-gray-50 transition"
              >
                <MessageCircle size={18} className="text-emerald-500" />
                {t('profile.supportWa')}
              </a>

              <Link
                href="/#faq"
                className="flex items-center gap-2 px-5 py-3.5 hover:bg-gray-50 transition"
              >
                <HelpCircle size={18} className="text-emerald-500" />
                {t('profile.faq')}
              </Link>

              <Link
                href="/orders"
                className="block w-full text-left px-5 py-3.5 hover:bg-gray-50 transition"
              >
                {t('profile.orders')}
              </Link>
            </div>

            {message && (
              <p className="text-sm text-emerald-600 text-center">{message}</p>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl flex items-center justify-center gap-2 transition"
            >
              <LogOut size={18} />
              {t('profile.logout')}
            </button>
          </>
        ) : (
          <div className="bg-white shadow-sm rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('profile.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('profile.phone')}</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('profile.email')}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('profile.passwordHint')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            {message && (
              <p className="text-sm text-emerald-600 text-center">{message}</p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition disabled:opacity-60"
              >
                {loading ? t('profile.saving') : t('profile.save')}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition"
              >
                {t('profile.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/** Shown when /profile is opened without a session — opens the auth modal. */
export function ProfileAuthGate() {
  const { openAuth } = useAuth()
  const t = useT()

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pb-24">
      <h2 className="text-xl font-semibold mb-2 text-[#111827]">
        {t('profile.notLoggedTitle')}
      </h2>
      <p className="text-sm text-slate-500 mb-5 max-w-sm">{t('profile.notLoggedHint')}</p>
      <button
        type="button"
        onClick={() => openAuth('login')}
        className="px-6 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-full font-semibold transition"
      >
        {t('nav.login')}
      </button>
    </section>
  )
}
