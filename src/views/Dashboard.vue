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
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Sum of payment records dated within the selected period.</p>
        </div>

        <!-- Active Pipeline Value -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Active Pipeline Value</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">Current</span>
          </div>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--ink); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiActivePipeline.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Total proposal value of deals where $0 has been paid so far (excludes churned deals).</p>
        </div>

        <!-- Expected Income -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Expected Income</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">Current</span>
          </div>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--caution); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiExpectedIncome.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Total still owed on projects that have already received at least one payment.</p>
        </div>

        <!-- Avg Client LTV -->
        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Avg Client LTV</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">Current</span>
          </div>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 40px; font-weight: 400; color: var(--info); margin: 0 0 6px; line-height: 1; letter-spacing: -0.02em;">${{ kpiAvgLTV.toLocaleString() }}</p>
          <p style="font-size: 11px; color: var(--ink-4); margin: 0;">Average total paid per client (clients who have paid $0 are excluded).</p>
        </div>

      </div>

      <!-- Row 2: Performance KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Win Rate</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">{{ currentFilterLabel }}</span>
          </div>
          <div class="flex items-baseline gap-2" style="margin-bottom: 12px;">
            <p style="font-family: var(--font-display); font-style: italic; font-size: 48px; font-weight: 400; color: var(--ink); margin: 0; line-height: 1; letter-spacing: -0.02em;">{{ kpiWinRate }}%</p>
            <p style="font-size: 13px; color: var(--ink-3); margin: 0;">of deals closed in period</p>
          </div>
          <div style="width: 100%; background: var(--ink-5); height: 2px; overflow: hidden;">
            <div :style="`width: ${kpiWinRate}%; background: var(--ember); height: 100%;`"></div>
          </div>
        </div>

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 10px;">
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Avg. Time to Close</p>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">{{ currentFilterLabel }}</span>
          </div>
          <p style="font-family: var(--font-display); font-style: italic; font-size: 48px; font-weight: 400; color: var(--ink); margin: 0 0 8px; line-height: 1; letter-spacing: -0.02em;">{{ kpiAvgTime }} <span style="font-size: 20px; color: var(--ink-3); font-style: normal;">Days</span></p>
          <p style="font-size: 12px; color: var(--ink-4); margin: 0;">From project creation to deal closed (won deals only).</p>
        </div>

      </div>

      <!-- Row 3: Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 24px;">
          <div class="flex justify-between items-start" style="margin-bottom: 20px;">
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Why Deals are Lost</h3>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">{{ currentFilterLabel }}</span>
          </div>
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
          <div class="flex justify-between items-start" style="margin-bottom: 20px;">
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Client Demographics</h3>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper-2); border: 1px solid var(--ink-5); border-radius: 2px; padding: 2px 5px;">Current</span>
          </div>
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
      supabase.from('projects').select('*').is('archived_at', null),
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

// Parse 'YYYY-MM-DD' strings as LOCAL midnight (not UTC) to avoid timezone drift
// where a payment dated Jan 1 falls into Dec 31 in negative-UTC zones.
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(dateStr)
}

const inDateRange = (date) => {
  const range = getDateRange()
  if (!range) return true
  if (!date) return false
  return date >= range.start && date <= range.end
}

// Stages that mark a deal as closed. Mirrors ProjectDetail.vue:945.
const WON_STAGES    = ['Contracts Signed', 'Invoice Paid', 'Request Review', 'Project Complete']
const LOST_STAGES   = ['Churn']
const CLOSED_STAGES = [...WON_STAGES, ...LOST_STAGES]

// === $ CLOSED — period-aware ===
// Sum of payments received within the selected period.
// Source of truth: payment_records[] (per-payment dated entries).
const kpiClosed = computed(() => {
  let total = 0
  projects.value.forEach(p => {
    if (!p.payment_records) return
    let records
    try {
      records = typeof p.payment_records === 'string' ? JSON.parse(p.payment_records) : p.payment_records
    } catch { return }
    if (!Array.isArray(records)) return
    records.forEach(record => {
      if (record.amount == null) return
      const paymentDate = parseLocalDate(record.date)
      if (!paymentDate) return
      if (inDateRange(paymentDate)) {
        total += Number(record.amount) || 0
      }
    })
  })
  return total
})

// === ACTIVE PIPELINE VALUE — snapshot ===
// Sum of proposal_value for deals where amount_paid = 0.
// Churn deals are excluded even if nothing has been paid.
const kpiActivePipeline = computed(() => {
  return projects.value
    .filter(p => Number(p.amount_paid) === 0 && !LOST_STAGES.includes(p.pipeline_stage))
    .reduce((sum, p) => sum + (Number(p.proposal_value) || 0), 0)
})

// === EXPECTED INCOME — snapshot ===
// Outstanding amounts owed from projects where amount_paid is NOT zero
// Only counts projects that have already received some payment
const kpiExpectedIncome = computed(() => {
  return projects.value
    .filter(p => Number(p.amount_paid) > 0)
    .reduce((sum, p) => sum + (Number(p.amount_owed) || 0), 0)
})

// === AVG CLIENT LTV — snapshot ===
// Average of total amount_paid per client (only money actually collected).
const kpiAvgLTV = computed(() => {
  const totals = {}
  projects.value.forEach(p => {
    if (!p.client_id) return
    totals[p.client_id] = (totals[p.client_id] || 0) + (Number(p.amount_paid) || 0)
  })
  const vals = Object.values(totals).filter(v => v > 0)
  if (!vals.length) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
})

// === WIN RATE — period-aware ===
// Won vs (won + lost) for deals whose closed_at falls within the selected range.
const kpiWinRate = computed(() => {
  const closedInRange = projects.value.filter(p => p.closed_at && inDateRange(new Date(p.closed_at)))
  const won  = closedInRange.filter(p => WON_STAGES.includes(p.pipeline_stage)).length
  const lost = closedInRange.filter(p => LOST_STAGES.includes(p.pipeline_stage)).length
  const total = won + lost
  return total === 0 ? 0 : Math.round((won / total) * 100)
})

// === AVG TIME TO CLOSE — period-aware ===
// Days from created_at to closed_at, only for won deals closed within the selected range.
const kpiAvgTime = computed(() => {
  const closed = projects.value.filter(p =>
    p.closed_at &&
    WON_STAGES.includes(p.pipeline_stage) &&
    inDateRange(new Date(p.closed_at))
  )
  if (!closed.length) return 0
  const total = closed.reduce((sum, p) => {
    return sum + Math.ceil(Math.abs(new Date(p.closed_at) - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
  }, 0)
  return Math.round(total / closed.length)
})

// === LOSS REASONS — period-aware ===
// Distribution of loss_reason for Churn deals closed within the selected range.
const lossReasons = computed(() => {
  const lost = projects.value.filter(p =>
    p.pipeline_stage === 'Churn' &&
    p.loss_reason &&
    p.closed_at &&
    inDateRange(new Date(p.closed_at))
  )
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
