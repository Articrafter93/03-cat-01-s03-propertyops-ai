import { NextResponse, type NextRequest } from 'next/server'
import { isPathAllowed, resolveSession, SESSION_COOKIE } from '@/lib/roles'
import { sessionKey } from '@/lib/session-key'
import { verifySessionValue } from '@/lib/session-token'

export function proxy(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value
  // Same rule as lib/auth.ts: no session unless the cookie carries a valid signature for this
  // build, the demo login is enabled and the signed email is one of the demo accounts.
  const session = resolveSession(verifySessionValue(cookieValue, sessionKey()))

  const { pathname } = request.nextUrl
  const isLoginPage = pathname.startsWith('/login')
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicPage = pathname.startsWith('/privacy')

  if (!session && !isLoginPage && !isAuthRoute && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    // A cookie that does not resolve to a session is dropped instead of being sent on every request.
    if (cookieValue) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'tecnico' ? '/incidents' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (session && !isPublicPage && !isLoginPage && !isAuthRoute) {
    if (!isPathAllowed(session.role, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/incidents'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
