<template>
  <div class="flex flex-col h-full" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;">

    <!-- Header -->
    <div class="flex justify-between items-center" style="padding: 20px 24px; border-bottom: 1px solid var(--ink);">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Calendar</h1>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Project due dates at a glance.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="prevMonth" style="padding: 7px 12px; background: transparent; border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; color: var(--ink-3); font-size: 16px; line-height: 1; transition: all 120ms;" @mouseenter="e=>e.currentTarget.style.borderColor='var(--ink)'" @mouseleave="e=>e.currentTarget.style.borderColor='var(--ink-5)'">‹</button>
        <span style="font-family: var(--font-display); font-style: italic; font-size: 20px; color: var(--ink); min-width: 180px; text-align: center; letter-spacing: -0.01em;">{{ monthLabel }}</span>
        <button @click="nextMonth" style="padding: 7px 12px; background: transparent; border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; color: var(--ink-3); font-size: 16px; line-height: 1; transition: all 120ms;" @mouseenter="e=>e.currentTarget.style.borderColor='var(--ink)'" @mouseleave="e=>e.currentTarget.style.borderColor='var(--ink-5)'">›</button>
      </div>
    </div>

    <div v-if="loading" class="p-8 text-center" style="color: var(--ink-4);">Loading...</div>

    <div v-else class="flex-1 overflow-auto p-4">
      <!-- Day headers -->
      <div class="grid grid-cols-7 mb-1">
        <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d"
          style="padding: 6px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-4); text-align: center;">
          {{ d }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7" style="border-left: 1px solid var(--bone-edge); border-top: 1px solid var(--bone-edge);">
        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          style="min-height: 100px; border-right: 1px solid var(--bone-edge); border-bottom: 1px solid var(--bone-edge); padding: 6px;"
          :style="cell.isToday ? 'background: var(--paper);' : cell.isCurrentMonth ? '' : 'background: var(--paper-2);'"
        >
          <!-- Day number -->
          <div style="margin-bottom: 4px;">
            <span
              :style="cell.isToday
                ? 'display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: var(--ink); color: var(--paper); border-radius: 50%; font-size: 11px; font-weight: 700;'
                : 'font-size: 11px; font-weight: 600; color: ' + (cell.isCurrentMonth ? 'var(--ink-3)' : 'var(--ink-5)') + ';'"
            >{{ cell.day }}</span>
          </div>

          <!-- Event pills -->
          <div v-for="evt in cell.events" :key="evt.id" class="mb-1">
            <button
              @click="evt.type === 'project' ? openProject(evt) : evt.type === 'zoom' ? openZoom(evt) : null"
              style="width: 100%; text-align: left; padding: 3px 6px; border-radius: 2px; border: none; cursor: pointer; font-size: 9px; font-weight: 600; line-height: 1.2; transition: opacity 120ms; overflow: hidden; display: block;"
              :style="getEventPillStyle(evt)"
              @mouseenter="e=>e.currentTarget.style.opacity='0.8'"
              @mouseleave="e=>e.currentTarget.style.opacity='1'"
              :title="evt.title"
            >
              <span style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ evt.label }}</span>
              <span v-if="evt.type === 'project' && evt.stage" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.stage }}</span>
              <span v-if="evt.type === 'zoom' && evt.meetingTime" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.meetingTime }}</span>
              <span v-if="(evt.type === 'followup' || evt.type === 'keyrotation') && evt.followupType" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.followupType }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ProjectDetail
      v-if="selectedProject"
      :is-open="isDetailOpen"
      :project="selectedProject"
      @close="isDetailOpen = false"
      @updated="fetchEvents"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ProjectDetail from '../components/ProjectDetail.vue'

// Human-readable follow-up labels — mirrors TRIGGER_META in FollowUps.vue
const FOLLOWUP_LABELS = {
  proposal_3d:        'Proposal Follow-up',
  proposal_7d:        'Second Follow-up',
  proposal_weekly:    'Weekly Follow-up',
  call_completed_24h: 'Post-Call Nudge',
  cold_30d:           'Cold Re-engagement',
  review_request:     'Request Review',
}

const events = ref([])
const loading = ref(true)
const isDetailOpen = ref(false)
const selectedProject = ref(null)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

const monthLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
})

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const fetchEvents = async () => {
  try {
    loading.value = true
    const allEvents = []

    // Fetch projects with due dates and other important dates
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, due_date, pipeline_stage, client_id, client:clients(name)')
      .order('due_date', { ascending: true })

    if (projects) {
      for (const p of projects) {
        const client = /** @type {any} */ (p.client)
        const clientName = (Array.isArray(client) ? client[0]?.name : client?.name) || ''

        // Due date event
        if (p.due_date) {
          allEvents.push({
            id: `proj-due-${p.id}`,
            type: 'project',
            date: p.due_date,
            title: `${p.title} (Due)`,
            label: p.title,
            stage: p.pipeline_stage,
            projectId: p.id,
            clientName,
            originalData: p
          })
        }
      }
    }

    // Fetch client meetings (scheduled_date set on the client card)
    const { data: meetings } = await supabase
      .from('clients')
      .select('id, name, scheduled_date, meeting_link')
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true })

    if (meetings) {
      for (const m of meetings) {
        const timeLabel = new Date(m.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        allEvents.push({
          id: `meeting-${m.id}`,
          type: 'zoom',
          date: m.scheduled_date,
          title: `${m.name || 'Meeting'} — ${timeLabel}`,
          label: m.name || 'Meeting',
          meetingTime: timeLabel,
          clientId: m.id,
          originalData: m
        })
      }
    }

    // Fetch pending follow-ups (email_queue items not yet completed)
    const { data: followups } = await supabase
      .from('email_queue')
      .select('id, client_name, project_title, trigger_type, due_at, completed_at')
      .is('completed_at', null)
      .not('due_at', 'is', null)
      .order('due_at', { ascending: true })

    if (followups) {
      for (const f of followups) {
        allEvents.push({
          id: `followup-${f.id}`,
          type: 'followup',
          date: f.due_at,
          title: `${f.client_name || 'Follow-up'} — ${FOLLOWUP_LABELS[f.trigger_type] || 'Follow-up'}`,
          label: f.client_name || 'Follow-up',
          followupType: FOLLOWUP_LABELS[f.trigger_type] || 'Follow-up',
          originalData: f
        })
      }
    }

    events.value = allEvents
  } catch (e) {
    console.error('Error fetching calendar events:', e)
  } finally {
    loading.value = false
  }
}

const calendarCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    cells.push({ key: `prev-${day}`, day, isCurrentMonth: false, isToday: false, date, events: getEventsForDate(date) })
  }

  // Current month
  const todayStr = today.toDateString()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ key: `cur-${d}`, day: d, isCurrentMonth: true, isToday: date.toDateString() === todayStr, date, events: getEventsForDate(date) })
  }

  // Next month padding to fill grid
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    cells.push({ key: `next-${d}`, day: d, isCurrentMonth: false, isToday: false, date, events: getEventsForDate(date) })
  }

  return cells
})

const getEventsForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  const matched = events.value.filter(evt => evt.date?.split('T')[0] === dateStr)

  // Recurring key rotation reminder: 1st day of each quarter (Jan/Apr/Jul/Oct).
  // Computed on the fly so it works for any month/year the user navigates to.
  if (date.getDate() === 1 && [0, 3, 6, 9].includes(date.getMonth())) {
    matched.push({
      id: `keyrotation-${date.getFullYear()}-${date.getMonth()}`,
      type: 'keyrotation',
      date: dateStr,
      title: 'Key Rotation — rotate API keys / credentials (every 3 months)',
      label: 'Key Rotation',
      followupType: 'Security',
      originalData: null
    })
  }

  return matched
}

const getEventPillStyle = (evt) => {
  if (evt.type === 'zoom') {
    return 'background: var(--info-soft); color: var(--info);'
  }
  if (evt.type === 'followup') {
    return 'background: var(--caution-soft); color: var(--caution);'
  }
  if (evt.type === 'keyrotation') {
    return 'background: var(--critical-soft); color: var(--critical);'
  }
  // Project event - color by stage
  const base = 'background: var(--ink); color: var(--paper);'
  const stage = evt.stage
  if (stage === 'Project Complete' || stage === 'Contracts Signed' || stage === 'Invoice Paid')
    return 'background: var(--positive-soft); color: var(--positive);'
  if (stage === 'Proposal Sent' || stage === 'Call Booked')
    return 'background: var(--caution-soft); color: var(--caution);'
  if (stage === 'Follow Up Needed' || stage === 'Project In Progress')
    return 'background: var(--info-soft); color: var(--info);'
  if (stage === 'Churn')
    return 'background: var(--critical-soft); color: var(--critical);'
  return base
}

const openProject = async (evt) => {
  const { data } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .eq('id', evt.projectId)
    .single()
  if (data) {
    selectedProject.value = data
    isDetailOpen.value = true
  }
}

const openZoom = (evt) => {
  // For now, just log. Can be extended to open zoom details
  console.log('Opening zoom meeting:', evt.originalData)
}

onMounted(fetchEvents)
</script>
