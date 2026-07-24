<script setup lang="ts">
useHead({
  title: 'Systems — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content:
        'The systems behind a dairy plant: SunApps operations PWA, an MES bridging SCADA to NetSuite, an API gateway, manufacturing services, and an external portal.',
    },
  ],
})

usePageFx()

const systems = [
  {
    name: 'SunApps',
    tag: 'operations pwa',
    desc: 'The central portal the plant runs on: work orders, inventory and pallet management, receiving and milk intake, QC sampling and release, and fulfillment. Used daily by ~85% of active staff.',
    stack: ['Vue 3', 'Pinia', 'PWA'],
    role: 'wrote 80%+ of the frontend',
  },
  {
    name: 'MES Service',
    tag: 'scada → erp bridge',
    desc: 'Reads real-time process data from AVEVA Historian, reconstructs batches at every production stage, and posts matching inventory and costing transactions into NetSuite — receipts, unbuilds, work orders, completions, waste sweeps.',
    stack: ['Node.js', 'AVEVA Historian', 'NetSuite'],
    role: 'sole author',
  },
  {
    name: 'API Gateway',
    tag: 'auth + integration broker',
    desc: 'The front door for every SunApps client. Owns authentication and brokers access to NetSuite (OAuth 1.0a) and Active Directory so frontend apps never touch credentials or internals.',
    stack: ['Node.js', 'Express', 'OAuth 1.0a'],
    role: 'co-built',
  },
  {
    name: 'Manufacturing Service',
    tag: 'work orders + consumption',
    desc: 'Coordinates manufacturing workflows: work order lifecycle, staging dashboards for production lines, the consumption queue and backflush engine, and finished-goods palletization.',
    stack: ['Node.js', 'Express', 'SQL Server'],
    role: 'primary developer',
  },
  {
    name: 'External Portal',
    tag: 'public web portal',
    desc: 'A customer-facing portal behind a hardened Express gateway: JWT access/refresh auth and curated DTOs, so internal systems and field names never leak to the public frontend.',
    stack: ['Vue 3', 'Express', 'JWT', 'PM2', 'Caddy'],
    role: 'building now',
  },
]
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /systems</h1>
      <p class="section-note reveal">
        Follow the milk. Every stage below is a real step in the plant — and every
        marker on the bus is a NetSuite transaction my MES posts automatically as it
        happens.
      </p>
    </section>

    <section class="section">
      <ProductionLine />
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /systems/services</h2>
      <div class="system-grid">
        <article v-for="s in systems" :key="s.name" class="system-card reveal">
          <div class="system-top">
            <span class="feature-tag">{{ s.tag }}</span>
            <span class="system-lock" title="Private repository">🔒 private · idamilk</span>
          </div>
          <h3 class="system-name">{{ s.name }}</h3>
          <p class="system-desc">{{ s.desc }}</p>
          <div class="system-meta">
            <div class="chips chips-sm">
              <span v-for="t in s.stack" :key="t">{{ t }}</span>
            </div>
            <span class="system-role">{{ s.role }}</span>
          </div>
        </article>
      </div>
      <p class="section-note reveal" style="margin-top: 28px">
        …plus the printing, EDI, and monitoring services orbiting the platform. These
        repos are private to the IdaMilk org — my public work is on the
        <NuxtLink to="/projects">projects page</NuxtLink>.
      </p>
    </section>
  </main>
</template>
