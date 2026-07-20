// @ts-nocheck — Deno Edge Function
//
// The single follow-up cron. Two jobs, in order:
//   1. Queue time-based follow-ups into email_queue (always runs — before the
//      daily guard — so it's independent of whether the digest was already sent).
//   2. Send ONE daily digest to Sierra (guarded by app_settings.digest_last_sent_date).
//
// Point the Supabase cron at THIS function only (schedule-followup-reminder was retired).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TRIGGER_LABELS = {
  proposal_3d:        'Proposal Follow-up (3 days)',
  proposal_7d:        'Second Follow-up (7 days)',
  call_completed_24h: 'Post-Call Nudge (24h)',
  cold_30d:           'Cold Re-engagement (30 days)',
  post_project_30d:   'Post-Project Check-in (30 days)',
}

export const DAY_MS = 24 * 60 * 60 * 1000

// ── Pure eligibility/due helpers (unit-tested in followups_selfcheck.ts) ──────
// Proposal follow-up: due `days` after entering 'Proposal Sent', but only while
// the project is STILL in that stage (leaving it = the client responded).
export function proposalDueDate(project, now, days) {
  if (!project || project.pipeline_stage !== 'Proposal Sent' || !project.proposal_sent_at) return null
  const sentAt = new Date(project.proposal_sent_at).getTime()
  if (isNaN(sentAt)) return null
  if (now.getTime() - sentAt < days * DAY_MS) return null // not due yet
  return new Date(sentAt + days * DAY_MS).toISOString()
}

// Post-call nudge: due 24h after the initial meeting, if it happened (not a no-show).
// The "no proposal sent yet" condition is enforced at query time, not here.
export function callNudgeDueDate(client, now) {
  if (!client || !client.scheduled_date || client.no_show_date) return null
  const sched = new Date(client.scheduled_date).getTime()
  if (isNaN(sched)) return null
  if (now.getTime() - sched < DAY_MS) return null
  return new Date(sched + DAY_MS).toISOString()
}

