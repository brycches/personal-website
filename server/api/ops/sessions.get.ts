/**
 * GET /api/ops/sessions?range=…&bots=1&country=…&replay=1&limit=…&offset=…
 * Paged session listing, newest first.
 */
function intParam(v: unknown, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(String(v ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const q = getQuery(event)
  const limit = intParam(q.limit, 50, 1, 200)
  const offset = intParam(q.offset, 0, 0, Number.MAX_SAFE_INTEGER)

  const where: string[] = ['s.started_at >= ?']
  const args: (string | number)[] = [opsRangeStart(q.range)]
  if (q.bots !== '1') where.push('s.is_bot = 0')
  if (q.replay === '1') where.push('s.has_replay = 1')
  const country = typeof q.country === 'string' ? q.country.trim() : ''
  if (country) {
    // SQLite LIKE is case-insensitive for ASCII; ESCAPE guards user wildcards.
    where.push(`s.country LIKE ? ESCAPE '\\'`)
    args.push(`%${country.replace(/[\\%_]/g, m => `\\${m}`)}%`)
  }
  const cond = where.join(' AND ')

  const db = useDB(event)
  await ensureOpsTables(db)

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM ops_session s WHERE ${cond}`)
    .bind(...args)
    .first<{ n: number }>()
  const rows = (
    await db
      .prepare(
        `SELECT s.* FROM ops_session s
         WHERE ${cond}
         ORDER BY s.started_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(...args, limit, offset)
      .all()
  ).results

  return { total: totalRow?.n ?? 0, rows }
})
