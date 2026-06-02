<template>
  <div class="flex flex-col h-full p-4" style="background: var(--paper);">
    <div class="mb-6 px-2 flex justify-between items-center">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Sales Pipeline</h1>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Monitoring deal flow and revenue health.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="deleteAllProjects"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--critical); border: 1px solid var(--critical); border-radius: 2px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: opacity 120ms;"
          @mouseenter="e => e.currentTarget.style.opacity = '0.7'"
          @mouseleave="e => e.currentTarget.style.opacity = '1'"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete All
        </button>
        <button
          @click="importFromHub"
          :disabled="isImporting"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: var(--paper); color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; display: inline-flex; align-items: center; gap: 6px;"
          :style="isImporting ? 'opacity: 0.5; cursor: not-allowed;' : ''"
          @mouseenter="e => !isImporting && (e.currentTarget.style.background = 'var(--ink)', e.currentTarget.style.color = 'var(--paper)')"
          @mouseleave="e => (e.currentTarget.style.background = 'var(--paper)', e.currentTarget.style.color = 'var(--ink)')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="11" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"/></svg>
          {{ isImporting ? 'Importing...' : 'Import Hub Projects' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-8 text-center" style="color: var(--ink-4);">
      <div class="animate-spin h-7 w-7 mx-auto mb-4" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Loading project data...
    </div>

    <div v-else class="flex-1 overflow-x-auto pb-6">
      <div class="flex gap-4 h-full px-2" style="min-width: max-content;">

        <div v-for="stage in STAGES" :key="stage"
             class="flex flex-col flex-shrink-0"
             style="width: 280px; background: var(--paper-2); border-radius: 4px; border: 1px solid var(--bone-edge); overflow: hidden;">

          <!-- Column header -->
          <div class="flex justify-between items-center" :style="getStageHeaderStyle(stage)" style="padding: 12px 14px; background: var(--bone); border-bottom: 1px solid var(--bone-edge);">
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">{{ stage }}</h3>
            <span style="font-family: var(--font-display); font-style: italic; font-size: 16px; color: var(--ink); line-height: 1;">
              {{ getProjectsByStage(stage).length }}
            </span>
          </div>

          <!-- Cards -->
          <div class="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
            <div
              v-for="project in getProjectsByStage(stage)"
              :key="project.id"
              @click="openProject(project)"
              class="relative overflow-hidden cursor-pointer"
              style="background: var(--bone); padding: 14px 14px 14px 18px; border: 1px solid var(--bone-edge); border-radius: 4px; transition: border-color 120ms;"
              @mouseenter="e => e.currentTarget.style.borderColor = 'var(--ink)'"
              @mouseleave="e => e.currentTarget.style.borderColor = 'var(--bone-edge)'"
            >
              <!-- Tier accent rail -->
              <div :style="{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: getTierAccent(project.client?.client_tier) }"></div>

              <!-- Client name + value -->
              <div class="flex justify-between items-start" style="margin-bottom: 4px;">
                <h4 style="font-family: var(--font-display); font-style: italic; font-size: 18px; font-weight: 400; color: var(--ink); margin: 0; line-height: 1.3; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.01em;">
                  {{ project.client?.name || 'Unknown Client' }}
                </h4>
                <span v-if="project.proposal_value" style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-2); flex-shrink: 0; margin-left: 8px;">
                  ${{ project.proposal_value.toLocaleString() }}
                </span>
              </div>

              <!-- Project title -->
              <p style="font-size: 12px; color: var(--ink-3); margin: 0 0 6px; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                {{ project.title }}
              </p>

              <!-- Hub status badge -->
              <div v-if="project.hub_project_id" style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span :style="getHubStatusStyle(hubProjectMap[project.hub_project_id]?.status)">
                  <svg width="5" height="5" viewBox="0 0 6 6" style="flex-shrink:0;"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
                  HUB · {{ hubProjectMap[project.hub_project_id]?.status || '…' }}
                </span>
              </div>

              <!-- Status chips -->
              <div class="flex flex-wrap gap-1" style="margin-bottom: 10px;" v-if="project.client?.nda_status || project.sow_status">
                <span v-if="project.client?.nda_status" :style="getStatusChipStyle(project.client.nda_status)">
                  NDA: {{ project.client.nda_status }}
                </span>
                <span v-if="project.sow_status" :style="getStatusChipStyle(project.sow_status)">
                  SOW: {{ project.sow_status }}
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between" style="padding-top: 10px; border-top: 1px solid var(--bone-edge);">
                <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);">
                  {{ project.client?.client_tier || 'Lead' }}
                </span>
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="openDueDates(project)"
                    style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-3); background: none; border: 1px solid var(--ink-5); border-radius: 2px; padding: 3px 6px; cursor: pointer; transition: all 120ms; white-space: nowrap;"
                    @mouseenter="e => (e.currentTarget.style.color='var(--ink)', e.currentTarget.style.borderColor='var(--ink)')"
                    @mouseleave="e => (e.currentTarget.style.color='var(--ink-3)', e.currentTarget.style.borderColor='var(--ink-5)')"
                  >Due Dates</button>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-4);">
                    {{ project.created_at ? new Date(project.created_at).toLocaleDateString() : '' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="getProjectsByStage(stage).length === 0"
                 class="h-24 flex items-center justify-center"
                 style="border: 1px dashed var(--ink-5); border-radius: 4px;">
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-5);">Empty</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ProjectDetail
      v-if="selectedProject"
      :is-open="isDetailOpen"
      :project="selectedProject"
      @close="isDetailOpen = false"
      @updated="fetchProjects"
    />

    <!-- Due Dates modal -->
    <div v-if="dueDatesModal.show" style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(14,14,12,0.45);" @click.self="dueDatesModal.show = false">
      <div style="background:var(--bone);border:1px solid var(--bone-edge);border-radius:4px;box-shadow:var(--shadow-3);width:90%;max-width:460px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--bone-edge);display:flex;justify-content:space-between;align-items:center;background:var(--paper-2);flex-shrink:0;">
          <div>
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:var(--ink-4);margin:0 0 3px;">Due Dates</p>
            <h3 style="font-family:var(--font-display);font-style:italic;font-weight:400;font-size:18px;color:var(--ink);margin:0;letter-spacing:-0.02em;">{{ dueDatesModal.project?.title }}</h3>
          </div>
          <button @click="dueDatesModal.show = false" style="background:none;border:none;font-size:20px;color:var(--ink-4);cursor:pointer;line-height:1;">&times;</button>
        </div>
        <div v-if="modalDueDates.length === 0" style="padding:24px;text-align:center;color:var(--ink-4);font-size:12px;font-style:italic;">No due dates set yet.</div>
        <div v-else style="overflow-y:auto;flex:1;">
          <div v-for="(d, idx) in modalDueDates" :key="d.label + idx"
            style="display:flex;justify-content:space-between;align-items:center;padding:9px 20px;"
            :style="idx < modalDueDates.length - 1 ? 'border-bottom:1px solid var(--bone-edge);' : ''"
          >
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:7px;font-weight:800;letter-spacing:0.1em;padding:1px 4px;border-radius:1px;" :style="d.source==='HUB' ? 'background:rgba(139,92,246,0.12);color:#7c3aed;' : 'background:rgba(0,0,0,0.07);color:var(--ink-4);'">{{ d.source }}</span>
              <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-3);">{{ d.label }}</span>
            </div>
            <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);" :style="d.statusStyle">{{ d.formattedDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { hubSupabase } from '../lib/hubClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import ProjectDetail from '../components/ProjectDetail.vue'

