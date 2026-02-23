import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth/jwt'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get('refresh_token')?.value
  if (!rawToken) {
    return NextResponse.json({ success: false, error: { message: '未授權' } }, { status: 401 })
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: rawToken } })
  if (!stored || stored.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: { message: '未授權' } }, { status: 401 })
  }

  try {
    verifyRefreshToken(rawToken)
  } catch {
    await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } })
    return NextResponse.json({ success: false, error: { message: '未授權' } }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } })
  if (!user) {
    return NextResponse.json({ success: false, error: { message: '未授權' } }, { status: 401 })
  }

  // Refresh Token Rotation
  await prisma.refreshToken.delete({ where: { token: rawToken } })
  const newRawToken = crypto.randomBytes(32).toString('hex')
  await prisma.refreshToken.create({
    data: { token: newRawToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  })

  const payload = { userId: user.id, email: user.email }
  const accessToken = signAccessToken(payload)
  const newRefreshToken = signRefreshToken(payload)

  const res = NextResponse.json({ success: true })
  res.cookies.set('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 15 * 60 })
  res.cookies.set('refresh_token', newRawToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 })
  return res
}
