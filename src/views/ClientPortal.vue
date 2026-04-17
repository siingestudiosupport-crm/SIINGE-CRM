<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    
    <div v-if="loading" class="max-w-3xl mx-auto text-center py-20">
      <p class="text-gray-500 font-medium animate-pulse">Loading secure document...</p>
    </div>
    <div v-else-if="!client" class="max-w-3xl mx-auto text-center py-20 bg-white shadow rounded-xl">
      <h2 class="text-2xl font-bold text-gray-800">Document Not Found</h2>
    </div>

    <div v-else class="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      
      <div class="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold tracking-wider uppercase">{{ isNDA ? 'NON-DISCLOSURE AGREEMENT' : 'SCOPE OF WORK' }}</h1>
          <p class="text-slate-400 text-sm mt-1">Ref: #{{ client.id.substring(0, 8) }}</p>
        </div>
        <div class="text-right">
          <button v-if="isSigned" @click="downloadPDF" :disabled="isGeneratingPDF" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition-colors">
            {{ isGeneratingPDF ? 'Preparing File...' : 'Download Signed PDF' }}
          </button>
        </div>
      </div>

      <div class="px-8 py-8">
        
        <div class="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden mb-10 bg-gray-100 shadow-inner">
          <iframe v-if="pdfPreviewUrl" :src="pdfPreviewUrl" class="w-full h-full" frameborder="0"></iframe>
          <div v-else class="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Injecting contract data...</p>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Execution & Signatures</h3>

          <div v-if="!isSigned" class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                <input v-model="form.company_name" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <template v-if="isSOW">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name (DBA)</label>
                  <input v-model="form.business_name" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Address</label>
                  <input v-model="form.full_address" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </template>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Signer's Full Name</label>
                <input v-model="form.client_name" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Signer's Title</label>
                <input v-model="form.client_title" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-end mb-2">
                <label class="block text-xs font-bold text-gray-500 uppercase">Draw Signature</label>
                <button @click="clearSignature" class="text-xs text-red-500 font-bold hover:underline">Clear Canvas</button>
              </div>
              <div class="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative overflow-hidden">
                <canvas ref="sigCanvas" 
                  @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing" 
                  @touchstart.prevent="startDrawingTouch" @touchmove.prevent="drawTouch" @touchend.prevent="stopDrawing" 
                  class="w-full h-40 cursor-crosshair touch-none bg-white"></canvas>
                <div v-if="!hasDrawn" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p class="text-gray-300 font-medium text-xl">Sign Here</p>
                </div>
              </div>
            </div>

            <button @click="submitDocument" :disabled="!isValid || isSubmitting" class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:opacity-50 transition-all flex justify-center items-center gap-3">
              <span v-if="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isSubmitting ? 'Securing & Saving to Vault...' : 'I Agree and Sign Document' }}
            </button>
          </div>

          <div v-else class="bg-green-50 p-8 rounded-xl border border-green-200 flex flex-col md:flex-row justify-between items-center">
            <div>
              <p class="text-green-800 font-bold text-lg">Document Signed & Secured</p>
              <p class="text-green-600 text-sm mt-1">Executed by <span class="font-bold">{{ isNDA ? client.nda_client_name : client.sow_client_name }}</span></p>
            </div>
            <img v-if="isNDA ? client.nda_signature : client.sow_signature" :src="isNDA ? client.nda_signature : client.sow_signature" class="h-20 mix-blend-multiply mt-4 md:mt-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import { PDFDocument } from 'pdf-lib'

const route = useRoute()
const { alert: showAlert } = useConfirmModal()
const loading = ref(true)
const isSubmitting = ref(false)
const isGeneratingPDF = ref(false)
const client = ref(null)
const pdfPreviewUrl = ref('')

const form = ref({ company_name: '', full_address: '', business_name: '', client_name: '', client_title: '' })
const sigCanvas = ref(null); const ctx = ref(null); const isDrawing = ref(false); const hasDrawn = ref(false)

const isNDA = computed(() => route.params.documentType === 'nda')
const isSOW = computed(() => route.params.documentType === 'sow')

