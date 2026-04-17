<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-end justify-end">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div class="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-slide-in">
      
      <div class="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ project?.title || 'Project Detail' }}</h2>
          <div class="flex items-center gap-2 mt-2">
            <p class="text-sm text-blue-600 font-bold">{{ project?.client?.name || 'Unknown Client' }}</p>
            <span v-if="project?.client?.client_tier" :class="['text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border', getTierClass(project.client.client_tier)]">
              {{ project.client.client_tier }}
            </span>
          </div>
          <div v-if="project?.client?.phone_number" class="flex items-center gap-2 mt-1">
            <span v-if="project?.client?.country" class="text-xs text-gray-500 font-medium">{{ project.client.country }}</span>
            <span v-if="project?.client?.country" class="text-gray-300 text-xs">|</span>
            <span class="text-xs text-gray-500 font-medium">📞 {{ project.client.phone_number }}</span>
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

          <section v-if="project?.client && (project.client.investment_level || project.client.brand_stage)" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div class="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <h3 class="font-bold text-gray-800">Strategy Call Intake</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Brand Stage</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.brand_stage || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Investment Level</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.investment_level || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Timeline</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.development_timeline || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Support Level</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.support_level || 'N/A' }}</p>
              </div>
              
              <div class="col-span-2 pt-2">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Primary Issue / Need</p>
                <div class="bg-gray-50 p-3.5 rounded-lg border border-gray-100 relative">
                  <span class="absolute top-2 left-2 text-gray-300 text-xl leading-none">"</span>
                  <p class="text-sm text-gray-700 font-medium italic pl-4 relative z-10 leading-relaxed">
                    {{ project.client.primary_issue || 'No specific issue mentioned.' }}
                  </p>
                </div>
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
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Meeting Date</p>
              <p class="font-medium text-gray-800 text-sm">
                {{ project.scheduled_date ? new Date(project.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled' }}
              </p>
              <a v-if="project.meeting_link" :href="project.meeting_link" target="_blank" class="mt-2 w-max inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Join Meeting
              </a>
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

        <div v-if="activeTab === 'Contracts'" class="space-y-6 pb-20">
          
          <template v-if="project?.client">
            
            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800 text-sm">Non-Disclosure Agreement</h3>
                <div class="text-xs space-y-1 mt-1 text-gray-500">
                  <p v-if="project.client.nda_sent_date">📤 Sent: {{ formatDate(project.client.nda_sent_date) }}</p>
                  <p v-if="project.client.nda_signed_date" class="text-green-600">✅ Signed: {{ formatDate(project.client.nda_signed_date) }}</p>
                </div>
              </div>
              <span :class="getStatusClass(project.client.nda_status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                {{ project.client.nda_status || 'Not Sent' }}
              </span>
            </div>

            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800 text-sm">Scope of Work (SOW)</h3>
                <div class="text-xs space-y-1 mt-1 text-gray-500">
                  <p v-if="project.client.sow_sent_date">📤 Sent: {{ formatDate(project.client.sow_sent_date) }}</p>
                  <p v-if="project.client.sow_signed_date" class="text-green-600">✅ Signed: {{ formatDate(project.client.sow_signed_date) }}</p>
                </div>
              </div>
              <span :class="getStatusClass(project.client.sow_status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                {{ project.client.sow_status || 'Not Sent' }}
              </span>
            </div>

            <div v-if="!['Sent', 'Signed'].includes(project.client.sow_status)" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
              <div class="mb-5 border-b border-gray-100 pb-3">
                <h3 class="font-bold text-gray-800 text-sm">Scope of Work Configuration</h3>
                <p class="text-xs text-gray-500 mt-0.5">Customize the 3 main contract clauses before sending.</p>
              </div>

              <div class="space-y-5">
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Deliverables (Section 2)</label>
                  <textarea 
                    v-model="project.client.sow_deliverables" 
                    rows="6" 
                    class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Timeline & Milestones (Section 3)</label>
                  <textarea 
                    v-model="project.client.sow_timeline" 
                    rows="5" 
                    class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Fees & Payment (Section 5)</label>
                  <textarea 
                    v-model="project.client.sow_fees_payment" 
                    rows="7" 
                    class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>

            <div v-if="availableDocs.length > 0" class="p-5 border border-blue-200 rounded-xl bg-blue-50 mt-4">
              <h3 class="font-bold text-blue-900 text-sm mb-3">Document Dispatch Center</h3>
              
              <div class="flex gap-4 mb-4">
                <label v-if="availableDocs.includes('NDA')" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value="NDA" v-model="selectedDocs" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span class="text-sm font-bold text-gray-700">Include NDA</span>
                </label>
                <label v-if="availableDocs.includes('SOW')" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value="SOW" v-model="selectedDocs" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span class="text-sm font-bold text-gray-700">Include SOW</span>
                </label>
              </div>

              <button 
                @click="saveAndPrepareEmail" 
                :disabled="selectedDocs.length === 0"
                class="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Details & Prepare Email
              </button>
            </div>

            <div v-if="project.client.nda_pdf_path || project.client.sow_pdf_path" class="pt-6 border-t border-gray-200 space-y-2 mt-4">
              <button v-if="project.client.nda_pdf_path" @click="downloadFromVault(project.client.nda_pdf_path)" class="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors flex justify-center gap-2">
                ⬇️ Download Signed NDA
              </button>
              <button v-if="project.client.sow_pdf_path" @click="downloadFromVault(project.client.sow_pdf_path)" class="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors flex justify-center gap-2">
                ⬇️ Download Signed SOW
              </button>
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
            Send Documents to {{ project?.client?.name }}
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
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-[11px] font-bold text-gray-500 uppercase">Message Body</label>
              <div class="flex bg-gray-100 rounded-md p-0.5">
                <button type="button" @click="emailViewMode = 'preview'" :class="['px-3 py-1 text-[10px] font-bold uppercase rounded-sm transition-colors', emailViewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']">Preview</button>
                <button type="button" @click="emailViewMode = 'code'" :class="['px-3 py-1 text-[10px] font-bold uppercase rounded-sm transition-colors', emailViewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']">HTML Edit</button>
              </div>
            </div>
            
            <div v-if="emailViewMode === 'preview'" class="w-full border border-gray-300 rounded-lg p-5 text-sm bg-white overflow-y-auto max-h-[300px] shadow-inner" v-html="emailData.body"></div>
            
            <textarea v-else v-model="emailData.body" rows="12" class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-mono bg-gray-800 text-green-400 whitespace-pre shadow-inner max-h-[300px]"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button @click="showEmailModal = false" class="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors text-sm">
            Cancel
          </button>
          <button @click="dispatchEmail" :disabled="isSendingEmail" class="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2">
            <span>{{ isSendingEmail ? 'Sending...' : 'Send Email' }}</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  isOpen: Boolean,
  project: Object
})

const emit = defineEmits(['close', 'updated'])

// Templates Textos Base
const defaultDeliverables = `Service Provider will deliver the following:
• [INSERT DELIVERABLES]
• [Be specific: outputs, formats, quantities]
• [Include anything that defines scope clearly]

Any work not expressly listed above is considered out of scope.`;

const defaultTimeline = `Project Start Date: [INSERT]
• Key Milestones (optional): [INSERT]
• Final Delivery Date: [INSERT]

Timeline is dependent on timely client feedback, approvals, and provision of required materials.`;

const defaultFees = `Total Project Fee: $[INSERT]

Payment Terms:
• [INSERT STRUCTURE]

Payment is a condition precedent to commencement of Services. No work shall begin until payment has been received.
All payments are non-refundable once Services have commenced.
Any Services outside the defined Deliverables shall be billed at $[INSERT RATE] or pursuant to a separate written agreement.
Failure to make timely payment may result in suspension of Services without liability.`;

const activeTab = ref('Overview')
const stages = [
  'Directory View', 
  'Intake Form Received', 'Call Booked', 'Proposal Sent', 
  'Contracts Signed', 'Invoice Paid', 'Follow Up Needed', 
  'Churn', 'Project Complete', 'Future Project Opp'
]

// Lógica de Documentos Disponibles Dinámicamente
const availableDocs = computed(() => {
  const docs = []
  const ndaStatus = props.project?.client?.nda_status
  const sowStatus = props.project?.client?.sow_status
  
  if (ndaStatus !== 'Sent' && ndaStatus !== 'Signed') docs.push('NDA')
  if (sowStatus !== 'Sent' && sowStatus !== 'Signed') docs.push('SOW')
  
  return docs
})

const selectedDocs = ref([])

// Inyección Automática de Templates y Checkboxes
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project?.client) {
    if (!props.project.client.sow_deliverables) props.project.client.sow_deliverables = defaultDeliverables;
    if (!props.project.client.sow_timeline) props.project.client.sow_timeline = defaultTimeline;
    if (!props.project.client.sow_fees_payment) props.project.client.sow_fees_payment = defaultFees;
    
    // Auto-seleccionar los documentos disponibles
    selectedDocs.value = [...availableDocs.value];
    // Reiniciar vista del correo a preview
    emailViewMode.value = 'preview';
  }
}, { immediate: true });

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

