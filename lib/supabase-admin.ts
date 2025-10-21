// import "server-only"; // закомментировано для сборки
import { createClient } from "@supabase/supabase-js";

// ✅ создаём и сразу экспортируем клиент администратора
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

// 🧩 алиасы для совместимости со старыми файлами
export const supabase = supabaseAdmin;
export const sbAdmin = supabaseAdmin;