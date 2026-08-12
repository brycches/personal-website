<script setup>
const theme = ref(null)

const isDark = () =>
  document.documentElement.dataset.theme === 'dark' ||
  (document.documentElement.dataset.theme !== 'light' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches)

onMounted(() => {
  theme.value = isDark() ? 'dark' : 'light'
})

function toggleTheme() {
  const next = isDark() ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {}
  theme.value = next
  // Keep the mobile browser chrome color in sync with the override.
  const color = next === 'dark' ? '#131C24' : '#EFF1EC'
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', color))
}
</script>

<template>
  <footer class="site-footer">
    <span>© 2026 Bryce Chesley
      <button
        v-if="theme"
        class="theme-toggle"
        type="button"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        @click="toggleTheme"
      >{{ theme === 'dark' ? '☀ light' : '☾ dark' }}</button>
    </span>
    <nav class="footer-nav" aria-label="Footer">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/experience">Experience</NuxtLink>
      <NuxtLink to="/systems">Systems</NuxtLink>
      <NuxtLink to="/mes">MES</NuxtLink>
      <NuxtLink to="/projects">Projects</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </nav>
    <span class="footer-mono">built with Nuxt + GSAP · <a href="https://fobech.com" target="_blank" rel="noopener">fobech.com</a></span>
  </footer>
</template>
