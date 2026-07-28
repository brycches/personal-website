<script setup lang="ts">
definePageMeta({ layout: 'ops', middleware: 'ops-auth' })

const route = useRoute()
const sid = computed(() => String(route.params.id ?? ''))

useHead({ title: 'OPS // SESSION' })

interface SessionDetail {
  sid: string
  vid: string
  started_at: number
  last_seen_at: number
  duration_ms: number
  ip: string | null
  ua: string | null
  browser: string | null
  browser_ver: string | null
  os: string | null
  device_type: string | null
  screen_w: number | null
  screen_h: number | null
  viewport_w: number | null
  viewport_h: number | null
  dpr: number | null
  lang: string | null
  tz: string | null
  country: string | null
  region: string | null
  city: string | null
  lat: number | null
  lon: number | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  entry_path: string | null
  pageviews: number
  max_scroll_pct: number
  is_bot: number
  has_replay: number
}

interface SessionEvent {
  ts: number
  type: string
  name: string | null
  payload: Record<string, unknown> | null
}

const { data, status, error } = useFetch<{ session: SessionDetail; events: SessionEvent[] }>(
  () => `/api/ops/sessions/${sid.value}`,
)

const tsFmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function dash(v: string | number | null | undefined): string {
  return v === null || v === undefined || v === '' ? '—' : String(v)
}

interface Readout {
  label: string
  value: string
  hot?: boolean
}

const meta = computed<Readout[]>(() => {
  const s = data.value?.session
  if (!s) return []
  return [
    { label: 'SID', value: s.sid },
    { label: 'VID', value: s.vid },
    { label: 'STARTED', value: tsFmt.format(s.started_at) },
    { label: 'LAST SEEN', value: tsFmt.format(s.last_seen_at) },
    { label: 'ACTIVE', value: mmss(s.duration_ms) },
    { label: 'IP', value: dash(s.ip) },
    { label: 'UA', value: dash(s.ua) },
    { label: 'BROWSER', value: `${dash(s.browser)} ${s.browser_ver ?? ''}`.trim() },
    { label: 'OS', value: dash(s.os) },
    { label: 'DEVICE', value: dash(s.device_type) },
    {
      label: 'SCREEN',
      value: s.screen_w ? `${s.screen_w}×${s.screen_h} @${s.dpr ?? 1}x` : '—',
    },
    {
      label: 'VIEWPORT',
      value: s.viewport_w ? `${s.viewport_w}×${s.viewport_h}` : '—',
    },
    { label: 'LANG', value: dash(s.lang) },
    { label: 'TZ', value: dash(s.tz) },
    {
      label: 'GEO',
      value: [s.country, s.region, s.city].filter(Boolean).join(' / ') || '—',
    },
    {
      label: 'COORDS',
      value: s.lat !== null && s.lon !== null ? `${s.lat.toFixed(3)}, ${s.lon.toFixed(3)}` : '—',
    },
    { label: 'REFERRER', value: dash(s.referrer) },
    { label: 'UTM SRC', value: dash(s.utm_source) },
    { label: 'UTM MED', value: dash(s.utm_medium) },
    { label: 'UTM CAMP', value: dash(s.utm_campaign) },
    { label: 'ENTRY', value: dash(s.entry_path) },
    { label: 'PAGEVIEWS', value: String(s.pageviews) },
    { label: 'MAX SCROLL', value: `${s.max_scroll_pct}%` },
    s.is_bot
      ? { label: 'BOT', value: 'FLAGGED', hot: true }
      : { label: 'BOT', value: 'NO' },
    s.has_replay
      ? { label: 'REPLAY', value: 'CAPTURED', hot: true }
      : { label: 'REPLAY', value: 'NONE' },
  ]
})
</script>

<template>
  <div class="sd">
    <NuxtLink to="/ops/sessions" class="sd__back">&larr; SESSION LOG</NuxtLink>

    <p v-if="error" class="sd__fault">
      {{ error.statusCode === 404 ? 'UNKNOWN SESSION // NO RECORD' : 'LINK FAULT // SESSION UNAVAILABLE' }}
    </p>
    <p v-else-if="status === 'pending'" class="sd__poll">... POLLING</p>

    <template v-if="data">
      <OpsPanel :title="`SESSION // ${sid.slice(0, 8).toUpperCase()}`">
        <div class="sd__meta">
          <div v-for="r in meta" :key="r.label" class="sd__readout">
            <span class="sd__label">{{ r.label }}</span>
            <span class="sd__value" :class="{ 'sd__value--hot': r.hot }">{{ r.value }}</span>
          </div>
        </div>
      </OpsPanel>

      <div class="sd__cols">
        <OpsPanel title="EVENT TIMELINE">
          <OpsEventTimeline :events="data.events" :start-ts="data.session.started_at" />
        </OpsPanel>
        <OpsPanel title="REPLAY" :lit="Boolean(data.session.has_replay)">
          <OpsReplayPlayer :sid="sid" />
        </OpsPanel>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sd {
  display: grid;
  gap: 16px;
}

.sd__back {
  color: var(--ops-dim);
  justify-self: start;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sd__back:hover {
  color: var(--ops-accent-hot);
}

.sd__poll {
  color: var(--ops-faint);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sd__fault {
  color: var(--ops-red);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sd__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  column-gap: 16px;
}

.sd__readout {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 0;
  border-bottom: 1px solid var(--ops-line);
  font-size: 12px;
  min-width: 0;
}

.sd__label {
  color: var(--ops-faint);
  font-size: 11px;
  letter-spacing: 0.14em;
  flex: none;
}

.sd__value {
  color: var(--ops-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.sd__value--hot {
  color: var(--ops-accent-hot);
}

.sd__cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

@media (max-width: 960px) {
  .sd__cols {
    grid-template-columns: 1fr;
  }
}
</style>
