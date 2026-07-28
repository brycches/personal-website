/**
 * First-party analytics + rrweb session replay (ported from the Fobech
 * demo_site ops console): pageviews per route, route dwell, scroll depth,
 * clicks, outbound links, heartbeats, web vitals, JS errors — batched to
 * POST /api/collect — plus sampled rrweb recording chunk-uploaded to
 * /api/replay (gzipped when CompressionStream exists).
 *
 * Every path is wrapped so a bug here can never break the site.
 * Opt out with ?optout=1 (persisted in localStorage).
 */

const COLLECT_URL = '/api/collect'
const REPLAY_URL = '/api/replay'
const FLUSH_MAX_QUEUE = 20
const FLUSH_INTERVAL_MS = 5000
const HEARTBEAT_MS = 15000
const INPUT_IDLE_MS = 30000
const MAX_JS_ERRORS = 10
const SCROLL_MILESTONES = [25, 50, 75, 90, 100]
const REPLAY_SAMPLE_RATE = 1

// replay caps (server enforces 800 KB/chunk and 6 MB/session)
const UPLOAD_INTERVAL_MS = 10000
const CHUNK_TRIGGER_BYTES = 400 * 1024
const MAX_RECORD_MS = 10 * 60 * 1000
const MAX_COMPRESSED_BYTES = 4 * 1024 * 1024
/** fetch keepalive bodies are quota-limited to 64 KiB — stay under it. */
const KEEPALIVE_LIMIT_BYTES = 60 * 1024

type TrackFn = (type: string, name: string | null, p?: Record<string, unknown>) => void

/** Wrap a listener so an analytics bug can never surface to the site. */
function safe<A extends unknown[]>(fn: (...args: A) => void): (...args: A) => void {
  return (...args: A) => {
    try {
      fn(...args)
    } catch {
      /* analytics must never break the site */
    }
  }
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode etc. */
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

function newId(): string {
  return window.crypto && 'randomUUID' in window.crypto
    ? window.crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-4000-8000-000000000000`
}

/** Route path → coarse feature name ('/' → home, '/mes' → mes …). */
function featureOf(path: string): string {
  const seg = String(path || '/').split('/').filter(Boolean)[0]
  return (seg || 'home').slice(0, 40)
}

/**
 * Compact CSS-ish path for an element, for analytics click events.
 * Walks at most the element plus 4 ancestors; an ancestor with an id
 * anchors the path and stops the walk. Hard-capped at 120 chars.
 */
function selectorPath(el: Element): string {
  const parts: string[] = []
  let node: Element | null = el

  while (node && parts.length < 5) {
    const cur = node
    if (cur === document.body || cur === document.documentElement) break

    if (cur.id) {
      parts.unshift(`#${cur.id}`)
      break
    }

    let seg = cur.tagName.toLowerCase()
    const cls = cur.classList[0]
    if (cls && /^[A-Za-z0-9_-]+$/.test(cls)) seg += `.${cls}`

    const parent = cur.parentElement
    if (parent) {
      const sameTag = Array.from(parent.children).filter((c) => c.tagName === cur.tagName)
      if (sameTag.length > 1) seg += `:nth-of-type(${sameTag.indexOf(cur) + 1})`
    }

    parts.unshift(seg)
    node = parent
  }

  return (parts.join(' > ') || el.tagName.toLowerCase()).slice(0, 120)
}

// ---------------------------------------------------------------- replay