const timeToClose = computed(() => {
  const p = props.project
  if (!p || !p.created_at || (!p.closed_at && !p.client?.sow_signed_date)) return null
  const start = new Date(p.created_at)
  const end = new Date(p.closed_at || p.client.sow_signed_date)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

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
    const { error } = await supabase.from('clients').update({ client_tier: props.project.client.client_tier }).eq('id', props.project.client_id)
    if (error) throw error
    emit('updated')
  } catch (error) { console.error(error.message) }
}

const updateOverview = async () => {
  if (!props.project || !props.project.id) return 
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
  } catch (error) { console.error(error.message) }
}

const showEmailModal = ref(false)
const emailViewMode = ref('preview') // Modo por defecto: Preview
const isSendingEmail = ref(false)
const emailData = ref({ subject: '', body: '' })

const saveAndPrepareEmail = async () => {
  if (!props.project?.client) return
  try {
    const { error } = await supabase
      .from('clients')
      .update({ 
        sow_deliverables: props.project.client.sow_deliverables,
        sow_timeline: props.project.client.sow_timeline,
        sow_fees_payment: props.project.client.sow_fees_payment
      })
      .eq('id', props.project.client_id)

    if (error) throw error

    openEmailEditor(selectedDocs.value)

  } catch (error) {
    alert('Error saving details: ' + error.message)
  }
}

