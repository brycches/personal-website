<script setup lang="ts">
useHead({
  title: 'MES Case Study — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content:
        'Case study: the manufacturing execution system (MES) that turns live plant-floor SCADA data into NetSuite ERP transactions with zero manual entry — read, reconstruct, post.',
    },
  ],
})

usePageFx()
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /mes</h1>
      <p class="section-note reveal">
        How the manufacturing execution system (MES) I built turns live plant-floor
        data into enterprise resource planning (ERP) truth — stage by stage.
        Generalized on purpose: the code belongs to my employer, but the
        architecture and the thinking are mine to share.
      </p>
    </section>

    <section class="section">
      <div class="case-flow reveal" aria-label="System diagram: plant floor signals flow into the SCADA historian, the MES service reconstructs batches from that data, and posts transactions to the NetSuite ERP, with reconciliation sweeps flowing back">
        <svg class="flow-diagram" viewBox="0 0 1080 260" role="img">
          <defs>
            <marker id="flow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          <!-- boxes -->
          <rect class="flow-box" x="16" y="78" width="212" height="84" rx="10" />
          <text class="flow-title" x="122" y="114" text-anchor="middle">PLANT FLOOR</text>
          <text class="flow-sub" x="122" y="138" text-anchor="middle">sensors · flows · weights</text>

          <rect class="flow-box" x="296" y="78" width="212" height="84" rx="10" />
          <text class="flow-title" x="402" y="114" text-anchor="middle">SCADA HISTORIAN</text>
          <text class="flow-sub" x="402" y="138" text-anchor="middle">time-series process data</text>

          <rect class="flow-box flow-box-accent" x="576" y="78" width="212" height="84" rx="10" />
          <text class="flow-title" x="682" y="114" text-anchor="middle">MES SERVICE</text>
          <text class="flow-sub" x="682" y="138" text-anchor="middle">batch reconstruction</text>

          <rect class="flow-box" x="856" y="78" width="208" height="84" rx="10" />
          <text class="flow-title" x="960" y="114" text-anchor="middle">NETSUITE · ERP</text>
          <text class="flow-sub" x="960" y="138" text-anchor="middle">lots · costing · inventory</text>

          <!-- arrows -->
          <line class="flow-arrow" x1="228" y1="120" x2="288" y2="120" marker-end="url(#flow-head)" />
          <text class="flow-label" x="258" y="64" text-anchor="middle">raw signals</text>

          <line class="flow-arrow" x1="508" y1="120" x2="568" y2="120" marker-end="url(#flow-head)" />
          <text class="flow-label" x="538" y="64" text-anchor="middle">real-time reads</text>

          <line class="flow-arrow" x1="788" y1="120" x2="848" y2="120" marker-end="url(#flow-head)" />
          <text class="flow-label" x="818" y="64" text-anchor="middle">REST · OAuth 1.0a</text>

          <!-- reconciliation loop -->
          <path class="flow-loop" d="M 960 162 C 960 226, 682 226, 682 168" marker-end="url(#flow-head)" />
          <text class="flow-label" x="821" y="240" text-anchor="middle">reconciliation sweeps</text>
        </svg>
      </div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /mes/problem</h2>
      <div class="case-prose reveal">
        <p>
          The plant made millions of pounds of product a week — and the books found
          out later. Contemporaneous production tracking sat around
          <strong>20%</strong>: in-plant production often wasn't recorded in the ERP
          as it happened, so inventory, costing, and lot traceability ran on
          end-of-day catch-up and educated guesswork. The people who could have
          typed it all in were busy doing something more important: running a
          plant.
        </p>
        <p>
          The goal wasn't a better data-entry screen. It was
          <strong>no data-entry screen</strong> — records that create themselves as
          the physical work happens.
        </p>
      </div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /mes/read</h2>
      <div class="case-prose reveal">
        <p>
          <strong>Stage 1 — listen to what the plant already says.</strong> The
          equipment was already talking: sensors, flows, and weights streaming into
          a supervisory control and data acquisition (SCADA) historian (AVEVA). The
          MES service reads that real-time process data directly — no new hardware
          on the line, no operator input, no parallel record-keeping. The physical
          signals are the source of truth, so the system starts from them.
        </p>
      </div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /mes/reconstruct</h2>
      <div class="case-prose reveal">
        <p>
          <strong>Stage 2 — turn signals into batches.</strong> This is the hard
          part. A historian hands you time-series soup; it does not hand you a
          batch. The service reconstructs production batches at every stage of the
          line from those signals — what ran, when it started and stopped, what it
          consumed, and what it produced — and ties every pound to a lot. Real
          production is messy, and this layer is built to absorb that mess rather
          than pass it downstream.
        </p>
      </div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /mes/post</h2>
      <div class="case-prose reveal">
        <p>
          <strong>Stage 3 — post it like an accountant would.</strong> Each
          reconstructed event becomes the matching NetSuite transaction,
          automatically, over secure OAuth 1.0a REST integrations: item receipts,
          assembly unbuilds, work order create/issue/complete, waste adjustments,
          and automated backflush consumption. And because no integration is
          trusted to be perfect, <strong>reconciliation sweeps</strong> continuously
          recheck the record and self-heal drift — the ERP converges on physical
          truth instead of slowly wandering away from it.
        </p>
      </div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /mes/results</h2>
    </section>

    <section class="stats" aria-label="MES results">
      <div class="stat reveal">
        <span class="stat-num"><span data-count="0">0</span></span>
        <span class="stat-label">operator entries for plant-floor production</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num"><span data-count="95">95</span>%</span>
        <span class="stat-label">contemporaneous tracking, up from ~20%</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num"><span data-count="90">90</span>%+</span>
        <span class="stat-label">of all company ERP lines posted by my systems</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num"><span data-count="1400000" data-format="compact">1.4M</span>+</span>
        <span class="stat-label">transaction lines in the first seven months of 2026</span>
      </div>
    </section>

    <section class="section contact">
      <p class="section-note reveal">
        Every lot traceable end to end, costed as it moves, with nobody typing
        anything in. The specifics above are deliberately high-level — but the same
        ideas run in the open at
        <a href="https://fobech.com" target="_blank" rel="noopener">Fobech</a>, my
        own manufacturing software studio. Poke the live demo below, or see
        <NuxtLink to="/systems">the rest of the systems</NuxtLink> and
        <NuxtLink to="/experience">the full experience page</NuxtLink>.
      </p>
      <DemoWindow />
    </section>
  </main>
</template>
