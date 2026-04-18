<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background: var(--paper);">
    <div class="w-full max-w-md" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 48px 40px;">

      <div class="text-center mb-10">
        <img src="../assets/siinge-logo.png" alt="SIINGE" style="height: 40px; margin: 0 auto 24px;" />
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 8px;">Welcome back.</h1>
        <p style="font-size: 13px; color: var(--ink-3); letter-spacing: 0.02em; margin: 0;">Internal CRM Access</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="admin@siinge.studio"
            style="width: 100%; box-sizing: border-box; padding: 11px 14px; background: var(--paper); border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 14px; color: var(--ink); outline: none; transition: border-color 120ms;"
            @focus="e => e.target.style.borderColor = 'var(--ink)'"
            @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
          />
        </div>

        <div>
          <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            style="width: 100%; box-sizing: border-box; padding: 11px 14px; background: var(--paper); border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 14px; color: var(--ink); outline: none; transition: border-color 120ms;"
            @focus="e => e.target.style.borderColor = 'var(--ink)'"
            @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
          />
        </div>

        <div v-if="error" style="font-size: 12px; font-weight: 600; color: var(--critical); background: var(--critical-soft); border: 1px solid var(--critical); border-radius: 2px; padding: 10px 14px;">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          style="width: 100%; height: 48px; background: var(--ink); color: var(--paper); font-family: var(--font-sans); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; border: none; border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
          :style="loading ? 'opacity: 0.5; cursor: not-allowed;' : ''"
          @mouseenter="e => !loading && (e.target.style.opacity = '0.85')"
          @mouseleave="e => !loading && (e.target.style.opacity = '1')"
        >
          {{ loading ? 'VERIFYING...' : 'SIGN IN' }}
        </button>
      </form>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--ink-5); text-align: center;">
        <p style="font-size: 10px; color: var(--ink-4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; margin: 0;">Authorized Personnel Only</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (authError) throw authError
  } catch (err) {
    error.value = 'Invalid credentials. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
