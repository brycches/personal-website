/**
 * rrweb replay chunk ingest (ported from the Fobech demo_site). Chunks land
 * in D1 as BLOBs; caps respect D1 statement/row limits — chunks are gzipped
 * client-side, so 800 KB compressed goes a long way.
 */
const SEQ_RE = /^\d{1,4}$/ // 0..9999
const MAX_CHUNK_BYTES = 800 * 1024
const MAX_SESSION_BYTES = 6 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const ip = clientIp(event) ?? ''
  if (!opsRateLimit('replay', ip, 30, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const sid = getHeader(event, 'x-bc-sid') ?? ''
  const seqRaw = getHeader(event, 'x-bc-seq') ?? ''
  if (!isValidOpsId(sid) || !SEQ_RE.test(seqRaw)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const seq = Number(seqRaw)
  const gz = getHeader(event, 'x-bc-gz') !== '0' // chunks are usually gzipped

  const declared = Number(getHeader(event, 'content-length') ?? 0)
  if (declared > MAX_CHUNK_BYTES) throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
  const raw = await readRawBody(event, false).catch(() => undefined)
  if (!raw || raw.length === 0) throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  if (raw.length > MAX_CHUNK_BYTES) throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })

  const bytes = typeof raw === 'string' ? new TextEncoder().encode(raw) : new Uint8Array(raw)
  // Standalone ArrayBuffer for the D1 blob binding.
  const blob = bytes.slice().buffer

  try {
    const db = useDB(event)
    await ensureOpsTables(db)

    // Cumulative per-session cap (excluding a chunk this seq would replace).
    const row = await db
      .prepare('SELECT COALESCE(SUM(bytes), 0) AS total FROM ops_replay_chunk WHERE sid = ? AND seq <> ?')
      .bind(sid, seq)
      .first<{ total: number }>()
    if ((row?.total ?? 0) + bytes.length > MAX_SESSION_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
    }

    await db.batch([
      db
        .prepare(
          'INSERT OR REPLACE INTO ops_replay_chunk (sid, seq, bytes, compressed, created_at, data) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(sid, seq, bytes.length, gz ? 1 : 0, Date.now(), blob),
      // The sid may have no ops_session row yet (replay beat /api/collect) —
      // the UPDATE is then a no-op and the chunk is still accepted.
      db.prepare('UPDATE ops_session SET has_replay = 1 WHERE sid = ?').bind(sid),
    ])
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    console.error('[replay] store failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }

  setResponseStatus(event, 204)
  return null
})
