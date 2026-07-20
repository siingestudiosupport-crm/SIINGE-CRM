// @ts-nocheck — Deno Edge Function: disable TS server checks (URL imports, Deno global)
//
// Receives a Motion booking (via Zapier's Google Calendar "New Event" trigger)
// and creates/updates a client in the CRM. Isolated: only writes to `clients`.
//
// Zapier sends the raw calendar-event fields and this function parses them:
//   {
//     "secret":      "<MOTION_BOOKING_SECRET>",        // required
//     "summary":     "Test Luis 2 <> Sierra: Scale ...", // event title (name before " <> ")
//     "description": "...Questions:\n...answers...",      // event description (Q&A)
//     "start":       "2026-06-09T10:00:00-06:00",         // event start (ISO)
//     "location":    "https://us06web.zoom.us/j/...",     // Zoom link
//     "attendees":   "sierra@siinge.studio, hydrophs@gmail.com, ..." // guest emails
//   }
// You can also send clean fields directly (name, email, scheduled_date,
// primary_issue, brand_stage, meeting_link) — those take priority over parsing.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Internal team domain — any guest on this domain is NOT the client.
const INTERNAL_DOMAIN = 'siinge.studio'
// Internal addresses that aren't on the domain (host Gmail + the routing inbox).
const INTERNAL_EMAILS = ['siinge.studio@gmail.com', 'siingestudiodev@gmail.com']

function isInternal(email) {
  return email.endsWith('@' + INTERNAL_DOMAIN) || INTERNAL_EMAILS.includes(email)
}

// The intake form's two questions are fixed-option selects; the chosen answer
// appears verbatim in the email body. Match against these known option strings
// (see client-crm/src/views/Clients.vue BRAND_STAGE_OPTIONS).
export const CHALLENGE_OPTIONS = [
  'Tech pack, specs, or development documentation',
  'Sampling, fit, and factory execution support',
  'Full product development from concept through production',
  'Sourcing or manufacturer guidance',
  'Brand Positioning and Product Design',
]
export const BRAND_STAGE_OPTIONS = [
  'Pre-launch with capital allocated for product development',
  'Generating sales with an early product line',
  'Scaling with multiple collections or expanding distribution (DTC/retail)',
  'Established brand investing in new product development or expansion',
]

// Which known option appears in the email text (i.e. the answer to a select).
export function findOption(text, options) {
  if (!text) return null
  const l = String(text).toLowerCase()
  return options.find(o => l.includes(o.toLowerCase())) || null
}

// Map a brand-stage answer to the CRM's dropdown value. Handles the 4 current
// select options plus legacy free-text answers. Falls back to raw text.
export function normalizeBrandStage(raw) {
  if (!raw) return null
  const l = raw.toLowerCase()
  if (l.includes('pre-launch') || l.includes('prelaunch') || l.includes('not launched') || l.includes('no idea'))
    return BRAND_STAGE_OPTIONS[0]
  if (l.includes('generating sales') || l.includes('early product line') || l.includes('already launched'))
    return BRAND_STAGE_OPTIONS[1]
  if (l.includes('scaling') || l.includes('expanding distribution') || l.includes('multiple collections'))
    return BRAND_STAGE_OPTIONS[2]
  if (l.includes('established') || l.includes('expansion') || l.includes('successful'))
    return BRAND_STAGE_OPTIONS[3]
  return raw
}

// "[Invitation:] Client Name <> Sierra: ..." -> "Client Name"
function nameFromSummary(summary) {
  if (!summary) return null
  let s = String(summary).split('<>')[0]
  // Strip calendar subject prefixes: "Invitation:", "Updated invitation:",
  // "Invitation from an unknown sender:", "Accepted:", etc.
  s = s.replace(/^\s*(updated invitation|invitation[^:]*|accepted|declined|tentative)\s*:\s*/i, '')
  return s.trim() || null
}

