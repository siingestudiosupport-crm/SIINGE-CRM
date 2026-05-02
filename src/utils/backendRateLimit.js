// Backend rate limiting - checks against Supabase records
// Signature routes (sow, nda): 100 requests/hour
// Other routes: 20 requests/hour

import { supabase } from '../lib/supabaseClient'

const RATE_LIMITS = {
  sow: { maxRequests: 100, windowMinutes: 60 },
  nda: { maxRequests: 100, windowMinutes: 60 },
  default: { maxRequests: 20, windowMinutes: 60 }
}

// Get client IP from request headers (for server-side use)
// This is called from edge functions, so IP comes from headers
export const getClientIP = (request) => {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('cf-connecting-ip') ||
         'unknown'
}

// Check rate limit and log access
export const checkBackendRateLimit = async (clientId, documentType, clientIp = null) => {
  try {
    const limit = RATE_LIMITS[documentType] || RATE_LIMITS.default
    const now = new Date()
    const windowStart = new Date(now.getTime() - limit.windowMinutes * 60 * 1000)

    // Count requests in the window
    const { data, error } = await supabase
      .from('portal_request_logs')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('document_type', documentType)
      .gte('created_at', windowStart.toISOString())

    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, message: null } // Fail open
    }

    const requestCount = data?.length || 0

    if (requestCount >= limit.maxRequests) {
      return {
        allowed: false,
        message: `Rate limit exceeded: ${requestCount}/${limit.maxRequests} requests in the last ${limit.windowMinutes} minutes`,
        retryAfter: limit.windowMinutes * 60
      }
    }

    return { allowed: true, message: null }
  } catch (err) {
    console.error('Backend rate limit error:', err)
    return { allowed: true, message: null } // Fail open
  }
}

// Log a portal access attempt
export const logPortalAccess = async (clientId, documentType, statusCode = 200, clientIp = null) => {
  try {
    await supabase.from('portal_request_logs').insert([{
      client_id: clientId,
      document_type: documentType,
      endpoint: `/portal/${clientId}/${documentType}`,
      status_code: statusCode,
      client_ip: clientIp || '0.0.0.0'
    }])
  } catch (err) {
    console.error('Error logging portal access:', err)
  }
}

// Check if IP is known scraper/bot
export const isKnownScraper = (userAgent) => {
  const scraperPatterns = [
    /bot|crawler|spider|scraper|curl|wget|python|node|java(?!script)|golang|ruby|php/i,
    /selenium|playwright|puppeteer|headless|phantomjs/i
  ]
  return scraperPatterns.some(pattern => pattern.test(userAgent))
}