function setupReplay(opts: { sid: string; sampleRate: number; track: TrackFn }) {
  let buffer: unknown[] = []
  let approxBytes = 0
  let seq = 0
  let compressedSent = 0
  let stopFn: (() => void) | undefined
  let uploadTimer: number | undefined
  let capTimer: number | undefined
  let uploading = false
  let stopped = false

  async function gzip(json: string): Promise<ArrayBuffer | null> {
    if (typeof CompressionStream === 'undefined') return null
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))
      return await new Response(stream).arrayBuffer()
    } catch {
      return null
    }
  }

  /** Drain the buffer to a JSON array string, or null when empty. */
  const takeBuffer = (): string | null => {
    if (buffer.length === 0) return null
    const events = buffer
    buffer = []
    approxBytes = 0
    return JSON.stringify(events)
  }

  const send = (body: BodyInit, chunkSeq: number, gz: string, size: number) =>
    fetch(REPLAY_URL, {
      method: 'POST',
      keepalive: size < KEEPALIVE_LIMIT_BYTES,
      headers: {
        'content-type': 'application/octet-stream',
        'x-bc-sid': opts.sid,
        'x-bc-seq': String(chunkSeq),
        'x-bc-gz': gz,
      },
      body,
    })

  const upload = async () => {
    if (uploading) return
    const json = takeBuffer()
    if (json === null) return
    uploading = true
    try {
      const chunkSeq = seq++
      const gzipped = await gzip(json)
      if (gzipped) {
        compressedSent += gzipped.byteLength
        await send(gzipped, chunkSeq, '1', gzipped.byteLength)
      } else {
        await send(json, chunkSeq, '0', json.length)
      }
      if (compressedSent >= MAX_COMPRESSED_BYTES) stop('cap')
    } catch {
      /* dropped chunk — replay is best-effort */
    } finally {
      uploading = false
    }
  }

  const stop = (reason: string) => {
    if (stopped) return
    stopped = true
    if (uploadTimer !== undefined) clearInterval(uploadTimer)
    if (capTimer !== undefined) clearTimeout(capTimer)
    try {
      stopFn?.()
    } catch {
      /* ignore */
    }
    opts.track('replay_stopped', null, { reason })
    // Drain what is still buffered; deferred so an in-flight upload
    // (which may be what tripped the byte cap) has released its lock.
    window.setTimeout(() => void upload(), 0)
  }

  const start = async () => {
    try {
      if (Math.random() >= opts.sampleRate) return
      // Dynamic import so rrweb code-splits into its own lazy chunk.
      const rrweb = await import('rrweb')
      stopFn = rrweb.record({
        emit(event: unknown) {
          if (stopped) return
          buffer.push(event)
          approxBytes += JSON.stringify(event).length
          if (approxBytes > CHUNK_TRIGGER_BYTES) void upload()
        },
        maskAllInputs: true,
        slimDOMOptions: 'all',
        sampling: { scroll: 150, media: 800, input: 'last' },
        checkoutEveryNms: 60000,
        blockClass: 'rr-block',
        inlineStylesheet: true,
      })
      if (!stopFn) return
      uploadTimer = window.setInterval(() => void upload(), UPLOAD_INTERVAL_MS)
      capTimer = window.setTimeout(() => stop('cap'), MAX_RECORD_MS)
    } catch {
      /* replay is optional — never let it break the site */
    }
  }

  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => void start())
    } else {
      window.setTimeout(() => void start(), 3000)
    }
  }

  try {
    if (opts.sampleRate > 0) {
      if (document.readyState === 'complete') schedule()
      else window.addEventListener('load', schedule, { once: true })
    }
  } catch {
    /* ignore */
  }

  const flushTail = () => {
    try {
      const json = takeBuffer()
      if (json === null) return
      const chunkSeq = seq++
      if (typeof CompressionStream !== 'undefined') {
        // Opportunistic: gzip is async, so if the page dies before the
        // promise settles the tail is lost — acceptable by design.
        void gzip(json)
          .then((gzipped) => {
            if (!gzipped || gzipped.byteLength >= KEEPALIVE_LIMIT_BYTES) return
            return send(gzipped, chunkSeq, '1', gzipped.byteLength)
          })
          .catch(() => {})
      } else if (json.length < KEEPALIVE_LIMIT_BYTES) {
        void send(json, chunkSeq, '0', json.length).catch(() => {})
      }
    } catch {
      /* ignore */
    }
  }

  return { flushTail }
}

// ---------------------------------------------------------------- plugin

