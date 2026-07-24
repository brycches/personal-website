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
      // --- Scroll-scrubbed reveal: machines wake, data lines light up ----
      const fills = gsap.utils.toArray<SVGPathElement>('.data-fill')
      fills.forEach((p) => {
        const l = p.getTotalLength()
        gsap.set(p, { strokeDasharray: `${l} ${l}`, strokeDashoffset: l })
      })

      const scrub = gsap.timeline({
        scrollTrigger: {
          trigger: '.mes-panel',
          // clamp() keeps the window inside the page bounds: progress is 0
          // at the very top of the page and hits 100% while the panel is
          // still on screen, instead of pre-starting / finishing off-screen.
          start: 'clamp(top 80%)',
          end: 'clamp(bottom 88%)',
          scrub: 1,
        },
        defaults: { ease: 'none' },
      })

      scrub.fromTo('.v-belt', { opacity: 0.72 }, { opacity: 1, duration: 0.25 })
      const machines = ['.v-infeed', '.v-press', '.v-drive', '.v-robot', '.v-stack']
      machines.forEach((m, i) => {
        scrub.fromTo(m, { opacity: 0.72 }, { opacity: 1, duration: 0.25 }, i * 0.2)
      })
      scrub.fromTo('.v-panel', { opacity: 0.72 }, { opacity: 1, duration: 0.3 }, '>-0.1')
      fills.forEach((p, i) => {
        scrub.to(p, { strokeDashoffset: 0, duration: 0.5 }, 1.2 + i * 0.25)
      })

      // --- Ambient machine motion (runs once visible) -------------------
      gsap.set('.dyn', { opacity: 1 })

      // Boxes riding the belt
      gsap.utils.toArray<SVGGElement>('.box-mv').forEach((b, i) => {
        gsap.fromTo(
          b,
          { x: 0 },
          {
            x: 1040,
            duration: 18,
            delay: i * -4.5,
            repeat: -1,
            ease: 'none',
            modifiers: { x: (x) => `${((parseFloat(x) % 1040) + 1040) % 1040}px` },
          },
        )
      })

      // Infeed drops
      gsap.utils.toArray<SVGCircleElement>('.feed-drop').forEach((d, i) => {
        gsap.fromTo(
          d,
          { y: 0, opacity: 0 },
          { y: 58, opacity: 1, duration: 0.8, repeat: -1, delay: i * 0.27, ease: 'power1.in' },
        )
      })

      // Press cycle: rod extends out of the crown while the platen travels,
      // so the assembly stays visually connected at full stroke.
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.9, yoyo: true })
        .to('.ram-rod', {
          scaleY: (40 + 34) / 40,
          transformOrigin: '50% 0%',
          duration: 0.55,
          ease: 'power3.in',
        }, 0)
        .to('.ram-platen', { y: 34, duration: 0.55, ease: 'power3.in' }, 0)

      // Gears
      gsap.to('.gear-1', { rotation: 360, svgOrigin: '683 270', duration: 6, repeat: -1, ease: 'none' })
      gsap.to('.gear-2', { rotation: -360, svgOrigin: '717 292', duration: 4.2, repeat: -1, ease: 'none' })

      // Robot arm sway
      gsap.to('.arm', {
        rotation: 14,
        svgOrigin: '950 300',
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
      gsap.fromTo(
        '.forearm',
        { rotation: -12, svgOrigin: '950 232' },
        { rotation: 20, svgOrigin: '950 232', duration: 1.9, yoyo: true, repeat: -1, ease: 'sine.inOut' },
      )

      // Sensor pings
      gsap.utils.toArray<SVGCircleElement>('.ping').forEach((p, i) => {
        gsap.fromTo(
          p,
          { scale: 0.6, opacity: 0.9, transformOrigin: 'center' },
          { scale: 2.1, opacity: 0, duration: 1.6, repeat: -1, delay: i * 0.4, ease: 'power1.out' },
        )
      })

      // Status lamp
      gsap.to('.lamp', { opacity: 0.25, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' })

      // Steam off the drive stack
      gsap.utils.toArray<SVGCircleElement>('.steam').forEach((s, i) => {
        gsap.to(s, {
          keyframes: [
            { y: -14, opacity: 0.55, scale: 1.4, duration: 1.1, ease: 'power1.out' },
            { y: -34, opacity: 0, scale: 2, duration: 1.3, ease: 'power1.in' },
          ],
          transformOrigin: 'center',
          delay: i * 0.8,
          repeat: -1,
          repeatDelay: 0.2,
        })
      })

      // Dashboard bars breathing
      gsap.utils.toArray<SVGRectElement>('.bar').forEach((b, i) => {
        gsap.to(b, {
          scaleY: 0.55 + (i % 3) * 0.18,
          transformOrigin: 'bottom',
          duration: 1.2 + i * 0.23,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      })

      // Data packets up to the business systems panel
      ;['#df-1', '#df-2', '#df-3', '#df-4'].forEach((path, i) => {
        gsap.to(`#pkt-${i + 1}`, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
          duration: 3.4 - i * 0.4,
          delay: i * 0.8,
          repeat: -1,
          repeatDelay: 0.6,
          ease: 'power1.in',
        })
      })
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div class="console mes-panel" aria-label="Animated diagram of a generic production line streaming machine data into business systems">
    <div class="console-bar">
      <span class="console-dot dot-red"></span>
      <span class="console-dot dot-yellow"></span>
      <span class="console-dot dot-green"></span>
      <span class="console-title">plant floor → business systems</span>
      <span class="console-status"><span class="pulse"></span>LIVE</span>
    </div>

    <div class="mes-scroll">
      <svg
        class="mes-diagram"
        viewBox="0 0 1240 470"
        role="img"
        aria-label="A generic factory line — infeed hopper, press, drive gearbox, and robot arm over a conveyor — with sensor data streaming up into an enterprise resource planning (ERP) and analytics panel"
      >
        <!-- floor -->
        <line class="floor" x1="40" y1="392" x2="1200" y2="392" />

        <!-- BELT -->
        <g class="vessel v-belt">
          <rect x="60" y="330" width="1120" height="10" rx="5" />
          <rect x="100" y="340" width="10" height="46" />
          <rect x="400" y="340" width="10" height="46" />
          <rect x="640" y="340" width="10" height="46" />
          <rect x="880" y="340" width="10" height="46" />
          <rect x="1150" y="340" width="10" height="46" />
        </g>

        <!-- boxes riding the belt (outer g holds the static offset; GSAP
             animates x on the inner g, so the offset survives) -->
        <g transform="translate(84,304)">
          <g class="box box-mv dyn" opacity="0">
            <rect x="0" y="0" width="28" height="24" rx="3" />
            <line x1="0" y1="8" x2="28" y2="8" />
          </g>
        </g>
        <g transform="translate(84,304)">
          <g class="box box-mv dyn" opacity="0">
            <rect x="0" y="0" width="28" height="24" rx="3" />
            <line x1="0" y1="8" x2="28" y2="8" />
          </g>
        </g>
        <g transform="translate(84,304)">
          <g class="box box-mv dyn" opacity="0">
            <rect x="0" y="0" width="28" height="24" rx="3" />
            <line x1="0" y1="8" x2="28" y2="8" />
          </g>
        </g>
        <g transform="translate(84,304)">
          <g class="box box-mv dyn" opacity="0">
            <rect x="0" y="0" width="28" height="24" rx="3" />
            <line x1="0" y1="8" x2="28" y2="8" />
          </g>
        </g>

        <!-- INFEED -->
        <g class="vessel v-infeed">
          <line x1="136" y1="214" x2="136" y2="330" />
          <line x1="204" y1="214" x2="204" y2="330" />
          <path d="M130,190 H210 V214 L186,242 H154 L130,214 Z" />
          <rect x="162" y="242" width="16" height="16" rx="3" />
          <line x1="170" y1="190" x2="170" y2="170" />
          <circle class="feed-drop dyn" cx="170" cy="262" r="3" opacity="0" />
          <circle class="feed-drop dyn" cx="170" cy="262" r="3" opacity="0" />
          <circle class="feed-drop dyn" cx="170" cy="262" r="3" opacity="0" />
        </g>

        <!-- PRESS -->
        <g class="vessel v-press">
          <rect x="400" y="206" width="14" height="124" />
          <rect x="466" y="206" width="14" height="124" />
          <rect x="390" y="174" width="100" height="34" rx="5" />
          <circle cx="402" cy="191" r="2.5" />
          <circle cx="478" cy="191" r="2.5" />
          <rect x="428" y="152" width="24" height="22" rx="4" />
          <line x1="440" y1="152" x2="440" y2="144" />
          <rect class="ram-rod" x="433" y="208" width="14" height="40" />
          <rect class="ram-platen" x="406" y="248" width="68" height="20" rx="3" />
        </g>

        <!-- DRIVE -->
        <g class="vessel v-drive">
          <rect x="736" y="208" width="10" height="26" />
          <circle class="steam dyn" cx="741" cy="196" r="4" opacity="0" />
          <circle class="steam dyn" cx="741" cy="196" r="4" opacity="0" />
          <circle class="steam dyn" cx="741" cy="196" r="4" opacity="0" />
          <rect x="650" y="232" width="100" height="98" rx="10" />
          <g class="gear gear-1">
            <circle cx="683" cy="270" r="20" />
            <line x1="683" y1="250" x2="683" y2="290" /><line x1="663" y1="270" x2="703" y2="270" />
            <line x1="669" y1="256" x2="697" y2="284" /><line x1="697" y1="256" x2="669" y2="284" />
            <circle class="hub" cx="683" cy="270" r="5" />
          </g>
          <g class="gear gear-2">
            <circle cx="717" cy="292" r="14" />
            <line x1="717" y1="278" x2="717" y2="306" /><line x1="703" y1="292" x2="731" y2="292" />
            <line x1="707" y1="282" x2="727" y2="302" /><line x1="727" y1="282" x2="707" y2="302" />
            <circle class="hub" cx="717" cy="292" r="4" />
          </g>
          <circle class="lamp" cx="738" cy="246" r="4" />
          <line x1="700" y1="232" x2="700" y2="210" />
        </g>

        <!-- ROBOT -->
        <g class="vessel v-robot">
          <rect x="922" y="300" width="56" height="30" rx="6" />
          <g class="arm">
            <rect x="944" y="232" width="12" height="72" rx="6" />
            <circle cx="950" cy="300" r="7" />
            <g class="forearm">
              <rect x="884" y="226" width="66" height="12" rx="6" />
              <circle cx="950" cy="232" r="6" />
              <path d="M884,226 l-10,-8 M884,238 l-10,8" fill="none" />
            </g>
          </g>
          <line x1="978" y1="296" x2="978" y2="252" />
        </g>

        <!-- STACK -->
        <g class="vessel v-stack">
          <g class="box"><rect x="1100" y="306" width="28" height="24" rx="3" /><line x1="1100" y1="314" x2="1128" y2="314" /></g>
          <g class="box"><rect x="1132" y="306" width="28" height="24" rx="3" /><line x1="1132" y1="314" x2="1160" y2="314" /></g>
          <g class="box"><rect x="1116" y="282" width="28" height="24" rx="3" /><line x1="1116" y1="290" x2="1144" y2="290" /></g>
        </g>

        <!-- sensor pings -->
        <circle class="ping" cx="170" cy="166" r="4" />
        <circle class="ping" cx="440" cy="140" r="4" />
        <circle class="ping" cx="700" cy="206" r="4" />
        <circle class="ping" cx="978" cy="248" r="4" />

        <!-- data lines: dim base + bright scroll-drawn fill -->
        <path class="data-line" d="M170,166 C170,104 560,74 1008,90" />
        <path class="data-line" d="M440,140 C440,96 680,88 1008,112" />
        <path class="data-line" d="M700,206 C700,148 830,126 1008,134" />
        <path class="data-line" d="M978,248 C978,196 992,166 1008,154" />
        <path id="df-1" class="data-fill" d="M170,166 C170,104 560,74 1008,90" />
        <path id="df-2" class="data-fill" d="M440,140 C440,96 680,88 1008,112" />
        <path id="df-3" class="data-fill" d="M700,206 C700,148 830,126 1008,134" />
        <path id="df-4" class="data-fill" d="M978,248 C978,196 992,166 1008,154" />

        <!-- data packets -->
        <circle id="pkt-1" class="data-dot dyn" r="3.5" opacity="0" />
        <circle id="pkt-2" class="data-dot dyn" r="3.5" opacity="0" />
        <circle id="pkt-3" class="data-dot dyn" r="3.5" opacity="0" />
        <circle id="pkt-4" class="data-dot dyn" r="3.5" opacity="0" />

        <!-- BUSINESS SYSTEMS panel -->
        <g class="vessel v-panel">
          <text x="1098" y="44" class="bus-name" text-anchor="middle">BUSINESS SYSTEMS</text>
          <rect x="1008" y="56" width="180" height="114" rx="10" />
          <rect class="bar" x="1022" y="132" width="12" height="24" />
          <rect class="bar" x="1042" y="118" width="12" height="38" />
          <rect class="bar" x="1062" y="126" width="12" height="30" />
          <rect class="bar" x="1082" y="108" width="12" height="48" />
          <rect class="bar" x="1102" y="120" width="12" height="36" />
          <rect x="1128" y="96" width="44" height="52" />
          <ellipse cx="1150" cy="96" rx="22" ry="8" />
          <ellipse cx="1150" cy="148" rx="22" ry="8" />
        </g>
      </svg>
    </div>

    <div class="console-log mes-caption" aria-hidden="true">
      <div><span class="arrow">→</span> machine cycle detected · matching enterprise resource planning (ERP) transaction posted <span class="ok">automatically</span></div>
      <div><span class="arrow">→</span> production, inventory, and costing record themselves · <span class="ok">no manual entry</span></div>
    </div>
  </div>
</template>
