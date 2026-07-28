<script setup lang="ts">
definePageMeta({ layout: 'ops', middleware: 'ops-auth' })

useHead({ title: 'OPS // SESSIONS' })

type Range = '24h' | '7d' | '30d' | 'all'
const RANGES: Range[] = ['24h', '7d', '30d', 'all']
const LIMIT = 50

const range = ref<Range>('7d')
const bots = ref(false)
const country = ref('')
const replayOnly = ref(false)

interface SessionRow {
  sid: string
  started_at: number
  duration_ms: number
  country: string | null
  city: string | null
  device_type: string | null
  browser: string | null
  max_scroll_pct: number
  pageviews: number
  is_bot: number
  has_replay: number
}

const rows = ref<SessionRow[]>([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)
const fault = ref(false)

async function load(reset: boolean) {
  loading.value = true
  fault.value = false
  if (reset) offset.value = 0
  try {
    const res = await $fetch<{ total: number; rows: SessionRow[] }>('/api/ops/sessions', {
      query: {
        range: range.value,
        limit: LIMIT,
        offset: offset.value,
        ...(bots.value ? { bots: '1' } : {}),
        ...(replayOnly.value ? { replay: '1' } : {}),
        ...(country.value.trim() ? { country: country.value.trim() } : {}),
      },
    })
    total.value = res.total
    rows.value = reset ? res.rows : [...rows.value, ...res.rows]
    offset.value += res.rows.length
  } catch {
    fault.value = true
  } finally {
    loading.value = false
  }
}

watch([range, bots, replayOnly], () => {
  void load(true)
})

let countryTimer: ReturnType<typeof setTimeout> | undefined
watch(country, () => {
  if (countryTimer) clearTimeout(countryTimer)
  countryTimer = setTimeout(() => {
    void load(true)
  }, 350)
})
onBeforeUnmount(() => {
  if (countryTimer) clearTimeout(countryTimer)
})

onMounted(() => {
  void load(true)
})

const timeFmt = new Intl.DateTimeFormat(undefined, {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function open(sid: string) {
  void navigateTo(`/ops/sessions/${sid}`)
}
</script>

<template>
  <div class="sx">
    <!-- filter bar -->
    <div class="sx__filters">
      <div class="sx__ranges" role="group" aria-label="Time range">
        <button
          v-for="r in RANGES"
          :key="r"
          type="button"
          class="sx__toggle"
          :class="{ 'sx__toggle--on': range === r }"
          @click="range = r"
        >
          {{ r.toUpperCase() }}
        </button>
      </div>
      <input
        v-model="country"
        class="sx__country"
        type="text"
        placeholder="COUNTRY…"
        spellcheck="false"
        aria-label="Filter by country"
      >
      <button
        type="button"
        class="sx__toggle"
        :class="{ 'sx__toggle--on': replayOnly }"
        :aria-pressed="replayOnly"
        @click="replayOnly = !replayOnly"
      >
        HAS REPLAY
      </button>
      <button
        type="button"
        class="sx__toggle"
        :class="{ 'sx__toggle--on': bots }"
        :aria-pressed="bots"
        @click="bots = !bots"
      >
        INCLUDE BOTS
      </button>
      <span class="sx__count">{{ total }} SESSION{{ total === 1 ? '' : 'S' }}</span>
    </div>

    <p v-if="fault" class="sx__fault">LINK FAULT // SESSIONS UNAVAILABLE</p>

    <!-- table -->
    <OpsPanel title="SESSION LOG">
      <div class="sx__head">
        <span>TIME</span>
        <span>GEO</span>
        <span>CLIENT</span>
        <span class="sx__num">ACTIVE</span>
        <span class="sx__num">SCROLL</span>
        <span class="sx__num">PAGES</span>
        <span>REPLAY</span>
      </div>

      <button
        v-for="s in rows"
        :key="s.sid"
        type="button"
        class="sx__row"
        @click="open(s.sid)"
      >
        <span class="sx__t">{{ timeFmt.format(s.started_at) }}</span>
        <span class="sx__cell">
          {{ s.country ?? '??' }}<template v-if="s.city"> / {{ s.city }}</template>
        </span>
        <span class="sx__cell sx__dim">
          {{ s.device_type ?? '?' }} · {{ s.browser ?? '?' }}
        </span>
        <span class="sx__num sx__t">{{ mmss(s.duration_ms) }}</span>
        <span class="sx__num sx__t">{{ s.max_scroll_pct }}%</span>
        <span class="sx__num sx__t">{{ s.pageviews }}</span>
        <span class="sx__lamp">
          <span class="sx__dot" :class="{ 'sx__dot--on': s.has_replay }" aria-hidden="true" />
        </span>
      </button>

      <div v-if="!loading && rows.length === 0 && !fault" class="sx__empty">
        NO SESSIONS IN RANGE
      </div>
      <div v-if="loading" class="sx__empty">... POLLING</div>

      <button
        v-if="rows.length < total"
        type="button"
        class="sx__more"
        :disabled="loading"
        @click="load(false)"
      >
        LOAD MORE // {{ rows.length }} OF {{ total }}
      </button>
    </OpsPanel>
  </div>
</template>

<style scoped>
.sx {
  display: grid;
  gap: 12px;
}

.sx__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sx__ranges {
  display: flex;
  gap: 4px;
}

.sx__toggle {
  padding: 4px 8px;
  border: 1px solid var(--ops-line);
  color: var(--ops-dim);
  font-size: 11px;
  letter-spacing: 0.14em;
  transition: border-color 0.2s, color 0.2s;
}

.sx__toggle:hover {
  border-color: var(--ops-line-lit);
  color: var(--ops-text);
}

.sx__toggle--on {
  border-color: var(--ops-accent);
  color: var(--ops-accent-hot);
}

.sx__country {
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ops-text);
  background: var(--ops-bg1);
  border: 1px solid var(--ops-line);
  padding: 4px 8px;
  width: 11em;
  text-transform: uppercase;
}

.sx__country:focus {
  outline: none;
  border-color: var(--ops-accent-hot);
}

.sx__count {
  margin-left: auto;
  color: var(--ops-faint);
  font-variant-numeric: tabular-nums;
}

.sx__fault {
  color: var(--ops-red);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sx__head,
.sx__row {
  display: grid;
  grid-template-columns: 8.5em minmax(0, 1fr) minmax(0, 1fr) 4.5em 4em 3.5em 3.5em;
  gap: 8px;
  align-items: center;
  text-align: left;
}

.sx__head {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ops-line-lit);
  color: var(--ops-faint);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sx__row {
  width: 100%;
  padding: 4px 0;
  border-bottom: 1px solid var(--ops-line);
  font-size: 12px;
  color: var(--ops-text);
  transition: background 0.15s;
}

.sx__row:hover {
  background: var(--ops-bg2);
}

.sx__cell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sx__dim {
  color: var(--ops-dim);
}

.sx__t {
  color: var(--ops-dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sx__num {
  text-align: right;
}

.sx__lamp {
  display: flex;
  justify-content: center;
}

.sx__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ops-line);
}

.sx__dot--on {
  background: var(--ops-accent-hot);
  box-shadow: 0 0 6px var(--ops-accent-hot);
}

.sx__empty {
  padding: 12px 0;
  color: var(--ops-faint);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.sx__more {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid var(--ops-line);
  color: var(--ops-dim);
  font-size: 11px;
  letter-spacing: 0.14em;
  transition: border-color 0.2s, color 0.2s;
}

.sx__more:hover:not(:disabled) {
  border-color: var(--ops-accent);
  color: var(--ops-accent-hot);
}

.sx__more:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 760px) {
  .sx__head,
  .sx__row {
    grid-template-columns: 7em minmax(0, 1fr) 4.5em 3.5em;
  }

  .sx__head :nth-child(3),
  .sx__head :nth-child(5),
  .sx__head :nth-child(6),
  .sx__row :nth-child(3),
  .sx__row :nth-child(5),
  .sx__row :nth-child(6) {
    display: none;
  }
}
</style>