// First Zoom URL found anywhere in the text.
function extractZoomLink(text) {
  if (!text) return null
  const m = String(text).match(/https?:\/\/[\w.-]*zoom\.us\/[^\s"'<>]+/i)
  return m ? m[0] : null
}

// Parse the booking date out of the email body's "When:" line, e.g.
// "Tuesday, 9th June 2026 | 11:00 am – 11:30 am ... UTC-05:00 America/Bogota".
// If Zapier passes the raw base64-encoded body part, decode it to plain text.
function maybeDecodeBase64(s) {
  if (!s) return s
  const str = String(s)
  const compact = str.replace(/\s+/g, '')
  const whitespace = (str.match(/\s/g) || []).length
  if (compact.length > 100 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(compact) && whitespace < str.length / 15) {
    try { return atob(compact.replace(/-/g, '+').replace(/_/g, '/')) } catch { /* not base64 */ }
  }
  return str
}

const MONTHS = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 }
const pad = (n) => String(n).padStart(2, '0')
// Parse a booking date from text. Handles both Google Calendar form
// ("Jun 8, 2026 11am ... GMT-5") and the "8th June 2026 11:00 am ... UTC-05:00" form.
function parseWhen(text) {
  if (!text) return null
  const t = String(text)
  let day, month, year
  let m = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i)
  if (m) { month = MONTHS[m[1].slice(0, 3).toLowerCase()]; day = +m[2]; year = +m[3] }
  else {
    m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(\d{4})/i)
    if (m) { day = +m[1]; month = MONTHS[m[2].slice(0, 3).toLowerCase()]; year = +m[3] }
  }
  if (!month) return null
  const tm = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*([ap]m)\b/i)
  let hour = 0, min = 0
  if (tm) { hour = (+tm[1]) % 12; if (/pm/i.test(tm[3])) hour += 12; min = tm[2] ? +tm[2] : 0 }
  // Timezone offset: "GMT-5", "UTC-05:00", "GMT+02:00"...
  let offset = 'Z'
  const om = t.match(/(?:GMT|UTC)\s*([+-]\d{1,2})(?::?(\d{2}))?/i)
  if (om) { const h = parseInt(om[1], 10); const mm = om[2] ? +om[2] : 0; offset = `${h < 0 ? '-' : '+'}${pad(Math.abs(h))}:${pad(mm)}` }
  const d = new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(min)}:00${offset}`)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

// First guest email that isn't on the internal team domain = the client.
function clientEmailFromAttendees(attendees) {
  if (!attendees) return null
  const emails = String(attendees).match(/[\w.+-]+@[\w.-]+\.\w+/g) || []
  const client = emails.map(e => e.toLowerCase()).find(e => !isInternal(e))
  return client || null
}

// Grab the text that sits between a question line and the next marker.
export function extractBetween(text, startRe, endRe) {
  if (!text) return null
  const start = text.match(startRe)
  if (!start) return null
  const rest = text.slice(start.index + start[0].length)
  const end = rest.match(endRe)
  const segment = end ? rest.slice(0, end.index) : rest
  return segment.replace(/\s+/g, ' ').trim() || null
}

const handler = async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const payload = await req.json()

    // Shared-secret check so only our Zap can create clients here.
    const expected = Deno.env.get('MOTION_BOOKING_SECRET') ?? ''
    const provided = req.headers.get('x-webhook-secret') || payload.secret || ''
    if (!expected || provided !== expected) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Works with the raw email (subject + body from "Email by Zapier") or with
    // structured calendar fields. Explicit clean fields always win.
    const body = maybeDecodeBase64(payload.body || '')
    const description = payload.description || body   // holds the Q&A
    const summary = payload.summary || payload.subject || ''
    const attendeeText = payload.attendees || body    // holds the guest emails ("Who")

    const name = (payload.name || '').trim() || nameFromSummary(summary)
    const email = ((payload.email || '').trim() || clientEmailFromAttendees(attendeeText) || '').toLowerCase()
    if (!email) return new Response('No client email found', { status: 400 })

    const primary_issue = (payload.primary_issue || '').trim() ||
      findOption(description, CHALLENGE_OPTIONS) ||
      extractBetween(description, /challenges are you facing\?/i, /(how would you|current stage of growth|which stage of the design process)|\n\s*\n|$/i)

    const brand_stage_raw = (payload.brand_stage || '').trim() ||
      findOption(description, BRAND_STAGE_OPTIONS) ||
      extractBetween(description, /(current stage of growth|which stage of the design process)[^\n?]*\??/i, /\n\s*\n|you have been invited|join zoom|need to make changes|scheduled with motion|$/i)

    const meeting_link = (payload.meeting_link || '').trim() || (payload.location || '').trim() ||
      extractZoomLink(body || description)

    // scheduled_date must be a valid timestamp or null — never let a bad date block creation.
    let scheduled_date = null
    const rawDate = payload.scheduled_date || payload.start
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) scheduled_date = d.toISOString()
    }
    if (!scheduled_date) scheduled_date = parseWhen([payload.subject, body, description].filter(Boolean).join('\n'))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Don't overwrite the original lead_source / contract state on returning leads.
    const { data: existing } = await supabase
      .from('clients')
      .select('id, lead_source')
      .eq('email', email)
      .maybeSingle()

    const clientPayload = {
      name: name || null,
      email,
      scheduled_date,
      primary_issue: primary_issue || null,
      brand_stage: normalizeBrandStage(brand_stage_raw),
      meeting_link,
      lead_source: existing?.lead_source || 'Motion',
    }

    if (!existing) {
      clientPayload.nda_status = 'Pending'
      clientPayload.sow_status = 'Pending'
    }

    const { error } = await supabase
      .from('clients')
      .upsert(clientPayload, { onConflict: 'email' })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log(`✅ Motion booking saved: ${clientPayload.name || email}`)
    return new Response('Client saved', { status: 200 })
  } catch (error) {
    console.error('❌ motion-webhook error:', error.message)
    return new Response(error.message, { status: 400 })
  }
}

// Only start the server when run directly, so parse_selfcheck.ts can import the
// pure helpers above without booting the HTTP handler.
if (import.meta.main) serve(handler)
