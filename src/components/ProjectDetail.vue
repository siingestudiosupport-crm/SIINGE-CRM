<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-end justify-end">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div class="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-slide-in">
      
      <div class="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ project?.title || 'Project Detail' }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-sm text-blue-600 font-bold">{{ project?.client?.name || 'Unknown Client' }}</p>
            <span v-if="project?.client?.client_tier" :class="['text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border', getTierClass(project.client.client_tier)]">
              {{ project.client.client_tier }}
            </span>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-800 text-2xl leading-none">&times;</button>
      </div>

      <div class="flex border-b border-gray-200 px-6 bg-gray-50">
        <button 
          @click="activeTab = 'Overview'"
          :class="['py-3 mr-6 text-sm font-bold transition-colors border-b-2', 
                   activeTab === 'Overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
        >
          Overview
        </button>
        <button 
          @click="activeTab = 'Contracts'"
          :class="['py-3 text-sm font-bold transition-colors border-b-2', 
                   activeTab === 'Contracts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
        >
          Contracts & SOW
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 bg-white" v-if="project">
        
        <div v-if="activeTab === 'Overview'" class="space-y-6">
          
          <section v-if="suggestedAction" class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
            <div class="flex items-start gap-3">
              <span class="text-xl">🔔</span>
              <div>
                <p class="text-[10px] font-black text-amber-700 uppercase tracking-widest">Suggested Action</p>
                <p class="text-sm text-amber-900 font-bold">{{ suggestedAction.title }}</p>
                <p class="text-xs text-amber-700 mt-1 italic">{{ suggestedAction.desc }}</p>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Pipeline Stage</label>
              <select v-model="project.pipeline_stage" @change="updateOverview" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800">
                <option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Proposal Value</label>
              <div class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <span class="text-gray-500 mr-1 font-bold">$</span>
                <input v-model="project.proposal_value" @blur="updateOverview" type="number" class="w-full bg-transparent border-none p-2.5 outline-none text-sm font-bold text-gray-800" placeholder="0.00" />
              </div>
            </div>
          </section>

          <section v-if="project.pipeline_stage === 'Churn'" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <label class="block text-xs font-bold text-red-700 uppercase mb-2">Reason for Loss (Required)</label>
            <select v-model="project.loss_reason" @change="updateOverview" class="w-full border border-red-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none text-red-900 font-bold">
              <option value="" disabled>Select a reason...</option>
              <option value="Too expensive">Too expensive</option>
              <option value="Timeline mismatch">Timeline mismatch</option>
              <option value="Not ready">Not ready</option>
              <option value="Ghosted">Ghosted</option>
              <option value="Other">Other</option>
            </select>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Meeting Date</p>
              <p class="font-medium text-gray-800 text-sm">
                {{ project.scheduled_date ? new Date(project.scheduled_date).toLocaleString() : 'Not scheduled' }}
              </p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Client Tier</p>
              <select v-if="project.client" v-model="project.client.client_tier" @change="updateClientTier" class="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer outline-none">
                <option value="Early-stage">Early-stage</option>
                <option value="Established">Established</option>
                <option value="High-value">High-value</option>
              </select>
              <p v-else class="text-xs text-gray-400">No client data</p>
            </div>
          </section>

          <section v-if="timeToClose" class="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <div>
              <p class="text-[10px] font-bold text-green-700 uppercase">Time to Close</p>
              <p class="text-xs text-green-600 mt-0.5">From creation to signature</p>
            </div>
            <span class="text-2xl font-black text-green-800">{{ timeToClose }} Days</span>
          </section>

          <section>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Internal Notes</label>
            <textarea 
              v-model="project.internal_notes" 
              @blur="updateOverview"
              placeholder="Private notes about this client/project..."
              class="w-full border border-gray-300 rounded-lg p-3 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </section>
        </div>

        <div v-if="activeTab === 'Contracts'" class="space-y-6">
          
          <template v-if="project?.client">
            <div class="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h3 class="font-bold text-gray-800">Non-Disclosure Agreement</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Standard NDA for client onboarding.</p>
                </div>
                <span :class="getStatusClass(project.client.nda_status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                  {{ project.client.nda_status || 'Not Sent' }}
                </span>
              </div>
              <button v-if="project.client.nda_status !== 'Signed'" @click="openEmailEditor('nda')" class="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm">
                Prepare & Send NDA
              </button>

              <div v-if="project.client.nda_status" class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Document History</p>
                <ul class="text-xs space-y-1.5 text-gray-600 font-medium">
                  <li v-if="project.client.nda_sent_date" class="flex justify-between"><span>📤 Sent:</span> <span>{{ formatDate(project.client.nda_sent_date) }}</span></li>
                  <li v-if="project.client.nda_opened_at" class="flex justify-between"><span>👀 Opened:</span> <span>{{ formatDate(project.client.nda_opened_at) }}</span></li>
                  <li v-if="project.client.nda_signed_date" class="flex justify-between text-green-600"><span>✅ Signed:</span> <span>{{ formatDate(project.client.nda_signed_date) }}</span></li>
                </ul>
                <button 
                  v-if="project.client.nda_pdf_path" 
                  @click="downloadFromVault(project.client.nda_pdf_path)" 
                  class="mt-4 w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Official PDF
                </button>
              </div>
            </div>

            <div class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <h3 class="font-bold text-gray-800">Scope of Work (SOW)</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Customize contract terms before sending.</p>
                </div>
                <span :class="getStatusClass(project.client.sow_status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                  {{ project.client.sow_status || 'Not Sent' }}
                </span>
              </div>

              <div v-if="project.client.sow_status !== 'Signed'" class="space-y-5">
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Deliverables (Section 2)</label>
                  <textarea 
                    v-model="project.client.sow_deliverables" 
                    rows="4" 
                    class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Timeline & Milestones (Section 3 & 5)</label>
                  <textarea 
                    v-model="project.client.sow_timeline" 
                    rows="4" 
                    class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  ></textarea>
                </div>

                <button @click="saveSOWAndOpenEmail" class="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Save & Prepare SOW Email
                </button>
              </div>

              <div v-if="project.client.sow_status" class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Document History</p>
                <ul class="text-xs space-y-1.5 text-gray-600 font-medium">
                  <li v-if="project.client.sow_sent_date" class="flex justify-between"><span>📤 Sent:</span> <span>{{ formatDate(project.client.sow_sent_date) }}</span></li>
                  <li v-if="project.client.sow_opened_at" class="flex justify-between"><span>👀 Opened:</span> <span>{{ formatDate(project.client.sow_opened_at) }}</span></li>
                  <li v-if="project.client.sow_signed_date" class="flex justify-between text-green-600"><span>✅ Signed:</span> <span>{{ formatDate(project.client.sow_signed_date) }}</span></li>
                </ul>
                
                <button 
                  v-if="project.client.sow_pdf_path" 
                  @click="downloadFromVault(project.client.sow_pdf_path)" 
                  class="mt-4 w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Official PDF
                </button>
              </div>
            </div>
          </template>
          
          <div v-else class="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl">
            <p class="text-sm font-bold text-gray-500">No client data linked to this project.</p>
          </div>

        </div>

      </div>
    </div>

    <div v-if="showEmailModal" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 uppercase tracking-wide">
            Send {{ emailData.type }} to {{ project?.client?.name }}
          </h3>
          <button @click="showEmailModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div class="p-6 flex-1 space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">To:</label>
            <input type="text" disabled :value="project?.client?.email" class="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-600" />
          </div>
          
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Subject:</label>
            <input v-model="emailData.subject" type="text" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Message Body:</label>
            <textarea 
              v-model="emailData.body" 
              rows="12" 
              class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button @click="showEmailModal = false" class="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors text-sm">
            Cancel
          </button>
          <button @click="dispatchEmail" :disabled="isSendingEmail" class="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2">
            <span>{{ isSendingEmail ? 'Sending...' : 'Send Document' }}</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  isOpen: Boolean,
  project: Object
})

