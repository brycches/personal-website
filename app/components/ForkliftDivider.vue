<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'

const track = ref<HTMLElement | null>(null)
const lift = ref<SVGSVGElement | null>(null)
const show = ref(true)

let ctx: gsap.Context | undefined

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    show.value = false
    return
  }

  whenVisible(() => {
    ctx = gsap.context(() => {
      const dist = (track.value?.offsetWidth ?? 1000) + 180

      // The commute: drive across, rest off-screen, repeat
      gsap.fromTo(
        lift.value,
        { x: 0 },
        { x: dist, duration: 17, ease: 'none', repeat: -1, repeatDelay: 7, delay: 2 },
      )
      // Suspension bob
      gsap.to(lift.value, { y: -1.2, duration: 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      // Warning beacon
      gsap.to('.fk-beacon', { opacity: 0.2, duration: 0.5, yoyo: true, repeat: -1, ease: 'none' })
    }, track.value ?? undefined)
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="track" class="forklift-track" aria-hidden="true">
    <svg v-if="show" ref="lift" class="forklift" viewBox="0 0 74 72" width="61" height="59">
      <!-- counterweight + body -->
      <rect class="fk-solid" x="2" y="38" width="6" height="14" rx="2" />
      <rect class="fk-solid" x="6" y="34" width="30" height="22" rx="3" />
      <!-- overhead guard + beacon -->
      <path class="fk-line" d="M10,34 V16 H32 V34" />
      <circle class="fk-beacon" cx="21" cy="13" r="2.5" />
      <!-- chassis link joining body to mast -->
      <rect class="fk-solid" x="33" y="42" width="9" height="8" rx="1" />
      <!-- mast + forks -->
      <line class="fk-line" x1="40" y1="6" x2="40" y2="66" />
      <line class="fk-line" x1="43" y1="6" x2="43" y2="66" />
      <line class="fk-line" x1="43" y1="64" x2="72" y2="64" />
      <!-- pallet deck + load -->
      <rect class="fk-box" x="45" y="58" width="26" height="4" rx="1" />
      <rect class="fk-box" x="48" y="44" width="20" height="14" rx="2" />
      <line class="fk-line" x1="48" y1="49" x2="68" y2="49" />
      <!-- wheels (same size) -->
      <circle class="fk-solid" cx="13" cy="64" r="6" />
      <circle class="fk-solid" cx="31" cy="64" r="6" />
      <circle class="fk-hub" cx="13" cy="64" r="2" />
      <circle class="fk-hub" cx="31" cy="64" r="2" />
    </svg>
    <div class="conveyor-divider"></div>
  </div>
</template>
