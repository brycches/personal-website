<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Repo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  Shell: '#89e051',
}

const repos = ref<Repo[]>([])
const loading = ref(true)
const failed = ref(false)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/users/brycches/repos?sort=pushed&per_page=100')
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const data: Repo[] = await res.json()
    repos.value = data
      .filter((r) => !r.fork && r.name !== 'brycches')
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 6)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion && repos.value.length) {
    gsap.registerPlugin(ScrollTrigger)
    await nextTick()
    ctx = gsap.context(() => {
      gsap.from('.repo-card', {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#repo-grid', start: 'top 85%' },
      })
    })
    ScrollTrigger.refresh()
  }
})

let ctx: gsap.Context | undefined

onBeforeUnmount(() => {
  ctx?.revert()
})
</script>

<template>
  <div id="repo-grid" class="repo-grid">
    <p v-if="loading" class="repo-loading">
      <svg class="gear-spin" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5" />
        <line x1="10" y1="0.5" x2="10" y2="4.5" stroke="currentColor" stroke-width="1.8" />
        <line x1="10" y1="15.5" x2="10" y2="19.5" stroke="currentColor" stroke-width="1.8" />
        <line x1="0.5" y1="10" x2="4.5" y2="10" stroke="currentColor" stroke-width="1.8" />
        <line x1="15.5" y1="10" x2="19.5" y2="10" stroke="currentColor" stroke-width="1.8" />
        <line x1="3.3" y1="3.3" x2="6.1" y2="6.1" stroke="currentColor" stroke-width="1.8" />
        <line x1="13.9" y1="13.9" x2="16.7" y2="16.7" stroke="currentColor" stroke-width="1.8" />
        <line x1="16.7" y1="3.3" x2="13.9" y2="6.1" stroke="currentColor" stroke-width="1.8" />
        <line x1="6.1" y1="13.9" x2="3.3" y2="16.7" stroke="currentColor" stroke-width="1.8" />
        <circle cx="10" cy="10" r="2.2" fill="currentColor" />
      </svg>
      Fetching repositories…
    </p>
    <p v-else-if="failed" class="repo-error">
      Couldn’t reach the GitHub application programming interface (API) — browse my work directly at
      <a href="https://github.com/brycches" target="_blank" rel="noopener">github.com/brycches</a>.
    </p>
    <template v-else>
      <a
        v-for="repo in repos"
        :key="repo.name"
        class="repo-card"
        :href="repo.html_url"
        target="_blank"
        rel="noopener"
      >
        <div class="repo-name">{{ repo.name }}</div>
        <div class="repo-desc">{{ repo.description || 'No description yet.' }}</div>
        <div class="repo-meta">
          <span v-if="repo.language">
            <span class="lang-dot" :style="{ background: LANG_COLORS[repo.language] || '#8b949e' }"></span>{{ repo.language }}
          </span>
          <span v-if="repo.stargazers_count > 0">★ {{ repo.stargazers_count }}</span>
          <span>updated {{ formatDate(repo.pushed_at) }}</span>
        </div>
      </a>
    </template>
  </div>
</template>
