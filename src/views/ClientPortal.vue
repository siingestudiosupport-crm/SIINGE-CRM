<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">

    <div v-if="loading" class="max-w-3xl mx-auto text-center py-20">
      <p class="text-gray-500 font-medium animate-pulse">Loading secure document...</p>
    </div>
    <div v-else-if="tokenError" class="max-w-3xl mx-auto text-center py-20 bg-white shadow rounded-xl border-l-4 border-red-500">
      <div class="p-6">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M12 2a10 10 0 110 20 10 10 0 010-20z"/></svg>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p class="text-gray-600 mb-6">{{ tokenError }}</p>
        <p class="text-sm text-gray-500">If you believe this is an error, please contact the document sender.</p>
      </div>
    </div>
    <div v-else-if="!client" class="max-w-3xl mx-auto text-center py-20 bg-white shadow rounded-xl">
      <h2 class="text-2xl font-bold text-gray-800">Document Not Found</h2>
    </div>

    <div v-else-if="tokenValid" class="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      
      <div class="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold tracking-wider uppercase">{{ isNDA ? 'NON-DISCLOSURE AGREEMENT' : 'SCOPE OF WORK' }}</h1>
          <p class="text-slate-400 text-sm mt-1">Ref: #{{ client.id.substring(0, 8) }}</p>
        </div>
        <div v-if="isSigned" class="text-right">
          <div class="flex items-center gap-2 text-white bg-green-600 px-4 py-2 rounded-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-bold">Document Signed</span>
          </div>
        </div>
      </div>

      <div class="px-8 py-8">

        <div class="mb-6 p-4" :style="isSigned ? 'background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 0.5rem;' : 'background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.5rem;'">
          <div class="flex items-center justify-between">
            <div>
              <h3 v-if="isSigned" class="text-sm font-bold text-green-800 uppercase tracking-wider">✓ Thank You!</h3>
              <h3 v-else class="text-sm font-bold text-blue-800 uppercase tracking-wider">Review Mode</h3>
              <p v-if="isSigned" class="text-green-700 text-xs mt-1">Thank you for signing the {{ isNDA ? 'Non-Disclosure Agreement' : 'Scope of Work' }}. A copy of the signed document has been sent to your email for your records.</p>
              <p v-else class="text-blue-600 text-xs mt-1">The document is read-only. Complete the fields below to update the preview.</p>
            </div>
          </div>
        </div>
        
        <div class="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden mb-10 bg-gray-100 shadow-inner">
          <iframe v-if="pdfPreviewUrl" :src="pdfPreviewUrl + '#toolbar=0&navpanes=0&scrollbar=0'" class="w-full h-full" frameborder="0"></iframe>
          <div v-else class="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Injecting contract data...</p>
          </div>
        </div>

        <div v-if="!isSigned" class="pt-8 border-t border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Execution & Signatures</h3>

          <div class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                <input v-model="form.company_name" type="text" class="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <template v-if="isSOW">
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

            <button @click.prevent="submitDocument" :disabled="!isValid || isSubmitting" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:shadow-none disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3">
              <span v-if="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isSubmitting ? 'Securing & Saving to Vault...' : 'I Agree and Sign Document' }}
            </button>
          </div>
        </div>

        <div v-else class="pt-8 border-t border-gray-200">
          <div class="bg-green-50 p-8 rounded-xl border border-green-200 flex flex-col md:flex-row justify-between items-center">
            <div>
              <p class="text-green-800 font-bold text-lg">Document Signed & Secured</p>
              <p class="text-green-600 text-sm mt-1">Executed by <span class="font-bold">{{ isNDA ? client.nda_client_name : sowProject?.sow_client_name }}</span></p>
            </div>
            <img v-if="isNDA ? client.nda_signature : sowProject?.sow_signature" :src="isNDA ? client.nda_signature : sowProject.sow_signature" class="h-20 mix-blend-multiply mt-4 md:mt-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Thank You Modal -->
    <div v-if="showThankYouModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5);">
      <div class="w-full max-w-md overflow-hidden rounded-xl" style="background: var(--bone); border: 1px solid var(--bone-edge); box-shadow: var(--shadow-3);">
        <div style="padding: 40px 32px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" style="color: #10b981;">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 style="font-size: 24px; font-weight: bold; color: var(--ink); margin: 0 0 12px;">Thank You!</h2>
          <p style="font-size: 14px; color: var(--ink-2); margin: 0 0 20px; line-height: 1.6;">
            Thank you for signing the {{ isNDA ? 'Non-Disclosure Agreement' : 'Scope of Work' }}. A copy of the signed document has been sent to your email for your records.
          </p>
          <button @click="showThankYouModal = false" style="font-family: var(--font-sans); font-weight: 700; font-size: 14px; padding: 12px 32px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import { PDFDocument, StandardFonts, rgb, PDFRef } from 'pdf-lib'
