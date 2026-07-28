<script setup lang="ts">
definePageMeta({ layout: 'ops', middleware: 'ops-auth' })
// Sessions IS the console — land there.
await navigateTo('/ops/sessions', { replace: true })
</script>

<template>
  <div />
</template>