const isSigned = computed(() => {
  if (!client.value) return false
  return isNDA.value ? client.value.nda_status === 'Signed' : client.value.sow_status === 'Signed'
})

const isValid = computed(() => {
  if (!hasDrawn.value || !form.value.client_name || !form.value.client_title || !form.value.company_name) return false
  if (isSOW.value && (!form.value.full_address || !form.value.business_name)) return false
  return true
})

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''

const fetchDocument = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('clients').select('*').eq('id', route.params.clientId).single()
    client.value = data
    
    if (data) {
      form.value.company_name = data.company || ''
      form.value.client_name = isNDA.value ? (data.nda_client_name || '') : (data.sow_client_name || '')
      form.value.client_title = isNDA.value ? (data.nda_client_title || '') : (data.sow_client_title || '')
      form.value.full_address = data.full_address || ''
      form.value.business_name = data.business_name || ''
      
      // Tracking: Fase 1 (Apertura)
      const openedField = isNDA.value ? 'nda_opened_at' : 'sow_opened_at'
      if (!isSigned.value && !data[openedField]) {
        await supabase.from('clients').update({ [openedField]: new Date().toISOString() }).eq('id', data.id)
      }
    }
    
    await generateLivePDFPreview()
    if (!isSigned.value) setTimeout(initCanvas, 150)
  } catch (error) { 
    console.error(error) 
  } finally { 
    loading.value = false 
  }
}

const buildPDF = async (forDownload = false) => {
  const url = isNDA.value ? '/mutual_nda.pdf' : '/sow.pdf'
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const pdfForm = pdfDoc.getForm()
  const p = client.value

  const fillExactField = (fieldName, text) => { 
    try { 
      const field = pdfForm.getTextField(fieldName);
      if(field) field.setText(String(text || ''));
    } catch (e) { console.warn('Field not found in PDF:', fieldName) } 
  }

  if (isSOW.value) {
    fillExactField('date_1', formatDate(p.sow_sent_date))
    fillExactField('deliverables', p.sow_deliverables)
    fillExactField('timeline', p.sow_timeline)
    fillExactField('fees_payment', p.sow_fees_payment)
    fillExactField('date_3', formatDate(p.sow_sent_date))
    fillExactField('company_name', form.value.company_name || p.company)
    fillExactField('full_address', form.value.full_address || p.full_address)
    fillExactField('business_name', form.value.business_name || p.business_name)
    fillExactField('client_name', form.value.client_name || p.sow_client_name)
    fillExactField('client_title', form.value.client_title || p.sow_client_title)
    fillExactField('date_2', formatDate(p.sow_signed_date))

    if (forDownload && p.sow_signature) {
      const png = await pdfDoc.embedPng(p.sow_signature)
      try {
        const rect = pdfForm.getField('signature_sow').acroField.getWidgets()[0].getRectangle()
        pdfDoc.getPages()[pdfDoc.getPages().length - 1].drawImage(png, { x: rect.x, y: rect.y, width: rect.width, height: rect.height })
      } catch (err) { console.warn('Signature field not found') }
    }
  } else {
    fillExactField('date_1', formatDate(p.nda_sent_date))
    fillExactField('company_name', form.value.company_name || p.company)
    fillExactField('client_name', form.value.client_name || p.nda_client_name)
    fillExactField('client_title', form.value.client_title || p.nda_client_title)
    fillExactField('date_2', formatDate(p.nda_signed_date))
    fillExactField('date_3', formatDate(p.nda_sent_date))
    
    if (forDownload && p.nda_signature) {
      const png = await pdfDoc.embedPng(p.nda_signature)
      try {
        const rect = pdfForm.getField('signature_nda').acroField.getWidgets()[0].getRectangle()
        pdfDoc.getPages()[pdfDoc.getPages().length - 1].drawImage(png, { x: rect.x, y: rect.y, width: rect.width, height: rect.height })
      } catch (err) {}
    }
  }

  if (forDownload) pdfForm.flatten() 
  return await pdfDoc.save()
}

const generateLivePDFPreview = async () => {
  try {
    const pdfBytes = await buildPDF(false)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error("Error loading PDF Preview", error)
  }
}

