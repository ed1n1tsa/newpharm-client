import { createHash, randomInt, timingSafeEqual } from "crypto";

export type OtpRecord = {
  phone: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
};

type RateBucket = {
  lastSentAt: number;
  sentHour: number[];
};

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MIN_RESEND_MS = 60 * 1000;
const MAX_PER_HOUR = 5;

type StoreShape = {
  otps: Map<string, OtpRecord>;
  rates: Map<string, RateBucket>;
};

function store(): StoreShape {
  const g = globalThis as unknown as { __npOtpStore?: StoreShape };
  if (!g.__npOtpStore) {
    g.__npOtpStore = {
      otps: new Map(),
      rates: new Map(),
    };
  }
  return g.__npOtpStore;
}

function pepper(): string {
  return (
    process.env.OTP_PEPPER ||
    process.env.MOBIZON_API_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "newpharm-otp-dev"
  );
}

export function hashOtp(phone: string, code: string): string {
  return createHash("sha256")
    .update(`${phone}|${code}|${pepper()}`)
    .digest("hex");
}

export function generateOtpCode(): string {
  // 4 digits as in product example: "NewPharm: kod 1234"
  return String(randomInt(0, 10000)).padStart(4, "0");
}

export function checkSendRate(phone: string): {
  ok: boolean;
  retryAfterSec?: number;
  error?: string;
} {
  const now = Date.now();
  const rates = store().rates;
  const bucket = rates.get(phone) || { lastSentAt: 0, sentHour: [] };
  bucket.sentHour = bucket.sentHour.filter((t) => now - t < 60 * 60 * 1000);

  if (bucket.lastSentAt && now - bucket.lastSentAt < MIN_RESEND_MS) {
    const retryAfterSec = Math.ceil(
      (MIN_RESEND_MS - (now - bucket.lastSentAt)) / 1000
    );
    return {
      ok: false,
      retryAfterSec,
      error: `Подождите ${retryAfterSec} сек. перед повторной отправкой`,
    };
  }
  if (bucket.sentHour.length >= MAX_PER_HOUR) {
    return {
      ok: false,
      retryAfterSec: 3600,
      error: "Слишком много SMS на этот номер. Попробуйте позже.",
    };
  }
  return { ok: true };
}

export function markSent(phone: string) {
  const now = Date.now();
  const rates = store().rates;
  const bucket = rates.get(phone) || { lastSentAt: 0, sentHour: [] };
  bucket.lastSentAt = now;
  bucket.sentHour = bucket.sentHour.filter((t) => now - t < 60 * 60 * 1000);
  bucket.sentHour.push(now);
  rates.set(phone, bucket);
}

export function saveOtp(phone: string, code: string): OtpRecord {
  const rec: OtpRecord = {
    phone,
    codeHash: hashOtp(phone, code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    createdAt: Date.now(),
  };
  store().otps.set(phone, rec);
  return rec;
}

export function verifyOtp(
  phone: string,
  code: string
): { ok: boolean; error?: string } {
  const rec = store().otps.get(phone);
  if (!rec) {
    return { ok: false, error: "Код не найден. Запросите новый." };
  }
  if (Date.now() > rec.expiresAt) {
    store().otps.delete(phone);
    return { ok: false, error: "Код истёк. Запросите новый." };
  }
  if (rec.attempts >= MAX_ATTEMPTS) {
    store().otps.delete(phone);
    return { ok: false, error: "Слишком много попыток. Запросите новый код." };
  }

  rec.attempts += 1;
  const expected = Buffer.from(rec.codeHash, "hex");
  const actual = Buffer.from(hashOtp(phone, code.trim()), "hex");
  const match =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!match) {
    store().otps.set(phone, rec);
    const left = MAX_ATTEMPTS - rec.attempts;
    return {
      ok: false,
      error:
        left > 0
          ? `Неверный код. Осталось попыток: ${left}`
          : "Неверный код. Запросите новый.",
    };
  }

  // one-time use
  store().otps.delete(phone);
  return { ok: true };
}

export const OTP_TTL_SECONDS = Math.floor(OTP_TTL_MS / 1000);
