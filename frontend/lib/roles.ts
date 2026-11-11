// Demo identity for the portfolio sandbox: who a session cookie belongs to and what that role may open.
// This module has no imports on purpose: the proxy, the server helpers and the unit tests share it as-is.
export type UserRole = 'admin' | 'tecnico';

// Demo email → role mapping (sandbox only; never use real credentials here)
const DEMO_ROLE_MAP: Record<string, UserRole> = {
  'admin@propertyops.demo': 'admin',
  'tecnico@propertyops.demo': 'tecnico',
};

// Technician ID assigned to the demo tecnico account
export const DEMO_TECNICO_ID = 'TEC-001';

// Cookie that carries the signed demo session. The proxy and lib/auth.ts both read it the same way:
// verifySessionValue (lib/session-token.ts) checks the signature, then resolveSession below.
export const SESSION_COOKIE = 'propertyops_demo_session';

// The demo login exists only when the build opts in explicitly (portfolio exhibition).
// A production build without the flag has no demo login and no demo session.
export function isDemoAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_AUTH === 'enabled';
}

// Unknown or missing emails have no role: there is no fallback to a privileged role.
// Object.hasOwn keeps inherited keys such as "constructor" from passing as a role.
export function getRole(email?: string | null): UserRole | null {
  if (!email || !Object.hasOwn(DEMO_ROLE_MAP, email)) return null;
  return DEMO_ROLE_MAP[email];
}

export interface DemoSession {
  email: string;
  role: UserRole;
}

// Turns the email from a verified session cookie into a demo identity, or null (signed out) when
// there is no verified email, the demo login is disabled for this build or the email is not one of
// the demo accounts.
export function resolveSession(
  email: string | null | undefined,
  demoAuthEnabled: boolean = isDemoAuthEnabled(),
): DemoSession | null {
  if (!demoAuthEnabled || !email) return null;
  const role = getRole(email);
  return role ? { email, role } : null;
}

// Routes the tecnico role is allowed to access
const TECNICO_ALLOWED = ['/incidents'];

// A route matches its own path or a sub-path (/incidents, /incidents/42), never a longer sibling (/incidentsX).
export function isPathAllowed(role: UserRole, pathname: string): boolean {
  if (role === 'admin') return true;
  return TECNICO_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
