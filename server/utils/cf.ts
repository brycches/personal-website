/**
 * Cloudflare binding access for Nitro server routes. On the cloudflare_pages
 * preset, bindings live at `event.context.cloudflare.env`.
 */
import type { H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

export function cfEnv(event: H3Event): Record<string, any> {
  const env = (event.context as any)?.cloudflare?.env
  if (!env || !env.DB) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Database binding unavailable. Bind a D1 database named DB to the Pages project (or run `wrangler pages dev` locally).',
    })
  }
  return env
}

export function useDB(event: H3Event): D1Database {
  return cfEnv(event).DB as D1Database
}

/**
 * Server config resolved from the Cloudflare env (Pages project variables /
 * secrets), falling back to Nuxt runtimeConfig for local dev.
 */
export function serverConfig(event: H3Event) {
  const rc = useRuntimeConfig(event) as Record<string, any>
  const env = ((event.context as any)?.cloudflare?.env ?? {}) as Record<string, any>
  const pick = (envKey: string, rcKey: string) => env[envKey] ?? rc[rcKey] ?? ''
  return {
    adminPassword: pick('NUXT_ADMIN_PASSWORD', 'adminPassword') as string,
    sessionSecret: (pick('NUXT_SESSION_SECRET', 'sessionSecret') as string) || 'dev-insecure-secret',
  }
}

export function clientIp(event: H3Event): string | null {
  const cf = getRequestHeader(event, 'cf-connecting-ip')
  if (cf) return cf.slice(0, 64)
  const fwd = getRequestHeader(event, 'x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim().slice(0, 64)
  const sock = (event.node?.req?.socket?.remoteAddress as string | undefined) ?? null
  if (sock) return sock.slice(0, 64)
  return null
}
