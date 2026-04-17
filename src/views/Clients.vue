<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full relative">
    
    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Clients Directory</h1>
        <p class="text-gray-500 text-sm mt-1">Manage your leads and active clients.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
      >
        + Add Client
      </button>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-500">
      Loading clients...
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
            <th class="p-4 font-semibold">Name & Contact</th>
            <th class="p-4 font-semibold">Company</th>
            <th class="p-4 font-semibold">Contracts</th>
            <th class="p-4 font-semibold">Join Date</th>
            <th class="p-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="clients.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">No clients registered yet.</td>
          </tr>
          
          <tr v-for="client in clients" :key="client.id" 
              @click="openClientDetail(client)"
              class="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer group">
            <td class="p-4">
              <div class="font-bold text-gray-800 group-hover:text-blue-600">{{ client.name }}</div>
              <div class="text-xs text-gray-400 font-medium">{{ client.email }}</div>
              <div v-if="client.phone_number" class="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5 font-medium bg-gray-50 border border-gray-100 w-max px-2 py-0.5 rounded-md">
                <span v-if="client.country">{{ client.country }}</span>
                <span v-if="client.country" class="text-gray-300">|</span>
                <span>📞 {{ client.phone_number }}</span>
              </div>
            </td>
            <td class="p-4 text-gray-600 text-sm">
              {{ client.company || 'N/A' }}
              <div v-if="client.investment_level && client.investment_level !== 'No especificado'" class="text-xs text-green-600 mt-1 font-semibold flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Strategy Call
              </div>
            </td>
            
            <td class="p-4">
              <div class="flex flex-col gap-1">
                <span v-if="client.nda_status" :class="['text-[8px] px-1.5 py-0.5 rounded font-bold uppercase w-max', getStatusClass(client.nda_status)]">
                  NDA: {{ client.nda_status }}
                </span>
                <span v-if="client.sow_status" :class="['text-[8px] px-1.5 py-0.5 rounded font-bold uppercase w-max', getStatusClass(client.sow_status)]">
                  SOW: {{ client.sow_status }}
                </span>
              </div>
            </td>

            <td class="p-4 text-gray-500 text-xs">
              {{ new Date(client.created_at).toLocaleDateString() }}
            </td>
            
            <td class="p-4 text-center">
              <div class="flex justify-center gap-2" @click.stop>
                <button @click="openModal(client)" class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button @click="confirmDelete(client)" class="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden animate-slide-up my-8">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">{{ editingId ? 'Edit Client' : 'New Client' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        
        <form @submit.prevent="saveClient" class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input v-model="form.name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input v-model="form.email" type="email" required class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
              <input v-model="form.company" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <input v-model="form.phone_number" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="+1 234 567 8900" />
            </div>

            <div class="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h4 class="text-sm font-bold text-gray-800 mb-4">Strategy Call Details</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 md:col-span-1">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Stage</label>
                  <input v-model="form.brand_stage" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Investment Level</label>
                  <input v-model="form.investment_level" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Timeline</label>
                  <input v-model="form.development_timeline" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Support Level</label>
                  <input v-model="form.support_level" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Issue / Need</label>
                  <textarea v-model="form.primary_issue" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ProjectDetail 
      v-if="selectedProject"
      :is-open="isDetailOpen" 
      :project="selectedProject" 
      @close="isDetailOpen = false"
      @updated="fetchClients"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import ProjectDetail from '../components/ProjectDetail.vue'

const { confirm: showConfirm, alert: showAlert } = useConfirmModal() 

const clients = ref([])
const loading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const editingId = ref(null)

const isDetailOpen = ref(false)
const selectedProject = ref(null)

const form = ref({ 
  name: '', email: '', company: '', phone_number: '', country: '', lead_source: 'Manual Entry',
  brand_stage: '', investment_level: '', development_timeline: '', support_level: '', primary_issue: ''
})

const getStatusClass = (status) => {
  if (status === 'Signed') return 'bg-green-100 text-green-700 border border-green-200'
  if (status === 'Sent') return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-gray-100 text-gray-700 border border-gray-200'
}

const fetchClients = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) throw error
    clients.value = data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openClientDetail = (client) => {
  selectedProject.value = {
    id: null,
    title: `Client Profile: ${client.name}`,
    client: client,
    client_id: client.id,
    pipeline_stage: 'Directory View',
    created_at: client.created_at,
    scheduled_date: client.scheduled_date, 
    meeting_link: client.meeting_link      
  }
  isDetailOpen.value = true
}

const openModal = (client = null) => {
  if (client) {
    editingId.value = client.id
    form.value = { ...client }
  } else {
    editingId.value = null
    form.value = { 
      name: '', email: '', company: '', phone_number: '', country: '', lead_source: 'Manual Entry',
      brand_stage: '', investment_level: '', development_timeline: '', support_level: '', primary_issue: '' 
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveClient = async () => {
  try {
    isSubmitting.value = true
    if (editingId.value) {
      const { error } = await supabase.from('clients').update(form.value).eq('id', editingId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('clients').insert([form.value])
      if (error) throw error
    }
    closeModal()
    fetchClients()
  } catch (err) { 
    await showAlert(err.message, 'Error')
  } finally { isSubmitting.value = false }
}

const confirmDelete = async (client) => {
  const confirmed = await showConfirm({
    title: 'Delete Client',
    message: `Are you sure you want to delete ${client.name}? This will also delete all their projects and signed contracts.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (confirmed) {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id)
      if (error) throw error
      fetchClients()
    } catch (err) { 
      await showAlert(err.message, 'Error')
    }
  }
}

onMounted(fetchClients)
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>