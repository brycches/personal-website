<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{
  value: number // 0–100
  label: string
  display: string
}>()

const root = ref<HTMLElement | null>(null)
const needle = ref<SVGGElement | null>(null)

let ctx: gsap.Context | undefined

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const target = (Math.min(Math.max(props.value, 0), 100) / 100) * 180

  if (reduceMotion) {
    gsap.set(needle.value, { rotation: target, svgOrigin: '60 64' })
    return
  }

  gsap.registerPlugin(ScrollTrigger)

  whenVisible(() => {
    ctx = gsap.context(() => {
      gsap.fromTo(
        needle.value,
        { rotation: 0, svgOrigin: '60 64' },
        {
          rotation: target,
          duration: 1.7,
          ease: 'elastic.out(1, 0.45)',
          scrollTrigger: { trigger: root.value, start: 'top 92%' },
          onComplete: () => {
            // faint mechanical tremble once settled
            gsap.to(needle.value, {
              rotation: target + 1.4,
              duration: 0.14,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
            })
          },
        },
      )
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="gauge-dial" aria-hidden="true">
    <svg viewBox="0 0 120 84" width="132" height="92">
      <path class="gauge-arc" d="M16,64 A44,44 0 0 1 104,64" />
      <path class="gauge-red" d="M95.6,38.1 A44,44 0 0 1 104,64" />
      <line class="gauge-tick" x1="16" y1="64" x2="10" y2="64" />
      <line class="gauge-tick" x1="28.9" y1="32.9" x2="24.6" y2="28.6" />
      <line class="gauge-tick" x1="60" y1="20" x2="60" y2="14" />
      <line class="gauge-tick" x1="91.1" y1="32.9" x2="95.4" y2="28.6" />
      <line class="gauge-tick" x1="104" y1="64" x2="110" y2="64" />
      <g ref="needle">
        <line class="gauge-needle" x1="60" y1="64" x2="24" y2="64" />
      </g>
      <circle class="gauge-hub" cx="60" cy="64" r="4.5" />
      <text class="gauge-value" x="60" y="80" text-anchor="middle">{{ display }}</text>
    </svg>
    <span class="gauge-label">{{ label }}</span>
  </div>
</template>
