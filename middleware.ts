import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import type { SessionUser } from '@/types'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production'
)

const COOKIE_NAME = 'skillcraft_session'

const protectedRoutes = ['/dashboard', '/view-course']
const authRoutes = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password']

async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret)
    return (payload.user as SessionUser) ?? null
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const user = await getSessionFromRequest(req)

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
