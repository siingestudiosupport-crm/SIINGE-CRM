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
          :style="(cell.isToday ? 'background: var(--paper);' : cell.isCurrentMonth ? '' : 'background: var(--paper-2);') + (cell.isCurrentMonth ? 'cursor:pointer;' : '')"
          @click="cell.isCurrentMonth && openAddModal(cell)"
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
              @click="handlePillClick(evt, $event)"
              style="width: 100%; text-align: left; padding: 3px 6px; border-radius: 2px; border: none; cursor: pointer; font-size: 9px; font-weight: 600; line-height: 1.2; transition: opacity 120ms; overflow: hidden; display: block;"
              :style="getEventPillStyle(evt)"
              @mouseenter="e=>e.currentTarget.style.opacity='0.8'"
              @mouseleave="e=>e.currentTarget.style.opacity='1'"
              :title="evt.title"
            >
              <span style="display:flex;align-items:center;gap:2px;min-width:0;">
                <span v-if="evt.type==='hub_event'||evt.type==='hub_stage'" style="flex-shrink:0;font-size:6px;font-weight:800;letter-spacing:0.08em;padding:1px 3px;border-radius:1px;background:rgba(255,255,255,0.3);color:inherit;">HUB</span>
                <span v-else-if="evt.type==='project'" style="flex-shrink:0;font-size:6px;font-weight:800;letter-spacing:0.08em;padding:1px 3px;border-radius:1px;background:rgba(0,0,0,0.12);color:inherit;">CRM</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ evt.label }}</span>
              </span>
              <span v-if="evt.type === 'project' && (evt.deliverableLabel || evt.stage)" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.deliverableLabel || evt.stage }}</span>
              <span v-if="evt.type === 'hub_stage' && evt.stageName" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.stageName }}</span>
              <span v-if="evt.type === 'zoom' && evt.meetingTime" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.meetingTime }}</span>
              <span v-if="(evt.type === 'followup' || evt.type === 'keyrotation') && evt.followupType" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.followupType }}</span>
              <span v-if="evt.type === 'hub_event'" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; opacity: 0.75; font-size: 8px;">{{ evt.eventCountry }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Due Date modal -->
    <div v-if="addModal.show" style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(14,14,12,0.45);" @click.self="addModal.show = false">
      <div style="background:var(--bone);border:1px solid var(--bone-edge);border-radius:4px;box-shadow:var(--shadow-3);width:90%;max-width:500px;display:flex;flex-direction:column;overflow:hidden;max-height:90vh;">
        <div style="padding:20px 24px;border-bottom:1px solid var(--bone-edge);display:flex;justify-content:space-between;align-items:center;background:var(--paper-2);flex-shrink:0;">
          <div>
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:var(--ink-4);margin:0 0 4px;">Set Due Date</p>
            <h3 style="font-family:var(--font-display);font-style:italic;font-weight:400;font-size:20px;color:var(--ink);margin:0;letter-spacing:-0.02em;">{{ formatAddDate(addModal.date) }}</h3>
          </div>
          <button @click="addModal.show = false" style="background:none;border:none;font-size:20px;color:var(--ink-4);cursor:pointer;line-height:1;padding:0;" @mouseenter="e=>e.target.style.color='var(--ink)'" @mouseleave="e=>e.target.style.color='var(--ink-4)'">&times;</button>
        </div>

        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:16px;">
          <div>
            <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);margin-bottom:6px;">Client</label>
            <select v-model="addModal.clientId" @change="onClientSelected" style="width:100%;padding:8px 10px;border:1px solid var(--bone-edge);border-radius:2px;background:var(--paper);color:var(--ink);font-size:13px;font-family:inherit;cursor:pointer;">
              <option :value="null">— Select client —</option>
              <option v-for="c in clientsWithProjects" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div v-if="addModal.clientId">
            <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);margin-bottom:6px;">Project</label>
            <select v-model="addModal.projectId" @change="onProjectSelected" style="width:100%;padding:8px 10px;border:1px solid var(--bone-edge);border-radius:2px;background:var(--paper);color:var(--ink);font-size:13px;font-family:inherit;cursor:pointer;">
              <option :value="null">— Select project —</option>
              <option v-for="p in clientProjects" :key="p.id" :value="p.id">{{ p.title }} · {{ p.pipeline_stage }}</option>
            </select>
            <p v-if="clientProjects.length === 0" style="margin:6px 0 0;font-size:11px;color:var(--ink-4);font-style:italic;">This client has no projects yet.</p>
          </div>

          <div v-if="addModal.loadingProject" style="text-align:center;padding:12px;color:var(--ink-4);font-size:12px;font-style:italic;">Loading…</div>

          <div v-if="addModal.projectData && !addModal.loadingProject">
            <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);margin-bottom:6px;">Which due date?</label>
            <select v-model="addModal.selectedField" style="width:100%;padding:8px 10px;border:1px solid var(--bone-edge);border-radius:2px;background:var(--paper);color:var(--ink);font-size:13px;font-family:inherit;cursor:pointer;">
              <option value="due_date">Main Due Date</option>
              <option v-for="f in DELIVERABLE_FIELDS" :key="f.dueField" :value="f.dueField">{{ f.label }}</option>
            </select>
          </div>

          <div v-if="addModal.projectData && !addModal.loadingProject">
            <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);margin-bottom:6px;">Notes</label>
            <textarea v-model="addModal.dueDateNotes[addModal.selectedField]" rows="3" placeholder="Notes for this due date..." style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--bone-edge);border-radius:2px;background:var(--paper);color:var(--ink);font-size:13px;font-family:inherit;resize:vertical;line-height:1.5;outline:none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--bone-edge)'"></textarea>
          </div>
        </div>

        <div style="padding:16px 24px;border-top:1px solid var(--bone-edge);display:flex;gap:8px;justify-content:flex-end;background:var(--paper-2);flex-shrink:0;">
          <button @click="addModal.show = false" style="padding:7px 16px;border:1px solid var(--bone-edge);border-radius:2px;background:transparent;color:var(--ink-3);font-size:13px;cursor:pointer;">Cancel</button>
          <button @click="saveAddModal" :disabled="!addModal.projectData || !addModal.selectedField || addModal.saving"
            style="padding:7px 16px;border:none;border-radius:2px;background:var(--ink);color:var(--paper);font-size:13px;font-weight:600;cursor:pointer;transition:opacity 120ms;"
            :style="(!addModal.projectData || !addModal.selectedField || addModal.saving) ? 'opacity:0.4;cursor:not-allowed;' : ''"
          >{{ addModal.saving ? 'Saving…' : 'Set Due Date' }}</button>
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

    <!-- No Show modal -->
    <div v-if="zoomModal.show" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(14,14,12,0.5);" @click.self="zoomModal.show = false">
      <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; width: 100%; max-width: 400px; padding: 28px; box-shadow: 0 20px 60px rgba(14,14,12,0.3);">
        <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-4); margin: 0 0 6px;">Scheduled Meeting</p>
        <h3 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--ink); margin: 0 0 4px;">{{ zoomModal.clientName }}</h3>
        <p style="font-size: 12px; color: var(--ink-3); margin: 0 0 20px;">{{ zoomModal.meetingDate }}</p>
        <div class="flex gap-3">
          <button @click="zoomModal.show = false"
            style="flex: 1; padding: 9px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer;">
            Close
          </button>
          <button @click="markNoShow"
            style="flex: 1; padding: 9px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; background: var(--critical); color: var(--bone); border: 1px solid var(--critical); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
            @mouseenter="e => e.currentTarget.style.opacity = '0.85'"
            @mouseleave="e => e.currentTarget.style.opacity = '1'">
            {{ zoomModal.saving ? 'Saving...' : 'No Show' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { hubSupabase } from '../lib/hubClient'
import ProjectDetail from '../components/ProjectDetail.vue'

const DELIVERABLE_FIELDS = [
  { label: 'Trend / Market Analysis',        dueField: 'deliverable_trend_analysis_due' },
  { label: 'Apparel Design',                 dueField: 'deliverable_design_due' },
  { label: 'Branding / Packaging Design',    dueField: 'deliverable_branding_due' },
  { label: 'Tech Pack',                      dueField: 'deliverable_tech_pack_due' },
  { label: 'Manu Quotes Due',                dueField: 'deliverable_manu_quotes_due' },
  { label: 'Initial Sample Due',             dueField: 'deliverable_initial_sample_due' },
  { label: 'Fitting Date',                   dueField: 'deliverable_fitting_due' },
  { label: 'Approved Sample Due',            dueField: 'deliverable_approved_sample_due' },
  { label: 'Size Range Approval Due',        dueField: 'deliverable_size_range_due' },
  { label: 'Bulk Due',                       dueField: 'deliverable_bulk_due' },
  { label: 'Product Analysis x Refinement', dueField: 'deliverable_product_analysis_due' },
  { label: 'In House Patternmaking',         dueField: 'deliverable_in_house_patternmaking_due' },
  { label: 'In House Proto',                dueField: 'deliverable_in_house_proto_due' },
  { label: 'In House Manufacturing',         dueField: 'deliverable_in_house_manufacturing_due' },
]

// Human-readable follow-up labels — mirrors TRIGGER_META in FollowUps.vue
const FOLLOWUP_LABELS = {
  proposal_3d:        'Proposal Follow-up',
  proposal_7d:        'Second Follow-up',
  proposal_weekly:    'Weekly Follow-up',
  call_completed_24h: 'Post-Call Nudge',
  cold_30d:           'Cold Re-engagement',
  review_request:     'Request Review',
  post_project_30d:   'Post-Project Check-in',
}

const events = ref([])
const loading = ref(true)
const isDetailOpen = ref(false)
const selectedProject = ref(null)
const allProjectsList = ref([])
const addModal = ref({ show: false, date: '', clientId: null, projectId: null, saving: false, projectData: null, selectedField: 'due_date', loadingProject: false, dueDateNotes: {} })

// Unique clients that have at least one project — for the Set Due Date modal.
const clientsWithProjects = computed(() => {
  const map = new Map()
  for (const p of allProjectsList.value) {
    if (!p.client_id || map.has(p.client_id)) continue
    const client = Array.isArray(p.client) ? p.client[0] : p.client
    map.set(p.client_id, { id: p.client_id, name: client?.name || 'Unknown Client' })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
})

// Projects belonging to the client selected in the modal.
const clientProjects = computed(() =>
  addModal.value.clientId
    ? allProjectsList.value.filter(p => p.client_id === addModal.value.clientId)
    : []
)

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

    // Fetch projects with due dates and all deliverable due dates
    const { data: projects } = await supabase
      .from('projects')
      .select(`id, title, due_date, pipeline_stage, client_id, client:clients(name),
        deliverable_trend_analysis_due, deliverable_design_due, deliverable_branding_due,
        deliverable_tech_pack_due, deliverable_manu_quotes_due, deliverable_initial_sample_due,
        deliverable_fitting_due, deliverable_approved_sample_due, deliverable_size_range_due, deliverable_bulk_due,
        deliverable_product_analysis_due, deliverable_in_house_patternmaking_due,
        deliverable_in_house_proto_due, deliverable_in_house_manufacturing_due`)
      .order('title', { ascending: true })

    if (projects) {
      for (const p of projects) {
        const client = /** @type {any} */ (p.client)
        const clientName = (Array.isArray(client) ? client[0]?.name : client?.name) || ''

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

        for (const f of DELIVERABLE_FIELDS) {
          if (p[f.dueField]) {
            allEvents.push({
              id: `proj-${f.dueField}-${p.id}`,
              type: 'project',
              date: p[f.dueField],
              title: `${p.title} — ${f.label}`,
              label: p.title,
              deliverableLabel: f.label,
              stage: p.pipeline_stage,
              projectId: p.id,
              clientName,
              originalData: p
            })
          }
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

    // Fetch Hub textile events
    const { data: hubEvents, error: hubEventsError } = await hubSupabase
      .from('events')
      .select('id, event_name, start_date, country')
      .not('start_date', 'is', null)
      .order('start_date', { ascending: true })

    if (hubEventsError) console.error('[Calendar] Hub events error:', hubEventsError)
    if (hubEvents) {
      for (const e of hubEvents) {
        allEvents.push({
          id: `hub-event-${e.id}`,
          type: 'hub_event',
          date: e.start_date,
          title: `${e.event_name}${e.country ? ` — ${e.country}` : ''}`,
          label: e.event_name,
          eventCountry: e.country || 'Global',
          originalData: e
        })
      }
    }

    // Fetch Hub project names (no FK defined in Hub DB — must fetch separately)
    const { data: hubProjectsData } = await hubSupabase.from('projects').select('id, project_name')
    const hubProjectMap = {}
    if (hubProjectsData) hubProjectsData.forEach(p => { hubProjectMap[p.id] = p.project_name })

    // Fetch Hub project stage due dates
    const { data: hubStages, error: hubStagesError } = await hubSupabase
      .from('project_stages')
      .select('id, stage_name, due_date, status, project_id')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })

    if (hubStagesError) console.error('[Calendar] Hub stages error:', hubStagesError)
    if (hubStages) {
      for (const s of hubStages) {
        const projectName = hubProjectMap[s.project_id] || 'Hub Project'
        allEvents.push({
          id: `hub-stage-${s.id}`,
          type: 'hub_stage',
          date: s.due_date,
          title: `${projectName} — ${s.stage_name}`,
          label: projectName,
          stageName: s.stage_name,
          status: s.status,
          projectId: s.project_id,
          originalData: s
        })
      }
    }

    // Fetch all projects for the add-due-date modal (grouped by client)
    const { data: projectsList } = await supabase
      .from('projects')
      .select('id, title, pipeline_stage, client_id, client:clients(name)')
      .order('title', { ascending: true })
    allProjectsList.value = projectsList || []

    events.value = allEvents
  } catch (e) {
    console.error('Error fetching calendar events:', e)
  } finally {
    loading.value = false
  }
}

function handlePillClick(evt, nativeEvent) {
  nativeEvent.stopPropagation() // never open the modal from a pill click
  if (evt.type === 'project') {
    openProject(evt)
  } else if (evt.type === 'hub_stage') {
    window.open(`https://siinge-hub.vercel.app/projects?project=${evt.projectId}&stage=${evt.originalData?.id}`, '_blank')
  } else if (evt.type === 'hub_event') {
    window.open('https://siinge-hub.vercel.app/events', '_blank')
  } else if (evt.type === 'keyrotation') {
    window.open('https://drive.google.com/file/d/1d_YlLhS53_0K6sijI9_spzhKvZftVW2c/view?usp=sharing', '_blank')
  }
  // followup, zoom → no action
}

function openAddModal(cell, preselectedProjectId = null) {
  const d = cell.date
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const clientId = preselectedProjectId
    ? (allProjectsList.value.find(p => p.id === preselectedProjectId)?.client_id || null)
    : null
  addModal.value = { show: true, date: dateStr, clientId, projectId: preselectedProjectId, saving: false, projectData: null, selectedField: 'due_date', loadingProject: false, dueDateNotes: {} }
  if (preselectedProjectId) onProjectSelected()
}

// Reset the project pick when the client changes.
function onClientSelected() {
  addModal.value.projectId = null
  addModal.value.projectData = null
  addModal.value.selectedField = 'due_date'
}

function formatAddDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

async function onProjectSelected() {
  const id = addModal.value.projectId
  if (!id) { addModal.value.projectData = null; addModal.value.dueDateNotes = {}; return }
  addModal.value.loadingProject = true
  const { data } = await supabase.from('projects').select('id, due_date_notes').eq('id', id).single()
  addModal.value.projectData = data
  addModal.value.selectedField = 'due_date'
  addModal.value.dueDateNotes = data?.due_date_notes || {}
  addModal.value.loadingProject = false
}

async function saveAddModal() {
  if (!addModal.value.projectData || !addModal.value.selectedField) return
  addModal.value.saving = true
  const notes = { ...addModal.value.dueDateNotes }
  if (!notes[addModal.value.selectedField]) delete notes[addModal.value.selectedField]
  await supabase.from('projects')
    .update({ [addModal.value.selectedField]: addModal.value.date, due_date_notes: notes })
    .eq('id', addModal.value.projectId)
  addModal.value.show = false
  addModal.value.saving = false
  fetchEvents()
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
  if (evt.type === 'hub_event') {
    return 'background: rgba(139,92,246,0.15); color: #8b5cf6;'
  }
  if (evt.type === 'hub_stage') {
    if (evt.status === 'Completed') return 'background: var(--positive-soft); color: var(--positive);'
    if (evt.status === 'In Progress') return 'background: #ede9fe; color: #6d28d9;'
    return 'background: #f3f4f6; color: #374151;'
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

const zoomModal = ref({ show: false, clientId: null, clientName: '', meetingDate: '', saving: false })

const openZoom = (evt) => {
  const d = new Date(evt.date)
  zoomModal.value = {
    show: true,
    clientId:    evt.originalData?.id || null,
    clientName:  evt.label,
    meetingDate: d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    saving: false,
  }
}

const markNoShow = async () => {
  if (!zoomModal.value.clientId || zoomModal.value.saving) return
  zoomModal.value.saving = true
  try {
    const dueAt = new Date()
    dueAt.setHours(dueAt.getHours() + 1)
    await supabase.from('email_queue').insert({
      client_id:    zoomModal.value.clientId,
      client_name:  zoomModal.value.clientName,
      trigger_type: 'no_show',
      due_at:       dueAt.toISOString(),
    })
    await supabase.from('activity_logs').insert({
      event_type: 'no_show',
      client_id:  zoomModal.value.clientId,
      notes:      `No-show recorded. Original meeting was scheduled for: ${zoomModal.value.meetingDate}.`,
    })
    zoomModal.value.show = false
    await fetchEvents()
  } catch (err) {
    console.error('No show error:', err.message)
  } finally {
    zoomModal.value.saving = false
  }
}

onMounted(fetchEvents)
</script>
