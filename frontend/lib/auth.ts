import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isDemoAuthEnabled, resolveSession, SESSION_COOKIE, type DemoSession } from './roles'
import { isValidDemoAccount } from './demo-accounts'
import { sessionKey } from './session-key'
import { signSessionValue, verifySessionValue } from './session-token'

export type Session = DemoSession

// Same rule as the proxy: a cookie without a valid signature, a cookie that is not a demo account,
// or any cookie while the demo login is disabled, is no session at all.
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  return resolveSession(verifySessionValue(store.get(SESSION_COOKIE)?.value, sessionKey()))
}

// Used by the dashboard layout and the incidents page, which must never render without a session.
// The proxy already redirects; this keeps them from rendering, and the incidents page from falling
// back to the unfiltered view, if a request ever gets past it.
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

// Error codes (localized in the client via the i18n dictionary)
export type AuthErrorCode = 'demoDisabled' | 'invalidCredentials'

export async function signInLocal(
  email: string,
  password: string
): Promise<{ error: AuthErrorCode } | null> {
  if (!isDemoAuthEnabled()) {
    return { error: 'demoDisabled' }
  }
  if (!isValidDemoAccount(email, password)) {
    return { error: 'invalidCredentials' }
  }
  const store = await cookies()
  store.set(SESSION_COOKIE, signSessionValue(email, sessionKey()), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return null
}

export async function signOutLocal(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
