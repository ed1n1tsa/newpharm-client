import { phoneDigits } from "@/lib/phone";

const MOBIZON_API_BASE =
  process.env.MOBIZON_API_BASE || "https://api.mobizon.kz/service";

export function hasMobizonKey(): boolean {
  return Boolean(process.env.MOBIZON_API_KEY?.trim());
}

export type MobizonSendResult = {
  ok: boolean;
  messageId?: number | string;
  campaignId?: number | string;
  code?: number;
  error?: string;
  raw?: unknown;
};

/**
 * Send a single SMS via Mobizon Message/SendSmsMessage.
 * Docs: https://mobizon.kz/help/api-docs/message
 * recipient = digits only, international (e.g. 7701…).
 * `from` is optional — omit to use tariff common signature.
 */
export async function sendMobizonSms(params: {
  phoneE164: string;
  text: string;
}): Promise<MobizonSendResult> {
  const apiKey = process.env.MOBIZON_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "MOBIZON_API_KEY не задан. Добавьте ключ в .env.local (Mobizon → Настройки API).",
    };
  }

  const recipient = phoneDigits(params.phoneE164);
  if (!recipient || recipient.length < 11) {
    return { ok: false, error: "Некорректный номер получателя" };
  }

  const body = new URLSearchParams();
  body.set("recipient", recipient);
  body.set("text", params.text);
  const from = process.env.MOBIZON_FROM?.trim();
  if (from) body.set("from", from);
  // Delivery wait window (min 60 per docs); OTP itself expires in our store sooner.
  body.set("params[validity]", "60");
  body.set("params[name]", "NewPharm OTP");

  const url = `${MOBIZON_API_BASE}/message/sendSmsMessage?output=json&api=v1&apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
      },
      body: body.toString(),
    });

    const raw = await res.json().catch(() => null);
    // Mobizon wraps payloads as { code, data, message }
    const code = Number(raw?.code);
    if (!res.ok) {
      return {
        ok: false,
        code,
        error: raw?.message || `Mobizon HTTP ${res.status}`,
        raw,
      };
    }
    if (code !== 0) {
      return {
        ok: false,
        code,
        error: raw?.message || `Mobizon error code ${code}`,
        raw,
      };
    }

    const data = raw?.data || {};
    return {
      ok: true,
      code,
      messageId: data.messageId,
      campaignId: data.campaignId,
      raw,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Mobizon network error" };
  }
}
