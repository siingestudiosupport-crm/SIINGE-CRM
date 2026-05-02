<template>
  <div class="min-h-full p-4 md:p-8" style="background: var(--paper);">

    <!-- Header -->
    <div class="flex justify-between items-start" style="margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em;">Follow-ups</h1>
        <p style="font-size: 14px; color: var(--ink-3); margin: 0;">
          <span v-if="pending.length === 0">All caught up — no pending follow-ups.</span>
          <span v-else>
            <span style="font-weight: 700; color: var(--ink);">{{ pending.length }}</span> pending
            <span v-if="overdueCount"> · <span style="font-weight: 700; color: var(--critical);">{{ overdueCount }} overdue</span></span>
          </span>
        </p>
      </div>
      <button
        @click="fetchAll"
        style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--ink); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; transition: all 120ms;"
        @mouseenter="e => e.currentTarget.style.borderColor = 'var(--ink)'"
        @mouseleave="e => e.currentTarget.style.borderColor = 'var(--ink-5)'"
      >Refresh</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3" style="color: var(--ink-4); padding: 40px 0;">
      <div class="animate-spin h-5 w-5" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Loading follow-ups...
    </div>

    <!-- Empty state -->
    <div v-else-if="pending.length === 0" style="padding: 80px 0; text-align: center;">
      <p style="font-family: var(--font-display); font-style: italic; font-size: 24px; color: var(--ink-4); margin: 0 0 8px;">All clear.</p>
      <p style="font-size: 13px; color: var(--ink-5); margin: 0;">No follow-ups pending right now.</p>
    </div>

    <!-- Grouped by stage -->
    <div v-else style="border: 1px solid var(--bone-edge); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column;">
      <div
        v-for="(items, triggerType, idx) in byTrigger"
        :key="triggerType"
        :style="`border-bottom: ${idx < Object.keys(byTrigger).length - 1 ? '1px solid var(--bone-edge)' : 'none'};`"
      >
        <!-- Group header -->
        <button
          @click="toggleGroup(triggerType)"
          class="w-full"
          :style="`display: flex; align-items: center; gap: 12px; padding: 13px 18px; border: none; text-align: left; cursor: pointer; transition: background 120ms; border-left: 3px solid ${expandedGroups.has(triggerType) ? (TRIGGER_META[triggerType]?.color || 'var(--ink-5)') : 'transparent'}; background: ${expandedGroups.has(triggerType) ? 'var(--paper)' : 'var(--bone)'};`"
        >
          <!-- Color dot -->
          <span :style="`width: 7px; height: 7px; border-radius: 50%; background: ${TRIGGER_META[triggerType]?.color || 'var(--ink-5)'}; flex-shrink: 0;`"></span>

          <!-- Label -->
          <span style="font-size: 13px; font-weight: 700; color: var(--ink); flex: 1; text-align: left;">
            {{ TRIGGER_META[triggerType]?.label || triggerType }}
          </span>

          <!-- Overdue badge -->
          <span
            v-if="items.filter(i => isOverdue(i.due_at) && !i.sent_at).length > 0"
            style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 7px; border-radius: 10px; background: var(--critical-soft); color: var(--critical); border: 1px solid var(--critical); white-space: nowrap;"
          >{{ items.filter(i => isOverdue(i.due_at) && !i.sent_at).length }} overdue</span>

          <!-- Total count -->
          <span
            :style="`font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; border: 1px solid; background: ${TRIGGER_META[triggerType]?.color}18; color: ${TRIGGER_META[triggerType]?.color}; border-color: ${TRIGGER_META[triggerType]?.color}44; white-space: nowrap;`"
          >{{ items.length }}</span>

          <!-- Chevron -->
          <svg
            :style="`width: 14px; height: 14px; color: var(--ink-4); flex-shrink: 0; transition: transform 200ms; transform: rotate(${expandedGroups.has(triggerType) ? 180 : 0}deg);`"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          ><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <!-- Items list -->
        <div v-if="expandedGroups.has(triggerType)">
          <div
            v-for="(item, iIdx) in items"
            :key="item.id"
            :style="`padding: 14px 18px 14px 28px; border-top: 1px solid var(--bone-edge); background: var(--paper); ${isOverdue(item.due_at) && !item.sent_at ? 'border-left: 3px solid var(--critical);' : 'border-left: 3px solid transparent;'}`"
          >
            <FollowUpRow :item="item" :templates="templateMap" @compose="openCompose" @done="markDone" />
          </div>
        </div>
      </div>
    </div>

    <!-- Email Compose Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4" style="background: rgba(14,14,12,0.5);">
      <div class="w-full max-w-2xl overflow-hidden flex flex-col" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3); max-height: 90vh;">

        <div class="px-8 py-5 flex justify-between items-center flex-shrink-0" style="background: var(--ink); border-bottom: 1px solid rgba(250,247,242,0.1);">
          <div class="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--paper); margin: 0;">Compose Follow-up</h3>
          </div>
          <button @click="showModal = false" style="color: rgba(250,247,242,0.5); background: none; border: none; font-size: 22px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>

        <div class="p-8 flex-1 space-y-5 overflow-y-auto">
          <div class="space-y-3">
            <div class="grid grid-cols-6 items-center" style="border-bottom: 1px solid var(--bone-edge); padding-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);" class="col-span-1">To</span>
              <input v-model="composeTo" type="email" class="col-span-5" style="font-size: 13px; font-weight: 600; color: var(--ink); background: transparent; border: none; outline: none; width: 100%;" />
            </div>
            <div class="grid grid-cols-6 items-center" style="border-bottom: 1px solid var(--bone-edge); padding-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);" class="col-span-1">CC</span>
              <span class="col-span-5" style="font-size: 13px; font-weight: 600; color: var(--ink-3);">sierra@siinge.studio</span>
            </div>
            <div class="grid grid-cols-6 items-center" style="border-bottom: 1px solid var(--bone-edge); padding-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);" class="col-span-1">Subject</span>
              <input v-model="composeSubject" type="text" class="col-span-5" style="font-size: 13px; font-weight: 600; color: var(--ink); background: transparent; border: none; outline: none; width: 100%;" />
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4); margin-bottom: 8px;">Message</label>
            <textarea
              v-model="composeBody"
              rows="10"
              style="width: 100%; box-sizing: border-box; padding: 14px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.7;"
              @focus="e => e.target.style.borderColor = 'var(--ink)'"
              @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 flex-shrink-0" style="padding: 20px 32px; border-top: 1px solid var(--bone-edge); background: var(--paper-2);">
          <button @click="showModal = false" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">Cancel</button>
          <button @click="sendFollowUp" :disabled="isSending"
            style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
            :style="isSending ? 'opacity: 0.5; cursor: not-allowed;' : ''"
          >{{ isSending ? 'Sending...' : 'Confirm & Send' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'

const { confirm: showConfirm, alert: showAlert } = useConfirmModal()

// ── Trigger metadata ──────────────────────────────────────────────────────────
const TRIGGER_ORDER = ['proposal_3d', 'proposal_7d', 'proposal_weekly', 'call_completed_24h', 'cold_30d', 'review_request']

const TRIGGER_META = {
  proposal_3d:        { label: 'Proposal Follow-up',  timing: '3-day follow-up',         color: 'var(--caution)' },
  proposal_7d:        { label: 'Second Follow-up',    timing: '7-day follow-up',          color: 'var(--ember)'   },
  proposal_weekly:    { label: 'Weekly Follow-up',    timing: 'Weekly check-in',          color: 'var(--ember)'   },
  call_completed_24h: { label: 'Post-Call Nudge',     timing: 'Send proposal within 24h', color: 'var(--info)'    },
  cold_30d:           { label: 'Cold Re-engagement',  timing: '30-day re-engage',         color: 'var(--ink-3)'   },
  review_request:     { label: 'Request Review',      timing: 'After project complete',   color: 'var(--positive)' },
}

const CLOSED_STAGES = ['Contracts Signed', 'Invoice Paid', 'Project Complete', 'Churn']

// ── State ─────────────────────────────────────────────────────────────────────
const queue             = ref([])
const templateMap       = ref({})
const snoozedProjectIds = ref(new Set())
const loading           = ref(true)
const expandedGroups    = ref(new Set(TRIGGER_ORDER))

const showModal      = ref(false)
const isSending      = ref(false)
const activeItem     = ref(null)
const composeTo      = ref('')
const composeSubject = ref('')
const composeBody    = ref('')

// ── Computed ──────────────────────────────────────────────────────────────────
const pending = computed(() =>
  queue.value.filter(i => !i.completed_at && (!i.project_id || !snoozedProjectIds.value.has(i.project_id)))
)

const overdueCount = computed(() =>
  pending.value.filter(i => isOverdue(i.due_at) && !i.sent_at).length
)

// Items grouped by trigger_type, in TRIGGER_ORDER, overdue first within each group
const byTrigger = computed(() => {
  const result = {}
  for (const type of TRIGGER_ORDER) {
    const items = pending.value
      .filter(i => i.trigger_type === type)
      .sort((a, b) => {
        const aOver = isOverdue(a.due_at) && !a.sent_at
        const bOver = isOverdue(b.due_at) && !b.sent_at
        if (aOver !== bOver) return aOver ? -1 : 1
        return new Date(a.due_at) - new Date(b.due_at)
      })
    if (items.length > 0) result[type] = items
  }
  return result
})

const toggleGroup = (type) => {
  const s = new Set(expandedGroups.value)
  s.has(type) ? s.delete(type) : s.add(type)
  expandedGroups.value = s
}

const isOverdue = (due_at) => new Date(due_at) <= new Date()

// ── Data fetching ─────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true

  const now         = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [qRes, tRes, coldTplRes] = await Promise.all([
    supabase.from('email_queue').select('*').is('completed_at', null).order('due_at', { ascending: true }),
    supabase.from('email_templates').select('*'),
    supabase.from('email_templates').select('id').eq('trigger_type', 'cold_30d').maybeSingle()
  ])

  if (tRes.data) {
    const map = {}
    tRes.data.forEach(t => { map[t.trigger_type] = t })
    templateMap.value = map
  }

  if (coldTplRes.data) {
    const alreadyQueued = new Set(
      (qRes.data || []).filter(i => i.trigger_type === 'cold_30d').map(i => i.client_id)
    )
    let coldQuery = supabase.from('clients').select('id, name, email').lt('updated_at', thirtyDaysAgo)
    if (alreadyQueued.size > 0) {
      coldQuery = coldQuery.not('id', 'in', `(${[...alreadyQueued].join(',')})`)
    }
    const { data: coldLeads } = await coldQuery
    if (coldLeads?.length > 0) {
      const entries = coldLeads.map(c => ({
        client_id: c.id, client_name: c.name, client_email: c.email,
        trigger_type: 'cold_30d', due_at: now.toISOString(),
      }))
      const { data: inserted } = await supabase.from('email_queue').insert(entries).select('*')
      if (inserted) qRes.data = [...(qRes.data || []), ...inserted]
    }
  }

  queue.value = qRes.data || []

  const projectIds = [...new Set(queue.value.filter(i => i.project_id).map(i => i.project_id))]
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects').select('id, snooze_until')
      .in('id', projectIds).gt('snooze_until', new Date().toISOString())
    snoozedProjectIds.value = new Set((projects || []).map(p => p.id))
  } else {
    snoozedProjectIds.value = new Set()
  }

  // Auto-expand groups that have items
  expandedGroups.value = new Set(Object.keys(byTrigger.value))

  loading.value = false
}

