/** Normalize Kazakhstan phone numbers to E.164 (+7XXXXXXXXXX). */
export function normalizePhone(input: string): string | null {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return null;

  let local = digits;
  if (local.startsWith("8") && local.length === 11) {
    local = "7" + local.slice(1);
  }
  if (local.length === 10) {
    local = "7" + local;
  }
  if (!local.startsWith("7") || local.length !== 11) return null;
  return `+${local}`;
}

export function phoneToWhatsAppLink(phone: string, text?: string): string {
  const digits = normalizePhone(phone)?.replace(/\D/g, "") ?? phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function phoneDigits(input: string): string {
  return normalizePhone(input)?.replace(/\D/g, "") ?? "";
}

export function formatPhoneDisplay(input: string): string {
  const d = phoneDigits(input);
  if (d.length !== 11) return input;
  return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}
