import { supabaseAdmin } from "@/lib/supabase-admin";
import { phoneDigits } from "@/lib/phone";

export function phoneEmail(phoneE164: string) {
  return `phone_${phoneDigits(phoneE164)}@users.newpharm.local`;
}

/** Find or create a client user for a phone number (fallback when SMS OTP is off). */
export async function ensurePhoneUser(
  phone: string,
  fullName?: string
): Promise<{ userId: string; email: string }> {
  const email = phoneEmail(phone);

  // Prefer profiles lookup (indexed, no pagination issues)
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (profile?.id) {
    if (fullName) {
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: { phone, role: "client", full_name: fullName },
      });
    }
    return { userId: profile.id, email };
  }

  // Do not set auth.phone here — Phone provider may be disabled; keep phone in metadata/profiles.
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      phone,
      role: "client",
      ...(fullName ? { full_name: fullName } : {}),
    },
  });

  if (created.data.user) {
    return { userId: created.data.user.id, email };
  }

  // Already exists under synthetic email — fetch via generateLink side-channel
  const link = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (link.data?.user?.id) {
    return { userId: link.data.user.id, email };
  }

  throw new Error(
    created.error?.message ||
      link.error?.message ||
      "Не удалось найти/создать пользователя"
  );
}
