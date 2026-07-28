<script setup lang="ts">
defineProps<{ title: string; lit?: boolean }>()
</script>

<template>
  <section class="panel" :class="{ 'panel--lit': lit }">
    <header class="panel__head">{{ title }}</header>
    <div class="panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: var(--ops-bg1);
  border: 1px solid var(--ops-line);
}

.panel--lit {
  border-color: var(--ops-accent);
}

.panel__head {
  padding: 8px 12px;
  border-bottom: 1px solid var(--ops-line);
  color: var(--ops-dim);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.panel--lit .panel__head {
  color: var(--ops-accent-hot);
}

.panel__body {
  padding: 12px;
}
</style>