const CRM_DUE_FIELDS = [
  { field: 'due_date',                              label: 'Main Due Date' },
  { field: 'deliverable_trend_analysis_due',        label: 'Trend Analysis' },
  { field: 'deliverable_design_due',                label: 'Apparel Design' },
  { field: 'deliverable_branding_due',              label: 'Branding/Packaging' },
  { field: 'deliverable_tech_pack_due',             label: 'Tech Pack' },
  { field: 'deliverable_manu_quotes_due',           label: 'Manu Quotes' },
  { field: 'deliverable_initial_sample_due',        label: 'Initial Sample' },
  { field: 'deliverable_approved_sample_due',       label: 'Approved Sample' },
  { field: 'deliverable_size_range_due',            label: 'Size Range Approval' },
  { field: 'deliverable_bulk_due',                  label: 'Bulk Due' },
  { field: 'deliverable_product_analysis_due',      label: 'Product Analysis' },
  { field: 'deliverable_in_house_patternmaking_due',label: 'In House Patternmaking' },
  { field: 'deliverable_in_house_proto_due',        label: 'In House Proto' },
  { field: 'deliverable_in_house_manufacturing_due',label: 'In House Mfg' },
]

const { alert: showAlert, confirm: showConfirm } = useConfirmModal()

const STAGES = [
  'Intake Form Received',
  'Call Booked',
  'Proposal Sent',
  'Contracts Signed',
  'Invoice Paid',
  'Project In Progress',
  'Follow Up Needed',
  'Request Review',
  'Project Complete',
  'Future Project Opp',
  'Churn'
]

