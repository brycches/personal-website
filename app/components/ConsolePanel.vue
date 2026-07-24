<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

const LOG_LINES = [
  '<span class="arrow">→</span> POST /work-orders <span class="ok">201 created</span>',
  '<span class="arrow">→</span> item receipt synced to NetSuite <span class="ok">ok</span>',
  '<span class="arrow">→</span> backflush job complete · 84 tx today <span class="ok">ok</span>',
  '<span class="arrow">→</span> GET /lot-traceability?lot=A2210 <span class="ok">200</span>',
  '<span class="arrow">→</span> bin transfer B-14 → C-02 <span class="ok">ok</span>',
  '<span class="arrow">→</span> QC release · batch 0847 <span class="ok">approved</span>',
  '<span class="arrow">→</span> inventory adjustment posted <span class="ok">ok</span>',
  '<span class="arrow">→</span> fulfillment #10382 dispatched <span class="ok">ok</span>',
]

const logEl = ref<HTMLElement | null>(null)
let logIndex = 0
let ticker: ReturnType<typeof setInterval> | null = null
let ctx: gsap.Context | undefined

function pushLogLine(animate: boolean) {
  const el = logEl.value
  if (!el) return
  const line = document.createElement('div')
  line.innerHTML = LOG_LINES[logIndex % LOG_LINES.length] as string
  logIndex++
  el.appendChild(line)
  while (el.children.length > 3) el.removeChild(el.firstChild as Node)
  if (animate) gsap.from(line, { opacity: 0, y: 8, duration: 0.35, ease: 'power1.out' })
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Seed a few lines immediately so the panel never looks empty
  pushLogLine(false)
  pushLogLine(false)
  pushLogLine(false)

  if (reduceMotion) return

  gsap.registerPlugin(MotionPathPlugin)

  // Defer console animations until the tab is visible so the wire-draw and
  // packet loops don't crawl through their timelines in a background tab.
  whenVisible(() => {
    ctx = gsap.context(() => {
    ticker = setInterval(() => pushLogLine(true), 2600)

    // Draw the wires, then pop the nodes in
    gsap
      .timeline({ delay: 0.9 })
      .from('.wire', {
        strokeDasharray: (_i: number, el: SVGPathElement) => {
          const l = el.getTotalLength()
          return `${l} ${l}`
        },
        strokeDashoffset: (_i: number, el: SVGPathElement) => el.getTotalLength(),
        duration: 0.9,
        stagger: 0.1,
        ease: 'power2.inOut',
      })
      .from(
        '.node',
        { opacity: 0, scale: 0.92, transformOrigin: 'center', duration: 0.4, stagger: 0.08 },
        '-=0.8',
      )

    // Data packets flowing through the integration diagram
    const ROUTES = [
      { packet: '#pk-1', path: '#p-ui-api', dur: 1.4, delay: 0.0 },
      { packet: '#pk-2', path: '#p-api-ns', dur: 1.6, delay: 0.9 },
      { packet: '#pk-3', path: '#p-api-sql', dur: 1.5, delay: 1.7 },
      { packet: '#pk-4', path: '#p-api-wh', dur: 1.6, delay: 2.4 },
    ]

    ROUTES.forEach((r) => {
      gsap
        .timeline({ repeat: -1, delay: 1.8 + r.delay, repeatDelay: 1.2 })
        .set(r.packet, { opacity: 1 })
        .to(r.packet, {
          motionPath: { path: r.path, align: r.path, alignOrigin: [0.5, 0.5] },
          duration: r.dur,
          ease: 'power1.inOut',
        })
        .to(r.packet, { opacity: 0, duration: 0.2 }, '-=0.1')
    })
    })
  })
})

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
  ctx?.revert()
})
</script>

<template>
  <div class="console" aria-label="Animated diagram of the operations platform">
    <div class="console-bar">
      <span class="console-dot dot-red"></span>
      <span class="console-dot dot-yellow"></span>
      <span class="console-dot dot-green"></span>
      <span class="console-title">ops platform · production</span>
      <span class="console-status"><span class="pulse"></span>LIVE</span>
    </div>

    <svg
      class="diagram"
      viewBox="0 0 640 320"
      role="img"
      aria-label="Data flows from the Vue operator interface through seven Node.js services into NetSuite, SQL Server, and warehouse floor workflows"
    >
      <path id="p-ui-api" class="wire" d="M150,160 C 210,160 220,160 268,160" />
      <path id="p-api-ns" class="wire" d="M382,120 C 440,90 460,72 500,66" />
      <path id="p-api-sql" class="wire" d="M382,160 C 440,160 460,160 500,160" />
      <path id="p-api-wh" class="wire" d="M382,200 C 440,230 460,248 500,254" />

      <g class="node" id="n-ui">
        <rect x="30" y="120" width="120" height="80" rx="10" />
        <text x="90" y="152" class="node-title" text-anchor="middle">Operator UI</text>
        <text x="90" y="176" class="node-sub" text-anchor="middle">Vue 3 · Pinia</text>
      </g>
      <g class="node" id="n-api">
        <rect x="268" y="104" width="114" height="112" rx="10" />
        <text x="325" y="138" class="node-title" text-anchor="middle">7 services</text>
        <text x="325" y="162" class="node-sub" text-anchor="middle">Node.js</text>
        <text x="325" y="184" class="node-sub" text-anchor="middle">Express · PM2</text>
      </g>
      <g class="node" id="n-ns">
        <rect x="500" y="36" width="112" height="60" rx="10" />
        <text x="556" y="62" class="node-title" text-anchor="middle">NetSuite</text>
        <text x="556" y="82" class="node-sub" text-anchor="middle">OAuth 1.0a</text>
      </g>
      <g class="node" id="n-sql">
        <rect x="500" y="130" width="112" height="60" rx="10" />
        <text x="556" y="156" class="node-title" text-anchor="middle">SQL Server</text>
        <text x="556" y="176" class="node-sub" text-anchor="middle">SuiteQL</text>
      </g>
      <g class="node" id="n-wh">
        <rect x="500" y="224" width="112" height="60" rx="10" />
        <text x="556" y="250" class="node-title" text-anchor="middle">Warehouse</text>
        <text x="556" y="270" class="node-sub" text-anchor="middle">RF workflows</text>
      </g>

      <circle class="packet" id="pk-1" r="4" />
      <circle class="packet" id="pk-2" r="4" />
      <circle class="packet" id="pk-3" r="4" />
      <circle class="packet" id="pk-4" r="4" />
    </svg>

    <div ref="logEl" class="console-log" aria-hidden="true"></div>
  </div>
</template>
