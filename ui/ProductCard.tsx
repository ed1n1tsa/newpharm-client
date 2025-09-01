"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/mockData";
import { useCart } from "./CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const [fav, setFav] = useState(false);
  const { add } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
    >
      <button
        aria-label="В избранное"
        onClick={() => setFav(!fav)}
        className={`absolute right-3 top-3 grid place-items-center rounded-full border p-2 transition ${
          fav ? "border-[#20B0B1] bg-[#20B0B1]/10" : "border-slate-200 bg-white/70 hover:bg-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill={fav ? "#20B0B1" : "none"}
          stroke={fav ? "#20B0B1" : "currentColor"}
          strokeWidth="2"
        >
          <path d="M20.8 11.6c0 4.1-8.8 9.2-8.8 9.2S3.2 15.7 3.2 11.6C3.2 8.4 5.8 6 8.6 6c1.7 0 3.2.9 3.4 2.5C12.2 6.9 13.7 6 15.4 6c2.8 0 5.4 2.4 5.4 5.6Z" />
        </svg>
      </button>

      <div className="aspect-[16/9] rounded-xl bg-slate-100 overflow-hidden mb-3">
        <img src={product.image} alt={product.title} className="h-full w-full object-contain" />
      </div>

      <div className="space-y-1">
        <div className="text-slate-900 font-bold">{product.price} ₸</div>
        <h3 className="text-sm text-slate-800 line-clamp-2">{product.title}</h3>
      </div>

      <button
        className="mt-4 w-full rounded-full bg-teal-500 px-5 py-2.5 text-white font-semibold hover:bg-teal-600 transition inline-flex items-center justify-center gap-2"
        onClick={() => add(product)}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6l-1-2H3" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
        В корзину
      </button>
    </motion.article>
  );
}
