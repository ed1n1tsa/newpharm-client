import { cookies } from 'next/headers'
import crypto from 'crypto'

export const CMS_COOKIE = 'np_cms_admin'

function secret() {
  return (
    process.env.CMS_ADMIN_PASSWORD ||
    process.env.ONE_C_SECRET ||
    'newpharm2026'
  )
}

export function cmsCredentials() {
  return {
    user: process.env.CMS_ADMIN_USER || 'admin',
    password: process.env.CMS_ADMIN_PASSWORD || 'newpharm2026',
  }
}

export function signCmsSession(user: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `${user}.${exp}`
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyCmsSession(token: string | undefined | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [user, expStr, sig] = parts
  const exp = Number(expStr)
  if (!user || !exp || Date.now() > exp) return false
  const payload = `${user}.${exp}`
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function requireCmsAdmin() {
  const jar = await cookies()
  return verifyCmsSession(jar.get(CMS_COOKIE)?.value)
}