const emit = defineEmits(['close', 'updated'])

// UI State
const activeTab = ref('Overview')
const stages = [
  'Directory View', // <-- Agregado para que no choque si abres desde Clientes
  'Intake Form Received', 'Call Booked', 'Proposal Sent', 
  'Contracts Signed', 'Invoice Paid', 'Follow Up Needed', 
  'Churn', 'Project Complete', 'Future Project Opp'
]

// LÓGICA DE TRIGGERS
const suggestedAction = computed(() => {
  const p = props.project
  const c = p?.client
  if (!p || !c) return null

  if (p.pipeline_stage === 'Project Complete') {
    return { title: 'Post-Project Follow-up', desc: 'In 30 days, check-in for next collection or upsell development.' }
  }
  if (c.sow_status === 'Sent' && !c.sow_signed_date) {
    return { title: 'Proposal Follow-up', desc: 'No response? Follow up again in 3 days, then 7 days.' }
  }
  if (p.pipeline_stage === 'Call Booked') {
    return { title: 'High Priority: Send Proposal', desc: 'Call completed. Send SOW within the next 24 hours to maintain momentum.' }
  }
  if (c.client_tier === 'Early-stage' && p.pipeline_stage === 'Intake Form Received') {
    return { title: 'Nurture Lead', desc: 'Early-stage founder. Re-engage in 30 days if no meeting is booked.' }
  }
  return null
})

