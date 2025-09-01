"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      setLoading(true);
      await login(email, password);
    } catch (e: any) {
      setErr(e.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      setLoading(true);
      await register(name, email, password);
    } catch (e: any) {
      setErr(e.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === "login"
                  ? "bg-[#20B0B1] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => setTab("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === "register"
                  ? "bg-[#20B0B1] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Регистрация
            </button>
          </div>
          <button onClick={closeAuth} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {err && <div className="mb-3 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}

          {tab === "login" ? (
            <form onSubmit={onLogin} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#20B0B1]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Пароль</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#20B0B1]"
                />
              </div>
              <button
                disabled={loading}
                className="w-full rounded-full bg-[#20B0B1] px-5 py-2.5 text-white font-semibold hover:opacity-95 disabled:opacity-70"
              >
                Войти
              </button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Имя</label>
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#20B0B1]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#20B0B1]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Пароль</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#20B0B1]"
                />
              </div>
              <button
                disabled={loading}
                className="w-full rounded-full bg-[#20B0B1] px-5 py-2.5 text-white font-semibold hover:opacity-95 disabled:opacity-70"
              >
                Зарегистрироваться
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
