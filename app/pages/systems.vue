<script setup lang="ts">
useHead({
  title: 'Systems — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content:
        'What I build: platforms that run operations, plant-floor data wired into the ERP, third-party tools replaced in-house, and architecture a business can grow on.',
    },
  ],
})

usePageFx()

const impacts = [
  {
    tag: 'operations platform',
    stat: '95%',
    statLabel: 'daily adoption',
    title: 'One app for the whole operation',
    body: 'I replaced scattered spreadsheets, radios, and one-off tools with a single platform every department works in — warehouse, quality, packaging, production, and management. When the whole company runs through one app, the data finally agrees with itself.',
    stack: ['Vue 3', 'PWA', 'REST'],
  },
  {
    tag: 'plant-floor automation',
    stat: '0',
    statLabel: 'manual entries',
    title: 'Machines that report their own work',
    body: 'I wired live machine data straight into the ERP, so production, inventory movement, and costing record themselves as they physically happen — millions of pounds of product a week, every lot traceable end to end, no operator typing anything in. Over 90% of all transaction lines in the ERP are now posted by my systems.',
    stack: ['Node.js', 'SCADA data', 'ERP integration'],
  },
  {
    tag: 'cost replacement',
    stat: '$250K',
    statLabel: 'per year recovered',
    title: 'Third-party tools, rebuilt in-house',
    body: "When licensed warehouse software couldn't fit how the operation actually works, I rebuilt those workflows on our own stack — barcode-driven receiving, transfers, counting, and fulfillment that match the floor exactly and cost nothing to license.",
    stack: ['NetSuite', 'OAuth', 'barcode workflows'],
  },
  {
    tag: 'trustworthy numbers',
    stat: '20→95%',
    statLabel: 'live tracking',
    title: 'Inventory the accountants can believe',
    body: 'Automated consumption and backflush turned end-of-day guesswork into records created the moment material is actually used — inventory accuracy, costing, and traceability the business can act on instead of argue about.',
    stack: ['SQL Server', 'automation', 'reconciliation'],
  },
  {
    tag: 'public-facing',
    stat: '0',
    statLabel: 'internals exposed',
    title: 'A hardened front door to internal systems',
    body: 'A public portal that shows outside users exactly what they should see and nothing else — token-based auth and response shaping so internal systems, field names, and URLs never leak past the gateway.',
    stack: ['Vue 3', 'Express', 'JWT'],
  },
]
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /systems</h1>
      <p class="section-note reveal">
        The general shape of what I build: machines and people on one side, business
        systems on the other, and software in between that makes the numbers true.
      </p>
    </section>

    <section class="section">
      <ProductionLine />
    </section>

    <div class="pipe-wrap" aria-hidden="true">
      <div class="pipe-divider"></div>
    </div>

    <section class="section contact">
      <h2 class="endpoint reveal"><span class="method">GET</span> /impact</h2>
      <div class="impact-rows">
        <article v-for="item in impacts" :key="item.title" class="impact-row reveal">
          <div class="impact-stat">
            <span class="impact-num">{{ item.stat }}</span>
            <span class="impact-num-label">{{ item.statLabel }}</span>
          </div>
          <div class="impact-body">
            <span class="feature-tag">{{ item.tag }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
            <div class="chips chips-sm">
              <span v-for="t in item.stack" :key="t">{{ t }}</span>
            </div>
          </div>
        </article>
      </div>
      <p class="section-note reveal" style="margin-top: 32px">
        All of it runs in production today. Specifics are generalized on purpose — the
        code belongs to my employer; my public work is on the
        <NuxtLink to="/projects">projects page</NuxtLink>. And when the work day ends,
        I build manufacturing software under my own flag at
        <a href="https://fobech.com" target="_blank" rel="noopener">Fobech</a> — you can
        even <a href="https://demo.fobech.com" target="_blank" rel="noopener">walk through a live MES demo</a>.
      </p>
    </section>
  </main>
</template>
