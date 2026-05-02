// Security headers configuration
// These headers protect against common web vulnerabilities

export const setupSecurityHeaders = () => {
  // Set security headers via meta tags and instructions for server
  const headers = {
    // Prevent clickjacking attacks
    'X-Frame-Options': 'SAMEORIGIN',

    // Enable XSS protection in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // CORS policy - only allow same origin
    'Access-Control-Allow-Origin': window.location.origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',

    // Content Security Policy - strict but allows necessary resources
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),

    // Permissions policy - disable unnecessary features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'usb=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()'
    ].join(', ')
  }

  return headers
}

// Add meta tags for security
export const addSecurityMetaTags = () => {
  const metaTags = [
    { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0' },
  ]

  metaTags.forEach(tag => {
    const meta = document.createElement('meta')
    if (tag.httpEquiv) meta.httpEquiv = tag.httpEquiv
    if (tag.name) meta.name = tag.name
    meta.content = tag.content
    document.head.appendChild(meta)
  })
}

// Disable dangerous features
export const hardingBrowser = () => {
  // Disable right-click on portal pages (optional, can be removed if too restrictive)
  // document.addEventListener('contextmenu', (e) => e.preventDefault())

  // Prevent console access from external scripts
  Object.defineProperty(window, 'console', {
    value: console,
    writable: false,
    configurable: false
  })

  // Disable eval
  window.eval = function() {
    throw new Error('eval() is disabled for security')
  }
}

// Check for common XSS vectors in user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input

  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// Validate URLs before opening
export const isSafeURL = (url) => {
  try {
    const parsed = new URL(url, window.location.origin)
    // Only allow same-origin or https
    return parsed.origin === window.location.origin || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
