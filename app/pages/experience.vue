<script setup lang="ts">
useHead({
  title: 'Experience — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content:
        'Software engineering experience: SunTado / Ida Milk operations platform, manufacturing execution system (MES) and NetSuite integrations, and the education behind them.',
    },
  ],
})

usePageFx()

function printResume() {
  window.print()
}
</script>

<template>
  <main>
    <div class="print-only print-head">
      <h1>Bryce Chesley</h1>
      <p>Software Engineer · Idaho (Mountain Time) · open to Boise &amp; remote</p>
      <p>brycches@gmail.com · brycechesley.com · github.com/brycches · linkedin.com/in/bryce-chesley-43546915b</p>
    </div>

    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /experience</h1>
      <p class="section-note reveal">The short version is on my resume. This is the real scope.</p>
      <p class="reveal resume-actions">
        <a class="btn btn-solid" href="/Bryce-Chesley-Resume.pdf" download="Bryce-Chesley-Resume.pdf">
          Download resume (PDF)
        </a>
        <button class="btn btn-ghost print-btn" type="button" @click="printResume">
          Print this page
        </button>
      </p>
    </section>

    <section class="section">
      <article class="entry reveal">
        <div class="entry-head">
          <div>
            <h3>Software Engineer</h3>
            <p class="entry-org">SunTado · Ida Milk — Idaho · promoted from Junior Developer</p>
          </div>
          <p class="entry-dates">JUN 2025 — AUG 2026</p>
        </div>
        <p class="entry-intro">
          I was the primary developer behind the software that runs an
          ultra-high-temperature (UHT) dairy
          manufacturing operation — top contributor across the platform's repos, and
          the person the plant called when something needed to work.
        </p>

        <h4 class="entry-sub">The platform</h4>
        <ul class="entry-points">
          <li>Built and owned <strong>the applications the plant runs on</strong> — Vue 3 progressive web apps (PWAs) for work orders, inventory and pallet management, receiving, quality control (QC) sampling and release, bin transfers, and fulfillment — used daily by ~95% of active staff across warehouse, quality assurance (QA), packaging, production, and management. I wrote 80%+ of the frontend.</li>
          <li>Built real-time features with Socket.IO: production key performance indicator (KPI) dashboards on shop-floor TVs, a live line-staging dashboard, and escalating material-low and queue alerts to operators and Microsoft Teams.</li>
        </ul>

        <h4 class="entry-sub">Manufacturing execution system — MES</h4>
        <ul class="entry-points">
          <li>Sole author of an <strong>MES service</strong> that bridges the plant floor and the enterprise resource planning (ERP) system: scheduled pollers read real-time process data from the plant's supervisory control and data acquisition (SCADA) historian, per-tank state machines reconstruct production batches at every stage of the line, and the service posts the matching NetSuite transactions automatically — receipts, assembly unbuilds, work order create/issue/complete, waste adjustments, and reconciliation sweeps.</li>
          <li>Engineered it to run unattended: restart-safe state recovery from SQL Server, idempotent retries that never double-post, a review queue for unrecognized products, a dry-run sandbox mode, and Teams alerting.</li>
          <li>Millions of pounds of milk a week land in NetSuite fully lot-traceable and costed, with <strong>zero operator data entry</strong> — in-plant production that previously wasn't recorded in the ERP at all.</li>
          <li>Built the automated backflush and consumption system that raised contemporaneous production tracking from ~20% to 95%, and eliminated lost inventory updates by serializing concurrent pallet consumption with per-bin, per-work-order locks.</li>
          <li class="no-print">Full architecture write-up: <NuxtLink to="/mes">the MES case study</NuxtLink>.</li>
        </ul>

        <h4 class="entry-sub">Integrations &amp; architecture</h4>
        <ul class="entry-points">
          <li>Split a monolithic Express API into independently deployed services — gateway, manufacturing, MES, ERP, and printing — each with GitHub Actions CI/CD for dev and production, mapping upstream and downstream dependencies to cut deployment risk.</li>
          <li>Designed, documented, and supported RESTful workflows and secure OAuth 1.0a NetSuite integrations for work orders, item receipts, fulfillments, inventory adjustments, QC release, bin transfers, and lot traceability — my services posted over 90% of the company's ERP transaction lines automatically (1.4M+ lines company-wide in the first seven months of 2026).</li>
          <li>Replaced major RF-SMART warehouse and inventory workflows with custom barcode-driven software, eliminating roughly $250K/year in third-party licensing.</li>
          <li>Co-built the application programming interface (API) gateway that fronts every client app on the platform — authentication and brokered access to NetSuite and Active Directory.</li>
          <li>Built the company's external web portal: a Vue 3 frontend behind a hardened Express gateway with JSON Web Token (JWT) access/refresh auth and curated data transfer objects (DTOs), running on Node 22 with PM2 and Caddy — including a milk-diversion planner that forecasts silo capacity and recommends daily truck diversions.</li>
        </ul>

        <h4 class="entry-sub">Reliability &amp; people</h4>
        <ul class="entry-points">
          <li>End-to-end testing, production troubleshooting, root-cause analysis, and change-impact validation across every application the plant depended on.</li>
          <li>Primary support resource and subject-matter expert for the platform; partnered with warehouse, QA, production, procurement, accounting, and management to turn business needs into shipped software.</li>
        </ul>
      </article>

      <ForkliftDivider />

      <article class="entry reveal">
        <div class="entry-head">
          <div>
            <h3>Digital Associate</h3>
            <p class="entry-org">Walmart — Boise, Idaho</p>
          </div>
          <p class="entry-dates">JAN 2022 — MAY 2025</p>
        </div>
        <ul class="entry-points">
          <li>Fulfilled online pickup and delivery orders in a fast-paced, metrics-driven environment while maintaining accuracy and service standards.</li>
          <li>Trusted subject-matter expert for department workflows; routinely assigned complex tasks based on reliability and operational knowledge.</li>
        </ul>
      </article>

      <div class="conveyor-divider" aria-hidden="true"></div>
    </section>

    <section class="section">
      <h2 class="endpoint reveal"><span class="method">GET</span> /education</h2>
      <div class="entry reveal">
        <div class="entry-head">
          <div>
            <h3>B.S. Software Engineering</h3>
            <p class="entry-org">Brigham Young University–Idaho</p>
          </div>
          <p class="entry-dates">SEP 2022 — JUL 2025</p>
        </div>
      </div>
      <div class="entry reveal">
        <div class="entry-head">
          <div>
            <h3>A.A. General Arts</h3>
            <p class="entry-org">Idaho State University — earned alongside my high school diploma</p>
          </div>
          <p class="entry-dates">SEP 2018 — MAY 2020</p>
        </div>
      </div>
    </section>

    <section class="section contact">
      <h2 class="endpoint reveal"><span class="method">GET</span> /skills</h2>
      <div class="skill-rows">
        <div class="skill-row reveal">
          <span class="skill-key">frontend</span>
          <div class="chips"><span>Vue 3</span><span>Nuxt</span><span>Vite</span><span>JavaScript</span><span>TypeScript</span><span>HTML</span><span>CSS</span><span>Pinia</span><span>Bulma</span><span>Chart.js</span></div>
        </div>
        <div class="skill-row reveal">
          <span class="skill-key">backend</span>
          <div class="chips"><span>Node.js</span><span>Express</span><span>REST</span><span>Socket.IO</span><span>OAuth 1.0a</span><span>JWT</span><span>PM2</span><span>Caddy</span></div>
        </div>
        <div class="skill-row reveal">
          <span class="skill-key">data &amp; erp</span>
          <div class="chips"><span>SQL Server</span><span>SQL</span><span>Sequelize</span><span>SuiteQL</span><span>NetSuite</span><span>SuiteScript</span><span>AVEVA Historian</span></div>
        </div>
        <div class="skill-row reveal">
          <span class="skill-key">languages</span>
          <div class="chips"><span>JavaScript</span><span>TypeScript</span><span>SQL</span><span>C#</span><span>C++</span><span>Python</span></div>
        </div>
        <div class="skill-row reveal">
          <span class="skill-key">practice</span>
          <div class="chips"><span>Git &amp; GitHub</span><span>GitHub Actions CI/CD</span><span>Cloudflare</span><span>SDLC</span><span>End-to-end testing</span><span>Root-cause analysis</span><span>Dependency analysis</span></div>
        </div>
        <div class="skill-row reveal">
          <span class="skill-key">ai&nbsp;tools</span>
          <div class="chips"><span>Claude Code</span><span>ChatGPT</span><span>AI-assisted debugging &amp; review</span></div>
        </div>
      </div>
    </section>
  </main>
</template>