onMounted(fetchAll)

// ── Compose modal ─────────────────────────────────────────────────────────────
const openCompose = (item) => {
  const tpl = templateMap.value[item.trigger_type]
  const clientName = item.client_name || 'there'
  activeItem.value     = item
  composeTo.value      = item.client_email || ''
  composeSubject.value = (tpl?.subject || '').replace(/\[Client Name\]/g, clientName)
  composeBody.value    = (tpl?.body    || '').replace(/\[Client Name\]/g, clientName)
  showModal.value      = true
}

const sendFollowUp = async () => {
  if (!activeItem.value) return
  isSending.value = true
  try {
    const item = activeItem.value
    const bodyHtml = composeBody.value
      .split('\n')
      .map(l => l.trim() ? `<p style="font-family:sans-serif;color:#374151;margin:0 0 8px;">${l}</p>` : '')
      .join('')

    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
      body: { to: composeTo.value, subject: composeSubject.value, html: bodyHtml,
              client_id: item.client_id, doc_type: 'followup', queue_item_id: item.id }
    })
    if (emailError) throw new Error('Email gateway error: ' + emailError.message)

    await supabase.from('activity_logs').insert({
      event_type: 'followup_sent', client_id: item.client_id, client_name: item.client_name,
      notes: `Follow-up sent: ${TRIGGER_META[item.trigger_type]?.label || item.trigger_type}`
    })

    await supabase.from('email_queue')
      .update({ sent_at: new Date().toISOString(), client_resend_id: emailData?.id || null })
      .eq('id', item.id)

    if (item.resend_id) {
      await supabase.functions.invoke('cancel-reminder', { body: { resend_id: item.resend_id } })
    }

    await queueNextWeekly(item)
    showModal.value = false
    await fetchAll()
    await showAlert('Follow-up sent successfully.', 'Done')
  } catch (err) {
    await showAlert('Failed to send: ' + err.message, 'Error')
  } finally {
    isSending.value = false
  }
}

