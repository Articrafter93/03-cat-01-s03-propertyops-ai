// Unit tests for the demo identity rules in lib/roles.ts, run with Node's built-in test runner
// (`npm test`): Node 24 strips the TypeScript types itself, so no test dependency is installed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getRole, isDemoAuthEnabled, isPathAllowed, resolveSession } from '../lib/roles.ts'

const ADMIN = 'admin@propertyops.demo'
const TECH = 'tecnico@propertyops.demo'

test('getRole maps the two demo accounts', () => {
  assert.equal(getRole(ADMIN), 'admin')
  assert.equal(getRole(TECH), 'tecnico')
})

test('getRole gives no role to a missing or unknown email instead of falling back to admin', () => {
  assert.equal(getRole(undefined), null)
  assert.equal(getRole(null), null)
  assert.equal(getRole(''), null)
  assert.equal(getRole('attacker@example.com'), null)
})

test('getRole ignores keys inherited from Object.prototype', () => {
  for (const key of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    assert.equal(getRole(key), null, key)
  }
})

test('resolveSession returns the demo identity only while the demo login is enabled', () => {
  assert.deepEqual(resolveSession(ADMIN, true), { email: ADMIN, role: 'admin' })
  assert.deepEqual(resolveSession(TECH, true), { email: TECH, role: 'tecnico' })
  assert.equal(resolveSession(ADMIN, false), null)
})

test('resolveSession treats a forged or empty cookie as signed out', () => {
  assert.equal(resolveSession('attacker@example.com', true), null)
  assert.equal(resolveSession('constructor', true), null)
  assert.equal(resolveSession('', true), null)
  assert.equal(resolveSession(undefined, true), null)
})

test('isDemoAuthEnabled requires the exact opt-in value', () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_AUTH
  try {
    process.env.NEXT_PUBLIC_DEMO_AUTH = 'enabled'
    assert.equal(isDemoAuthEnabled(), true)
    assert.deepEqual(resolveSession(ADMIN), { email: ADMIN, role: 'admin' })
    for (const value of ['', 'true', 'Enabled', 'disabled']) {
      process.env.NEXT_PUBLIC_DEMO_AUTH = value
      assert.equal(isDemoAuthEnabled(), false, value)
      assert.equal(resolveSession(ADMIN), null, value)
    }
    delete process.env.NEXT_PUBLIC_DEMO_AUTH
    assert.equal(isDemoAuthEnabled(), false)
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_AUTH
    else process.env.NEXT_PUBLIC_DEMO_AUTH = previous
  }
})

test('isPathAllowed lets admin open everything and scopes the technician to /incidents', () => {
  assert.equal(isPathAllowed('admin', '/rooms'), true)
  assert.equal(isPathAllowed('tecnico', '/incidents'), true)
  assert.equal(isPathAllowed('tecnico', '/incidents/42'), true)
  assert.equal(isPathAllowed('tecnico', '/incidentsX'), false)
  assert.equal(isPathAllowed('tecnico', '/rooms'), false)
  assert.equal(isPathAllowed('tecnico', '/dashboard'), false)
})