const downloadPDF = async () => {
  isGeneratingPDF.value = true
  try {
    const pdfBytes = await buildPDF(true)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob)
    link.download = `${isNDA.value ? 'NDA' : 'SOW'}_Signed_${form.value.company_name.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) { 
    await showAlert('Error generating official PDF', 'Error')
  } finally { 
    isGeneratingPDF.value = false 
  }
}

const initCanvas = () => { if (!sigCanvas.value) return; sigCanvas.value.width = sigCanvas.value.offsetWidth * 2; sigCanvas.value.height = sigCanvas.value.offsetHeight * 2; ctx.value = sigCanvas.value.getContext('2d'); ctx.value.scale(2, 2); ctx.value.lineWidth = 3; ctx.value.lineCap = 'round'; ctx.value.strokeStyle = '#0f172a' }
const getCoords = (e) => { const rect = sigCanvas.value.getBoundingClientRect(); const ev = e.touches ? e.touches[0] : e; return { x: ev.clientX - rect.left, y: ev.clientY - rect.top } }
const startDrawing = (e) => { isDrawing.value = true; hasDrawn.value = true; const c = getCoords(e); ctx.value.beginPath(); ctx.value.moveTo(c.x, c.y) }
const startDrawingTouch = (e) => startDrawing(e)
const draw = (e) => { if (!isDrawing.value) return; const c = getCoords(e); ctx.value.lineTo(c.x, c.y); ctx.value.stroke() }
const drawTouch = (e) => draw(e)
const stopDrawing = () => { isDrawing.value = false; ctx.value?.closePath() }
const clearSignature = () => { ctx.value.clearRect(0,0,sigCanvas.value.width,sigCanvas.value.height); hasDrawn.value = false }

const submitDocument = async () => {
  try {
    isSubmitting.value = true
    console.log("Iniciando proceso de firma...");
    
    const sig64 = sigCanvas.value.toDataURL('image/png')
    const d = new Date().toISOString()
    
    if (isNDA.value) client.value.nda_signature = sig64
    else client.value.sow_signature = sig64

    console.log("Generando PDF con pdf-lib...");
    const pdfBytes = await buildPDF(true)
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
    
    const cleanCompanyName = form.value.company_name.replace(/[^a-z0-9]/gi, '_')
    const fileName = `${isNDA.value ? 'NDA' : 'SOW'}_Signed_${cleanCompanyName}.pdf`
    const filePath = `${route.params.clientId}/${Date.now()}_${fileName}`

    console.log("Intentando subir archivo a Storage en la ruta:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error("ERROR EN STORAGE:", uploadError);
      throw new Error(`Error subiendo el PDF: ${uploadError.message}`);
    }

    console.log("Subida exitosa, datos recibidos:", uploadData);
    
    let updates = { company: form.value.company_name }
    if (isNDA.value) {
      updates = { 
        ...updates, 
        nda_status: 'Signed', 
        nda_client_name: form.value.client_name, 
        nda_client_title: form.value.client_title, 
        nda_signed_date: d, 
        nda_signature: sig64,
        nda_pdf_path: filePath 
      }
    } else {
      updates = { 
        ...updates, 
        sow_status: 'Signed', 
        full_address: form.value.full_address, 
        business_name: form.value.business_name, 
        sow_client_name: form.value.client_name, 
        sow_client_title: form.value.client_title, 
        sow_signed_date: d, 
        sow_signature: sig64,
        sow_pdf_path: filePath 
      }
    }

    console.log("Actualizando base de datos con los campos:", updates);

    const { error: dbError } = await supabase.from('clients').update(updates).eq('id', client.value.id)
    if (dbError) {
      console.error("ERROR EN BASE DE DATOS:", dbError);
      throw dbError;
    }

    console.log("Todo completado con éxito.");
    await fetchDocument() 
  } catch (error) { 
    console.error("FALLO GENERAL:", error);
    await showAlert('System error: ' + error.message, 'Critical Error')
  } finally { 
    isSubmitting.value = false 
  }
}

onMounted(fetchDocument)
</script>