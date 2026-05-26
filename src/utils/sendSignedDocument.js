import { supabase } from '../lib/supabaseClient'

export const sendSignedDocumentEmail = async (clientEmail, clientName, documentType, filePath, projectTitle = '') => {
  try {
    console.log('[sendSignedDocumentEmail] Starting with:', { clientEmail, clientName, documentType, filePath })

    // Prepare email content
    const isSOW = documentType === 'sow'
    const docTitle = isSOW ? 'Scope of Work' : 'Non-Disclosure Agreement'

    // Create signed URL valid for 30 days (2592000 seconds)
    // If this fails (e.g. RLS after a document reset), we still send the email without the download link
    console.log('[sendSignedDocumentEmail] Creating signed URL for:', filePath)
    let downloadLinkHtml = '<p>If you need a copy of your signed document, please don\'t hesitate to reach out and we\'ll send it right over.</p>'

    try {
      const { data, error: urlError } = await supabase.storage
        .from('contracts')
        .createSignedUrl(filePath, 2592000)

      if (!urlError && data?.signedUrl) {
        const downloadFilename = `${docTitle.replace(/\s+/g, '_')}_Signed_${clientName.replace(/[^a-z0-9]/gi, '_')}.pdf`
        const downloadUrl = `${data.signedUrl}&download=${encodeURIComponent(downloadFilename)}`
        downloadLinkHtml = `<p>Your signed copy is ready to download <a href="${downloadUrl}">here</a>. The link will be valid for 30 days.</p>`
        console.log('[sendSignedDocumentEmail] Signed URL created successfully')
      } else {
        console.warn('[sendSignedDocumentEmail] Could not create signed URL, sending email without download link:', urlError)
      }
    } catch (urlErr) {
      console.warn('[sendSignedDocumentEmail] Signed URL creation threw, sending email without download link:', urlErr)
    }

    console.log('[sendSignedDocumentEmail] Sending email to:', clientEmail)

    const emailHtml = `
      <p>Hi ${clientName},</p>

      <p>Thank you for reviewing and signing the <strong>${docTitle}</strong> ${isSOW ? `for ${projectTitle}` : ''}.</p>

      ${downloadLinkHtml}

      <p>If you have any questions, please don't hesitate to reach out.</p>
    `

    // Call Supabase Edge Function with unique identifier to prevent deduplication
    const uniqueId = `${documentType}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: clientEmail,
          subject: `Your Signed ${docTitle}`,
          html: emailHtml,
          client_id: clientName,
          doc_type: isSOW ? 'signed_sow' : 'signed_nda',
          idempotency_key: uniqueId
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('[sendSignedDocumentEmail] Response not OK:', response.status, error)
      throw new Error(`Email send failed: ${error.error}`)
    }

    console.log('[sendSignedDocumentEmail] Email sent successfully to:', clientEmail)
    return { success: true, error: null }
  } catch (err) {
    console.error('[sendSignedDocumentEmail] Error:', err.message)
    return { success: false, error: err.message }
  }
}
