import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { ensurePhoneUser, phoneEmail } from "@/lib/phone-auth-user";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Completes phone login for the fallback path (Phone provider disabled).
 * Returns token_hash for supabase.auth.verifyOtp({ type: 'email', token_hash }).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body.phone || ""));
    const fullName = String(body.full_name || "").trim();
    const mode = String(body.mode || "fallback");

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите корректный номер" },
        { status: 400 }
      );
    }

    if (mode === "otp") {
      return NextResponse.json({
        ok: true,
        mode: "otp",
        message: "Подтверждайте OTP через supabase.auth.verifyOtp на клиенте",
      });
    }

    const { userId, email } = await ensurePhoneUser(phone, fullName || undefined);

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        phone,
        role: "client",
        email: phoneEmail(phone),
        full_name: fullName || null,
      },
      { onConflict: "id" }
    );

    const link = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (link.error || !link.data?.properties?.hashed_token) {
      return NextResponse.json(
        {
          ok: false,
          error:
            link.error?.message ||
            "Не удалось выдать сессию. Включите Phone Auth в Supabase Dashboard.",
          needsDashboard: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "fallback",
      email,
      token_hash: link.data.properties.hashed_token,
      email_otp: link.data.properties.email_otp || null,
      user_id: userId,
      needsDashboard: true,
      message:
        "Сессия без SMS (Phone Auth выключен). Включите Phone + Twilio в Supabase Dashboard.",
    });
  } catch (err: any) {
    console.error("phone/verify", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка подтверждения" },
      { status: 500 }
    );
  }
}
