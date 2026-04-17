<template>
  <div class="antialiased font-sans">
    <Login v-if="!session" />

    <div v-else>
      <router-view />
      
      <button 
        @click="handleSignOut" 
        class="fixed bottom-4 left-4 z-50 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
      >
        Sign Out
      </button>
    </div>

    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import { useConfirmModal } from './composables/useConfirmModal'
import Login from './components/Login.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const session = ref(null)
const confirmModal = ref(null)
const { setModalInstance } = useConfirmModal()

onMounted(() => {
  // Initialize confirm modal
  if (confirmModal.value) {
    setModalInstance(confirmModal.value)
  }
  
  // Verify current session
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // Escuchamos cambios de auth
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
  })
})

const handleSignOut = async () => {
  await supabase.auth.signOut()
}
</script>