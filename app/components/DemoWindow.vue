<script setup lang="ts">
import { ref } from 'vue'

const loaded = ref(false)
</script>

<template>
  <div class="console demo-window reveal">
    <div class="console-bar">
      <span class="console-dot dot-red"></span>
      <span class="console-dot dot-yellow"></span>
      <span class="console-dot dot-green"></span>
      <span class="console-title">demo.fobech.com · live sandbox</span>
      <span class="console-status"><span class="pulse"></span>LIVE</span>
    </div>

    <div v-if="!loaded" class="demo-cover">
      <span class="feature-tag">fobech · live demo</span>
      <h3>Walk through a working MES</h3>
      <p>
        An interactive manufacturing demo from my company, Fobech — work orders, lot
        traceability, QC, and a live Andon board running on synthetic data. Click
        anything; it's built to be poked.
      </p>
      <div class="demo-actions">
        <button class="btn btn-solid" type="button" @click="loaded = true">Load the live demo</button>
        <a class="btn btn-ghost demo-newtab" href="https://demo.fobech.com" target="_blank" rel="noopener">Open in a new tab</a>
      </div>
    </div>

    <template v-else>
      <iframe
        class="demo-frame"
        src="https://demo.fobech.com/?embed=1"
        title="Fobech MES live demo"
        loading="lazy"
      ></iframe>
      <div class="console-log demo-foot" aria-hidden="true">
        <div>
          <span class="arrow">→</span> running live in this window ·
          <a href="https://demo.fobech.com" target="_blank" rel="noopener">open full size</a>
          <span class="ok"> ok</span>
        </div>
      </div>
    </template>
  </div>
</template>
