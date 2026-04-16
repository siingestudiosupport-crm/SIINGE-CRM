<template>
  <div class="flex flex-col h-full bg-slate-50/50 p-4">
    <div class="mb-6 px-2">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Sales Pipeline</h1>
      <p class="text-slate-500 text-sm mt-1 font-medium">Monitoring deal flow and revenue health.</p>
    </div>

    <div v-if="loading" class="p-8 text-center text-slate-400">
      <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      Loading project data...
    </div>

    <div v-else class="flex-1 overflow-x-auto pb-6">
      <div class="flex gap-5 h-full inline-flex min-w-full px-2">
        
        <div v-for="stage in STAGES" :key="stage" 
             class="w-80 bg-slate-100/80 rounded-2xl flex flex-col flex-shrink-0 border border-slate-200 shadow-sm overflow-hidden">
          
          <div :class="['p-4 border-b flex justify-between items-center bg-white', getStageHeaderClass(stage)]">
            <h3 class="font-black text-[10px] uppercase tracking-widest text-slate-700">{{ stage }}</h3>
            <span class="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-black border border-slate-200">
              {{ getProjectsByStage(stage).length }}
            </span>
          </div>

          <div class="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            <div 
              v-for="project in getProjectsByStage(stage)" 
              :key="project.id"
              @click="openProject(project)"
              class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div :class="['absolute left-0 top-0 bottom-0 w-1', getTierAccent(project.client?.client_tier)]"></div>

              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-slate-800 text-sm group-hover:text-blue-600 truncate flex-1">
                  {{ project.client?.name || 'Unknown Client' }}
                </h4>
                <span v-if="project.proposal_value" class="text-[11px] font-black text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  ${{ project.proposal_value.toLocaleString() }}
                </span>
              </div>

              <p class="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {{ project.title }}
              </p>
              
              <div class="flex flex-wrap gap-1.5 mb-4" v-if="project.client?.nda_status || project.client?.sow_status">
                <span v-if="project.client?.nda_status" :class="['text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border', getStatusClass(project.client.nda_status)]">
                  NDA: {{ project.client.nda_status }}
                </span>
                <span v-if="project.client?.sow_status" :class="['text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border', getStatusClass(project.client.sow_status)]">
                  SOW: {{ project.client.sow_status }}
                </span>
              </div>

              <div class="pt-3 border-t border-slate-50 flex items-center justify-between">
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-tight">
                  {{ project.client?.client_tier || 'Lead' }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  {{ project.created_at ? new Date(project.created_at).toLocaleDateString() : '' }}
                </span>
              </div>
            </div>

            <div v-if="getProjectsByStage(stage).length === 0" 
                 class="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empty Stage</p>
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

// --- HELPERS ESTILOS ---

const getStageHeaderClass = (stage) => {
  const map = {
    'Intake Form Received': 'border-t-4 border-t-slate-400',
    'Call Booked': 'border-t-4 border-t-blue-500',
    'Proposal Sent': 'border-t-4 border-t-amber-500',
    'Contracts Signed': 'border-t-4 border-t-emerald-500',
    'Invoice Paid': 'border-t-4 border-t-green-600',
    'Follow Up Needed': 'border-t-4 border-t-orange-500',
    'Churn': 'border-t-4 border-t-rose-500',
    'Project Complete': 'border-t-4 border-t-indigo-500',
    'Future Project Opp': 'border-t-4 border-t-teal-500'
  }
  return map[stage] || 'border-t-4 border-t-slate-200'
}

const getStatusClass = (status) => {
  if (status === 'Signed') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (status === 'Sent') return 'bg-amber-50 text-amber-700 border-amber-100'
  return 'bg-slate-50 text-slate-500 border-slate-200'
}

const getTierAccent = (tier) => {
  if (tier === 'High-value') return 'bg-purple-500'
  if (tier === 'Established') return 'bg-blue-500'
  return 'bg-slate-300'
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

const getProjectsByStage = (stage) => {
  return projects.value.filter(p => p.pipeline_stage === stage)
}

const openProject = (project) => {
  selectedProject.value = project
  isDetailOpen.value = true
}

onMounted(fetchProjects)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>