// ── Weekly chain ──────────────────────────────────────────────────────────────
const queueNextWeekly = async (item) => {
  if (!['proposal_7d', 'proposal_weekly'].includes(item.trigger_type)) return
  if (!item.project_id) return
  const { data: proj } = await supabase.from('projects').select('pipeline_stage').eq('id', item.project_id).single()
  if (!proj || CLOSED_STAGES.includes(proj.pipeline_stage)) return
  const nextDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await supabase.from('email_queue').insert({
    client_id: item.client_id, client_name: item.client_name,
    client_email: item.client_email, project_id: item.project_id,
    project_title: item.project_title, trigger_type: 'proposal_weekly',
    due_at: nextDue.toISOString(),
  })
}

// ── Mark done ─────────────────────────────────────────────────────────────────
const markDone = async (item) => {
  const ok = await showConfirm({
    title: 'Mark as Done',
    message: `Mark the follow-up for ${item.client_name} as completed without sending an email?`,
    confirmText: 'Mark Done', cancelText: 'Cancel', isDangerous: false
  })
  if (!ok) return
  await supabase.from('email_queue')
    .update({ completed_at: new Date().toISOString(), completed_by: 'manual' })
    .eq('id', item.id)
  if (item.resend_id) {
    await supabase.functions.invoke('cancel-reminder', { body: { resend_id: item.resend_id } })
  }
  await queueNextWeekly(item)
  await fetchAll()
}

