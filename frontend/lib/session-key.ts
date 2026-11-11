import 'server-only'

// The per-build key for the session cookie signature. next.config.ts generates it when the build
// starts and lists it under `env`, so Next replaces process.env.DEMO_SESSION_SECRET below with the
// literal value at compile time. This is the only module that reads it, and 'server-only' makes the
// build fail if a client component ever imports it, so the key cannot reach the browser bundle.
export function sessionKey(): string | undefined {
  return process.env.DEMO_SESSION_SECRET || undefined
}
