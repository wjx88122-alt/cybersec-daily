import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get('refresh_token')?.value

  if (rawToken) {
    await prisma.refreshToken.deleteMany({ where: { token: rawToken } })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.delete('access_token')
  res.cookies.delete('refresh_token')
  return res
}
