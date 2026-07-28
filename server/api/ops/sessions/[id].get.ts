/**
 * GET /api/ops/sessions/:id — full session row + its first 2000 events.
 */
function parsePayload(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const sid = getRouterParam(event, 'id') ?? ''
  if (!isValidOpsId(sid)) {
    throw createError({ statusCode: 400, statusMessage: 'bad session id' })
  }
  const db = useDB(event)
  await ensureOpsTables(db)

  const session = await db
    .prepare('SELECT * FROM ops_session WHERE sid = ?')
    .bind(sid)
    .first<Record<string, unknown>>()
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'unknown session' })
  }

  const rows = (
    await db
      .prepare('SELECT ts, type, name, payload FROM ops_event WHERE sid = ? ORDER BY ts LIMIT 2000')
      .bind(sid)
      .all<{ ts: number; type: string; name: string | null; payload: string | null }>()
  ).results

  const events = rows.map(r => ({
    ts: r.ts,
    type: r.type,
    name: r.name,
    payload: parsePayload(r.payload),
  }))

  return { session, events }
})
