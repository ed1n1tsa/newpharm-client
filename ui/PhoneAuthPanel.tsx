"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { normalizePhone, formatPhoneDisplay } from "@/lib/phone";

type Props = {
  onAuthenticated: (info: { phone: string; fullName: string }) => void;
  initialPhone?: string;
  initialName?: string;
  /** Embedded inside checkout step — no outer card chrome */
  embedded?: boolean;
};

export default function PhoneAuthPanel({
  onAuthenticated,
  initialPhone = "",
  initialName = "",
  embedded = false,
}: Props) {
  const [phone, setPhone] = useState(initialPhone);
  const [fullName, setFullName] = useState(initialName);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  async function requestSms(overridePhone?: string) {
    setError(null);
    setHint(null);
    setRetryAfter(null);
    const normalized = normalizePhone(overridePhone ?? phone);
    if (!normalized) {
      setError("Введите номер в формате +7 XXX XXX XX XX");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.retryAfterSec) setRetryAfter(data.retryAfterSec);
        throw new Error(data.error || "Не удалось отправить код");
      }

      setPhone(normalized);
      setHint(`Код отправлен по SMS на ${formatPhoneDisplay(normalized)}`);
      setStep("otp");
      setCode("");
    } catch (err: any) {
      setError(err?.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    await requestSms();
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Некорректный телефон");
      return;
    }
    if (!code.trim()) {
      setError("Введите код из SMS");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          full_name: fullName,
          token: code.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Неверный код");
      }

      let sessErr = (
        await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: "email",
        })
      ).error;
      if (sessErr && data.email_otp && data.email) {
        sessErr = (
          await supabase.auth.verifyOtp({
            email: data.email,
            token: data.email_otp,
            type: "email",
          })
        ).error;
      }
      if (sessErr) throw sessErr;

      onAuthenticated({ phone: normalized, fullName: fullName.trim() });
    } catch (err: any) {
      setError(err?.message || "Ошибка подтверждения");
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Контактные данные
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Войдите по номеру телефона — пришлём SMS с кодом.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
          {retryAfter ? ` (через ~${retryAfter} сек.)` : null}
        </div>
      )}
      {hint && (
        <div className="rounded-xl bg-emerald-50/80 text-emerald-900 px-3 py-2 text-sm">
          {hint}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Имя</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Как к вам обращаться"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 7XX XXX XX XX"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 disabled:opacity-60"
          >
            {loading ? "Отправляем SMS…" : "Получить код по SMS"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm text-slate-600">
            Номер: <strong>{formatPhoneDisplay(phone)}</strong>{" "}
            <button
              type="button"
              className="text-emerald-700 underline"
              onClick={() => {
                setStep("phone");
                setCode("");
                setHint(null);
              }}
            >
              изменить
            </button>
          </p>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Код из SMS
            </label>
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="1234"
              required
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 tracking-widest"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Код действует 5 минут. Одноразовый.
            </p>
          </div>
          {!fullName && (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Имя</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Как к вам обращаться"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 disabled:opacity-60"
          >
            {loading ? "Проверяем…" : "Войти и продолжить"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => requestSms(phone)}
            className="w-full text-sm text-emerald-700 hover:underline py-1"
          >
            Отправить код ещё раз
          </button>
        </form>
      )}
    </div>
  );

  if (embedded) return body;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {body}
    </div>
  );
}
