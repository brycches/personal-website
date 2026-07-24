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
    <svg v-if="show" ref="lift" class="forklift" viewBox="0 0 84 52" width="76" height="47">
      <!-- counterweight + body -->
      <rect class="fk-solid" x="10" y="24" width="8" height="14" rx="2" />
      <rect class="fk-solid" x="16" y="20" width="36" height="18" rx="3" />
      <!-- overhead guard + beacon -->
      <path class="fk-line" d="M22,20 V8 H46 V20" />
      <circle class="fk-beacon" cx="34" cy="6" r="2.5" />
      <!-- mast + fork + load -->
      <line class="fk-line" x1="58" y1="4" x2="58" y2="46" />
      <line class="fk-line" x1="61" y1="4" x2="61" y2="46" />
      <line class="fk-line" x1="61" y1="44" x2="82" y2="44" />
      <rect class="fk-box" x="64" y="28" width="16" height="15" rx="2" />
      <line class="fk-line" x1="64" y1="33" x2="80" y2="33" />
      <!-- wheels -->
      <circle class="fk-solid" cx="26" cy="44" r="7" />
      <circle class="fk-solid" cx="50" cy="44" r="6" />
      <circle class="fk-hub" cx="26" cy="44" r="2" />
      <circle class="fk-hub" cx="50" cy="44" r="2" />
    </svg>
    <div class="conveyor-divider"></div>
  </div>
</template>
