<template>
  <div class="flex flex-col h-full p-4" style="background: var(--paper);">
    <div class="mb-6 px-2">
      <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Sales Pipeline</h1>
      <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Monitoring deal flow and revenue health.</p>
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
              <p style="font-size: 12px; color: var(--ink-3); margin: 0 0 10px; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                {{ project.title }}
              </p>

              <!-- Status chips -->
              <div class="flex flex-wrap gap-1" style="margin-bottom: 10px;" v-if="project.client?.nda_status || project.client?.sow_status">
                <span v-if="project.client?.nda_status" :style="getStatusChipStyle(project.client.nda_status)">
                  NDA: {{ project.client.nda_status }}
                </span>
                <span v-if="project.client?.sow_status" :style="getStatusChipStyle(project.client.sow_status)">
                  SOW: {{ project.client.sow_status }}
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between" style="padding-top: 10px; border-top: 1px solid var(--bone-edge);">
                <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);">
                  {{ project.client?.client_tier || 'Lead' }}
                </span>
                <span style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-4);">
                  {{ project.created_at ? new Date(project.created_at).toLocaleDateString() : '' }}
                </span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ProjectDetail from '../components/ProjectDetail.vue'

const STAGES = [
  'Intake Form Received',
  'Call Booked',
  'Proposal Sent',
  'Contracts Signed',
  'Invoice Paid',
  'Follow Up Needed',
  'Churn',
  'Project Complete',
  'Future Project Opp'
]

const projects = ref([])
const loading = ref(true)
const isDetailOpen = ref(false)
const selectedProject = ref(null)

const getStageHeaderStyle = (stage) => {
  const map = {
    'Intake Form Received': 'border-top: 2px solid var(--ink-4);',
    'Call Booked':          'border-top: 2px solid var(--info);',
    'Proposal Sent':        'border-top: 2px solid var(--caution);',
    'Contracts Signed':     'border-top: 2px solid var(--positive);',
    'Invoice Paid':         'border-top: 2px solid var(--positive);',
    'Follow Up Needed':     'border-top: 2px solid var(--ember);',
    'Churn':                'border-top: 2px solid var(--critical);',
    'Project Complete':     'border-top: 2px solid var(--ink);',
    'Future Project Opp':   'border-top: 2px solid var(--ink-3);',
  }
  return map[stage] || 'border-top: 2px solid var(--ink-5);'
}

const getStatusChipStyle = (status) => {
  const base = 'display: inline-flex; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 3px 6px; border-radius: 2px; border: 1px solid; white-space: nowrap;'
  if (status === 'Signed') return base + 'background: var(--positive-soft); color: var(--positive); border-color: #B8C4A0;'
  if (status === 'Sent')   return base + 'background: var(--caution-soft); color: var(--caution); border-color: #DBC68A;'
  return base + 'background: var(--paper-2); color: var(--ink-4); border-color: var(--ink-5);'
}

const getTierAccent = (tier) => {
  if (tier === 'High-value')  return 'var(--positive)'
  if (tier === 'Established') return 'var(--info)'
  return 'var(--ink-5)'
}

const fetchProjects = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    projects.value = data || []
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    loading.value = false
  }
}

const getProjectsByStage = (stage) => projects.value.filter(p => p.pipeline_stage === stage)

const openProject = (project) => {
  selectedProject.value = project
  isDetailOpen.value = true
}

onMounted(fetchProjects)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ink-5); border-radius: 2px; }
</style>
