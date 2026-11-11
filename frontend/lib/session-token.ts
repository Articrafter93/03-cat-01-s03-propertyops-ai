import { createHmac, timingSafeEqual } from 'node:crypto'

// Signs and verifies the demo session cookie: "<email>.<HMAC-SHA256(email) in base64url>".
// The key is passed in by the caller (lib/session-key.ts holds it, server-only). A cookie without a
// valid signature for that key is no session. This module only imports node:crypto, so Node's
// test runner can load it directly (tests/).

function mac(email: string, key: string): string {
  return createHmac('sha256', key).update(email).digest('base64url')
}

export function signSessionValue(email: string, key: string | undefined): string {
  if (!key) throw new Error('DEMO_SESSION_SECRET is missing: the demo session cannot be signed')
  return `${email}.${mac(email, key)}`
}

// Returns the signed email, or null when the value is missing, malformed, signed with another key
// or there is no key at all (fail closed: signed out). The signature is compared, in constant time,
// against its canonical base64url text, so only one spelling of a valid signature is accepted.
export function verifySessionValue(value: string | null | undefined, key: string | undefined): string | null {
  if (!value || !key) return null
  const dot = value.lastIndexOf('.')
  if (dot <= 0) return null
  const email = value.slice(0, dot)
  const given = Buffer.from(value.slice(dot + 1))
  const expected = Buffer.from(mac(email, key))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  return email
}
