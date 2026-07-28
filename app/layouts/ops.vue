<script setup lang="ts">
const route = useRoute()

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

async function logout() {
  try {
    await $fetch('/api/ops/logout', { method: 'POST' })
  } catch {
    // even if the call fails, fall through to the login screen
  }
  await navigateTo('/ops/login')
}
</script>

<template>
  <!-- rr-block: never let a replay record the ops console itself -->
  <div class="ops rr-block">
    <header class="ops-strip">
      <span class="ops-strip__id">
        <span class="ops-strip__lamp" aria-hidden="true" />
        BRYCECHESLEY.COM // OPS CONSOLE
      </span>
      <nav class="ops-strip__nav" aria-label="Ops console">
        <NuxtLink
          to="/ops/sessions"
          class="ops-strip__link"
          :class="{ 'ops-strip__link--on': route.path.startsWith('/ops/sessions') }"
        >
          SESSIONS
        </NuxtLink>
        <NuxtLink to="/" class="ops-strip__link">VIEW SITE</NuxtLink>
        <button type="button" class="ops-strip__link ops-strip__logout" @click="logout">
          LOGOUT
        </button>
      </nav>
    </header>

    <main class="ops-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.ops {
  /* local console tokens, derived from the site palette */
  --ops-bg0: #0A1116;
  --ops-bg1: #0E171E;
  --ops-bg2: #131F28;
  --ops-line: #24333D;
  --ops-line-lit: #364854;
  --ops-text: #B9C6CE;
  --ops-dim: #7C8B94;
  --ops-faint: #55636C;
  --ops-accent: #E85D1F;
  --ops-accent-hot: #FF7A3C;
  --ops-ok: #46B06E;
  --ops-amber: #E8A23D;
  --ops-red: #E05252;

  min-height: 100vh;
  background: var(--ops-bg0);
  color: var(--ops-text);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 13px;
}

.ops :deep(a) {
  text-decoration: none;
}

.ops :deep(button) {
  font: inherit;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
}

.ops-strip {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 44px;
  padding: 0 16px;
  background: var(--ops-bg1);
  border-bottom: 1px solid var(--ops-line);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.ops-strip__id {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ops-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ops-strip__lamp {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ops-ok);
  box-shadow: 0 0 6px var(--ops-ok);
}

.ops-strip__nav {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: none;
}

.ops-strip__link {
  color: var(--ops-dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ops-strip__link:hover {
  color: var(--ops-accent-hot);
}

.ops-strip__link--on {
  color: var(--ops-accent-hot);
}

.ops-strip__logout {
  color: var(--ops-amber);
}

.ops-strip__logout:hover {
  color: var(--ops-red);
}

.ops-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
</style>
