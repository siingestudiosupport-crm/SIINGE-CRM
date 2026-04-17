<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <div class="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-xl text-gray-800 uppercase tracking-tight">
            {{ step === 1 ? 'Step 1: Prepare Documents' : 'Step 2: Dispatch' }}
          </h3>
          <p class="text-xs text-gray-500 font-medium">
            {{ step === 1 ? 'Fill out the specific contract details' : 'Review and edit email before sending' }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>

      <div class="p-8 overflow-y-auto space-y-8">
        
        <div v-if="step === 1" class="space-y-8">
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest">General Information</h4>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Legal Company Name</label>
              <input v-model="clientData.company" type="text" placeholder="e.g. Acme Corporation LLC" class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div v-if="selection.types.includes('sow')" class="space-y-4">
            <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Scope of Work Details</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Deliverables</label>
                <textarea v-model="clientData.sow_deliverables" rows="6" class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-gray-50"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Timeline</label>
                <textarea v-model="clientData.sow_timeline" rows="5" class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-gray-50"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Fees & Payment</label>
                <textarea v-model="clientData.sow_fees_payment" rows="9" class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-gray-50"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-if="step === 2" class="space-y-6">
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
            ✅ Data saved securely! You can edit the email below before sending.
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Email Composer</h4>
            
            <div class="space-y-4 border border-gray-200 rounded-xl p-6 bg-slate-50">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">To</label>
                <p class="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 inline-block">{{ clientData.email }}</p>
              </div>
              
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</label>
                <input v-model="email.subject" type="text" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white" />
              </div>
              
              <div class="pt-2 border-t border-gray-200">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Message Body</label>
                <textarea 
                  v-model="email.messageBody" 
                  rows="6" 
                  class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed resize-y"
                ></textarea>
                
                <div class="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                  <p class="text-[10px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    Magic Links (Appended automatically)
                  </p>
                  <div v-html="email.buttonsHtml"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <div class="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button v-if="step === 1" @click="$emit('close')" class="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
        
        <button v-if="step === 1" @click="saveDataAndGenerate" :disabled="loading" class="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2">
          {{ loading ? 'Saving...' : 'Save & Prepare Email' }}
        </button>

        <button v-if="step === 2" @click="sendWithSupabaseFunction" :disabled="loading" class="px-8 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-lg transition-all flex items-center gap-2">
          <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          {{ loading ? 'Dispatching...' : 'Send Official Email' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'

const props = defineProps({ selection: Object })
const emit = defineEmits(['close', 'sent'])
const { alert: showAlert } = useConfirmModal()

const step = ref(1) 
const loading = ref(false)
const clientData = ref({ name: '', email: '', company: '', sow_deliverables: '', sow_timeline: '', sow_fees_payment: '' })

// SEPARACIÓN DE MENSAJE Y BOTONES PARA QUE SEA EDITABLE
const email = ref({ subject: '', messageBody: '', buttonsHtml: '' })

const defaultDeliverables = "Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n• [Include anything that defines scope clearly]\nAny work not expressly listed above is considered out of scope"
const defaultTimeline = "• Project Start Date: [INSERT]\n• Key Milestones (optional): [INSERT]\n• Final Delivery Date: [INSERT]\nTimeline is dependent on timely client feedback, approvals, and provision of required materials."
const defaultFees = "Total Project Fee: $[INSERT]\nPayment Terms:\n• [INSERT STRUCTURE]\nPayment is a condition precedent to commencement of Services. No work shall begin until\npayment has been received.\nAll payments are non-refundable once Services have commenced.\nAny Services outside the defined Deliverables shall be billed at $[INSERT RATE] or pursuant to\na separate written agreement.\nFailure to make timely payment may result in suspension of Services without liability."

const fetchClient = async () => {
  try {
    const { data } = await supabase.from('clients').select('*').eq('id', props.selection.clientId).single()
    if (data) {
      clientData.value = { 
        ...data, 
        company: data.company || '',
        sow_deliverables: data.sow_deliverables || defaultDeliverables,
        sow_timeline: data.sow_timeline || defaultTimeline,
        sow_fees_payment: data.sow_fees_payment || defaultFees
      }
    }
  } catch (err) { console.error(err) }
}

const saveDataAndGenerate = async () => {
  try {
    loading.value = true
    const sentDate = new Date().toISOString()
    const updates = { company: clientData.value.company }
    
    if (props.selection.types.includes('nda')) {
      updates.nda_status = 'Sent'; updates.nda_sent_date = sentDate
    }
    if (props.selection.types.includes('sow')) {
      updates.sow_status = 'Sent'; updates.sow_sent_date = sentDate
      updates.sow_deliverables = clientData.value.sow_deliverables
      updates.sow_timeline = clientData.value.sow_timeline
      updates.sow_fees_payment = clientData.value.sow_fees_payment
    }

    const { error } = await supabase.from('clients').update(updates).eq('id', props.selection.clientId)
    if (error) throw error
    
    const docs = props.selection.types.map(t => t.toUpperCase()).join(' and ')
    email.value.subject = `Document Request: ${docs} from SIINGE STUDIO`
    
    // TEXTO BASE EDITABLE (Tu jefa lo puede cambiar todo desde la pantalla)
    email.value.messageBody = `Hi ${clientData.value.name || 'there'},\n\nPlease review and sign your requested documents via our secure portal below:\n\nIf you have any questions, feel free to reply to this email.`
    
    let buttonsHtml = '';
    
    // CÓDIGO HTML DE LOS BOTONES (No debe llevar saltos de línea \n en el código interno)
    if (props.selection.types.includes('nda')) {
      const ndaLink = `${window.location.origin}/portal/${props.selection.clientId}/nda`;
      buttonsHtml += `<a href="${ndaLink}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600; font-family: sans-serif; margin-right: 12px; margin-bottom: 12px;">Review and Sign NDA</a>`;
    }

    if (props.selection.types.includes('sow')) {
      const sowLink = `${window.location.origin}/portal/${props.selection.clientId}/sow`;
      buttonsHtml += `<a href="${sowLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600; font-family: sans-serif; margin-bottom: 12px;">Review and Sign SOW</a>`;
    }
    
    email.value.buttonsHtml = `<div style="margin-top: 10px;">${buttonsHtml}</div>`;
    
    step.value = 2
  } catch (err) { 
    await showAlert('Error: ' + err.message, 'Error')
  } finally { 
    loading.value = false 
  }
}

const sendWithSupabaseFunction = async () => {
  if (!clientData.value.email) {
    await showAlert('Client email is missing!', 'Missing Information')
    return
  }

  try {
    loading.value = true
    
    // COMBINAMOS EL TEXTO EDITADO POR LA JEFA Y LOS BOTONES ANTES DE ENVIAR
    const finalPayloadHtml = `${email.value.messageBody}\n\n${email.value.buttonsHtml}`

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { 
        to: clientData.value.email,
        subject: email.value.subject,
        html: finalPayloadHtml
      }
    })

    if (error) throw error

    await showAlert('Email sent successfully via production server!', 'Success')
    emit('sent')
  } catch (err) {
    await showAlert('Error sending email: ' + err.message, 'Error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchClient)
</script>