<script setup lang="ts">
import { gsap } from 'gsap'

useHead({
  title: 'About — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content:
        'About Bryce Chesley: teacher at heart, musician, backpacker, and a software engineer who likes problems with real-world weight.',
    },
  ],
})

usePageFx(() => {
  // Draw the ridgeline as it scrolls into view
  const path = document.querySelector<SVGPathElement>('.ridge path')
  if (!path) return
  const l = path.getTotalLength()
  gsap.fromTo(
    path,
    { strokeDasharray: `${l} ${l}`, strokeDashoffset: l },
    {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.ridge', start: 'top 88%' },
    },
  )
})
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /about</h1>
      <p class="section-note reveal">The parts of me that don't fit in a bullet point.</p>
    </section>

    <section class="section">
      <div class="about-grid">
        <article class="about-block reveal">
          <span class="feature-tag">explaining till it clicks</span>
          <p>
            I've always ended up teaching along the way — math tutoring in high
            school, helping classmates through programming courses in college.
            Explaining something until it clicks for someone else is still how I
            learn best, and it's why I end up as the go-to support person for every
            system I build.
          </p>
        </article>

        <article class="about-block reveal">
          <span class="feature-tag">virginia &amp; scotland</span>
          <p>
            I spent 18 months on a proselyting mission for The Church of Jesus Christ
            of Latter-day Saints across Virginia and Scotland. I came home fully
            independent, comfortable talking with anyone from any background, and
            self-motivated in a way no classroom ever managed.
          </p>
        </article>

        <article class="about-block reveal">
          <span class="feature-tag">analog interfaces</span>
          <p>
            Piano, guitar, and euphonium. I'm an avid reader, a tennis player, a
            skier, and unapologetic about video games. There's a version of
            problem-solving in music — patterns, timing, practice until it's muscle
            memory — that maps surprisingly well onto debugging.
          </p>
        </article>

        <article class="about-block reveal">
          <span class="feature-tag">the sawtooths</span>
          <p>
            Every year my family backpacks either the White Clouds or the Sawtooths
            here in Idaho. A few days of switchbacks with everything you need on your
            back is the best systems-thinking exercise I know — pack light, plan for
            failure, enjoy the view.
          </p>
        </article>
      </div>

      <div class="ridge reveal" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,110 L90,58 L150,86 L230,30 L310,84 L390,52 L470,96 L560,24 L640,78 L720,48 L800,92 L890,36 L970,82 L1050,60 L1120,90 L1200,44 L1200,120 L0,120 Z" />
        </svg>
        <span class="ridge-label">white clouds · sawtooths · idaho</span>
      </div>
    </section>

    <section class="section contact">
      <p class="contact-lede reveal">
        Curious how that translates into work? Start with the systems.
      </p>
      <div class="hero-actions reveal">
        <NuxtLink class="btn btn-solid" to="/systems">See the systems</NuxtLink>
        <NuxtLink class="btn btn-ghost" to="/contact">Get in touch</NuxtLink>
      </div>
    </section>
  </main>
</template>