// CÁLCULO DE MÉTRICAS
const timeToClose = computed(() => {
  const p = props.project
  if (!p || !p.created_at || (!p.closed_at && !p.client?.sow_signed_date)) return null
  
  const start = new Date(p.created_at)
  const end = new Date(p.closed_at || p.client.sow_signed_date)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Helpers Visuales
const getStatusClass = (status) => {
  if (status === 'Signed') return 'bg-green-100 text-green-700 border border-green-200'
  if (status === 'Sent') return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-gray-100 text-gray-500 border border-gray-200'
}

const getTierClass = (tier) => {
  if (tier === 'High-value') return 'bg-purple-100 text-purple-700 border-purple-200'
  if (tier === 'Established') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  })
}

const updateClientTier = async () => {
  if (!props.project?.client_id || !props.project?.client) return
  try {
    const { error } = await supabase
      .from('clients')
      .update({ client_tier: props.project.client.client_tier })
      .eq('id', props.project.client_id)
    if (error) throw error
    emit('updated')
  } catch (error) {
    console.error('Error updating client tier:', error.message)
  }
}

// Database Actions: Overview
const updateOverview = async () => {
  if (!props.project || !props.project.id) return // Si se abre desde Clients.vue (no tiene ID de proyecto), ignoramos guardado en 'projects'
  try {
    const updates = { 
      pipeline_stage: props.project.pipeline_stage,
      internal_notes: props.project.internal_notes,
      proposal_value: props.project.proposal_value || 0,
      loss_reason: props.project.pipeline_stage === 'Churn' ? props.project.loss_reason : null,
      closed_at: (props.project.pipeline_stage === 'Contracts Signed' || props.project.pipeline_stage === 'Churn') ? new Date().toISOString() : null
    }

    const { error } = await supabase.from('projects').update(updates).eq('id', props.project.id)
    if (error) throw error
    emit('updated')
  } catch (error) {
    console.error('Error updating overview:', error.message)
  }
}

// --- EMAIL & CONTRACT LOGIC ---
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const emailData = ref({ type: '', subject: '', body: '' })

const saveSOWAndOpenEmail = async () => {
  if (!props.project?.client) return
  try {
    const { error } = await supabase
      .from('clients')
      .update({ 
        sow_deliverables: props.project.client.sow_deliverables,
        sow_timeline: props.project.client.sow_timeline
      })
      .eq('id', props.project.client_id)

    if (error) throw error
    openEmailEditor('sow')
  } catch (error) {
    alert('Error saving SOW details: ' + error.message)
  }
}

const openEmailEditor = (documentType) => {
  const typeUpper = documentType.toUpperCase()
  const baseUrl = window.location.origin
  
  const magicLink = `${baseUrl}/portal/${props.project.client_id}/${documentType.toLowerCase()}`

  emailData.value.type = typeUpper
  emailData.value.subject = `Document Request: ${typeUpper} from SIINGE STUDIO`
  emailData.value.body = `Hi ${props.project?.client?.name},\n\nPlease review and sign your ${typeUpper} for our upcoming collaboration.\n\nYou can securely review and sign your document here:\n${magicLink}\n\nBest regards,\nSIINGE STUDIO Team`

  showEmailModal.value = true
}

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true
    const sentDate = new Date().toISOString()
    
    const updates = emailData.value.type === 'NDA' 
      ? { nda_status: 'Sent', nda_sent_date: sentDate } 
      : { sow_status: 'Sent', sow_sent_date: sentDate } 

    await new Promise(resolve => setTimeout(resolve, 800))

    const { error } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
    if (error) throw error

    if (props.project.client) {
      if (emailData.value.type === 'NDA') {
        props.project.client.nda_status = 'Sent'
        props.project.client.nda_sent_date = sentDate
      } else {
        props.project.client.sow_status = 'Sent'
        props.project.client.sow_sent_date = sentDate
      }
    }

    alert(`${emailData.value.type} sent successfully!`)
    showEmailModal.value = false
    emit('updated')

  } catch (error) {
    alert('Error sending email: ' + error.message)
  } finally {
    isSendingEmail.value = false
  }
}

const downloadFromVault = async (filePath) => {
  try {
    const { data, error } = await supabase.storage.from('contracts').createSignedUrl(filePath, 60)
    if (error) throw error
    window.open(data.signedUrl, '_blank')
  } catch (error) {
    alert('Error accessing the secure vault: ' + error.message)
    console.error(error)
  }
}
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>