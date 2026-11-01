import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { hasMobizonKey, sendMobizonSms } from "@/lib/mobizon";
import {
  checkSendRate,
  generateOtpCode,
  markSent,
  saveOtp,
  OTP_TTL_SECONDS,
} from "@/lib/otp-store";

export const runtime = "nodejs";

/**
 * Sends a real SMS OTP via Mobizon.kz (own code + Message/SendSmsMessage).
 * Requires MOBIZON_API_KEY in server env. No silent "confirm without SMS" path.
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

    if (!hasMobizonKey()) {
      return NextResponse.json(
        {
          ok: false,
          mode: "unavailable",
          needsMobizonKey: true,
          error:
            "SMS не настроен: задайте MOBIZON_API_KEY в .env.local. Получить ключ: mobizon.kz → Панель → Настройки API → включить доступ.",
        },
        { status: 503 }
      );
    }

    const rate = checkSendRate(phone);
    if (!rate.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: rate.error,
          retryAfterSec: rate.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const code = generateOtpCode();
    const text = `NewPharm: kod ${code}`;
    const sms = await sendMobizonSms({ phoneE164: phone, text });
    if (!sms.ok) {
      console.error("mobizon send failed", sms.code, sms.error);
      return NextResponse.json(
        {
          ok: false,
          error:
            sms.error ||
            "Не удалось отправить SMS. Проверьте ключ Mobizon и баланс.",
          mobizonCode: sms.code,
        },
        { status: 502 }
      );
    }

    saveOtp(phone, code);
    markSent(phone);

    return NextResponse.json({
      ok: true,
      mode: "mobizon",
      phone,
      ttlSec: OTP_TTL_SECONDS,
      messageId: sms.messageId ?? null,
      message: "Код отправлен по SMS",
    });
  } catch (err: any) {
    console.error("phone/send", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка отправки кода" },
      { status: 500 }
    );
  }
}
