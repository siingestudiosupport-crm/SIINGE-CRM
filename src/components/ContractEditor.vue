<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(14,14,12,0.45);">
    <div class="w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3);">

      <div class="flex justify-between items-center" style="padding: 20px 32px; border-bottom: 1px solid var(--bone-edge); background: var(--ink);">
        <div>
          <h3 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--paper); margin: 0 0 2px; letter-spacing: -0.02em;">
            {{ step === 1 ? 'Step 1: Prepare Documents' : 'Step 2: Dispatch' }}
          </h3>
          <p style="font-size: 11px; color: rgba(250,247,242,0.5); margin: 0;">
            {{ step === 1 ? 'Fill out the specific contract details' : 'Review and edit email before sending' }}
          </p>
        </div>
        <button @click="$emit('close')" style="color: rgba(250,247,242,0.5); background: none; border: none; font-size: 22px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
      </div>

      <div class="p-8 overflow-y-auto space-y-8">
        
        <div v-if="step === 1" class="space-y-8">
          <div class="space-y-4">
            <h4 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">General Information</h4>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Legal Company Name</label>
              <input v-model="clientData.company" type="text" placeholder="e.g. Acme Corporation LLC" class="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div v-if="selection.types.includes('sow')" class="space-y-4">
            <h4 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Scope of Work Details</h4>
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
          <div style="padding: 12px 16px; background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 2px; font-size: 13px; color: var(--positive); font-weight: 600;">
            Data saved securely. You can edit the email below before sending.
          </div>

          <div class="space-y-4">
            <h4 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Email Composer</h4>
            
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

      <div class="flex justify-end gap-3" style="padding: 16px 32px; border-top: 1px solid var(--bone-edge); background: var(--paper-2);">
        <button v-if="step === 1" @click="$emit('close')" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">Cancel</button>

        <button v-if="step === 1" @click="saveDataAndGenerate" :disabled="loading"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
          :style="loading ? 'opacity: 0.5;' : ''">
          {{ loading ? 'Saving...' : 'Save & Prepare Email' }}
        </button>

        <button v-if="step === 2" @click="sendWithSupabaseFunction" :disabled="loading"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ember); color: #fff; border: 1px solid var(--ember); border-radius: 2px; cursor: pointer; transition: opacity 120ms; display: inline-flex; align-items: center; gap: 8px;"
          :style="loading ? 'opacity: 0.5;' : ''">
          <svg v-if="!loading" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
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

const defaultDeliverables = "Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n• [Include anything that defines scope clearly]\nAny work not expressly listed above is considered out of scope."
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
    const firstName = (clientData.value.name || '').split(' ')[0]
    const callDate = clientData.value.call_date ? new Date(clientData.value.call_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '[date of call]'
    const projectName = clientData.value.project_name || '[project name]'

    let docsPhrase = ''
    if (props.selection.types.includes('sow') && props.selection.types.includes('nda')) {
      docsPhrase = 'the Scope of Work and Mutual NDA'
    } else if (props.selection.types.includes('sow')) {
      docsPhrase = 'the Scope of Work'
    } else if (props.selection.types.includes('nda')) {
      docsPhrase = 'the Mutual NDA'
    }
    const linkWord = props.selection.types.length > 1 ? 'links' : 'link'

    email.value.messageBody = `Hi ${firstName},\n\nIt was great catching up with you on ${callDate} and talking through the details of your project. I put together a structured scope based on everything we discussed so you have a clear picture of how this would move forward.\n\nI've outlined the deliverables, timeline, and how we'll approach development for the ${projectName}.\n\nPlease review and sign ${docsPhrase} by clicking on the ${linkWord} below.\n\nOnce those are complete, I'll send through the invoice and we'll get started!`
    
    let linksHtml = '';

    if (props.selection.types.includes('sow')) {
      const sowLink = `${window.location.origin}/portal/${props.selection.clientId}/sow`;
      linksHtml += `<a href="${sowLink}" style="color: #2563eb; text-decoration: underline;">Review & Sign SOW</a>`;
    }

    if (props.selection.types.includes('nda')) {
      const ndaLink = `${window.location.origin}/portal/${props.selection.clientId}/nda`;
      if (linksHtml) linksHtml += ' and ';
      linksHtml += `<a href="${ndaLink}" style="color: #1e293b; text-decoration: underline;">Review & Sign NDA</a>`;
    }

    email.value.buttonsHtml = linksHtml ? `<p style="font-family:sans-serif;color:#374151;margin:0 0 8px">${linksHtml}</p>` : '';
    
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