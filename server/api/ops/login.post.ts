/**
 * POST /api/ops/login — { password } → issues the bc_admin cookie.
 * Throttled per client IP.
 */
export default defineEventHandler(async (event) => {
  if (!opsRateLimit('ops-login', clientIp(event) ?? '', 5, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'too many attempts' })
  }

  const body = await readBody<{ password?: unknown }>(event).catch(() => null)
  const supplied = typeof body?.password === 'string' ? body.password : ''

  const ok = await verifyAdminPassword(event, supplied)
  if (!ok) {
    // Small delay to blunt brute force.
    await new Promise((r) => setTimeout(r, 400))
    throw createError({ statusCode: 401, statusMessage: 'access denied' })
  }

  await issueAdminCookie(event)
  return { ok: true }
})
