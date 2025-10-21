import { supabaseServer } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error?.message === "Auth session missing!" || !data?.user) {
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

  // Загружаем профиль из таблицы profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <ProfileClient
  fullName={profile?.full_name || user.user_metadata?.full_name || user.email}
  email={user.email || "—"} // ✅ добавлено
  phone={profile?.phone || user.user_metadata?.phone || "—"}
  registeredAt={
    new Date(profile?.created_at || user.created_at).toLocaleDateString("ru-RU")
  }
/>
  );
}
