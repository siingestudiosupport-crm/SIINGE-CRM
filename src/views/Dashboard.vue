<template>
  <div class="min-h-full p-4 md:p-8" style="background: var(--paper);">

    <div class="mb-8">
      <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em;">Business Analytics</h1>
      <p style="font-size: 14px; color: var(--ink-3); margin: 0;">Real-time insights on deal flow, revenue, and client segments.</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64" style="color: var(--ink-4);">
      <div class="animate-spin h-7 w-7 mr-3" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Crunching numbers...
    </div>

    <div v-else class="space-y-6">

      <!-- KPI Tiles -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Active Pipeline Value</p>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 48px; font-weight: 400; color: var(--ink); margin: 0 0 8px; line-height: 1; letter-spacing: -0.02em;">${{ kpiPipelineValue.toLocaleString() }}</p>
          <p style="font-size: 12px; color: var(--ink-4); margin: 0;">Expected revenue from open deals.</p>
        </div>

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Win Rate</p>
          <div class="flex items-baseline gap-2" style="margin-bottom: 12px;">
            <p style="font-family: var(--font-display); font-style: italic; font-size: 48px; font-weight: 400; color: var(--ink); margin: 0; line-height: 1; letter-spacing: -0.02em;">{{ kpiWinRate }}%</p>
            <p style="font-size: 13px; color: var(--ink-3); margin: 0;">of closed deals</p>
          </div>
          <div style="width: 100%; background: var(--ink-5); height: 2px; overflow: hidden;">
            <div :style="`width: ${kpiWinRate}%; background: var(--ember); height: 100%;`"></div>
          </div>
        </div>

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Avg. Time to Close</p>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 48px; font-weight: 400; color: var(--ink); margin: 0 0 8px; line-height: 1; letter-spacing: -0.02em;">{{ kpiAvgTime }} <span style="font-size: 20px; color: var(--ink-3); font-style: normal;">Days</span></p>
          <p style="font-size: 12px; color: var(--ink-4); margin: 0;">From lead creation to contract signed.</p>
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Loss Reasons -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 20px;">Why Deals are Lost</h3>
          <div v-if="lossReasons.length === 0" style="text-align: center; color: var(--ink-4); padding: 40px 0; font-size: 13px;">
            Not enough data yet.
          </div>
          <div v-else class="space-y-5">
            <div v-for="item in lossReasons" :key="item.reason">
              <div class="flex justify-between" style="font-size: 11px; font-weight: 600; color: var(--ink-2); margin-bottom: 6px;">
                <span>{{ item.reason }}</span>
                <span style="color: var(--ink-4); font-family: var(--font-mono);">{{ item.count }} · {{ item.percentage }}%</span>
              </div>
              <div style="width: 100%; background: var(--ink-5); height: 2px; overflow: hidden;">
                <div :style="`width: ${item.percentage}%; background: var(--ember); height: 100%;`"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Client Demographics -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 20px;">Client Demographics</h3>
          <div v-if="clientTiers.length === 0" style="text-align: center; color: var(--ink-4); padding: 40px 0; font-size: 13px;">
            Not enough data yet.
          </div>
          <div v-else class="space-y-4">
            <div v-for="tier in clientTiers" :key="tier.name" class="flex items-center gap-4">
              <div style="width: 88px; font-size: 11px; font-weight: 600; color: var(--ink-3); text-align: right; flex-shrink: 0;">{{ tier.name }}</div>
              <div class="flex-1 relative" style="background: var(--paper-2); height: 22px; overflow: hidden; border-radius: 2px;">
                <div class="absolute left-0 top-0 h-full" :style="{ width: tier.percentage + '%', background: tier.color }"></div>
                <span class="relative" style="font-size: 10px; font-weight: 700; color: var(--ink); margin-left: 8px; line-height: 22px; display: block; position: relative; z-index: 1;">
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

const kpiPipelineValue = computed(() => {
  const activeStages = ['Intake Form Received', 'Call Booked', 'Proposal Sent', 'Follow Up Needed']
  return projects.value
    .filter(p => activeStages.includes(p.pipeline_stage))
    .reduce((sum, p) => sum + (Number(p.proposal_value) || 0), 0)
})

const kpiWinRate = computed(() => {
  const won = projects.value.filter(p => ['Contracts Signed', 'Invoice Paid', 'Project Complete'].includes(p.pipeline_stage)).length
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn').length
  const totalClosed = won + lost
  if (totalClosed === 0) return 0
  return Math.round((won / totalClosed) * 100)
})

const kpiAvgTime = computed(() => {
  const closedProjects = projects.value.filter(p => p.closed_at && ['Contracts Signed', 'Invoice Paid', 'Project Complete'].includes(p.pipeline_stage))
  if (closedProjects.length === 0) return 0
  let totalDays = 0
  closedProjects.forEach(p => {
    const start = new Date(p.created_at)
    const end = new Date(p.closed_at)
    totalDays += Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
  })
  return Math.round(totalDays / closedProjects.length)
})

const lossReasons = computed(() => {
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn' && p.loss_reason)
  if (lost.length === 0) return []
  const counts = {}
  lost.forEach(p => { counts[p.loss_reason] = (counts[p.loss_reason] || 0) + 1 })
  return Object.keys(counts).map(reason => ({
    reason,
    count: counts[reason],
    percentage: Math.round((counts[reason] / lost.length) * 100)
  })).sort((a, b) => b.count - a.count)
})

const clientTiers = computed(() => {
  const total = clients.value.length
  if (total === 0) return []
  const counts = { 'Early-stage': 0, 'Established': 0, 'High-value': 0 }
  clients.value.forEach(c => {
    const tier = c.client_tier || 'Early-stage'
    if (counts[tier] !== undefined) counts[tier]++
  })
  return [
    { name: 'High-value',  count: counts['High-value'],  percentage: Math.round((counts['High-value']  / total) * 100), color: 'var(--positive)' },
    { name: 'Established', count: counts['Established'], percentage: Math.round((counts['Established'] / total) * 100), color: 'var(--info)' },
    { name: 'Early-stage', count: counts['Early-stage'], percentage: Math.round((counts['Early-stage'] / total) * 100), color: 'var(--ink-4)' }
  ].filter(t => t.count > 0)
})

onMounted(fetchData)
</script>