const openEmailEditor = (docsToInclude) => {
  const baseUrl = window.location.origin
  const clientName = props.project?.client?.name || 'Client'
  
  let docsText = docsToInclude.join(' and ')
  emailData.value.subject = `Document Request: ${docsText} from SIINGE STUDIO`

  // Generación del HTML con diseño limpio para el correo
  let htmlBody = `<p style="font-family: sans-serif; color: #374151;">Hi ${clientName},</p>

<p style="font-family: sans-serif; color: #374151;">Please review and sign the requested documents for our upcoming collaboration.</p>

<div style="margin: 30px 0;">
`

  if (docsToInclude.includes('NDA')) {
    const ndaLink = `${baseUrl}/portal/${props.project.client_id}/nda`
    htmlBody += `  <a href="${ndaLink}" style="display:inline-block; margin-bottom:12px; margin-right:12px; padding:12px 24px; background-color:#1e293b; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:bold; font-family:sans-serif;">Review and sign NDA</a><br>\n`
  }

  if (docsToInclude.includes('SOW')) {
    const sowLink = `${baseUrl}/portal/${props.project.client_id}/sow`
    htmlBody += `  <a href="${sowLink}" style="display:inline-block; margin-bottom:12px; padding:12px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:bold; font-family:sans-serif;">Review and sign SOW</a><br>\n`
  }

  htmlBody += `</div>

<p style="font-family: sans-serif; color: #374151;">Best regards,<br><strong>SIINGE STUDIO Team</strong></p>`

  emailData.value.body = htmlBody
  showEmailModal.value = true
  emailViewMode.value = 'preview'
}

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true
    const sentDate = new Date().toISOString()
    const updates = {}

    // Marcar como enviados los seleccionados
    if (selectedDocs.value.includes('NDA')) {
      updates.nda_status = 'Sent'
      updates.nda_sent_date = sentDate
      props.project.client.nda_status = 'Sent'
      props.project.client.nda_sent_date = sentDate
    }
    
    if (selectedDocs.value.includes('SOW')) {
      updates.sow_status = 'Sent'
      updates.sow_sent_date = sentDate
      props.project.client.sow_status = 'Sent'
      props.project.client.sow_sent_date = sentDate
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    const { error } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
    if (error) throw error

    alert(`Documents (${selectedDocs.value.join(', ')}) sent successfully!`)
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