const projects = ref([])
const loading = ref(true)
const isDetailOpen = ref(false)
const selectedProject = ref(null)
const hubProjectMap = ref({})
const isImporting = ref(false)
let hubChannel = null

const dueDatesModal = ref({ show: false, project: null })

function openDueDates(project) {
  dueDatesModal.value = { show: true, project }
}

const modalDueDates = computed(() => {
  const p = dueDatesModal.value.project
  if (!p) return []
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const toEntry = (label, dateStr, source) => {
    const date = new Date(dateStr + 'T12:00:00')
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    return {
      label, source,
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      statusStyle: diff < 0 ? 'color: var(--critical);' : diff === 0 ? 'color: var(--caution);' : diff <= 7 ? 'color: var(--ember);' : 'color: var(--ink-2);',
      diff,
    }
  }
  const crmDates = CRM_DUE_FIELDS.filter(f => p[f.field]).map(f => toEntry(f.label, p[f.field], 'CRM'))
  const hubDates = (hubProjectMap.value[p.hub_project_id]?.stageDates || []).map(s => toEntry(s.stage_name, s.due_date, 'HUB'))
  return [...crmDates, ...hubDates].sort((a, b) => a.diff - b.diff)
})

const getStageHeaderStyle = (stage) => {
  const map = {
    'Intake Form Received': 'border-top: 2px solid var(--ink-4);',
    'Call Booked':          'border-top: 2px solid var(--info);',
    'Proposal Sent':        'border-top: 2px solid var(--caution);',
    'Contracts Signed':     'border-top: 2px solid var(--positive);',
    'Invoice Paid':         'border-top: 2px solid var(--positive);',
    'Project In Progress':  'border-top: 2px solid var(--info);',
    'Follow Up Needed':     'border-top: 2px solid var(--ember);',
    'Request Review':       'border-top: 2px solid var(--positive);',
    'Project Complete':     'border-top: 2px solid var(--ink);',
    'Future Project Opp':   'border-top: 2px solid var(--ink-3);',
    'Churn':                'border-top: 2px solid var(--critical);',
  }
  return map[stage] || 'border-top: 2px solid var(--ink-5);'
}

const getStatusChipStyle = (status) => {
  const base = 'display: inline-flex; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 3px 6px; border-radius: 2px; border: 1px solid; white-space: nowrap;'
  if (status === 'Signed') return base + 'background: var(--positive-soft); color: var(--positive); border-color: #B8C4A0;'
  if (status === 'Sent')   return base + 'background: var(--caution-soft); color: var(--caution); border-color: #DBC68A;'
  return base + 'background: var(--paper-2); color: var(--ink-4); border-color: var(--ink-5);'
}

const getHubStatusStyle = (status) => {
  const base = 'display: inline-flex; align-items: center; gap: 4px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 3px 7px; border-radius: 2px; border: 1px solid; white-space: nowrap;'
  if (status === 'active') return base + 'background: var(--positive-soft); color: var(--positive); border-color: #B8C4A0;'
  if (status === 'Project Completion') return base + 'background: var(--info-soft); color: var(--info); border-color: #B6C0C7;'
  if (status === 'Sample Development') return base + 'background: var(--caution-soft); color: var(--caution); border-color: #DBC68A;'
  return base + 'background: var(--paper-2); color: var(--ink-3); border-color: var(--ink-5);'
}

const getTierAccent = (tier) => {
  if (tier === 'High-value')  return 'var(--positive)'
  if (tier === 'Established') return 'var(--info)'
  return 'var(--ink-5)'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const fetchHubStatuses = async (projectList) => {
  const hubIds = projectList.filter(p => p.hub_project_id).map(p => p.hub_project_id)
  if (!hubIds.length) return

  const [{ data: projectsData }, { data: stagesData }] = await Promise.all([
    hubSupabase.from('projects').select('id, status, project_name').in('id', hubIds),
    hubSupabase.from('project_stages')
      .select('project_id, stage_name, due_date')
      .in('project_id', hubIds)
      .is('completed_date', null)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
  ])

  const stageDatesMap = {}
  if (stagesData) {
    for (const stage of stagesData) {
      if (!stageDatesMap[stage.project_id]) stageDatesMap[stage.project_id] = []
      stageDatesMap[stage.project_id].push({ stage_name: stage.stage_name, due_date: stage.due_date })
    }
  }

  if (projectsData) {
    const map = {}
    projectsData.forEach(p => {
      map[p.id] = {
        status: p.status,
        project_name: p.project_name,
        stageDates: stageDatesMap[p.id] || []
      }
    })
    hubProjectMap.value = map
  }
}

const subscribeToHubUpdates = () => {
  hubChannel = hubSupabase.channel('hub-project-status')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, (payload) => {
      const updated = payload.new
      if (hubProjectMap.value[updated.id] !== undefined) {
        hubProjectMap.value[updated.id] = { status: updated.status, project_name: updated.project_name }
      }
    })
    .subscribe()
}

