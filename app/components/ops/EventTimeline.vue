<script setup lang="ts">
export interface TimelineEvent {
  ts: number
  type: string
  name: string | null
  payload: Record<string, unknown> | null
}

const props = defineProps<{
  events: TimelineEvent[]
  /** session started_at — offsets are rendered relative to this */
  startTs: number
}>()

/** '+mm:ss.t' offset from session start (tenths). */
function offset(ts: number): string {
  const d = Math.max(0, ts - props.startTs)
  const mm = String(Math.floor(d / 60_000)).padStart(2, '0')
  const ss = String(Math.floor((d % 60_000) / 1000)).padStart(2, '0')
  const t = Math.floor((d % 1000) / 100)
  return `+${mm}:${ss}.${t}`
}

/** 'k=v k=v' one-liner, hard-capped so a fat payload can't wreck the row. */
function compact(p: Record<string, unknown> | null): string {
  if (!p) return ''
  const out: string[] = []
  for (const [k, v] of Object.entries(p)) {
    if (v === null || v === undefined || v === '') continue
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    out.push(`${k}=${s.length > 60 ? `${s.slice(0, 57)}…` : s}`)
  }
  const joined = out.join(' ')
  return joined.length > 160 ? `${joined.slice(0, 157)}…` : joined
}
</script>

<template>
  <div class="tl">
    <div v-if="events.length === 0" class="tl__empty">NO EVENTS RECORDED</div>
    <div v-for="(e, i) in events" :key="i" class="tl__row" :class="`tl__row--${e.type}`">
      <span class="tl__t">{{ offset(e.ts) }}</span>
      <span class="tl__type">{{ e.type }}</span>
      <span class="tl__name">{{ e.name ?? '' }}</span>
      <span class="tl__p">{{ compact(e.payload) }}</span>
    </div>
  </div>
</template>

<style scoped>
.tl {
  max-height: 560px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.9;
  font-variant-numeric: tabular-nums;
}

.tl__empty {
  color: var(--ops-faint);
  padding: 8px 0;
  letter-spacing: 0.14em;
}

.tl__row {
  display: grid;
  grid-template-columns: 5.5em 8.5em minmax(4em, auto) minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  border-bottom: 1px solid var(--ops-line);
  white-space: nowrap;
}

.tl__t {
  color: var(--ops-dim);
}

.tl__type {
  color: var(--ops-text);
  letter-spacing: 0.06em;
}

.tl__name {
  color: var(--ops-dim);
  overflow: hidden;
  text-overflow: ellipsis;
}

.tl__p {
  color: var(--ops-faint);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* signal coloring per event type */
.tl__row--outbound .tl__type,
.tl__row--outbound .tl__name {
  color: var(--ops-accent-hot);
}

.tl__row--js_error .tl__type,
.tl__row--js_error .tl__p {
  color: var(--ops-red);
}

.tl__row--heartbeat .tl__type {
  color: var(--ops-faint);
}

.tl__row--pageview .tl__type {
  color: var(--ops-ok);
}
</style>