export default defineNuxtPlugin((nuxtApp) => {
  try {
    // Never track the ops console itself.
    if (location.pathname.startsWith('/ops')) return

    if (new URLSearchParams(location.search).get('optout') === '1') {
      lsSet('bc_optout', '1')
      console.info('[ops] analytics opt-out saved — this browser will not be tracked')
    }
    if (lsGet('bc_optout')) return

    // -- identity -------------------------------------------------------
    const storedVid = lsGet('bc_vid')
    const vid = storedVid || newId()
    if (!storedVid) lsSet('bc_vid', vid)

    const cookieSid = readCookie('bc_ops_sid')
    const sid = cookieSid || newId()
    const returning = Boolean(storedVid) && cookieSid === null

    const refreshSidCookie = () => {
      document.cookie = `bc_ops_sid=${sid}; path=/; max-age=1800; SameSite=Lax`
    }
    refreshSidCookie()

    // -- queue + flush --------------------------------------------------
    const queue: Array<Record<string, unknown>> = []

    const flush = (preferBeacon: boolean) => {
      try {
        if (queue.length === 0) return
        const events = queue.splice(0, queue.length)
        const body = JSON.stringify({ v: 1, vid, sid, returning, url: location.pathname, events })
        refreshSidCookie()
        let delivered = false
        if (preferBeacon && typeof navigator.sendBeacon === 'function') {
          try {
            delivered = navigator.sendBeacon(COLLECT_URL, new Blob([body], { type: 'application/json' }))
          } catch {
            delivered = false
          }
        }
        if (!delivered) {
          fetch(COLLECT_URL, {
            method: 'POST',
            keepalive: true,
            headers: { 'content-type': 'application/json' },
            body,
          }).catch(() => {})
        }
      } catch {
        /* never surface */
      }
    }

    const track: TrackFn = (type, name, p) => {
      queue.push({ t: Date.now(), type, name: name ?? null, ...(p !== undefined ? { p } : {}) })
      if (queue.length >= FLUSH_MAX_QUEUE) flush(false)
    }

    window.setInterval(safe(() => flush(false)), FLUSH_INTERVAL_MS)

    // -- session replay (sampled, lazy) ---------------------------------
    const replay = setupReplay({ sid, sampleRate: REPLAY_SAMPLE_RATE, track })

    // -- pageviews + route dwell ----------------------------------------
    const params = new URLSearchParams(location.search)
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string } }

    const pageviewPayload = (path: string) => ({
      referrer: document.referrer,
      utm: {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign'),
        term: params.get('utm_term'),
        content: params.get('utm_content'),
      },
      screen: { w: screen.width, h: screen.height, dpr: devicePixelRatio },
      viewport: { w: innerWidth, h: innerHeight },
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
      platform: navigator.platform,
      touch: matchMedia('(pointer: coarse)').matches,
      deviceMemory: nav.deviceMemory,
      cores: navigator.hardwareConcurrency,
      connection: nav.connection && nav.connection.effectiveType,
      path,
    })

    let openSection: { name: string; enteredAt: number } | null = null

    const exitSection = () => {
      if (!openSection) return
      track('section_exit', openSection.name, { dwellMs: Date.now() - openSection.enteredAt })
      openSection = null
    }

    let lastTracked = ''
    const pageview = safe((fullPath: string, path: string) => {
      if (path.startsWith('/ops')) return
      if (fullPath === lastTracked) return
      lastTracked = fullPath
      const feature = featureOf(path)
      track('pageview', null, pageviewPayload(fullPath))
      if (openSection && openSection.name === feature) return
      exitSection()
      openSection = { name: feature, enteredAt: Date.now() }
      track('section_enter', feature)
    })

    const router = useRouter()
    router.afterEach((to) => pageview(to.fullPath, to.path))
    // The initial route may resolve before afterEach is registered.
    void router.isReady().then(() => {
      const r = router.currentRoute.value
      pageview(r.fullPath, r.path)
    })

    // -- scroll depth ---------------------------------------------------
    const firedMilestones = new Set<number>()
    let scrollTickScheduled = false
    const measureDepth = safe(() => {
      scrollTickScheduled = false
      const height = document.documentElement.scrollHeight || 1
      const pct = ((scrollY + innerHeight) / height) * 100
      for (const m of SCROLL_MILESTONES) {
        if (pct >= m && !firedMilestones.has(m)) {
          firedMilestones.add(m)
          track('scroll_depth', null, { pct: m })
        }
      }
    })
    addEventListener(
      'scroll',
      () => {
        if (scrollTickScheduled) return
        scrollTickScheduled = true
        requestAnimationFrame(measureDepth)
      },
      { passive: true },
    )

    // -- clicks + outbound ----------------------------------------------
    document.addEventListener(
      'pointerdown',
      safe((ev: PointerEvent) => {
        const target = ev.target
        if (!(target instanceof Element)) return

        track('click', null, {
          sel: selectorPath(target),
          text: (target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          x: Math.round(ev.clientX),
          y: Math.round(ev.clientY),
          section: openSection ? openSection.name : undefined,
        })

        const anchor = target.closest('a[href]') as HTMLAnchorElement | null
        if (!anchor) return
        let url: URL
        try {
          url = new URL(anchor.href, location.href)
        } catch {
          return
        }
        if (url.origin === location.origin) return
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return
        track('outbound', url.host, {
          href: url.href.slice(0, 300),
          label: (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          section: openSection ? openSection.name : undefined,
        })
        flush(true) // the navigation may unload the page before the next tick
      }),
      { capture: true, passive: true },
    )

    // -- heartbeat (active visible time) --------------------------------
    let lastInputAt = Date.now()
    const noteInput = () => {
      lastInputAt = Date.now()
    }
    for (const type of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart']) {
      addEventListener(type, noteInput, { passive: true })
    }
    window.setInterval(
      safe(() => {
        if (document.visibilityState === 'visible' && Date.now() - lastInputAt <= INPUT_IDLE_MS) {
          track('heartbeat', null, {})
        }
      }),
      HEARTBEAT_MS,
    )

    // -- web vitals (hand-rolled) ---------------------------------------
    let ttfb: number | undefined
    let lcp: number | undefined
    let cls = 0
    let inp: number | undefined
    let vitalsQueued = false
    const observers: PerformanceObserver[] = []

    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined
      if (navEntry) ttfb = Math.round(navEntry.responseStart)
    } catch {
      /* ignore */
    }

    const observe = (init: PerformanceObserverInit, cb: (entries: PerformanceEntry[]) => void) => {
      try {
        const po = new PerformanceObserver(safe((list: PerformanceObserverEntryList) => cb(list.getEntries())))
        po.observe(init)
        observers.push(po)
      } catch {
        /* entry type unsupported */
      }
    }

    observe({ type: 'largest-contentful-paint', buffered: true }, (entries) => {
      const last = entries[entries.length - 1]
      if (last) lcp = Math.round(last.startTime)
    })
    observe({ type: 'layout-shift', buffered: true }, (entries) => {
      for (const entry of entries as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
        if (!entry.hadRecentInput) cls += entry.value ?? 0
      }
    })
    observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit, (entries) => {
      for (const entry of entries) inp = Math.max(inp ?? 0, Math.round(entry.duration))
    })

    const queueVitals = () => {
      if (vitalsQueued) return
      vitalsQueued = true
      for (const po of observers) {
        try {
          po.disconnect()
        } catch {
          /* ignore */
        }
      }
      const p: Record<string, number> = { cls: Math.round(cls * 1000) / 1000 }
      if (ttfb !== undefined) p.ttfb = ttfb
      if (lcp !== undefined) p.lcp = lcp
      if (inp !== undefined) p.inp = inp
      track('vitals', null, p)
    }

    // -- JS errors ------------------------------------------------------
    let errorCount = 0
    addEventListener(
      'error',
      safe((ev: ErrorEvent) => {
        if (errorCount >= MAX_JS_ERRORS || typeof ev.message !== 'string') return
        errorCount++
        track('js_error', null, {
          msg: ev.message.slice(0, 300),
          src: String(ev.filename || '').slice(0, 200),
          line: ev.lineno,
          stack: (ev.error instanceof Error ? ev.error.stack || '' : '').slice(0, 1000),
        })
      }),
    )
    addEventListener(
      'unhandledrejection',
      safe((ev: PromiseRejectionEvent) => {
        if (errorCount >= MAX_JS_ERRORS) return
        errorCount++
        const reason = ev.reason
        const msg = reason instanceof Error ? reason.message : String(reason)
        track('js_error', null, {
          msg: msg.slice(0, 300),
          src: 'unhandledrejection',
          stack: (reason instanceof Error ? reason.stack || '' : '').slice(0, 1000),
        })
      }),
    )

    // -- lifecycle flushes ----------------------------------------------
    document.addEventListener(
      'visibilitychange',
      safe(() => {
        if (document.visibilityState !== 'hidden') return
        queueVitals()
        flush(true)
      }),
    )
    addEventListener(
      'pagehide',
      safe(() => {
        exitSection()
        queueVitals()
        flush(true)
        replay.flushTail()
      }),
    )
  } catch {
    /* analytics must never break the site */
  }
})