import { getSOWPdfBlob, getSOWPdfDataUrl } from '../utils/sowPdfmake'
import { checkRateLimit } from '../utils/portalRateLimit'
import { checkTokenValid } from '../utils/portalTokens'
import { checkBackendRateLimit, logPortalAccess, isKnownScraper } from '../utils/backendRateLimit'
import { sendSignedDocumentEmail } from '../utils/sendSignedDocument'

const route = useRoute()
const { alert: showAlert } = useConfirmModal()
const loading = ref(true)
const isSubmitting = ref(false)
const isGeneratingPDF = ref(false)
const client = ref(null)
const sowProject = ref(null)
const pdfPreviewUrl = ref('')
const tokenValid = ref(false)
const tokenError = ref(null)

const form = ref({ company_name: '', full_address: '', business_name: '', client_name: '', client_title: '' })
const sigCanvas = ref(null); const ctx = ref(null); const isDrawing = ref(false); const hasDrawn = ref(false)
const showThankYouModal = ref(false)

const isNDA = computed(() => route.params.documentType === 'nda')
const isSOW = computed(() => route.params.documentType === 'sow')

const isSigned = computed(() => {
  if (!client.value) return false
  if (isNDA.value) return client.value.nda_status === 'Signed'
  return sowProject.value?.sow_status === 'Signed'
})

const isValid = computed(() => {
  if (!hasDrawn.value || !form.value.client_name || !form.value.client_title || !form.value.company_name) return false
  if (isSOW.value && !form.value.full_address) return false
  return true
})

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''

const fetchDocument = async () => {
  try {
    loading.value = true

    // Detect scrapers
    const userAgent = navigator.userAgent
    if (isKnownScraper(userAgent)) {
      tokenError.value = 'Automated access not permitted.'
      await logPortalAccess(route.params.clientId, route.params.documentType, 403)
      loading.value = false
      return
    }

    // Validate portal token
    const token = route.query.token
    if (!token) {
      tokenError.value = 'Missing access token. This link may have expired or is invalid.'
      loading.value = false
      return
    }

    const validation = await checkTokenValid(
      token,
      route.params.clientId,
      route.params.documentType,
      route.params.projectId
    )

    if (!validation.valid) {
      tokenError.value = validation.error || 'Invalid or expired access token'
      await logPortalAccess(route.params.clientId, route.params.documentType, 401)
      loading.value = false
      return
    }

    tokenValid.value = true

    // Client-side rate limiting
    const rateLimitCheck = checkRateLimit(route.params.documentType)
    if (!rateLimitCheck.allowed) {
      tokenError.value = rateLimitCheck.reason || 'Too many requests'
      await logPortalAccess(route.params.clientId, route.params.documentType, 429)
      loading.value = false
      return
    }

    // Backend rate limiting
    const backendLimit = await checkBackendRateLimit(route.params.clientId, route.params.documentType)
    if (!backendLimit.allowed) {
      tokenError.value = backendLimit.message || 'Rate limit exceeded'
      await logPortalAccess(route.params.clientId, route.params.documentType, 429)
      loading.value = false
      return
    }

    // Log successful access
    await logPortalAccess(route.params.clientId, route.params.documentType, 200)

    console.log('[fetchDocument] Fetching client data')
    const { data, error: clientError } = await supabase.from('clients').select('*').eq('id', route.params.clientId).single()
    if (clientError) throw new Error(`Failed to fetch client: ${clientError.message}`)
    client.value = data
    console.log('[fetchDocument] Client loaded:', client.value?.id)

    // For SOW: fetch the specific project so each project has its own SOW
    if (isSOW.value && route.params.projectId) {
      console.log('[fetchDocument] Fetching SOW project:', route.params.projectId)
      const { data: projData, error: projError } = await supabase.from('projects').select('*').eq('id', route.params.projectId).single()
      if (projError) throw new Error(`Failed to fetch project: ${projError.message}`)
      sowProject.value = projData
      console.log('[fetchDocument] Project loaded:', sowProject.value?.id)
    }

    if (data) {
      form.value.company_name = ''
      form.value.client_name = ''
      form.value.client_title = ''
      form.value.full_address = ''
      form.value.business_name = ''

      // Tracking: opened_at
      if (!isSigned.value) {
        if (isNDA.value && !data.nda_opened_at) {
          await supabase.from('clients').update({ nda_opened_at: new Date().toISOString() }).eq('id', data.id)
        } else if (isSOW.value && sowProject.value && !sowProject.value.sow_opened_at) {
          await supabase.from('projects').update({ sow_opened_at: new Date().toISOString() }).eq('id', sowProject.value.id)
        }
      }
    }

    console.log('[fetchDocument] About to generate PDF preview')
    await generateLivePDFPreview()
    console.log('[fetchDocument] PDF preview generated successfully')
  } catch (error) {
    console.error('[fetchDocument] Error:', error)
    tokenError.value = `Failed to load document: ${error.message}`
  } finally {
    loading.value = false
  }
}

