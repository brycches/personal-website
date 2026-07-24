<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

let ctx: gsap.Context | undefined

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

  whenVisible(() => {
    ctx = gsap.context(() => {
      // --- Scroll-scrubbed "milk fills the line" pass -------------------
      const fills = gsap.utils.toArray<SVGPathElement>('.pipe-fill')
      fills.forEach((p) => {
        const l = p.getTotalLength()
        gsap.set(p, { strokeDasharray: `${l} ${l}`, strokeDashoffset: l })
      })

      const scrub = gsap.timeline({
        scrollTrigger: {
          trigger: '.mes-panel',
          start: 'top 75%',
          end: '+=1100',
          scrub: 1,
        },
        defaults: { ease: 'none' },
      })

      const stage = (vessel: string, pipe?: string, tick?: string) => {
        if (pipe) scrub.to(pipe, { strokeDashoffset: 0, duration: 0.6 })
        scrub.fromTo(vessel, { opacity: 0.45 }, { opacity: 1, duration: 0.25 }, '<50%')
        if (tick) scrub.fromTo(tick, { opacity: 0.2 }, { opacity: 1, duration: 0.3 }, '<')
      }

      scrub.fromTo('.erp-bus', { opacity: 0.25 }, { opacity: 1, duration: 0.4 })
      stage('.v-tanker')
      stage('.v-silo', '#pf-1', '.tick-receipt')
      stage('.v-sep', '#pf-2')
      stage('.v-cream', '#pf-cream', '.tick-unbuild')
      stage('.v-blend', '#pf-3', '.tick-wo')
      stage('.v-uht', '#pf-4')
      stage('.v-surge', '#pf-5', '.tick-adjust')
      stage('.v-filler', '#pf-6')
      stage('.v-conveyor', undefined, '.tick-complete')
      stage('.v-pallet')

      // --- Continuous ambient motion (starts once visible) --------------
      gsap.set('.dyn', { opacity: 1 })

      // Milk dots along the main line
      ;[0, 2.6, 5.2].forEach((delay, i) => {
        gsap.to(`#dot-${i + 1}`, {
          motionPath: { path: '#flow-main', align: '#flow-main', alignOrigin: [0.5, 0.5] },
          duration: 8,
          delay,
          repeat: -1,
          ease: 'none',
        })
      })
      // Cream dot up the branch
      gsap.to('#dot-cream', {
        motionPath: { path: '#pf-cream', align: '#pf-cream', alignOrigin: [0.5, 0.5] },
        duration: 3,
        repeat: -1,
        repeatDelay: 1.2,
        ease: 'power1.inOut',
      })
      // Filler drips
      gsap.utils.toArray<SVGCircleElement>('.drip').forEach((d, i) => {
        gsap.fromTo(
          d,
          { y: 0, opacity: 0 },
          { y: 34, opacity: 1, duration: 0.7, repeat: -1, delay: i * 0.23, ease: 'power1.in' },
        )
      })
      // Cartons riding the belt
      gsap.utils.toArray<SVGGElement>('.carton-mv').forEach((c, i) => {
        gsap.fromTo(
          c,
          { x: 0 },
          {
            x: 190,
            duration: 5.4,
            delay: i * 1.8,
            repeat: -1,
            ease: 'none',
            modifiers: { x: (x) => `${parseFloat(x) % 190}px` },
          },
        )
      })
      // Blend-tank agitator
      gsap.to('.agitator', {
        rotation: 360,
        transformOrigin: 'center',
        duration: 2.4,
        repeat: -1,
        ease: 'none',
      })
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div class="console mes-panel" aria-label="Animated diagram of the dairy production line and the NetSuite transactions the MES posts at each stage">
    <div class="console-bar">
      <span class="console-dot dot-red"></span>
      <span class="console-dot dot-yellow"></span>
      <span class="console-dot dot-green"></span>
      <span class="console-title">sunapps_mes · plant floor → netsuite</span>
      <span class="console-status"><span class="pulse"></span>LIVE</span>
    </div>

    <div class="mes-scroll">
      <svg
        class="mes-diagram"
        viewBox="0 0 1240 470"
        role="img"
        aria-label="Milk flows from tanker intake through raw silo, separator, blend tank, UHT, surge tank, and filler onto a conveyor and pallet; each stage posts a matching NetSuite transaction: item receipt, assembly unbuild, work order and issues, adjustments, and completions"
      >
        <!-- base pipes (always visible, dim) -->
        <path class="pipe-base" d="M150,210 H196" />
        <path class="pipe-base" d="M260,210 H326" />
        <path class="pipe-base" d="M390,210 H484" />
        <path class="pipe-base" d="M550,210 H628" />
        <path class="pipe-base" d="M732,210 H796" />
        <path class="pipe-base" d="M854,210 H916" />
        <path class="pipe-base" d="M358,140 C358,104 396,92 430,92" />

        <!-- bright fill pass, drawn by scroll -->
        <path id="pf-1" class="pipe-fill" d="M150,210 H196" />
        <path id="pf-2" class="pipe-fill" d="M260,210 H326" />
        <path id="pf-3" class="pipe-fill" d="M390,210 H484" />
        <path id="pf-4" class="pipe-fill" d="M550,210 H628" />
        <path id="pf-5" class="pipe-fill" d="M732,210 H796" />
        <path id="pf-6" class="pipe-fill" d="M854,210 H916" />
        <path id="pf-cream" class="pipe-fill pipe-cream" d="M358,140 C358,104 396,92 430,92" />

        <!-- invisible guide for the milk dots -->
        <path id="flow-main" d="M150,210 H916" fill="none" stroke="none" />

        <!-- TANKER -->
        <g class="vessel v-tanker">
          <rect x="42" y="178" width="104" height="52" rx="26" />
          <rect x="130" y="200" width="22" height="30" rx="4" />
          <circle cx="64" cy="238" r="8" /><circle cx="88" cy="238" r="8" /><circle cx="128" cy="238" r="8" />
          <ellipse cx="80" cy="178" rx="10" ry="4" /><ellipse cx="112" cy="178" rx="10" ry="4" />
          <text x="95" y="266" class="v-label" text-anchor="middle">INTAKE</text>
        </g>

        <!-- RAW SILO -->
        <g class="vessel v-silo">
          <rect x="196" y="120" width="64" height="120" rx="10" />
          <ellipse cx="228" cy="122" rx="32" ry="10" />
          <line x1="208" y1="240" x2="208" y2="258" /><line x1="248" y1="240" x2="248" y2="258" />
          <text x="228" y="278" class="v-label" text-anchor="middle">RAW SILO</text>
        </g>

        <!-- SEPARATOR -->
        <g class="vessel v-sep">
          <rect x="326" y="140" width="64" height="76" rx="10" />
          <line x1="336" y1="158" x2="380" y2="158" /><line x1="336" y1="172" x2="380" y2="172" />
          <line x1="336" y1="186" x2="380" y2="186" /><line x1="336" y1="200" x2="380" y2="200" />
          <path d="M336,216 L358,238 L380,216" fill="none" />
          <text x="358" y="262" class="v-label" text-anchor="middle">SEPARATOR</text>
        </g>

        <!-- CREAM TANK -->
        <g class="vessel v-cream">
          <rect x="430" y="68" width="74" height="48" rx="10" />
          <text x="467" y="134" class="v-label" text-anchor="middle">CREAM</text>
        </g>

        <!-- BLEND TANK -->
        <g class="vessel v-blend">
          <rect x="484" y="132" width="66" height="108" rx="10" />
          <line x1="517" y1="148" x2="517" y2="196" />
          <g class="agitator">
            <line x1="503" y1="202" x2="531" y2="202" />
            <line x1="517" y1="194" x2="517" y2="210" />
          </g>
          <text x="517" y="262" class="v-label" text-anchor="middle">BLEND</text>
        </g>

        <!-- UHT -->
        <g class="vessel v-uht">
          <rect x="628" y="150" width="104" height="80" rx="10" />
          <polyline points="640,218 652,164 664,218 676,164 688,218 700,164 712,218 720,190" fill="none" />
          <text x="680" y="262" class="v-label" text-anchor="middle">UHT</text>
        </g>

        <!-- SURGE -->
        <g class="vessel v-surge">
          <rect x="796" y="150" width="58" height="90" rx="10" />
          <text x="825" y="262" class="v-label" text-anchor="middle">SURGE</text>
        </g>

        <!-- FILLER -->
        <g class="vessel v-filler">
          <path d="M916,150 H1000 V172 L974,198 H942 L916,172 Z" />
          <rect x="952" y="198" width="12" height="14" rx="3" />
          <text x="958" y="140" class="v-label" text-anchor="middle">FILLER</text>
          <circle class="drip dyn" cx="958" cy="222" r="2.5" opacity="0" />
          <circle class="drip dyn" cx="958" cy="222" r="2.5" opacity="0" />
          <circle class="drip dyn" cx="958" cy="222" r="2.5" opacity="0" />
        </g>

        <!-- CONVEYOR -->
        <g class="vessel v-conveyor">
          <rect x="880" y="310" width="240" height="8" rx="4" />
          <circle cx="896" cy="322" r="6" /><circle cx="936" cy="322" r="6" /><circle cx="976" cy="322" r="6" />
          <circle cx="1016" cy="322" r="6" /><circle cx="1056" cy="322" r="6" /><circle cx="1096" cy="322" r="6" />
          <g class="carton carton-mv" transform="translate(890,276)">
            <path d="M0,10 L8,0 H18 L26,10 V34 H0 Z" />
          </g>
          <g class="carton carton-mv" transform="translate(890,276)">
            <path d="M0,10 L8,0 H18 L26,10 V34 H0 Z" />
          </g>
        </g>

        <!-- PALLET -->
        <g class="vessel v-pallet">
          <g class="carton"><path d="M1124,366 l8,-10 h10 l8,10 v24 h-26 Z" /></g>
          <g class="carton"><path d="M1152,366 l8,-10 h10 l8,10 v24 h-26 Z" /></g>
          <g class="carton"><path d="M1180,366 l8,-10 h10 l8,10 v24 h-26 Z" /></g>
          <g class="carton"><path d="M1138,332 l8,-10 h10 l8,10 v24 h-26 Z" /></g>
          <g class="carton"><path d="M1166,332 l8,-10 h10 l8,10 v24 h-26 Z" /></g>
          <rect x="1118" y="392" width="96" height="9" rx="2" />
          <rect x="1124" y="401" width="14" height="7" /><rect x="1160" y="401" width="14" height="7" /><rect x="1196" y="401" width="12" height="7" />
          <text x="1166" y="426" class="v-label" text-anchor="middle">PALLETIZE</text>
        </g>

        <!-- milk + cream dots -->
        <circle id="dot-1" class="milk-dot dyn" r="4" opacity="0" />
        <circle id="dot-2" class="milk-dot dyn" r="4" opacity="0" />
        <circle id="dot-3" class="milk-dot dyn" r="4" opacity="0" />
        <circle id="dot-cream" class="cream-dot dyn" r="4" opacity="0" />

        <!-- ERP bus -->
        <g class="erp-bus">
          <path class="bus-line" d="M60,438 H1210" />
          <text x="60" y="458" class="bus-name">NETSUITE ERP</text>
        </g>
        <g class="tick tick-receipt">
          <path d="M228,284 V438" />
          <circle cx="228" cy="438" r="4" />
          <text x="236" y="458" class="tick-label">item receipt</text>
        </g>
        <g class="tick tick-unbuild">
          <path d="M358,268 V438" />
          <circle cx="358" cy="438" r="4" />
          <text x="366" y="458" class="tick-label">assembly unbuild</text>
        </g>
        <g class="tick tick-wo">
          <path d="M517,268 V438" />
          <circle cx="517" cy="438" r="4" />
          <text x="525" y="458" class="tick-label">work order + issues</text>
        </g>
        <g class="tick tick-adjust">
          <path d="M825,268 V438" />
          <circle cx="825" cy="438" r="4" />
          <text x="833" y="458" class="tick-label">waste adjustments</text>
        </g>
        <g class="tick tick-complete">
          <path d="M1000,330 V438" />
          <circle cx="1000" cy="438" r="4" />
          <text x="1008" y="458" class="tick-label">completions</text>
        </g>
      </svg>
    </div>

    <div class="console-log mes-caption" aria-hidden="true">
      <div><span class="arrow">→</span> the MES watches the plant's historian and posts every one of these transactions <span class="ok">automatically</span></div>
      <div><span class="arrow">→</span> millions of pounds of milk a week · zero operator data entry · full lot traceability</div>
    </div>
  </div>
</template>
