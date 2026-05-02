// Rate limiting for portal access to prevent scraping
// Signature routes (sow, nda) are lenient; other routes are stricter

const RATE_LIMIT_KEY = 'portal_rate_limit'
const SIGNATURE_ROUTES = ['sow', 'nda']

// Signature routes: 50 requests per hour
const SIGNATURE_LIMIT = { requests: 50, windowMs: 3600000 }

// Non-signature routes: 10 requests per hour
const GENERAL_LIMIT = { requests: 10, windowMs: 3600000 }

export const checkRateLimit = (documentType) => {
  const isSignatureRoute = SIGNATURE_ROUTES.includes(documentType)
  const limit = isSignatureRoute ? SIGNATURE_LIMIT : GENERAL_LIMIT

  const now = Date.now()
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  const data = stored ? JSON.parse(stored) : { requests: [], blocked: false, blockedUntil: 0 }

  // Check if currently blocked
  if (data.blocked && now < data.blockedUntil) {
    return {
      allowed: false,
      reason: `Too many requests. Try again in ${Math.ceil((data.blockedUntil - now) / 1000)} seconds.`,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000)
    }
  }

  // Clean old requests outside the window
  data.requests = data.requests.filter(time => now - time < limit.windowMs)

  // Check if limit exceeded
  if (data.requests.length >= limit.requests) {
    data.blocked = true
    data.blockedUntil = now + 300000 // Block for 5 minutes
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))

    return {
      allowed: false,
      reason: `Too many requests. Access blocked for 5 minutes.`,
      retryAfter: 300
    }
  }

  // Record this request
  data.requests.push(now)
  data.blocked = false
  data.blockedUntil = 0
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))

  return { allowed: true }
}

export const clearRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY)
}