const buildPDF = async (forDownload = false, flattenPdf = false) => {
  const p = client.value

  // === SOW: Generate with pdfmake ===
  if (isSOW.value) {
    try {
      const proj = sowProject.value || p
      if (!proj) throw new Error('Project data not available')

      const studioSignatureBase64 = await fetch('/signature.png')
        .then(r => r.blob())
        .then(b => new Promise(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(b)
        }))
        .catch(() => null)

      // Determine which signature to show:
      // - After signing: use saved signature from database
      // - Before signing (preview): use canvas if drawn
      // - For download: use saved signature if available
      let clientSig = null
      if (proj.sow_signature) {
        // Use saved signature (for both preview after signing and download)
        clientSig = proj.sow_signature.split(',')[1]
      } else if (!forDownload && hasDrawn.value) {
        // Preview before signing: use canvas signature if drawn
        clientSig = sigCanvas.value.toDataURL('image/png').split(',')[1]
      }

      const blob = await getSOWPdfBlob({
        date_1: formatDate(proj.sow_sent_date),
        date_2: formatDate(proj.sow_signed_date || (proj.sow_status === 'Signed' ? new Date().toISOString() : '')),
        date_3: formatDate(proj.sow_signed_date || (proj.sow_status === 'Signed' ? new Date().toISOString() : '')),
        company_name: form.value.company_name,
        full_address: form.value.full_address,
        business_name: form.value.company_name,
        client_name: form.value.client_name,
        client_title: form.value.client_title,
        deliverables: proj.sow_deliverables,
        timeline: proj.sow_timeline,
        fees_payment: proj.sow_fees_payment,
        signatureImageBase64: clientSig,
        studioSignatureBase64,
      })

      return new Uint8Array(await blob.arrayBuffer())
    } catch (error) {
      console.error('[buildPDF] SOW generation error:', error)
      throw error
    }
  }

  // === NDA: Use PDF template (existing logic) ===
  const url = '/mutual_nda.pdf'
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const pdfForm = pdfDoc.getForm()

  const fillField = (fieldName, text) => {
    try {
      const field = pdfForm.getTextField(fieldName)
      if (field) field.setText(String(text || ''))
    } catch (e) { console.warn('Field not found in PDF:', fieldName) }
  }

  fillField('date_1', formatDate(p.nda_sent_date))
  fillField('company_name', form.value.company_name)
  fillField('client_name', form.value.client_name)
  fillField('client_title', form.value.client_title)
  fillField('date_2', formatDate(p.nda_signed_date || (p.nda_status === 'Signed' ? new Date().toISOString() : '')))
  fillField('date_3', formatDate(p.nda_signed_date || (p.nda_status === 'Signed' ? new Date().toISOString() : '')))

  if (forDownload && p.nda_signature) {
    try {
      const png = await pdfDoc.embedPng(p.nda_signature)
      const rect = pdfForm.getField('signature_nda').acroField.getWidgets()[0].getRectangle()
      pdfDoc.getPages()[pdfDoc.getPages().length - 1].drawImage(png, { x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    } catch (err) { console.warn('Signature embedding failed') }
  }

  if (flattenPdf || forDownload) pdfForm.flatten()

  return await pdfDoc.save()
}

const generateLivePDFPreview = async () => {
  try {
    const pdfBytes = await buildPDF(false, true)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error("[PDF Preview] Error:", error)
    tokenError.value = `PDF generation failed: ${error.message}`
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

watch(sigCanvas, (canvas) => {
  if (canvas) initCanvas()
})

// Update preview only when signature is drawn or after signing (not on form changes to avoid flashing)
watch(() => hasDrawn.value, async () => {
  if (!tokenValid.value || !client.value) return
  try {
    await generateLivePDFPreview()
  } catch (error) {
    console.error('[updatePreview] Error:', error)
  }
})

watch(() => sowProject.value?.sow_signature, async () => {
  if (!tokenValid.value || !client.value) return
  try {
    await generateLivePDFPreview()
  } catch (error) {
    console.error('[updatePreview] Error:', error)
  }
})


const submitDocument = async () => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    console.log("Iniciando proceso de firma...");
    
    const sig64 = sigCanvas.value.toDataURL('image/png')
    const d = new Date().toISOString()

    if (isNDA.value) {
      client.value.nda_signature = sig64
      client.value.nda_signed_date = d
    } else if (sowProject.value) {
      sowProject.value.sow_signature = sig64
      sowProject.value.sow_signed_date = d
    }

    console.log("Generando PDF con pdf-lib...");
    const pdfBytes = await buildPDF(true)
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })

    const cleanCompanyName = form.value.company_name.replace(/[^a-z0-9]/gi, '_')
    const fileName = `${cleanCompanyName}_${Date.now()}_${isNDA.value ? 'NDA' : 'SOW'}_Signed.pdf`
    const filePath = `${cleanCompanyName}/${fileName}`

    console.log("Intentando subir archivo a Storage en la ruta:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error("ERROR EN STORAGE:", uploadError);
      throw new Error(`Error uploading the PDF: ${uploadError.message}`);
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
        full_address: form.value.full_address,
        business_name: form.value.company_name,
      }
    }

    const { error: dbError } = await supabase.from('clients').update(updates).eq('id', client.value.id)
    if (dbError) {
      console.error("ERROR EN BASE DE DATOS:", dbError);
      throw dbError;
    }

    // SOW: write all signing data to the project
    let signedProjectId = null
    let signedProjectTitle = null
    if (!isNDA.value && sowProject.value) {
      signedProjectId = sowProject.value.id
      signedProjectTitle = sowProject.value.title
      const { error: sowUpdateError } = await supabase.from('projects').update({
        sow_status: 'Signed',
        sow_client_name: form.value.client_name,
        sow_client_title: form.value.client_title,
        sow_signed_date: d,
        sow_signature: sig64,
        sow_pdf_path: filePath
      }).eq('id', sowProject.value.id)

      if (sowUpdateError) {
        console.error('ERROR actualizando proyecto SOW:', sowUpdateError)
        throw sowUpdateError
      }

      // Update local state to reflect signed status
      sowProject.value.sow_status = 'Signed'
      sowProject.value.sow_signature = sig64
      sowProject.value.sow_signed_date = d
    } else if (isNDA.value) {
      // Update local state for NDA
      client.value.nda_status = 'Signed'
      client.value.nda_signature = sig64
    }

    await supabase.from('activity_logs').insert({
      event_type: isNDA.value ? 'nda_signed' : 'sow_signed',
      client_id: client.value.id,
      client_name: client.value.name,
      project_id: signedProjectId,
      project_title: signedProjectTitle,
      notes: `Signed by ${form.value.client_name} (${form.value.client_title})`
    })

    // Send signed document email to client
    if (client.value.email) {
      const emailResult = await sendSignedDocumentEmail(
        client.value.email,
        form.value.client_name,
        route.params.documentType,
        filePath,
        signedProjectTitle
      )
      if (!emailResult.success) {
        console.error('Email send failed:', emailResult.error)
      } else {
        console.log('Signed document email sent successfully')
      }
    }

    console.log("Todo completado con éxito.");
    showThankYouModal.value = true
    await generateLivePDFPreview()
  } catch (error) {
    console.error("FALLO GENERAL:", error);
    await showAlert('System error: ' + error.message, 'Critical Error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchDocument)
</script>
