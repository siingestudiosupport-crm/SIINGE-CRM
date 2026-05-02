import { supabase } from '../lib/supabaseClient'

export const sendSignedDocumentEmail = async (clientEmail, clientName, documentType, filePath, projectTitle = '') => {
  try {
    // Prepare email content
    const isSOW = documentType === 'sow'
    const docTitle = isSOW ? 'Scope of Work' : 'Non-Disclosure Agreement'

    // Create signed URL valid for 30 days (2592000 seconds)
    const { data, error: urlError } = await supabase.storage
      .from('contracts')
      .createSignedUrl(filePath, 2592000)

    if (urlError || !data?.signedUrl) {
      throw new Error(`Failed to generate download link: ${urlError?.message || 'Unknown error'}`)
    }

    // Pass filename to download parameter so browser saves with correct name
    const downloadFilename = `${docTitle.replace(/\s+/g, '_')}_Signed_${clientName.replace(/[^a-z0-9]/gi, '_')}.pdf`
    const downloadUrl = `${data.signedUrl}&download=${encodeURIComponent(downloadFilename)}`

    const emailHtml = `
      <p>Hi ${clientName},</p>

      <p>Thank you for reviewing and signing the <strong>${docTitle}</strong> ${isSOW ? `for ${projectTitle}` : ''}. Your signed copy is ready to download <a href="${downloadUrl}">here</a>.</p>

      <p>The link will be valid for 30 days. If you have any questions or need a copy after that expires, please don't hesitate to reach out.</p>

      <p>Best regards,<br/>
      <strong>Sierra</strong><br/>
      SIINGE STUDIO</p>
    `

    // Call Supabase Edge Function
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
          doc_type: 'signed_document'
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Email send failed: ${error.error}`)
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Error sending signed document email:', err)
    return { success: false, error: err.message }
  }
}
