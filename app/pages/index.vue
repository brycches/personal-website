<script setup lang="ts">
import { gsap } from 'gsap'

useHead({
  title: 'Bryce Chesley — Software Engineer',
  meta: [
    {
      name: 'description',
      content:
        'Full-stack software engineer in Idaho. I build the operations platform and manufacturing execution system (MES) that run a dairy plant — Vue 3, Node.js, SQL Server, NetSuite.',
    },
  ],
})

usePageFx(() => {
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-line', { y: 34, opacity: 0, duration: 0.7, stagger: 0.12 })
    .from('.console', { y: 40, opacity: 0, duration: 0.8 }, '-=0.55')
})
</script>

<template>
  <main>
    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow hero-line">SOFTWARE ENGINEER · SUNTADO / IDA MILK</p>
        <h1 class="hero-name">
          <span class="hero-line">Bryce</span>
          <span class="hero-line">Chesley</span>
        </h1>
        <p class="hero-lede hero-line">
          I built the software that runs a dairy plant — from the apps in operators'
          hands to the manufacturing execution system (MES) that turns live
          plant-floor data into enterprise resource planning (ERP) truth. Vue 3,
          Node.js, SQL Server, and NetSuite, in production every day.
        </p>
        <div class="hero-actions hero-line">
          <a class="btn btn-solid" href="mailto:brycches@gmail.com">Email me</a>
          <NuxtLink class="btn btn-ghost" to="/systems">See the systems</NuxtLink>
          <a class="btn btn-ghost" href="https://github.com/brycches" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>

      <ConsolePanel />
    </section>

    <!-- ============ STATS ============ -->
    <section class="stats" aria-label="Impact at a glance">
      <div class="stat reveal">
        <span class="stat-num"><span data-count="95">95</span>%</span>
        <span class="stat-label">of active staff use my applications daily</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num">$<span data-count="250">250</span>K</span>
        <span class="stat-label">annual third-party spend replaced</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num"><span data-count="0">0</span></span>
        <span class="stat-label">manual entries for plant-floor ERP postings</span>
      </div>
      <div class="stat reveal">
        <span class="stat-num"><span data-count="1282224" data-format="compact">1.3M</span>+</span>
        <span class="stat-label">ERP transaction lines my systems posted this year</span>
      </div>
    </section>

    <!-- ============ FEATURED ============ -->
    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /highlights</h2>
      <div class="feature-grid">
        <NuxtLink to="/systems" class="feature-card reveal">
          <span class="feature-tag">plant floor → erp</span>
          <h3>An MES with zero data entry</h3>
          <p>
            Reads live supervisory control and data acquisition (SCADA) process
            data, reconstructs every batch on the line, and
            posts inventory and costing to NetSuite automatically. Millions of pounds
            of milk a week, fully lot-traceable.
          </p>
          <span class="feature-more">follow the milk →</span>
        </NuxtLink>
        <NuxtLink to="/systems" class="feature-card reveal">
          <span class="feature-tag">the platform</span>
          <h3>One app runs the operation</h3>
          <p>
            A Vue 3 progressive web app (PWA) for work orders, inventory and
            pallets, receiving, quality control (QC), and
            fulfillment — used daily by ~95% of staff. I wrote 80%+ of the frontend
            and own it end to end.
          </p>
          <span class="feature-more">see the systems →</span>
        </NuxtLink>
        <NuxtLink to="/experience" class="feature-card reveal">
          <span class="feature-tag">the path</span>
          <h3>Owner of the stack, end to end</h3>
          <p>
            BYU–Idaho software engineering grad, now the primary developer and
            subject-matter expert behind a plant's daily operations software — the
            person they call when it matters.
          </p>
          <span class="feature-more">full experience →</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="section contact">
      <p class="contact-lede reveal">
        I like building software a real operation depends on. If that's the kind of
        engineer you need — let's talk.
      </p>
      <div class="hero-actions reveal">
        <NuxtLink class="btn btn-solid" to="/contact">Get in touch</NuxtLink>
      </div>
    </section>
  </main>
</template>
