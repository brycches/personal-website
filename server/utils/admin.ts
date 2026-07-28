/**
 * Password-protected /ops auth, using an HMAC-signed cookie (Web Crypto —
 * works on Workers and in dev). No external auth dependency.
 */
import type { H3Event } from 'h3'

const COOKIE = 'bc_admin'
const MAX_AGE_S = 60 * 60 * 12 // 12h

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return toHex(sig)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export async function verifyAdminPassword(event: H3Event, password: string): Promise<boolean> {
  const cfg = serverConfig(event)
  // Trim both sides — secrets set via piped stdin can carry a trailing newline.
  const expected = (cfg.adminPassword ?? '').trim()
  if (!expected) return false
  // Constant-time-ish compare via HMAC of both sides.
  const [a, b] = await Promise.all([
    hmac(cfg.sessionSecret, expected),
    hmac(cfg.sessionSecret, (password ?? '').trim()),
  ])
  return timingSafeEqual(a, b)
}

export async function issueAdminCookie(event: H3Event): Promise<void> {
  const secret = serverConfig(event).sessionSecret
  const ts = Date.now()
  const sig = await hmac(secret, `admin|${ts}`)
  // Secure only over HTTPS (always true on Cloudflare); allows local http testing.
  const secure = getRequestProtocol(event) === 'https'
  setCookie(event, COOKIE, `${ts}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: MAX_AGE_S,
  })
}

export function clearAdminCookie(event: H3Event): void {
  deleteCookie(event, COOKIE, { path: '/' })
}

export async function isAdmin(event: H3Event): Promise<boolean> {
  const raw = getCookie(event, COOKIE)
  if (!raw || !raw.includes('.')) return false
  const [tsStr, sig] = raw.split('.')
  const ts = Number(tsStr)
  if (!Number.isFinite(ts)) return false
  if (Date.now() - ts > MAX_AGE_S * 1000) return false
  const secret = serverConfig(event).sessionSecret
  const expected = await hmac(secret, `admin|${ts}`)
  return timingSafeEqual(expected, sig ?? '')
}

export async function requireAdmin(event: H3Event): Promise<void> {
  if (!(await isAdmin(event))) {
    throw createError({ statusCode: 401, statusMessage: 'Admin authentication required' })
  }
}
