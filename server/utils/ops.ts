/**
 * Ops-console analytics infrastructure, ported from the Fobech demo_site
 * (itself adapted from the riley-betts ops-console for D1/Workers).
 *
 * - visitor/session/event/replay tables (lazy CREATE IF NOT EXISTS — the
 *   remote DB carries live data and is never re-seeded)
 * - regex-table UA parser + bot wordlist
 * - sliding-window rate limiter (in-memory, per-isolate — counters reset
 *   whenever the isolate recycles, which is acceptable for abuse throttling)
 * - geo from the Cloudflare edge (request.cf) — no local mmdb
 * - opportunistic retention pruning (no cron on Workers)
 */
import type { H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

// ---------------------------------------------------------------- ids/ranges

/** vid/sid wire format (uuid or hex ids). */
const OPS_ID_RE = /^[0-9a-fA-F-]{16,64}$/
export function isValidOpsId(id: unknown): id is string {
  return typeof id === 'string' && OPS_ID_RE.test(id)
}

const DAY_MS = 86_400_000
const RANGE_MS: Record<string, number> = {
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
}

/** Start-of-range epoch-ms for ?range= (default 7d, 'all' → 0). */
export function opsRangeStart(range: unknown): number {
  if (range === 'all') return 0
  const ms = (typeof range === 'string' && RANGE_MS[range]) || RANGE_MS['7d']!
  return Date.now() - ms
}

// ---------------------------------------------------------------- rate limit

interface RateWindow {
  hits: number[]
  windowMs: number
}

const rateWindows = new Map<string, RateWindow>()

/**
 * Returns true when the call is ALLOWED (and records it), false when the
 * key has exhausted `limit` calls within the trailing `windowMs`.
 */
export function opsRateLimit(bucket: string, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  // Inline sweep: drop windows whose newest hit has fully aged out.
  if (rateWindows.size > 2000) {
    for (const [id, w] of rateWindows) {
      const newest = w.hits[w.hits.length - 1]
      if (newest === undefined || newest + w.windowMs <= now) rateWindows.delete(id)
    }
  }

  const id = `${bucket}:${key}`
  let w = rateWindows.get(id)
  if (!w) {
    w = { hits: [], windowMs }
    rateWindows.set(id, w)
  }
  w.windowMs = windowMs

  const cutoff = now - windowMs
  while (w.hits.length > 0 && w.hits[0]! <= cutoff) w.hits.shift()

  if (w.hits.length >= limit) return false
  w.hits.push(now)
  return true
}

// ---------------------------------------------------------------- bots

const BOT_RE
  = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|python|curl|wget|scrapy|httpclient|node-fetch|axios/i

/** Empty UA or anything matching the crawler/tooling wordlist counts as a bot. */
export function isBotUA(ua: string | null | undefined): boolean {
  return !ua || ua.trim().length === 0 || BOT_RE.test(ua)
}

// ---------------------------------------------------------------- UA parsing

export interface ParsedUA {
  browser: string
  browserVer: string
  os: string
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot'
}

// Order matters: Edge and Opera ship a Chrome token, Chrome ships a Safari token.
const BROWSERS: Array<[RegExp, string]> = [
  [/edg(?:e|a|ios)?\/([\d.]+)/i, 'Edge'],
  [/opr\/([\d.]+)/i, 'Opera'],
  [/opera[/ ]([\d.]+)/i, 'Opera'],
  [/fxios\/([\d.]+)/i, 'Firefox'],
  [/firefox\/([\d.]+)/i, 'Firefox'],
  [/crios\/([\d.]+)/i, 'Chrome'],
  [/chrome\/([\d.]+)/i, 'Chrome'],
  [/version\/([\d.]+).*safari/i, 'Safari'],
]

// iOS before macOS ("like Mac OS X"), ChromeOS before Linux.
const OSES: Array<[RegExp, string]> = [
  [/iphone|ipad|ipod/i, 'iOS'],
  [/android/i, 'Android'],
  [/windows nt|windows phone|win64|win32/i, 'Windows'],
  [/cros/i, 'ChromeOS'],
  [/mac os x|macintosh/i, 'macOS'],
  [/linux|x11/i, 'Linux'],
]

/** Small regex-table UA parser — good enough for a personal-site dashboard. */
export function parseUA(ua: string | null | undefined): ParsedUA {
  const s = ua ?? ''

  let browser = 'Unknown'
  let browserVer = ''
  for (const [re, name] of BROWSERS) {
    const m = s.match(re)
    if (m) {
      browser = name
      browserVer = m[1] ?? ''
      break
    }
  }

  let os = 'Unknown'
  for (const [re, name] of OSES) {
    if (re.test(s)) {
      os = name
      break
    }
  }

  let deviceType: ParsedUA['deviceType'] = 'desktop'
  if (isBotUA(s)) deviceType = 'bot'
  else if (/ipad|tablet/i.test(s) || (/android/i.test(s) && !/mobile/i.test(s))) deviceType = 'tablet'
  else if (/mobi|iphone|ipod|android/i.test(s)) deviceType = 'mobile'

  return { browser, browserVer, os, deviceType }
}

// ---------------------------------------------------------------- geo

export interface OpsGeo {
  country: string | null
  region: string | null
  city: string | null
  lat: number | null
  lon: number | null
}

/** Visitor geo from the Cloudflare edge (request.cf). */
export function opsGeo(event: H3Event): OpsGeo {
  const cf = ((event.context as any)?.cf ??
    (event.context as any)?.cloudflare?.request?.cf ??
    {}) as Record<string, unknown>
  const num = (v: unknown): number | null => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const str = (v: unknown, max: number): string | null =>
    typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null
  return {
    country: str(cf.country, 8) ?? (getRequestHeader(event, 'cf-ipcountry')?.slice(0, 8) || null),
    region: str(cf.region, 80),
    city: str(cf.city, 80),
    lat: num(cf.latitude),
    lon: num(cf.longitude),
  }
}

// ---------------------------------------------------------------- schema

const OPS_DDL = [
  `CREATE TABLE IF NOT EXISTS ops_visitor (
    vid            TEXT PRIMARY KEY,
    first_seen_at  INTEGER NOT NULL,
    last_seen_at   INTEGER NOT NULL,
    visit_count    INTEGER NOT NULL DEFAULT 1,
    first_referrer TEXT,
    first_utm_source TEXT,
    first_utm_medium TEXT,
    first_utm_campaign TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS ops_session (
    sid          TEXT PRIMARY KEY,
    vid          TEXT NOT NULL,
    started_at   INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    duration_ms  INTEGER NOT NULL DEFAULT 0,
    ip TEXT,
    ua TEXT,
    browser TEXT,
    browser_ver TEXT,
    os TEXT,
    device_type TEXT,
    screen_w INTEGER, screen_h INTEGER,
    viewport_w INTEGER, viewport_h INTEGER,
    dpr REAL,
    lang TEXT,
    tz TEXT,
    country TEXT, region TEXT, city TEXT, lat REAL, lon REAL,
    referrer TEXT,
    utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_term TEXT, utm_content TEXT,
    entry_path TEXT,
    pageviews INTEGER NOT NULL DEFAULT 0,
    max_scroll_pct INTEGER NOT NULL DEFAULT 0,
    is_bot INTEGER NOT NULL DEFAULT 0,
    has_replay INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_ops_session_started ON ops_session(started_at)`,
  `CREATE INDEX IF NOT EXISTS idx_ops_session_vid ON ops_session(vid)`,
  `CREATE TABLE IF NOT EXISTS ops_event (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    sid     TEXT NOT NULL,
    ts      INTEGER NOT NULL,
    type    TEXT NOT NULL,
    name    TEXT,
    payload TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_ops_event_sid_ts ON ops_event(sid, ts)`,
  `CREATE INDEX IF NOT EXISTS idx_ops_event_type_ts ON ops_event(type, ts)`,
  `CREATE TABLE IF NOT EXISTS ops_replay_chunk (
    sid        TEXT NOT NULL,
    seq        INTEGER NOT NULL,
    bytes      INTEGER NOT NULL,
    compressed INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    data       BLOB NOT NULL,
    PRIMARY KEY (sid, seq)
  )`,
]

// Checked once per isolate; CREATE IF NOT EXISTS makes races harmless.
let opsTablesEnsured = false
export async function ensureOpsTables(db: D1Database): Promise<void> {
  if (opsTablesEnsured) return
  await db.batch(OPS_DDL.map((sql) => db.prepare(sql)))
  opsTablesEnsured = true
}

// ---------------------------------------------------------------- retention

const REPLAY_RETENTION_DAYS = 30
const EVENT_RETENTION_DAYS = 180
const PRUNE_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000

let lastPruneAt = 0

/**
 * Opportunistic retention pruning, called from the collect ingest path.
 * Workers have no long-lived timers, so this runs at most once per isolate
 * per 6h window. Best-effort by design.
 */
export async function maybePruneOps(db: D1Database): Promise<void> {
  const now = Date.now()
  if (now - lastPruneAt < PRUNE_MIN_INTERVAL_MS) return
  lastPruneAt = now
  try {
    await db.batch([
      db.prepare('DELETE FROM ops_event WHERE ts < ?').bind(now - EVENT_RETENTION_DAYS * DAY_MS),
      db
        .prepare('DELETE FROM ops_replay_chunk WHERE created_at < ?')
        .bind(now - REPLAY_RETENTION_DAYS * DAY_MS),
      db.prepare(
        'UPDATE ops_session SET has_replay = 0 WHERE has_replay = 1 AND sid NOT IN (SELECT DISTINCT sid FROM ops_replay_chunk)',
      ),
    ])
  } catch (err) {
    console.error('[ops] prune failed:', err)
  }
}
