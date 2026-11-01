import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { ensurePhoneUser } from "@/lib/phone-auth-user";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Phone OTP contract for checkout.
 *
 * Primary path (when Phone provider is on): client calls supabase.auth.signInWithOtp.
 * Fallback path: prepares a user so verify can issue a session without SMS.
 *
 * Enable in Supabase Dashboard:
 * Authentication → Providers → Phone → Enable
 * + configure Twilio (SMS provider already set to twilio in project settings).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body.phone || ""));
    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите корректный номер (+7…)" },
        { status: 400 }
      );
    }

    const settingsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } }
    );
    const settings = settingsRes.ok ? await settingsRes.json() : null;
    const phoneEnabled = Boolean(settings?.external?.phone);

    if (phoneEnabled) {
      return NextResponse.json({
        ok: true,
        mode: "otp",
        phone,
        message: "Отправьте OTP через supabase.auth.signInWithOtp",
      });
    }

    const { userId } = await ensurePhoneUser(phone);
    await supabaseAdmin.from("profiles").upsert(
      { id: userId, phone, role: "client" },
      { onConflict: "id" }
    );

    return NextResponse.json({
      ok: true,
      mode: "fallback",
      phone,
      needsDashboard: true,
      message:
        "Phone Auth в Supabase выключен. SMS не отправляется — подтвердите номер на следующем шаге. Включите Phone + Twilio в Dashboard.",
    });
  } catch (err: any) {
    console.error("phone/send", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка отправки кода" },
      { status: 500 }
    );
  }
}
