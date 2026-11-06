import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

const configured = Boolean(url && serviceRole);

if (!configured) {
  console.warn(
    "supabase-admin: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE missing — using inert client (guest fallbacks)"
  );
}

/** Server-only admin client. Never import this into client components. */
export const supabaseAdmin = createClient(
  url || "http://127.0.0.1:54321",
  serviceRole || "missing-service-role-key",
  {
    auth: { persistSession: false },
  }
);

export const sbAdmin = supabaseAdmin;

export function isSupabaseAdminConfigured() {
  return configured;
}
