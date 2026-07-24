<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    document.body.classList.add('no-motion')
    return
  }

  gsap.registerPlugin(ScrollTrigger)

  // Hero load sequence
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.site-header', { y: -16, opacity: 0, duration: 0.5 })
    .from('.hero-line', { y: 34, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.2')
    .from('.console', { y: 40, opacity: 0, duration: 0.8 }, '-=0.55')

  // Scroll reveals
  gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    )
  })

  // Stat counters
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count') || '0', 10)
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.val))
      },
    })
  })
})
</script>

<template>
  <div>
    <header class="site-header">
      <a class="brand" href="#top" aria-label="Bryce Chesley — home">
        <span class="brand-mark">BC</span>
        <span class="brand-sub">/ burley, idaho</span>
      </a>
      <nav class="site-nav" aria-label="Sections">
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#contact" class="nav-cta">Contact</a>
      </nav>
    </header>

    <main id="top">
      <!-- ============ HERO ============ -->
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow hero-line">SOFTWARE DEVELOPMENT ENGINEER · SUNTADO</p>
          <h1 class="hero-name">
            <span class="hero-line">Bryce</span>
            <span class="hero-line">Chesley</span>
          </h1>
          <p class="hero-lede hero-line">
            Full-stack engineer with production ownership of an enterprise operations
            platform — Vue 3, Node.js, SQL Server, and NetSuite, running a dairy plant
            every day.
          </p>
          <div class="hero-actions hero-line">
            <a class="btn btn-solid" href="mailto:brycches@gmail.com">Email me</a>
            <a class="btn btn-ghost" href="https://github.com/brycches" target="_blank" rel="noopener">GitHub</a>
            <a class="btn btn-ghost" href="https://www.linkedin.com/in/bryce-chesley-43546915b" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>

        <ConsolePanel />
      </section>

      <!-- ============ STATS ============ -->
      <section class="stats" aria-label="Impact at a glance">
        <div class="stat reveal">
          <span class="stat-num"><span data-count="85">0</span>%</span>
          <span class="stat-label">of active staff use SunApps daily</span>
        </div>
        <div class="stat reveal">
          <span class="stat-num">$<span data-count="50">0</span>K</span>
          <span class="stat-label">annual third-party spend replaced</span>
        </div>
        <div class="stat reveal">
          <span class="stat-num"><span data-count="4">0</span></span>
          <span class="stat-label">services refactored from one monolith</span>
        </div>
        <div class="stat reveal">
          <span class="stat-num">~<span data-count="100">0</span></span>
          <span class="stat-label">NetSuite transactions supported per day</span>
        </div>
      </section>

      <!-- ============ EXPERIENCE ============ -->
      <section class="section" id="experience">
        <h2 class="endpoint reveal"><span class="method">GET</span> /experience</h2>

        <article class="entry reveal">
          <div class="entry-head">
            <div>
              <h3>Junior Developer / NetSuite Integration Developer</h3>
              <p class="entry-org">SunTado — Burley, Idaho</p>
            </div>
            <p class="entry-dates">JUN 2025 — PRESENT</p>
          </div>
          <ul class="entry-points">
            <li>Develop and maintain <strong>SunApps</strong>, a production enterprise operations platform (Vue 3, Node.js, Express, SQL Server, NetSuite) used by ~85% of active staff across warehouse, QA, packaging, production, and management.</li>
            <li>Designed and support RESTful API workflows and secure OAuth 1.0a integrations for work orders, item receipts, fulfillments, inventory adjustments, QC release, bin transfers, and lot traceability.</li>
            <li>Built custom NetSuite integrations that replaced major RF-SMART warehouse workflows, eliminating roughly $50K in annual third-party cost.</li>
            <li>Created at least 80% of the Vue frontend and refactored a monolithic Node.js API into four independent services, reducing deployment risk and improving maintainability.</li>
            <li>Built an automated backflush and consumption system that raised contemporaneous production tracking from ~20% to 80–90%.</li>
            <li>Primary SunApps support resource and subject-matter expert; partner with warehouse, QA, production, procurement, accounting, and management to turn business needs into software.</li>
          </ul>
        </article>

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
      </section>

      <!-- ============ SKILLS ============ -->
      <section class="section" id="skills">
        <h2 class="endpoint reveal"><span class="method">GET</span> /skills</h2>
        <div class="skill-rows">
          <div class="skill-row reveal">
            <span class="skill-key">frontend</span>
            <div class="chips"><span>Vue 3</span><span>Nuxt</span><span>JavaScript</span><span>HTML</span><span>CSS</span><span>Pinia</span><span>Bulma</span></div>
          </div>
          <div class="skill-row reveal">
            <span class="skill-key">backend</span>
            <div class="chips"><span>Node.js</span><span>Express</span><span>REST</span><span>OAuth 1.0a</span><span>PM2</span></div>
          </div>
          <div class="skill-row reveal">
            <span class="skill-key">data</span>
            <div class="chips"><span>SQL Server</span><span>SQL</span><span>SuiteQL</span><span>NetSuite</span><span>SuiteScript</span></div>
          </div>
          <div class="skill-row reveal">
            <span class="skill-key">languages</span>
            <div class="chips"><span>JavaScript</span><span>C#</span><span>C++</span><span>Python</span></div>
          </div>
          <div class="skill-row reveal">
            <span class="skill-key">practice</span>
            <div class="chips"><span>Git &amp; GitHub</span><span>SDLC</span><span>End-to-end testing</span><span>Root-cause analysis</span></div>
          </div>
          <div class="skill-row reveal">
            <span class="skill-key">ai&nbsp;tools</span>
            <div class="chips"><span>Claude Code</span><span>ChatGPT</span><span>AI-assisted debugging &amp; review</span></div>
          </div>
        </div>
      </section>

      <!-- ============ PROJECTS ============ -->
      <section class="section" id="projects">
        <h2 class="endpoint reveal"><span class="method">GET</span> /projects</h2>
        <p class="section-note reveal">
          Pulled live from <a href="https://github.com/brycches" target="_blank" rel="noopener">github.com/brycches</a>.
        </p>
        <RepoGrid />
      </section>

      <!-- ============ EDUCATION ============ -->
      <section class="section" id="education">
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
              <p class="entry-org">Idaho State University</p>
            </div>
            <p class="entry-dates">SEP 2018 — MAY 2020</p>
          </div>
        </div>
      </section>

      <!-- ============ CONTACT ============ -->
      <section class="section contact" id="contact">
        <h2 class="endpoint reveal"><span class="method method-post">POST</span> /contact</h2>
        <p class="contact-lede reveal">
          I like building software that a real operation depends on. If you're hiring — or
          just want to talk shop — my inbox is open.
        </p>
        <div class="hero-actions reveal">
          <a class="btn btn-solid" href="mailto:brycches@gmail.com">brycches@gmail.com</a>
          <a class="btn btn-ghost" href="https://www.linkedin.com/in/bryce-chesley-43546915b" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn btn-ghost" href="https://github.com/brycches" target="_blank" rel="noopener">GitHub</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>© 2026 Bryce Chesley</span>
      <span class="footer-mono">built with Nuxt + GSAP · hosted on GitHub Pages</span>
    </footer>
  </div>
</template>
