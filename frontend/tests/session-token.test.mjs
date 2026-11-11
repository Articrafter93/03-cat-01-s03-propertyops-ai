// Unit tests for the demo session cookie signature in lib/session-token.ts (Node's built-in runner).
// The key is always passed explicitly: lib/session-token.ts never reads the environment.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signSessionValue, verifySessionValue } from '../lib/session-token.ts'

const KEY = 'test-key-for-unit-tests-only-0123456789'
const ADMIN = 'admin@propertyops.demo'
const TECH = 'tecnico@propertyops.demo'

function signatureOf(token) {
  return token.slice(token.lastIndexOf('.') + 1)
}

test('a value signed with a key verifies back to its email with the same key', () => {
  assert.equal(verifySessionValue(signSessionValue(ADMIN, KEY), KEY), ADMIN)
  assert.equal(verifySessionValue(signSessionValue(TECH, KEY), KEY), TECH)
})

test('an unsigned email, the old cookie format, is rejected', () => {
  assert.equal(verifySessionValue(ADMIN, KEY), null)
})

test('swapping the email under a valid signature is rejected', () => {
  assert.equal(verifySessionValue(`${ADMIN}.${signatureOf(signSessionValue(TECH, KEY))}`, KEY), null)
})

test('a value signed with another key is rejected', () => {
  assert.equal(verifySessionValue(signSessionValue(ADMIN, 'another-key-0123456789-0123456789'), KEY), null)
})

test('only the canonical spelling of a valid signature is accepted', () => {
  const token = signSessionValue(ADMIN, KEY)
  // Base64 padding decodes to the same bytes but is not the canonical base64url text.
  assert.equal(verifySessionValue(`${token}=`, KEY), null)

  // The standard base64 alphabet (+ and /) decodes to the same bytes as base64url (- and _).
  let email = ADMIN
  for (let i = 0; !/[-_]/.test(signatureOf(signSessionValue(email, KEY))); i++) email = `user${i}@propertyops.demo`
  const canonical = signSessionValue(email, KEY)
  const standardAlphabet = canonical.slice(0, canonical.lastIndexOf('.') + 1) + signatureOf(canonical).replace(/-/g, '+').replace(/_/g, '/')
  assert.equal(verifySessionValue(canonical, KEY), email)
  assert.equal(verifySessionValue(standardAlphabet, KEY), null)
})

test('malformed values are rejected without throwing', () => {
  for (const value of [undefined, null, '', '.', '.abc', `${ADMIN}.`, `${ADMIN}.short`, `${ADMIN}.!!!`]) {
    assert.equal(verifySessionValue(value, KEY), null, String(value))
  }
})

test('without a key nothing verifies and signing fails loudly', () => {
  const token = signSessionValue(ADMIN, KEY)
  assert.equal(verifySessionValue(token, undefined), null)
  assert.equal(verifySessionValue(token, ''), null)
  assert.throws(() => signSessionValue(ADMIN, undefined), /DEMO_SESSION_SECRET is missing/)
  assert.throws(() => signSessionValue(ADMIN, ''), /DEMO_SESSION_SECRET is missing/)
})
