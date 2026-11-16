import type { NextRequest } from "next/server";
import { requireCmsAdmin } from "@/lib/cms-auth";

/**
 * Authorize mutating 1C sync endpoints.
 * Accepts any of:
 * - x-onec-secret / ?secret matching ONE_C_SECRET
 * - Authorization: Bearer matching CRON_SECRET or ONE_C_SECRET
 * - valid CMS admin cookie (admin UI)
 */
export async function authorizeOnecSync(
  req: NextRequest
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const onecSecret = process.env.ONE_C_SECRET?.trim() || "";
  const cronSecret = process.env.CRON_SECRET?.trim() || "";

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const headerSecret = req.headers.get("x-onec-secret")?.trim() || "";
  const querySecret = req.nextUrl.searchParams.get("secret")?.trim() || "";

  if (onecSecret && (headerSecret === onecSecret || querySecret === onecSecret)) {
    return { ok: true };
  }
  if (bearer) {
    if (cronSecret && bearer === cronSecret) return { ok: true };
    if (onecSecret && bearer === onecSecret) return { ok: true };
  }

  // Admin UI (same-origin cookie)
  try {
    if (await requireCmsAdmin()) return { ok: true };
  } catch {
    // ignore cookie parse errors
  }

  if (!onecSecret && !cronSecret) {
    return {
      ok: false,
      status: 401,
      error:
        "Unauthorized: задайте ONE_C_SECRET/CRON_SECRET или войдите как CMS-админ",
    };
  }

  return { ok: false, status: 401, error: "Unauthorized" };
}
