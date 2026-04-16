<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
      
      <div class="text-center mb-10">
        <h1 class="text-2xl font-bold tracking-tighter uppercase text-black">Siinge Studio</h1>
        <p class="text-xs text-gray-400 font-medium mt-1 tracking-widest uppercase text-center">Internal CRM Access</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            required
            placeholder="admin@siinge.studio"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all text-sm bg-gray-50/50"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all text-sm bg-gray-50/50"
          />
        </div>

        <div v-if="error" class="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all text-sm shadow-lg disabled:opacity-50"
        >
          {{ loading ? 'VERIFYING...' : 'SIGN IN' }}
        </button>
      </form>

      <div class="mt-8 pt-8 border-t border-gray-50 text-center">
        <p class="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Authorized Personnel Only</p>
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