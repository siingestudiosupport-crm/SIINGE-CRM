<template>
  <div class="antialiased font-sans">
    <Login v-if="!session" />

    <div v-else class="min-h-screen bg-white">
      <header class="border-b border-gray-100 px-8 py-4 flex justify-between items-center bg-white sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <span class="font-black text-lg tracking-tighter">SIINGE CRM</span>
          <span class="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-100">LIVE</span>
        </div>
        
        <div class="flex items-center gap-6">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            Logged as: {{ session.user.email }}
          </span>
          <button @click="handleSignOut" class="text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main>
        <ClientDashboard /> 
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import Login from './components/Login.vue'
import ClientDashboard from './components/ClientDashboard.vue' // Asegúrate de que el nombre coincida con tu archivo de la tabla

const session = ref(null)

onMounted(() => {
  // 1. Revisar si ya hay una sesión al cargar
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // 2. Escuchar cambios (login/logout)
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
  })
})

const handleSignOut = async () => {
  await supabase.auth.signOut()
}
</script>