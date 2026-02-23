import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ success: false, error: { message: '無效的驗證連結' } }, { status: 400 })
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: { message: '驗證連結已過期或無效' } }, { status: 400 })
  }

  await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } })
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.json({ success: true, message: 'Email 驗證成功' })
}
