import { supabaseServer } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error?.message === "Auth session missing!" || !data?.user) {
    // 👇 вместо redirect() — просто JSX со ссылкой
    return (
      <section className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-4">Вы не вошли в аккаунт</h2>
        <Link
          href="/login"
          className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
        >
          Войти
        </Link>
      </section>
    );
  }

  const user = data.user;

  return (
    <section className="min-h-screen bg-white text-[#001759] py-16 px-4">
      <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
          <Image
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`}
            alt="Аватар"
            width={112}
            height={112}
            className="object-cover w-full h-full"
          />
        </div>

        <h1 className="text-2xl font-bold mb-1">
          {user.user_metadata?.full_name || user.email}
        </h1>
        <p className="text-sm text-slate-600 mb-4">{user.email}</p>

        <div className="text-sm w-full text-left space-y-2">
          <div>
            <span className="font-semibold">📞 Телефон: </span>
            {user.user_metadata?.phone || "—"}
          </div>
          <div>
            <span className="font-semibold">📅 Регистрация: </span>
            {new Date(user.created_at).toLocaleDateString("ru-RU")}
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
      </div>
    </section>
  );
}
