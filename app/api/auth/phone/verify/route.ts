import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { ensurePhoneUser, phoneEmail } from "@/lib/phone-auth-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyOtp } from "@/lib/otp-store";

export const runtime = "nodejs";

/**
 * Verifies Mobizon OTP, then issues a Supabase session via magiclink token_hash.
 * Code is required — no bypass without SMS verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body.phone || ""));
    const fullName = String(body.full_name || "").trim();
    const token = String(body.token || body.code || "").trim();

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите корректный номер" },
        { status: 400 }
      );
    }
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Введите код из SMS" },
        { status: 400 }
      );
    }

    const check = verifyOtp(phone, token);
    if (!check.ok) {
      return NextResponse.json(
        { ok: false, error: check.error || "Неверный код" },
        { status: 401 }
      );
    }

    const { userId, email } = await ensurePhoneUser(
      phone,
      fullName || undefined
    );

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
            "Код верный, но не удалось создать сессию. Попробуйте ещё раз.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "mobizon",
      email,
      token_hash: link.data.properties.hashed_token,
      email_otp: link.data.properties.email_otp || null,
      user_id: userId,
      message: "Телефон подтверждён",
    });
  } catch (err: any) {
    console.error("phone/verify", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка подтверждения" },
      { status: 500 }
    );
  }
}
