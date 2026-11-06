'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, X } from 'lucide-react'
import { useAuth, type AuthTab } from './AuthContext'
import { supabase } from '@/lib/supabase-browser'
import { formatPhoneDisplay, normalizePhone } from '@/lib/phone'
import { useT } from '@/ui/LocaleProvider'

function digitsOnly(v: string) {
  return v.replace(/\D/g, '')
}

/** Local part after +7 → "(777) 123-45-67" */
function formatLocalPhone(raw: string) {
  let d = digitsOnly(raw)
  if (d.startsWith('7') && d.length > 10) d = d.slice(1)
  if (d.startsWith('8') && d.length > 10) d = d.slice(1)
  d = d.slice(0, 10)
  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6, 8)
  const e = d.slice(8, 10)
  if (d.length <= 3) return a
  if (d.length <= 6) return `(${a}) ${b}`
  if (d.length <= 8) return `(${a}) ${b}-${c}`
  return `(${a}) ${b}-${c}-${e}`
}

function toE164(localMasked: string) {
  return normalizePhone(`+7${digitsOnly(localMasked)}`)
}

export default function AuthModal() {
  const { isAuthOpen, authTab, setAuthTab, closeAuth } = useAuth()
  const router = useRouter()
  const t = useT()
  const [localPhone, setLocalPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [humanOk, setHumanOk] = useState(false)
  const [normalized, setNormalized] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthOpen) return
    setStep('phone')
    setCode('')
    setError(null)
    setHint(null)
    setRetryAfter(null)
    setHumanOk(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isAuthOpen, authTab])

  if (!isAuthOpen) return null

  function switchTab(tab: AuthTab) {
    setAuthTab(tab)
  }

  async function requestSms() {
    setError(null)
    setHint(null)
    setRetryAfter(null)
    const phone = toE164(localPhone)
    if (!phone) {
      setError(t('auth.errPhoneFormat'))
      return
    }
    if (authTab === 'register' && !humanOk) {
      setError(t('auth.errRobot'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data.retryAfterSec) setRetryAfter(data.retryAfterSec)
        throw new Error(data.error || t('auth.errSendFail'))
      }
      setNormalized(phone)
      setHint(t('auth.codeSent', { phone: formatPhoneDisplay(phone) }))
      setStep('otp')
      setCode('')
    } catch (err: any) {
      setError(err?.message || t('auth.errSend'))
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const phone = normalized || toE164(localPhone)
    if (!phone) {
      setError(t('auth.errBadPhone'))
      return
    }
    if (!code.trim()) {
      setError(t('auth.errNeedCode'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || t('auth.errBadCode'))
      }

      let sessErr = (
        await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'email',
        })
      ).error
      if (sessErr && data.email_otp && data.email) {
        sessErr = (
          await supabase.auth.verifyOtp({
            email: data.email,
            token: data.email_otp,
            type: 'email',
          })
        ).error
      }
      if (sessErr) throw sessErr

      closeAuth()
      // Stay on the public site — no /client portal redirect
      router.refresh()
    } catch (err: any) {
      setError(err?.message || t('auth.errVerify'))
    } finally {
      setLoading(false)
    }
  }

  async function onPrimarySubmit(e: React.FormEvent) {
    e.preventDefault()
    await requestSms()
  }

  const isLogin = authTab === 'login'

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <button
        type="button"
        aria-label={t('auth.close')}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={closeAuth}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-[420px] rounded-[24px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] overflow-hidden"
      >
        <button
          type="button"
          aria-label={t('auth.close')}
          onClick={closeAuth}
          className="absolute right-3.5 top-3.5 z-10 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-7 pb-6 sm:px-8">
          <div className="flex justify-center">
            <Link href="/" onClick={closeAuth} className="inline-flex items-center gap-1.5">
              <Image
                src="/logo.png"
                alt="NewPharm"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-[16px] font-bold text-[#111827]">NewPharm</span>
            </Link>
          </div>

          <div className="mt-5 mx-auto flex w-full max-w-[280px] rounded-full bg-[#f3f4f6] p-1">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${
                isLogin
                  ? 'bg-[#dcfce7] text-[#166534]'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${
                !isLogin
                  ? 'bg-[#dcfce7] text-[#166534]'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <h2
              id="auth-modal-title"
              className="text-[22px] font-extrabold text-[#111827] tracking-[-0.02em]"
            >
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h2>
            <p className="mt-1.5 text-[13px] leading-snug text-[#6b7280]">
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-3 py-2 text-[13px]">
              {error}
              {retryAfter ? t('auth.retryAfter', { sec: retryAfter }) : null}
            </div>
          )}
          {hint && (
            <div className="mt-4 rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-[13px]">
              {hint}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={onPrimarySubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  {t('auth.phone')}
                </label>
                <div className="flex rounded-2xl border border-[#e5e7eb] overflow-hidden focus-within:border-[#22c55e]">
                  <div className="inline-flex items-center gap-1.5 px-3 bg-[#f9fafb] border-r border-[#e5e7eb] text-[14px] text-[#111827] shrink-0">
                    <span aria-hidden className="text-[16px] leading-none">
                      🇰🇿
                    </span>
                    +7
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(formatLocalPhone(e.target.value))}
                    placeholder={t('auth.phonePlaceholder')}
                    required
                    className="flex-1 min-w-0 px-3 py-3 text-[14px] outline-none bg-white"
                    autoComplete="tel-national"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    {t('auth.humanCheck')}
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3.5 py-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={humanOk}
                      onChange={(e) => setHumanOk(e.target.checked)}
                      className="size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[14px] text-[#111827]">{t('auth.notRobot')}</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-3 text-[14px] transition disabled:opacity-60"
              >
                {loading
                  ? t('auth.sendingSms')
                  : isLogin
                    ? t('auth.getCode')
                    : t('auth.signUp')}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-5 space-y-4">
              <p className="text-[13px] text-[#6b7280] text-center">
                {t('auth.phonePrefix')}{' '}
                <strong className="text-[#111827]">
                  {formatPhoneDisplay(normalized || '')}
                </strong>{' '}
                <button
                  type="button"
                  className="text-emerald-600 underline"
                  onClick={() => {
                    setStep('phone')
                    setCode('')
                    setHint(null)
                  }}
                >
                  {t('auth.changePhone')}
                </button>
              </p>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  {t('auth.codeLabel')}
                </label>
                <input
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="1234"
                  required
                  autoComplete="one-time-code"
                  className="w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-[18px] tracking-[0.35em] text-center outline-none focus:border-[#22c55e]"
                />
                <p className="mt-1.5 text-[12px] text-[#9ca3af] text-center">
                  {t('auth.codeHint')}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-3 text-[14px] transition disabled:opacity-60"
              >
                {loading
                  ? t('auth.checking')
                  : isLogin
                    ? t('auth.verify')
                    : t('auth.finishRegister')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => requestSms()}
                className="w-full text-[13px] text-emerald-600 hover:underline py-1"
              >
                {t('auth.resend')}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            {isLogin ? (
              <p className="inline-flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                <Lock size={12} />
                {t('auth.secureHint')}
              </p>
            ) : (
              <p className="text-[11px] leading-snug text-[#9ca3af]">
                {t('auth.agreePrefix')}{' '}
                <Link
                  href="/#faq"
                  className="text-emerald-600 underline"
                  onClick={closeAuth}
                >
                  {t('auth.terms')}
                </Link>{' '}
                {t('auth.and')}{' '}
                <Link
                  href="/#faq"
                  className="text-emerald-600 underline"
                  onClick={closeAuth}
                >
                  {t('auth.privacy')}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
