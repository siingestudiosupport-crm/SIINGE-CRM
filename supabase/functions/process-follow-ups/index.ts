// @ts-nocheck — Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TRIGGER_LABELS = {
  proposal_3d:        'Proposal Follow-up (3 days)',
  proposal_7d:        'Second Follow-up (7 days)',
  call_completed_24h: 'Post-Call Nudge (24h)',
  cold_30d:           'Cold Re-engagement (30 days)',
}

serve(async (req) => {
  // Validate cron secret to prevent unauthorized triggers
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const DIGEST_TO = 'sierra@siinge.studio'

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // ─── 1. Detect cold leads ────────────────────────────────────────────────────
  // Find client_ids already queued for cold_30d (pending, not completed)
  const { data: existingCold } = await supabase
    .from('email_queue')
    .select('client_id')
    .eq('trigger_type', 'cold_30d')
    .is('completed_at', null)

  const existingColdIds = (existingCold || []).map(r => r.client_id)

  // Clients with no activity in 30+ days
  let coldQuery = supabase
    .from('clients')
    .select('id, name, email')
    .lt('updated_at', thirtyDaysAgo)

  if (existingColdIds.length > 0) {
    coldQuery = coldQuery.not('id', 'in', `(${existingColdIds.join(',')})`)
  }

  const { data: coldLeads } = await coldQuery

  // ─── 2. Queue cold lead follow-ups ──────────────────────────────────────────
  let coldQueued = 0
  if (coldLeads && coldLeads.length > 0) {
    const { data: coldTemplate } = await supabase
      .from('email_templates')
      .select('id')
      .eq('trigger_type', 'cold_30d')
      .single()

    if (coldTemplate) {
      const entries = coldLeads.map(client => ({
        client_id: client.id,
        trigger_type: 'cold_30d',
        template_id: coldTemplate.id,
        due_at: now.toISOString(),
      }))
      await supabase.from('email_queue').insert(entries)
      coldQueued = entries.length
    }
  }

  // ─── 3. Fetch all pending items for digest ───────────────────────────────────
  const { data: pending } = await supabase
    .from('email_queue')
    .select('*, clients(name, email)')
    .is('completed_at', null)
    .order('due_at', { ascending: true })

  const overdue  = (pending || []).filter(item => new Date(item.due_at) <= now)
  const upcoming = (pending || []).filter(item => new Date(item.due_at) > now)

  // ─── 4. Send daily digest ────────────────────────────────────────────────────
  if (RESEND_API_KEY && (pending?.length > 0 || coldQueued > 0)) {
    const renderRow = (item) => {
      const name  = item.clients?.name || '—'
      const label = TRIGGER_LABELS[item.trigger_type] || item.trigger_type
      const due   = new Date(item.due_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#888;">${due}</td>
      </tr>`
    }

    const tableHead = (cols) => `<thead><tr style="background:#f9f9f9;">
      ${cols.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e5e5;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">${c}</th>`).join('')}
    </tr></thead>`

    const overdueSection = overdue.length > 0 ? `
      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c0392b;margin:0 0 8px;">
        Overdue — ${overdue.length}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;">
        ${tableHead(['Client', 'Follow-up', 'Was Due'])}
        <tbody>${overdue.map(renderRow).join('')}</tbody>
      </table>` : ''

    const upcomingSection = upcoming.length > 0 ? `
      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555;margin:0 0 8px;">
        Upcoming — ${upcoming.length}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;">
        ${tableHead(['Client', 'Follow-up', 'Due'])}
        <tbody>${upcoming.map(renderRow).join('')}</tbody>
      </table>` : ''

    const coldNote = coldQueued > 0
      ? `<p style="font-size:12px;color:#888;margin-top:16px;padding-top:16px;border-top:1px solid #eee;">
          + ${coldQueued} cold re-engagement follow-up${coldQueued > 1 ? 's' : ''} added to queue today.
         </p>`
      : ''

    const emptyNote = pending?.length === 0
      ? `<p style="color:#888;font-size:14px;">No pending follow-ups — you're all caught up.</p>`
      : ''

    const html = `
      <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;padding:24px 0;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:#aaa;margin:0 0 6px;">SIINGE Studio CRM</p>
        <h2 style="font-size:22px;font-weight:400;margin:0 0 4px;">Daily Follow-up Digest</h2>
        <p style="color:#aaa;font-size:13px;margin:0 0 28px;">${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        ${overdueSection}
        ${upcomingSection}
        ${emptyNote}
        ${coldNote}
      </div>`

    const subjectParts = []
    if (overdue.length > 0)  subjectParts.push(`${overdue.length} overdue`)
    if (upcoming.length > 0) subjectParts.push(`${upcoming.length} upcoming`)
    const subject = subjectParts.length > 0
      ? `Follow-up Digest — ${subjectParts.join(', ')}`
      : 'Follow-up Digest — all clear'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SIINGE CRM <sierra@siinge.studio>',
        to: [DIGEST_TO],
        subject,
        html,
      }),
    })
  }

  return new Response(JSON.stringify({
    cold_queued: coldQueued,
    pending: pending?.length || 0,
    overdue: overdue.length,
    upcoming: upcoming.length,
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
