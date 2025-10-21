'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Props = {
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
};

export default function ProfileClient({
  fullName,
  email,
  phone,
  registeredAt,
}: Props) {
  return (
    <section className="min-h-screen bg-white text-[#001759] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-50 p-6 rounded-2xl shadow-md flex flex-col items-center text-center"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-slate-200">
            <Image
              src="/images/avatar.png"
              alt="Аватар"
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          </div>

          <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
          <p className="text-sm text-slate-600 mb-4">{email}</p>

          <div className="text-sm w-full text-left space-y-2">
            <div>
              <span className="font-semibold">📞 Телефон: </span>
              {phone}
            </div>
            <div>
              <span className="font-semibold">📅 Регистрация: </span>
              {registeredAt}
            </div>
          </div>

          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="mt-6 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
            >
              Выйти
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
