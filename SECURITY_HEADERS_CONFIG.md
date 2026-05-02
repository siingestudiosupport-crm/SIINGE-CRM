# Security Headers Configuration

## Server-Side Headers (Vercel / Server)

Add these headers to your server configuration. If you're using Vercel, add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    },
    {
      "source": "/portal.*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate, max-age=0"
        }
      ]
    }
  ]
}
```

## CORS Configuration

If using Supabase, ensure CORS is properly configured:

```js
// In supabaseClient.js or similar
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

## What's Protected

✅ **XSS (Cross-Site Scripting)**
- CSP blocks inline scripts except where needed
- Input sanitization enabled
- eval() disabled

✅ **Clickjacking**
- X-Frame-Options prevents embedding in iframes
- Frame-ancestors CSP restricts framing

✅ **MIME Type Sniffing**
- X-Content-Type-Options prevents browser guessing

✅ **Feature Access**
- Permissions-Policy disables camera, mic, geolocation, etc.

✅ **Man-in-the-Middle**
- HSTS forces HTTPS
- Secure cookies (if using auth)

## What Still Needs Configuration in Supabase

1. **Row Level Security (RLS)** - Configure per-table policies
2. **API Rate Limiting** - Use edge functions or middleware
3. **Database Encryption** - Ensure at rest encryption is enabled
4. **Backups** - Configure automated backups

See RLS_SETUP.md for database security configuration.
