/**
 * GET /api/ops/replay/:id — stitch every stored rrweb chunk for the session
 * back into one flat event array for rrweb-player. Chunks live in D1 as
 * (usually gzipped) BLOBs; gunzip via DecompressionStream.
 */
async function gunzipToString(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))
  return await new Response(stream).text()
}

/** D1 returns BLOB columns as ArrayBuffer (older runtimes: number[]). */
function asBytes(data: unknown): Uint8Array | null {
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  if (Array.isArray(data)) return Uint8Array.from(data as number[])
  return null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const sid = getRouterParam(event, 'id') ?? ''
  if (!isValidOpsId(sid)) {
    throw createError({ statusCode: 400, statusMessage: 'bad session id' })
  }
  const db = useDB(event)
  await ensureOpsTables(db)

  const chunks = (
    await db
      .prepare('SELECT seq, compressed FROM ops_replay_chunk WHERE sid = ? ORDER BY seq')
      .bind(sid)
      .all<{ seq: number; compressed: number }>()
  ).results
  if (chunks.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'no replay' })
  }

  const combined: unknown[] = []
  for (const chunk of chunks) {
    try {
      // One chunk per query keeps each D1 response comfortably under limits.
      const row = await db
        .prepare('SELECT data FROM ops_replay_chunk WHERE sid = ? AND seq = ?')
        .bind(sid, chunk.seq)
        .first<{ data: unknown }>()
      const bytes = asBytes(row?.data)
      if (!bytes) continue
      const text = chunk.compressed ? await gunzipToString(bytes) : new TextDecoder().decode(bytes)
      const events = JSON.parse(text) as unknown
      if (Array.isArray(events)) combined.push(...events)
    } catch {
      // damaged / pruned chunk — skip, keep what we can stitch
    }
  }
  if (combined.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'no replay' })
  }

  return combined
})
