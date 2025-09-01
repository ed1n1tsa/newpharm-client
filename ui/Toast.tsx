"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: string; text: string };
type ToastCtx = { show: (text: string) => void };

const Ctx = createContext<ToastCtx | null>(null);
export const useToast = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used inside <ToastProvider/>");
  return v;
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = (text: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    const t: Toast = { id, text };
    setItems((s) => [...s, t]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3000);
  };

  const value = useMemo(() => ({ show }), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* Стек тостов */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto max-w-[90vw] sm:max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-[#20B0B1]/10 text-[#20B0B1]">
                  ✓
                </span>
                <p className="text-sm text-slate-800">{t.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
