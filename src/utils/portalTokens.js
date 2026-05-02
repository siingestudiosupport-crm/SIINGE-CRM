// Portal access tokens - time-limited, single-use tokens for secure document access
import { supabase } from '../lib/supabaseClient'

// Generate a cryptographically secure random token
const generateRandomToken = () => {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

// Create a portal access token
export const createPortalToken = async (clientId, documentType, projectId = null, expiresInHours = 48) => {
  try {
    const token = generateRandomToken()
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase.from('portal_access_tokens').insert([{
      token,
      client_id: clientId,
      document_type: documentType,
      project_id: projectId,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      is_used: false
    }]).select().single()

    if (error) throw error
    return { token, expiresAt, error: null }
  } catch (err) {
    console.error('Error creating portal token:', err)
    return { token: null, expiresAt: null, error: err.message }
  }
}

// Check token validity WITHOUT marking as used
export const checkTokenValid = async (token, clientId, documentType, projectId = null) => {
  try {
    const { data, error } = await supabase
      .from('portal_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('client_id', clientId)
      .eq('document_type', documentType)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Token not found' }
    }

    // Check if expired
    if (new Date() > new Date(data.expires_at)) {
      return { valid: false, error: 'Token has expired' }
    }

    // Check if already used
    if (data.is_used) {
      return { valid: false, error: 'Token has already been used' }
    }

    // Validate project ID if SOW
    if (documentType === 'sow' && projectId && data.project_id !== projectId) {
      return { valid: false, error: 'Token does not match this project' }
    }

    return { valid: true, error: null }
  } catch (err) {
    console.error('Error checking token validity:', err)
    return { valid: false, error: err.message }
  }
}

// Mark token as used (one-time consumption)
export const markTokenAsUsed = async (token) => {
  try {
    const { error } = await supabase
      .from('portal_access_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('token', token)

    if (error) throw error
    return { success: true, error: null }
  } catch (err) {
    console.error('Error marking token as used:', err)
    return { success: false, error: err.message }
  }
}

// Validate and consume a portal token (legacy, use checkTokenValid + markTokenAsUsed instead)
export const validatePortalToken = async (token, clientId, documentType, projectId = null) => {
  const check = await checkTokenValid(token, clientId, documentType, projectId)
  if (!check.valid) return check

  const mark = await markTokenAsUsed(token)
  return mark.success ? { valid: true, error: null } : { valid: false, error: mark.error }
}

// Generate a shareable portal link with token
export const generatePortalLink = (clientId, documentType, projectId = null, token = null) => {
  const baseUrl = window.location.origin
  const params = new URLSearchParams()
  params.append('token', token)

  if (projectId && documentType === 'sow') {
    return `${baseUrl}/portal/${clientId}/${documentType}/${projectId}?${params.toString()}`
  }

  return `${baseUrl}/portal/${clientId}/${documentType}?${params.toString()}`
}