// ── Row sub-component ─────────────────────────────────────────────────────────
const FollowUpRow = defineComponent({
  props: { item: Object, templates: Object },
  emits: ['compose', 'done'],
  setup(props, { emit }) {
    const daysLabel = (due_at) => {
      const diff = Math.round((new Date(due_at) - Date.now()) / (1000 * 60 * 60 * 24))
      if (diff < 0) return `${Math.abs(diff)}d overdue`
      if (diff === 0) return 'Due today'
      return `Due in ${diff}d`
    }
    const isOv = (due_at) => new Date(due_at) <= new Date()
    const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    return () => h('div', { class: 'flex items-center justify-between gap-4', style: 'flex-wrap: wrap;' }, [
      h('div', { style: 'flex: 1; min-width: 0;' }, [
        h('div', { class: 'flex items-center gap-2', style: 'margin-bottom: 3px; flex-wrap: wrap;' }, [
          h('span', { style: 'font-family: var(--font-display); font-style: italic; font-size: 18px; color: var(--ink); letter-spacing: -0.01em; line-height: 1.2;' },
            props.item.client_name),
          props.item.project_title && h('span', { style: 'font-size: 11px; color: var(--ink-4);' },
            '· ' + props.item.project_title),
        ]),
        h('div', { class: 'flex items-center gap-3', style: 'flex-wrap: wrap;' }, [
          !props.item.sent_at && h('span', {
            style: `font-size: 11px; font-weight: 700; font-family: var(--font-mono); color: ${isOv(props.item.due_at) ? 'var(--critical)' : 'var(--ink-4)'};`
          }, daysLabel(props.item.due_at)),
          !props.item.sent_at && h('span', { style: 'font-size: 11px; color: var(--ink-5); font-family: var(--font-mono);' },
            new Date(props.item.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ),
          props.item.sent_at && h('span', { style: 'font-size: 11px; font-weight: 700; color: var(--positive); font-family: var(--font-mono);' },
            `Sent ${fmtDate(props.item.sent_at)}`),
          props.item.sent_at && h('span', {
            style: `font-size: 11px; font-weight: 700; font-family: var(--font-mono); color: ${props.item.opened_at ? 'var(--info)' : 'var(--ink-5)'};`
          }, props.item.opened_at ? `Opened ${fmtDate(props.item.opened_at)}` : 'Not opened yet'),
        ])
      ]),
      !props.item.sent_at && h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          onClick: () => emit('done', props.item),
          style: 'font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 7px 12px; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; transition: all 120ms; white-space: nowrap;',
          onMouseenter: e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--ink)' },
          onMouseleave: e => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.borderColor = 'var(--ink-5)' },
        }, 'Mark Done'),
        h('button', {
          onClick: () => emit('compose', props.item),
          style: 'font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 7px 14px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; white-space: nowrap;',
          onMouseenter: e => { e.currentTarget.style.opacity = '0.8' },
          onMouseleave: e => { e.currentTarget.style.opacity = '1' },
        }, 'Compose & Send'),
      ]),
    ])
  }
})
</script>
