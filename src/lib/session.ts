/**
 * Who is signed in, from a signed cookie. Web Crypto only, so it runs on
 * Workers and under Bun alike: an HMAC over the payload for the session
 * token, PBKDF2 for the password.
 */

import { cookies } from '@rsc-kit/core/request'
import { env } from '@/env'
import { getUserById } from './queries'

const SESSION_COOKIE = 'session'
const ONE_DAY = 60 * 60 * 24

const encoder = new TextEncoder()

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes))

  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(text: string): Uint8Array<ArrayBuffer> {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(new ArrayBuffer(bin.length))

  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)

  return bytes
}

interface SessionPayload {
  user: { id: number }
  expires: number
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const body = base64url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await key(), encoder.encode(body))

  return `${body}.${base64url(signature)}`
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  const [body, signature] = token.split('.')

  if (!body || !signature) return null

  const valid = await crypto.subtle.verify('HMAC', await key(), fromBase64url(signature), encoder.encode(body))

  if (!valid) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64url(body))) as SessionPayload

    return payload.expires > Date.now() ? payload : null
  } catch {
    return null
  }
}

export async function setSession(userId: number): Promise<void> {
  const token = await signToken({ user: { id: userId }, expires: Date.now() + ONE_DAY * 1000 })
  const jar = await cookies()

  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: ONE_DAY, path: '/' })
}

export async function clearSession(): Promise<void> {
  const jar = await cookies()

  jar.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', maxAge: 0, path: '/' })
}

export async function getUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyToken(token)

  if (!session) return null

  return getUserById(session.user.id)
}

// PBKDF2, 100k rounds, a 16-byte salt kept in front of the hash.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derive(password, salt)

  return `${base64url(salt)}.${base64url(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split('.')

  if (!salt || !hash) return false

  const bits = await derive(password, fromBase64url(salt))

  return base64url(bits) === hash
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])

  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, material, 256)
}
