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
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
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
          </section>
        </div>

        <div v-if="activeTab === 'Contracts'" class="space-y-6 pb-20">
          <template v-if="project?.client">
            
            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800 text-sm">Non-Disclosure Agreement</h3>
                <div class="text-xs space-y-1 mt-1 text-gray-500">
                  <p v-if="project.client.nda_sent_date" class="flex items-center gap-2">
                    📤 Sent: {{ formatDate(project.client.nda_sent_date) }}
                    <button @click="resetDocument('NDA')" class="text-[9px] text-blue-500 hover:text-blue-700 underline font-bold cursor-pointer">🔄 Reset / Resend</button>
                  </p>
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
                  <p v-if="project.client.sow_sent_date" class="flex items-center gap-2">
                    📤 Sent: {{ formatDate(project.client.sow_sent_date) }}
                    <button @click="resetDocument('SOW')" class="text-[9px] text-blue-500 hover:text-blue-700 underline font-bold cursor-pointer">🔄 Reset / Resend</button>
                  </p>
                </div>
              </div>
              <span :class="getStatusClass(project.client.sow_status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                {{ project.client.sow_status || 'Not Sent' }}
              </span>
            </div>

            <div v-if="!['Sent', 'Signed'].includes(project.client.sow_status)" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
              <div class="space-y-5">
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Deliverables</label>
                  <textarea v-model="project.client.sow_deliverables" rows="5" class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"></textarea>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Timeline</label>
                  <textarea v-model="project.client.sow_timeline" rows="4" class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"></textarea>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Fees & Payment</label>
                  <textarea v-model="project.client.sow_fees_payment" rows="5" class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"></textarea>
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
              <button @click="saveAndPrepareEmail" :disabled="selectedDocs.length === 0" class="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                Save Details & Prepare Email
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="showEmailModal" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 uppercase tracking-wide">Email Preview</h3>
          <button @click="showEmailModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>
        <div class="p-6 flex-1 space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">To:</label>
            <input type="text" disabled :value="project?.client?.email" class="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-600" />
          </div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Message Body</label>
            <div class="flex bg-gray-100 rounded-md p-0.5">
              <button type="button" @click="emailViewMode = 'preview'" :class="['px-3 py-1 text-[10px] rounded-sm transition-colors', emailViewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500']">Preview</button>
              <button type="button" @click="emailViewMode = 'code'" :class="['px-3 py-1 text-[10px] rounded-sm transition-colors', emailViewMode === 'code' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500']">HTML</button>
            </div>
          </div>
          <div v-if="emailViewMode === 'preview'" class="w-full border border-gray-300 rounded-lg p-5 text-sm bg-white overflow-y-auto max-h-[300px]" v-html="emailData.body"></div>
          <textarea v-else v-model="emailData.body" rows="12" class="w-full border border-gray-300 rounded-lg p-4 text-sm font-mono bg-gray-800 text-green-400"></textarea>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button @click="showEmailModal = false" class="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
          <button @click="dispatchEmail" :disabled="isSendingEmail" class="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm text-sm">
            {{ isSendingEmail ? 'Sending...' : 'Send Email' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({ isOpen: Boolean, project: Object })
const emit = defineEmits(['close', 'updated'])

// UI States
const activeTab = ref('Overview')
const emailViewMode = ref('preview')
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const selectedDocs = ref([])
const emailData = ref({ subject: '', body: '' })

// Templates
const defaultDeliverables = `Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n\nAny work not expressly listed above is considered out of scope.`;
const defaultTimeline = `Project Start Date: [INSERT]\n• Final Delivery Date: [INSERT]\n\nTimeline is dependent on timely client feedback.`;
const defaultFees = `Total Project Fee: $[INSERT]\n\nPayment Terms:\n• 50% Upfront, 50% on Completion.\n\nAll payments are non-refundable once Services have commenced.`;

// Watch para cargar templates
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project?.client) {
    if (!props.project.client.sow_deliverables) props.project.client.sow_deliverables = defaultDeliverables;
    if (!props.project.client.sow_timeline) props.project.client.sow_timeline = defaultTimeline;
    if (!props.project.client.sow_fees_payment) props.project.client.sow_fees_payment = defaultFees;
    selectedDocs.value = [...availableDocs.value];
  }
}, { immediate: true });

const availableDocs = computed(() => {
  const docs = [];
  if (!['Sent', 'Signed'].includes(props.project?.client?.nda_status)) docs.push('NDA');
  if (!['Sent', 'Signed'].includes(props.project?.client?.sow_status)) docs.push('SOW');
  return docs;
});

// Helpers Visuales
const getStatusClass = (s) => s === 'Signed' ? 'bg-green-100 text-green-700' : s === 'Sent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';
const getTierClass = (t) => t === 'High-value' ? 'bg-purple-100 text-purple-700' : t === 'Established' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';
const formatDate = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// --- ACCIONES ---
const resetDocument = async (type) => {
  if (!confirm(`Reset ${type}?`)) return;
  const updates = type === 'NDA' ? { nda_status: null, nda_sent_date: null } : { sow_status: null, sow_sent_date: null };
  const { error } = await supabase.from('clients').update(updates).eq('id', props.project.client_id);
  if (!error) emit('updated');
};

const saveAndPrepareEmail = async () => {
  const { error } = await supabase.from('clients').update({
    sow_deliverables: props.project.client.sow_deliverables,
    sow_timeline: props.project.client.sow_timeline,
    sow_fees_payment: props.project.client.sow_fees_payment
  }).eq('id', props.project.client_id);
  
  if (!error) openEmailEditor();
};

const openEmailEditor = () => {
  const baseUrl = window.location.origin;
  const clientName = props.project.client.name;
  emailData.value.subject = `Document Request from SIINGE STUDIO`;
  
  let htmlBody = `<p>Hi ${clientName},</p><p>Please review and sign the requested documents:</p><div style="margin: 25px 0;">`;
  if (selectedDocs.value.includes('NDA')) {
    htmlBody += `<a href="${baseUrl}/portal/${props.project.client_id}/nda" style="display:inline-block; margin-right:10px; padding:12px 20px; background-color:#1e293b; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Sign NDA</a>`;
  }
  if (selectedDocs.value.includes('SOW')) {
    htmlBody += `<a href="${baseUrl}/portal/${props.project.client_id}/sow" style="display:inline-block; padding:12px 20px; background-color:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Sign SOW</a>`;
  }
  htmlBody += `</div><p>Best regards,<br>SIINGE STUDIO Team</p>`;
  emailData.value.body = htmlBody;
  showEmailModal.value = true;
};

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true;
    const sentDate = new Date().toISOString();
    
    // 1. LLAMADA REAL A LA FUNCIÓN DE SUPABASE
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: props.project.client.email,
        subject: emailData.value.subject,
        html: emailData.value.body // Importante: Enviamos "html" porque así lo espera tu función de 90 líneas
      }
    });

    if (emailError) throw emailError;

    // 2. ACTUALIZAR BASE DE DATOS LOCAL
    const updates = {};
    if (selectedDocs.value.includes('NDA')) { updates.nda_status = 'Sent'; updates.nda_sent_date = sentDate; }
    if (selectedDocs.value.includes('SOW')) { updates.sow_status = 'Sent'; updates.sow_sent_date = sentDate; }
    
    await supabase.from('clients').update(updates).eq('id', props.project.client_id);
    
    alert('Email sent successfully!');
    showEmailModal.value = false;
    emit('updated');
  } catch (err) {
    alert('Failed to send email: ' + err.message);
  } finally {
    isSendingEmail.value = false;
  }
};
</script>