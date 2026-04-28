<template>
  <div class="min-h-full p-4 md:p-8" style="background: var(--paper);">

    <div class="flex justify-between items-start mb-8" style="flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em;">Business Analytics</h1>
        <p style="font-size: 14px; color: var(--ink-3); margin: 0;">Real-time insights on deal flow, revenue, and client segments.</p>
      </div>

      <!-- Time filter -->
      <div class="flex items-center gap-1" style="flex-wrap: wrap;">
        <button v-for="opt in filterOptions" :key="opt.value"
          @click="filterPeriod = opt.value"
          style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 7px 12px; border-radius: 2px; cursor: pointer; transition: all 120ms;"
          :style="filterPeriod === opt.value
            ? 'background: var(--ink); color: var(--paper); border: 1px solid var(--ink);'
            : 'background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5);'"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Custom date range -->
    <div v-if="filterPeriod === 'custom'" class="flex items-center gap-3 mb-6" style="flex-wrap: wrap;">
      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3);">From</span>
      <input type="date" v-model="customStart" style="padding: 7px 10px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: var(--bone); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3);">To</span>
      <input type="date" v-model="customEnd" style="padding: 7px 10px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: var(--bone); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64" style="color: var(--ink-4);">
      <div class="animate-spin h-7 w-7 mr-3" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Crunching numbers...
    </div>

    <div v-else class="space-y-5">

      <!-- Row 1: Revenue KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <!-- $ Closed -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">$ Closed</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">{{ currentFilterLabel }}</span>
          </div>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--positive); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiClosed.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Total paid on Invoice Paid &amp; Complete projects.</p>
        </div>

        <!-- Active Pipeline Value -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Active Pipeline Value</p>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--ink); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiActivePipeline.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Open deals with no payment yet, excluding Churn.</p>
        </div>

        <!-- Expected Income -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Expected Income</p>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--caution); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiExpectedIncome.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Sum of all outstanding amounts owed.</p>
        </div>

        <!-- Avg Client LTV -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Avg Client LTV</p>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--info); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiAvgLTV.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Average total paid per client across all projects.</p>
        </div>

      </div>

      <!-- Row 2: Performance KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

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

      <!-- Row 3: Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 20px;">Why Deals are Lost</h3>
          <div v-if="lossReasons.length === 0" style="text-align: center; color: var(--ink-4); padding: 40px 0; font-size: 13px;">Not enough data yet.</div>
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

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 20px;">Client Demographics</h3>
          <div v-if="clientTiers.length === 0" style="text-align: center; color: var(--ink-4); padding: 40px 0; font-size: 13px;">Not enough data yet.</div>
          <div v-else class="space-y-4">
            <div v-for="tier in clientTiers" :key="tier.name" class="flex items-center gap-4">
              <div style="width: 88px; font-size: 11px; font-weight: 600; color: var(--ink-3); text-align: right; flex-shrink: 0;">{{ tier.name }}</div>
              <div class="flex-1 relative" style="background: var(--paper-2); height: 22px; overflow: hidden; border-radius: 2px;">
                <div class="absolute left-0 top-0 h-full" :style="{ width: tier.percentage + '%', background: tier.color }"></div>
                <span class="relative" style="font-size: 10px; font-weight: 700; color: var(--ink); margin-left: 8px; line-height: 22px; display: block; position: relative; z-index: 1;">{{ tier.count }} Clients</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const loading = ref(true)
const projects = ref([])
const clients = ref([])

const filterPeriod = ref('month')
const customStart = ref('')
const customEnd = ref('')

const filterOptions = [
  { value: 'month',   label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year',    label: 'This Year' },
  { value: 'all',     label: 'All Time' },
  { value: 'custom',  label: 'Custom' },
]

const currentFilterLabel = computed(() => filterOptions.find(o => o.value === filterPeriod.value)?.label || '')

const getDateRange = () => {
  const now = new Date()
  if (filterPeriod.value === 'month')
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
  if (filterPeriod.value === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return { start: new Date(now.getFullYear(), q * 3, 1), end: now }
  }
  if (filterPeriod.value === 'year')
    return { start: new Date(now.getFullYear(), 0, 1), end: now }
  if (filterPeriod.value === 'custom' && customStart.value && customEnd.value)
    return { start: new Date(customStart.value), end: new Date(customEnd.value + 'T23:59:59') }
  return null
}

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
    clients.value  = clientsRes.data || []
  } catch (error) {
    console.error('Dashboard fetch error:', error.message)
  } finally {
    loading.value = false
  }
}

// $ Closed: Invoice Paid or Project Complete, filtered by closed_at (or created_at fallback)
const kpiClosed = computed(() => {
  const range = getDateRange()
  const paid = projects.value.filter(p =>
    ['Invoice Paid', 'Project Complete'].includes(p.pipeline_stage)
  )
  const filtered = range
    ? paid.filter(p => {
        const date = new Date(p.closed_at || p.created_at)
        return date >= range.start && date <= range.end
      })
    : paid
  return filtered.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0)
})

// Active Pipeline: no payment yet, not Churn
const kpiActivePipeline = computed(() => {
  return projects.value
    .filter(p => p.pipeline_stage !== 'Churn' && !(Number(p.amount_paid) > 0))
    .reduce((sum, p) => sum + (Number(p.proposal_value) || 0), 0)
})

// Expected Income: sum of amount_owed across all projects
const kpiExpectedIncome = computed(() => {
  return projects.value.reduce((sum, p) => sum + (Number(p.amount_owed) || 0), 0)
})

// Avg Client LTV: average of per-client sum of amount_paid
const kpiAvgLTV = computed(() => {
  const totals = {}
  projects.value.forEach(p => {
    if (p.client_id && Number(p.amount_paid) > 0) {
      totals[p.client_id] = (totals[p.client_id] || 0) + Number(p.amount_paid)
    }
  })
  const vals = Object.values(totals)
  if (!vals.length) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
})

const kpiWinRate = computed(() => {
  const won  = projects.value.filter(p => ['Contracts Signed','Invoice Paid','Project Complete'].includes(p.pipeline_stage)).length
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn').length
  const total = won + lost
  return total === 0 ? 0 : Math.round((won / total) * 100)
})

const kpiAvgTime = computed(() => {
  const closed = projects.value.filter(p => p.closed_at && ['Contracts Signed','Invoice Paid','Project Complete'].includes(p.pipeline_stage))
  if (!closed.length) return 0
  const total = closed.reduce((sum, p) => {
    return sum + Math.ceil(Math.abs(new Date(p.closed_at) - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
  }, 0)
  return Math.round(total / closed.length)
})

const lossReasons = computed(() => {
  const lost = projects.value.filter(p => p.pipeline_stage === 'Churn' && p.loss_reason)
  if (!lost.length) return []
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
  if (!total) return []
  const counts = { 'Early-stage': 0, 'Established': 0, 'High-value': 0 }
  clients.value.forEach(c => {
    const t = c.client_tier || 'Early-stage'
    if (counts[t] !== undefined) counts[t]++
  })
  return [
    { name: 'High-value',  count: counts['High-value'],  percentage: Math.round(counts['High-value']  / total * 100), color: 'var(--positive)' },
    { name: 'Established', count: counts['Established'], percentage: Math.round(counts['Established'] / total * 100), color: 'var(--info)' },
    { name: 'Early-stage', count: counts['Early-stage'], percentage: Math.round(counts['Early-stage'] / total * 100), color: 'var(--ink-4)' },
  ].filter(t => t.count > 0)
})

onMounted(fetchData)
</script>
