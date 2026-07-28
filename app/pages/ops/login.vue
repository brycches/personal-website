<script setup lang="ts">
definePageMeta({ layout: 'ops' })

useHead({ title: 'RESTRICTED // OPS ACCESS' })

const password = ref('')
const busy = ref(false)
const denied = ref(false)
const message = ref('')
const attempt = ref(0)

async function submit() {
  if (busy.value) return
  busy.value = true
  denied.value = false
  try {
    await $fetch('/api/ops/login', {
      method: 'POST',
      body: { password: password.value },
    })
    await navigateTo('/ops/sessions')
  } catch (err) {
    const statusCode = (err as { statusCode?: number } | null)?.statusCode
    message.value =
      statusCode === 429
        ? 'RATE LIMITED // HOLD 60S'
        : statusCode === 503
          ? 'ADMIN DISABLED'
          : 'ACCESS DENIED'
    denied.value = true
    attempt.value++
    password.value = ''
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="login">
    <div :key="attempt" class="login__box" :class="{ 'login__box--shake': attempt > 0 }">
      <OpsPanel title="RESTRICTED // OPS ACCESS">
        <form class="login__form" @submit.prevent="submit">
          <label class="login__label" for="ops-password">PASSPHRASE</label>
          <input
            id="ops-password"
            v-model="password"
            class="login__input"
            type="password"
            autocomplete="current-password"
            autofocus
            spellcheck="false"
          >
          <button class="login__submit" type="submit" :disabled="busy">
            {{ busy ? '... VERIFYING' : 'AUTHENTICATE' }}
          </button>
          <p v-if="denied" class="login__denied" role="alert">{{ message }}</p>
          <p v-else class="login__hint">UNAUTHORIZED ACCESS IS LOGGED</p>
        </form>
      </OpsPanel>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 44px - 96px);
}

.login__box {
  width: min(360px, 100%);
}

.login__box--shake {
  animation: login-shake 0.35s linear;
}

@keyframes login-shake {
  10% { transform: translateX(-7px); }
  30% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  70% { transform: translateX(3px); }
  90% { transform: translateX(-1px); }
}

@media (prefers-reduced-motion: reduce) {
  .login__box--shake {
    animation: none;
  }
}

.login__form {
  display: grid;
  gap: 8px;
  padding-top: 8px;
}

.login__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ops-dim);
}

.login__input {
  font: inherit;
  color: var(--ops-text);
  background: var(--ops-bg0);
  border: 1px solid var(--ops-line-lit);
  padding: 8px;
  letter-spacing: 0.3em;
}

.login__input:focus {
  outline: none;
  border-color: var(--ops-accent-hot);
}

.login__submit {
  margin-top: 4px;
  padding: 8px;
  border: 1px solid var(--ops-accent);
  color: var(--ops-accent-hot);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: background 0.2s, color 0.2s;
}

.login__submit:hover:not(:disabled) {
  background: var(--ops-accent);
  color: #fff;
}

.login__submit:disabled {
  opacity: 0.5;
  cursor: default;
}

.login__denied {
  color: var(--ops-red);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-align: center;
}

.login__hint {
  color: var(--ops-faint);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-align: center;
}
</style>
