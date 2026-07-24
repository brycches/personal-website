<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
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
      .filter((r) => !r.fork)
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
    gsap.from('.repo-card', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#repo-grid', start: 'top 85%' },
    })
    ScrollTrigger.refresh()
  }
})
</script>

<template>
  <div id="repo-grid" class="repo-grid">
    <p v-if="loading" class="repo-loading">Fetching repositories…</p>
    <p v-else-if="failed" class="repo-error">
      Couldn’t reach the GitHub API — browse my work directly at
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
