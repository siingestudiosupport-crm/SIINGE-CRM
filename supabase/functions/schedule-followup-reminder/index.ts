// @ts-nocheck — Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TRIGGER_LABELS = {
  proposal_3d:        'Proposal Follow-up (3 days)',
  proposal_7d:        'Second Follow-up (7 days)',
  proposal_weekly:    'Weekly Follow-up',
  call_completed_24h: 'Post-Call Nudge (24h)',
  cold_30d:           'Cold Re-engagement (30 days)',
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // ── 0. Cooldown — skip if a digest was queued in the last 6 hours ─────────
    const { data: cdRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'digest_last_queued_at')
      .maybeSingle()

    if (cdRow?.value) {
      const lastQueued = new Date(cdRow.value)
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
      if (lastQueued > sixHoursAgo) {
        return new Response(JSON.stringify({ ok: true, note: 'cooldown active, skipped' }), {
          headers: { 'Content-Type': 'application/json' }, status: 200,
        })
      }
    }

    // ── 1. Cancel the previously scheduled digest (if any) ───────────────────
    const { data: setting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'digest_resend_id')
      .maybeSingle()

    const prevResendId = setting?.value
    if (prevResendId) {
      await fetch(`https://api.resend.com/emails/${prevResendId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
      })
    }

    // ── 2. Fetch all pending items ────────────────────────────────────────────
    const { data: allPending } = await supabase
      .from('email_queue')
      .select('id, client_name, project_id, project_title, trigger_type, due_at')
      .is('completed_at', null)
      .is('sent_at', null)
      .order('due_at', { ascending: true })

    // Filter out snoozed projects
    const projectIds = [...new Set((allPending || []).filter(i => i.project_id).map(i => i.project_id))]
    let snoozedIds = new Set<string>()
    if (projectIds.length > 0) {
      const { data: snoozedProjects } = await supabase
        .from('projects')
        .select('id')
        .in('id', projectIds)
        .gt('snooze_until', new Date().toISOString())
      if (snoozedProjects) snoozedIds = new Set(snoozedProjects.map(p => p.id))
    }

    const pending = (allPending || []).filter(i => !i.project_id || !snoozedIds.has(i.project_id))

    if (!pending || pending.length === 0) {
      await supabase.from('app_settings').update({ value: null }).eq('key', 'digest_resend_id')
      return new Response(JSON.stringify({ ok: true, note: 'no pending items' }), { status: 200 })
    }

    // ── 3. Schedule digest 1 day before the earliest due item ─────────────────
    const earliest    = new Date(pending[0].due_at)
    const sendAt      = new Date(earliest.getTime() - 24 * 60 * 60 * 1000)
    const twoMinAhead = new Date(Date.now() + 2 * 60 * 1000)

    const now = new Date()
    const overdue  = pending.filter(i => new Date(i.due_at) <= now)
    const upcoming = pending.filter(i => new Date(i.due_at) > now)

    const renderRow = (item) => {
      const label   = TRIGGER_LABELS[item.trigger_type] || item.trigger_type
      const diff    = Math.round((new Date(item.due_at) - now) / (1000 * 60 * 60 * 24))
      const when    = diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? 'today' : `in ${diff}d`
      const project = item.project_title ? `<span style="font-size:11px;color:#888;display:block;">${item.project_title}</span>` : ''
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-weight:600;">${item.client_name}${project}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#555;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:${diff < 0 ? '#c0392b' : '#888'};font-family:monospace;font-size:12px;">${when}</td>
      </tr>`
    }

    const thead = `<thead><tr style="background:#f9f9f9;">
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e5e5;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Client / Project</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e5e5;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Follow-up</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e5e5;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Due</th>
    </tr></thead>`

    const overdueSection = overdue.length > 0 ? `
      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c0392b;margin:0 0 8px;">Overdue — ${overdue.length}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">${thead}<tbody>${overdue.map(renderRow).join('')}</tbody></table>
    ` : ''

    const upcomingSection = upcoming.length > 0 ? `
      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555;margin:0 0 8px;">Upcoming — ${upcoming.length}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">${thead}<tbody>${upcoming.map(renderRow).join('')}</tbody></table>
    ` : ''

    const html = `
      <div style="font-family:Arial,sans-serif;color:#333;max-width:580px;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:#aaa;margin:0 0 6px;">SIINGE Studio CRM</p>
        <h2 style="font-size:20px;font-weight:400;margin:0 0 4px;">Follow-up Reminder</h2>
        <p style="font-size:13px;color:#aaa;margin:0 0 28px;">${pending.length} pending · Open the CRM to review and send.</p>
        ${overdueSection}
        ${upcomingSection}
      </div>`

    const subjectParts = []
    if (overdue.length)  subjectParts.push(`${overdue.length} overdue`)
    if (upcoming.length) subjectParts.push(`${upcoming.length} upcoming`)
    const subject = `[CRM] Follow-ups — ${subjectParts.join(', ')}`

    const emailBody = {
      from:    'SIINGE CRM <sierra@siinge.studio>',
      to:      ['sierra@siinge.studio'],
      subject,
      html,
    }
    if (sendAt > twoMinAhead) {
      emailBody.scheduled_at = sendAt.toISOString()
    }

    // ── 4. Schedule new digest ────────────────────────────────────────────────
    const resendRes  = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body:    JSON.stringify(emailBody),
    })
    const resendData = await resendRes.json()
    console.log('Digest scheduled:', JSON.stringify(resendData))

    // ── 5. Store new digest ID + cooldown timestamp ───────────────────────────
    await supabase
      .from('app_settings')
      .update({ value: resendData.id || null })
      .eq('key', 'digest_resend_id')

    await supabase
      .from('app_settings')
      .upsert({ key: 'digest_last_queued_at', value: new Date().toISOString() }, { onConflict: 'key' })

    return new Response(JSON.stringify({ ok: true, resend_id: resendData.id, pending: pending.length }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error:', err.message)
    return new Response(err.message, { status: 500 })
  }
})
