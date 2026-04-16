<template>
  <div class="bg-slate-50 min-h-full p-4 md:p-8">
    
    <div class="mb-8">
      <h1 class="text-3xl font-black text-slate-800 tracking-tight">Business Analytics</h1>
      <p class="text-slate-500 font-medium mt-1">Real-time insights on deal flow, revenue, and client segments.</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64 text-slate-400">
      <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
      Crunching numbers...
    </div>

    <div v-else class="space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div class="relative z-10">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Pipeline Value</p>
            <p class="text-4xl font-black text-slate-800">${{ kpiPipelineValue.toLocaleString() }}</p>
            <p class="text-xs text-slate-500 mt-2 font-medium">Expected revenue from open deals.</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
           <div class="relative z-10">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Win Rate</p>
            <div class="flex items-baseline gap-2">
              <p class="text-4xl font-black text-emerald-600">{{ kpiWinRate }}%</p>
              <p class="text-sm font-bold text-slate-500">of closed deals</p>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" :style="`width: ${kpiWinRate}%`"></div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div class="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
           <div class="relative z-10">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Time to Close</p>
            <p class="text-4xl font-black text-purple-600">{{ kpiAvgTime }} <span class="text-xl text-slate-500">Days</span></p>
            <p class="text-xs text-slate-500 mt-2 font-medium">From lead creation to contract signed.</p>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Why Deals are Lost</h3>
          <div v-if="lossReasons.length === 0" class="text-center text-slate-400 py-10 text-sm font-medium">
            Not enough data yet.
          </div>
          <div v-else class="space-y-4">
            <div v-for="item in lossReasons" :key="item.reason">
              <div class="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>{{ item.reason }}</span>
                <span>{{ item.count }} Deals ({{ item.percentage }}%)</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-rose-400 h-full rounded-full" :style="`width: ${item.percentage}%`"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Client Demographics</h3>
          <div v-if="clientTiers.length === 0" class="text-center text-slate-400 py-10 text-sm font-medium">
            Not enough data yet.
          </div>
          <div v-else class="space-y-4">
            <div v-for="tier in clientTiers" :key="tier.name" class="flex items-center gap-4">
              <div class="w-24 text-xs font-bold text-slate-600 text-right">{{ tier.name }}</div>
              <div class="flex-1 bg-slate-100 h-6 rounded-md overflow-hidden relative flex items-center">
                <div :class="['h-full absolute left-0 top-0', tier.color]" :style="`width: ${tier.percentage}%`"></div>
                <span class="relative z-10 ml-2 text-[10px] font-black text-slate-900 drop-shadow-sm">
                  {{ tier.count }} Clients
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

const loading = ref(true)
const projects = ref([])
const clients = ref([])

// Fecth de Datos
const fetchData = async () => {
  try {
    loading.value = true
    const [projectsRes, clientsRes] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('clients').select('*')
    ])
    
    if (projectsRes.error) throw projectsRes.error
    if (clientsRes.error) throw clientsRes.error

    projects.value = projectsRes.data || []
    clients.value = clientsRes.data || []
  } catch (error) {
    console.error('Error fetching analytics:', error.message)
  } finally {
    loading.value = false
  }
}

// --- LÓGICA DE MATEMÁTICAS ---

// 1. Active Pipeline Value (Dinero sobre la mesa)
const kpiPipelineValue = computed(() => {
  const activeStages = ['Intake Form Received', 'Call Booked', 'Proposal Sent', 'Follow Up Needed']
  return projects.value
    .filter(p => activeStages.includes(p.pipeline_stage))
    .reduce((sum, p) => sum + (Number(p.proposal_value) || 0), 0)
})

// 2. Win Rate (Aceptados vs Rechazados)
const kpiWinRate = computed(() => {
  const won = projects.value.filter(p => ['Contracts Signed', 'Invoice Paid', 'Project Complete'].includes(p.pipeline_stage)).length
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn').length
  const totalClosed = won + lost
  
  if (totalClosed === 0) return 0
  return Math.round((won / totalClosed) * 100)
})

// 3. Avg Time to Close (Promedio de días para firmar)
const kpiAvgTime = computed(() => {
  const closedProjects = projects.value.filter(p => p.closed_at && ['Contracts Signed', 'Invoice Paid', 'Project Complete'].includes(p.pipeline_stage))
  
  if (closedProjects.length === 0) return 0

  let totalDays = 0
  closedProjects.forEach(p => {
    const start = new Date(p.created_at)
    const end = new Date(p.closed_at)
    const diffTime = Math.abs(end - start)
    totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  return Math.round(totalDays / closedProjects.length)
})

// 4. Breakdown: Razones de pérdida
const lossReasons = computed(() => {
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn' && p.loss_reason)
  if (lost.length === 0) return []

  const counts = {}
  lost.forEach(p => {
    counts[p.loss_reason] = (counts[p.loss_reason] || 0) + 1
  })

  return Object.keys(counts).map(reason => ({
    reason,
    count: counts[reason],
    percentage: Math.round((counts[reason] / lost.length) * 100)
  })).sort((a, b) => b.count - a.count)
})

// 5. Breakdown: Tipos de Cliente (Tier)
const clientTiers = computed(() => {
  const total = clients.value.length
  if (total === 0) return []

  const counts = { 'Early-stage': 0, 'Established': 0, 'High-value': 0 }
  clients.value.forEach(c => {
    const tier = c.client_tier || 'Early-stage'
    if (counts[tier] !== undefined) counts[tier]++
  })

  return [
    { name: 'High-value', count: counts['High-value'], percentage: Math.round((counts['High-value'] / total) * 100), color: 'bg-purple-300' },
    { name: 'Established', count: counts['Established'], percentage: Math.round((counts['Established'] / total) * 100), color: 'bg-blue-300' },
    { name: 'Early-stage', count: counts['Early-stage'], percentage: Math.round((counts['Early-stage'] / total) * 100), color: 'bg-slate-300' }
  ].filter(t => t.count > 0)
})

onMounted(fetchData)
</script>