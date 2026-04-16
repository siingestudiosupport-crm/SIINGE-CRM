<template>
  <div class="p-8 max-w-6xl mx-auto font-sans">
    <header class="mb-10">
      <h1 class="text-3xl font-bold text-gray-800">Contract Center</h1>
      <p class="text-gray-500 mt-2">Select the documents to prepare and the client.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="space-y-4">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 1: Document Types</h2>
        
        <label class="block p-6 rounded-xl border-2 cursor-pointer transition-all" :class="selection.types.includes('nda') ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'">
          <div class="flex items-center gap-4">
            <input type="checkbox" value="nda" v-model="selection.types" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
            <div>
              <h3 class="font-bold text-gray-800">Mutual NDA</h3>
              <p class="text-xs text-gray-500">Non-Disclosure Agreement</p>
            </div>
          </div>
        </label>

        <label class="block p-6 rounded-xl border-2 cursor-pointer transition-all" :class="selection.types.includes('sow') ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'">
          <div class="flex items-center gap-4">
            <input type="checkbox" value="sow" v-model="selection.types" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
            <div>
              <h3 class="font-bold text-gray-800">Scope of Work</h3>
              <p class="text-xs text-gray-500">SOW & Deliverables</p>
            </div>
          </div>
        </label>
      </div>

      <div class="lg:col-span-2 space-y-4">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 2: Recipient Details</h2>
        <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Select Client</label>
            <select v-model="selection.clientId" class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="" disabled>Search and select a client...</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
            </select>
          </div>

          <div class="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              @click="showEditor = true"
              :disabled="!selection.clientId || selection.types.length === 0"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue to Customization
            </button>
          </div>
        </div>
      </div>
    </div>

    <ContractEditor 
      v-if="showEditor"
      :selection="selection"
      @close="showEditor = false"
      @sent="handleSent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ContractEditor from '../components/ContractEditor.vue'

const clients = ref([])
const showEditor = ref(false)

const selection = ref({
  types: [], // Ahora es un arreglo para soportar múltiples selecciones
  clientId: ''
})

const fetchClients = async () => {
  const { data } = await supabase.from('clients').select('*').order('name')
  clients.value = data || []
}

const handleSent = () => {
  showEditor.value = false
  selection.value.types = []
  selection.value.clientId = ''
}

onMounted(fetchClients)
</script>