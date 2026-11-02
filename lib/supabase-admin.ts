import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceRole) {
  throw new Error(
    "supabase-admin requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE on the server"
  );
}

/** Server-only admin client. Never import this into client components. */
export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export const sbAdmin = supabaseAdmin;