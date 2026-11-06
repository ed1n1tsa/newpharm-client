import { NextResponse } from 'next/server'
import { CMS_COOKIE, cmsCredentials, signCmsSession } from '@/lib/cms-auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { user, password } = cmsCredentials()
  if (body.user !== user || body.password !== password) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  }
  const token = signCmsSession(user)
  const res = NextResponse.json({ ok: true, user })
  res.cookies.set(CMS_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CMS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