const handler = async (req) => {
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
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS).toISOString()

  // Template id per trigger_type (queue rows reference it; blank compose without it).
  const { data: templates } = await supabase.from('email_templates').select('id, trigger_type')
  const templateId = {}
  for (const t of (templates || [])) templateId[t.trigger_type] = t.id

  // Already-queued ids for a trigger (any status) — used to dedupe scans.
  const queuedIdsFor = async (trigger, col) => {
    const { data } = await supabase.from('email_queue').select(col).eq('trigger_type', trigger)
    return new Set((data || []).map(r => r[col]).filter(Boolean))
  }

  const queued = { cold_30d: 0, proposal_3d: 0, proposal_7d: 0, call_completed_24h: 0 }

  // ─── 1a. Cold leads (30d no activity) ────────────────────────────────────────
  {
    const existing = await queuedIdsFor('cold_30d', 'client_id')
    let q = supabase.from('clients').select('id, name, email').lt('updated_at', thirtyDaysAgo)
    if (existing.size) q = q.not('id', 'in', `(${[...existing].join(',')})`)
    const { data: cold } = await q
    const entries = (cold || []).map(c => ({
      client_id: c.id, client_name: c.name, client_email: c.email,
      trigger_type: 'cold_30d', template_id: templateId.cold_30d || null,
      due_at: now.toISOString(),
    }))
    if (entries.length) { await supabase.from('email_queue').insert(entries); queued.cold_30d = entries.length }
  }

  // ─── 1b. Proposal follow-ups (3d / 7d after entering 'Proposal Sent') ─────────
  const { data: proposalProjects } = await supabase
    .from('projects')
    .select('id, title, client_id, pipeline_stage, proposal_sent_at, clients(name, email)')
    .eq('pipeline_stage', 'Proposal Sent')
    .not('proposal_sent_at', 'is', null)

  for (const [trigger, days] of [['proposal_3d', 3], ['proposal_7d', 7]]) {
    const existing = await queuedIdsFor(trigger, 'project_id')
    const entries = []
    for (const p of (proposalProjects || [])) {
      if (existing.has(p.id)) continue
      const due = proposalDueDate(p, now, days)
      if (!due) continue
      entries.push({
        client_id: p.client_id, client_name: p.clients?.name || '', client_email: p.clients?.email || '',
        project_id: p.id, project_title: p.title || '',
        trigger_type: trigger, template_id: templateId[trigger] || null, due_at: due,
      })
    }
    if (entries.length) { await supabase.from('email_queue').insert(entries); queued[trigger] = entries.length }
  }

  // ─── 1c. Post-call nudge (24h after the initial meeting, no proposal yet) ─────
  {
    const existing = await queuedIdsFor('call_completed_24h', 'client_id')
    // Clients whose proposal was already sent (any project) — skip the nudge.
    const { data: sentProjects } = await supabase
      .from('projects').select('client_id').not('proposal_sent_at', 'is', null)
    const proposalSentClients = new Set((sentProjects || []).map(r => r.client_id))

    const { data: clients } = await supabase
      .from('clients').select('id, name, email, scheduled_date, no_show_date')
      .not('scheduled_date', 'is', null).is('no_show_date', null)

    const entries = []
    for (const c of (clients || [])) {
      if (existing.has(c.id) || proposalSentClients.has(c.id)) continue
      const due = callNudgeDueDate(c, now)
      if (!due) continue
      entries.push({
        client_id: c.id, client_name: c.name || '', client_email: c.email || '',
        trigger_type: 'call_completed_24h', template_id: templateId.call_completed_24h || null, due_at: due,
      })
    }
    if (entries.length) { await supabase.from('email_queue').insert(entries); queued.call_completed_24h = entries.length }
  }

  // ── 2. Daily digest guard — whichever run claims the day sends; others skip ──
  const todayUTC = now.toISOString().split('T')[0]
  const { data: claimed } = await supabase
    .from('app_settings')
    .update({ value: todayUTC })
    .eq('key', 'digest_last_sent_date')
    .neq('value', todayUTC)
    .select('key')

  if (!claimed?.length) {
    const { data: existing } = await supabase
      .from('app_settings').select('value').eq('key', 'digest_last_sent_date').maybeSingle()
    if (existing?.value === todayUTC) {
      return new Response(JSON.stringify({ ok: true, note: 'digest already sent today', queued }), {
        headers: { 'Content-Type': 'application/json' }, status: 200,
      })
    }
    if (!existing) {
      const { error: insertErr } = await supabase
        .from('app_settings').insert({ key: 'digest_last_sent_date', value: todayUTC })
      if (insertErr) {
        return new Response(JSON.stringify({ ok: true, note: 'race: other process claimed', queued }), {
          headers: { 'Content-Type': 'application/json' }, status: 200,
        })
      }
    }
  }

  // ─── 3. Fetch all pending items for the digest ───────────────────────────────
  const { data: pending } = await supabase
    .from('email_queue')
    .select('*, clients(name, email)')
    .is('completed_at', null)
    .order('due_at', { ascending: true })

  const overdue  = (pending || []).filter(item => new Date(item.due_at) <= now)
  const upcoming = (pending || []).filter(item => new Date(item.due_at) > now)

  // ─── 4. Send daily digest ────────────────────────────────────────────────────
  if (RESEND_API_KEY && pending?.length > 0) {
    const renderRow = (item) => {
      const name  = item.clients?.name || item.client_name || '—'
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

    const html = `
      <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;padding:24px 0;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:#aaa;margin:0 0 6px;">SIINGE Studio CRM</p>
        <h2 style="font-size:22px;font-weight:400;margin:0 0 4px;">Daily Follow-up Digest</h2>
        <p style="color:#aaa;font-size:13px;margin:0 0 28px;">${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        ${overdueSection}
        ${upcomingSection}
      </div>`

    const subjectParts = []
    if (overdue.length > 0)  subjectParts.push(`${overdue.length} overdue`)
    if (upcoming.length > 0) subjectParts.push(`${upcoming.length} upcoming`)
    const subject = subjectParts.length > 0
      ? `Follow-up Digest — ${subjectParts.join(', ')}`
      : 'Follow-up Digest — all clear'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: 'SIINGE CRM <sierra@siinge.studio>', to: [DIGEST_TO], subject, html }),
    })
  }

  return new Response(JSON.stringify({
    queued,
    pending: pending?.length || 0,
    overdue: overdue.length,
    upcoming: upcoming.length,
  }), { headers: { 'Content-Type': 'application/json' }, status: 200 })
}

// Only boot the server when run directly, so followups_selfcheck.ts can import
// the pure helpers without starting the HTTP handler.
if (import.meta.main) serve(handler)
