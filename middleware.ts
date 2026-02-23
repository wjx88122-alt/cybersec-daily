import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

const protectedRoutes = ['/dashboard', '/profile', '/settings']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('access_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    verifyAccessToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
}
