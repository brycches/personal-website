<script setup lang="ts">
useHead({
  title: 'Projects — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content: 'Public GitHub repositories by Bryce Chesley, pulled live from the GitHub API.',
    },
  ],
})

usePageFx()
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method">GET</span> /projects</h1>
      <p class="section-note reveal">
        Pulled live from
        <a href="https://github.com/brycches" target="_blank" rel="noopener">github.com/brycches</a>.
        The production systems I build at work live in a private org — those are on the
        <NuxtLink to="/systems">systems page</NuxtLink>.
      </p>
    </section>

    <section class="section">
      <div class="feature-grid">
        <a class="feature-card reveal" href="https://demo.fobech.com" target="_blank" rel="noopener">
          <span class="feature-tag">fobech · live demo</span>
          <h3>Walk through a working MES</h3>
          <p>
            An interactive manufacturing demo from my company, Fobech — work orders,
            lot traceability, QC, and a live Andon board running on synthetic data.
            Click anything; it's built to be poked.
          </p>
          <span class="feature-more">open demo.fobech.com →</span>
        </a>
      </div>
    </section>

    <section class="section contact">
      <RepoGrid />
    </section>
  </main>
</template>
