<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement | null>(null)
const liquid = ref<SVGRectElement | null>(null)
const wave = ref<SVGEllipseElement | null>(null)
const pct = ref<SVGTextElement | null>(null)

let ctx: gsap.Context | undefined

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    root.value?.classList.add('silo-hidden')
    return
  }

  gsap.registerPlugin(ScrollTrigger)

  whenVisible(() => {
    ctx = gsap.context(() => {
      gsap.set(liquid.value, { scaleY: 0, transformOrigin: 'bottom' })

      // Gentle surface slosh
      gsap.to(wave.value, {
        attr: { rx: 15 },
        duration: 1.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      const TOP = 34 // liquid rect top in SVG coords
      const H = 124 // liquid rect height

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(liquid.value, { scaleY: Math.max(p, 0.001) })
          if (wave.value) wave.value.setAttribute('cy', String(TOP + H - p * H))
          if (pct.value) pct.value.textContent = `${Math.round(p * 100)}%`
        },
        onRefresh: (self) => {
          // Hide the silo on pages too short to scroll
          const scrollable = self.end - self.start > 60
          root.value?.classList.toggle('silo-hidden', !scrollable)
        },
      })
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="silo-progress" aria-hidden="true">
    <svg viewBox="0 0 60 208" width="76" height="263">
      <!-- liquid -->
      <rect ref="liquid" class="silo-liquid" x="17" y="34" width="26" height="124" rx="4" />
      <ellipse ref="wave" class="silo-wave" cx="30" cy="158" rx="12" ry="2.6" />
      <!-- vessel -->
      <rect class="silo-line silo-body" x="14" y="30" width="32" height="130" rx="7" />
      <!-- ladder rungs -->
      <line class="silo-line" x1="8" y1="52" x2="14" y2="52" />
      <line class="silo-line" x1="8" y1="76" x2="14" y2="76" />
      <line class="silo-line" x1="8" y1="100" x2="14" y2="100" />
      <line class="silo-line" x1="8" y1="46" x2="8" y2="106" />
      <!-- legs -->
      <line class="silo-line" x1="19" y1="160" x2="13" y2="184" />
      <line class="silo-line" x1="41" y1="160" x2="47" y2="184" />
      <line class="silo-line" x1="8" y1="184" x2="52" y2="184" />
      <text ref="pct" class="silo-pct" x="30" y="202" text-anchor="middle">0%</text>
    </svg>
  </div>
</template>