const fetchProjects = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    projects.value = data || []
    if (selectedProject.value) {
      const fresh = (data || []).find(p => p.id === selectedProject.value.id)
      if (fresh) selectedProject.value = fresh
    }
    await fetchHubStatuses(data || [])
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    loading.value = false
  }
}

const addToHub = async (project) => {
  try {
    const { data: newHubProject, error } = await hubSupabase
      .from('projects')
      .insert([{
        project_name: project.title,
        client_name: project.client?.name || '',
        status: 'active',
      }])
      .select('id, status, project_name')
      .single()
    if (error) throw error
    await supabase.from('projects').update({ hub_project_id: newHubProject.id }).eq('id', project.id)
    project.hub_project_id = newHubProject.id
    hubProjectMap.value[newHubProject.id] = { status: newHubProject.status, project_name: newHubProject.project_name }
  } catch (err) {
    await showAlert('Could not add to Hub: ' + err.message, 'Error')
  }
}

const importFromHub = async () => {
  try {
    isImporting.value = true
    const { data: hubProjects, error: hubError } = await hubSupabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (hubError) throw hubError

    const { data: clients } = await supabase.from('clients').select('id, name')
    const existingHubIds = new Set(projects.value.filter(p => p.hub_project_id).map(p => p.hub_project_id))
    const existingTitles = new Set(projects.value.map(p => p.title?.toLowerCase().trim()))
    const toImport = (hubProjects || []).filter(p =>
      !existingHubIds.has(p.id) && !existingTitles.has((p.project_name || '').toLowerCase().trim())
    )

    if (!toImport.length) {
      await showAlert('All Hub projects are already in the CRM.', 'Up to date')
      return
    }

    let imported = 0
    for (const hp of toImport) {
      const matchedClient = (clients || []).find(c =>
        c.name.toLowerCase().trim() === (hp.client_name || '').toLowerCase().trim()
      )
      if (!matchedClient) continue
      await supabase.from('projects').insert([{
        client_id: matchedClient.id,
        title: hp.project_name,
        pipeline_stage: 'Intake Form Received',
        hub_project_id: hp.id,
        amount_paid: 0,
        amount_owed: 0,
      }])
      imported++
    }

    await fetchProjects()
    await showAlert(`${imported} project(s) imported from Hub.`, 'Import Complete')
  } catch (err) {
    await showAlert('Import failed: ' + err.message, 'Error')
  } finally {
    isImporting.value = false
  }
}

const deleteAllProjects = async () => {
  const first = await showConfirm({
    title: 'Delete All Projects',
    message: `This will permanently delete all ${projects.value.length} projects from the CRM. This cannot be undone.`,
    confirmText: 'Yes, continue',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (!first) return

  const second = await showConfirm({
    title: 'Are you absolutely sure?',
    message: 'Final confirmation — all projects will be deleted permanently. There is no way to recover them.',
    confirmText: 'Delete everything',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (!second) return

  try {
    const { error } = await supabase.from('projects').update({ archived_at: new Date().toISOString() }).is('archived_at', null)
    if (error) throw error
    projects.value = []
    hubProjectMap.value = {}
    await showAlert('All projects have been deleted.', 'Done')
  } catch (err) {
    await showAlert('Delete failed: ' + err.message, 'Error')
  }
}

const getProjectsByStage = (stage) => projects.value.filter(p => p.pipeline_stage === stage)

const openProject = (project) => {
  selectedProject.value = project
  isDetailOpen.value = true
}

onMounted(() => {
  fetchProjects()
  subscribeToHubUpdates()
})

onUnmounted(() => {
  if (hubChannel) hubChannel.unsubscribe()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ink-5); border-radius: 2px; }
</style>
