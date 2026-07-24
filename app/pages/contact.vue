<script setup lang="ts">
useHead({
  title: 'Contact — Bryce Chesley',
  meta: [
    {
      name: 'description',
      content: 'Get in touch with Bryce Chesley — email, LinkedIn, or GitHub.',
    },
  ],
})

usePageFx()
</script>

<template>
  <main>
    <section class="section page-head">
      <h1 class="endpoint reveal"><span class="method method-post">POST</span> /contact</h1>
    </section>

    <section class="section contact">
      <p class="contact-lede reveal">
        I like building software that a real operation depends on. If you're hiring —
        or just want to talk shop — my inbox is open.
      </p>
      <div class="hero-actions reveal">
        <a class="btn btn-solid" href="mailto:brycches@gmail.com">brycches@gmail.com</a>
        <a class="btn btn-ghost" href="https://www.linkedin.com/in/bryce-chesley-43546915b" target="_blank" rel="noopener">LinkedIn</a>
        <a class="btn btn-ghost" href="https://github.com/brycches" target="_blank" rel="noopener">GitHub</a>
      </div>
      <div class="contact-flex">
        <dl class="contact-rows reveal">
          <div class="contact-row">
            <dt>location</dt>
            <dd>Idaho — Mountain Time · open to Boise &amp; remote</dd>
          </div>
          <div class="contact-row">
            <dt>best for</dt>
            <dd>Full-stack product work, ERP/NetSuite integrations, manufacturing systems</dd>
          </div>
          <div class="contact-row">
            <dt>response</dt>
            <dd>Usually within a day</dd>
          </div>
        </dl>
        <div class="gauge-cluster reveal">
          <GaugeDial :value="92" label="response time" display="&lt;24h" />
          <GaugeDial :value="99" label="uptime mindset" display="99.9%" />
        </div>
      </div>
    </section>
  </main>
</template>
