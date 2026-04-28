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

          <!-- Project pills -->
          <div v-for="proj in cell.projects" :key="proj.id" class="mb-1">
            <button
              @click="openProject(proj)"
              style="width: 100%; text-align: left; padding: 3px 6px; border-radius: 2px; border: none; cursor: pointer; font-size: 10px; font-weight: 600; line-height: 1.3; transition: opacity 120ms; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;"
              :style="getProjectPillStyle(proj.pipeline_stage)"
              @mouseenter="e=>e.currentTarget.style.opacity='0.8'"
              @mouseleave="e=>e.currentTarget.style.opacity='1'"
              :title="proj.title + ' — ' + proj.client_name"
            >
              {{ proj.title }}
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
      @updated="fetchProjects"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ProjectDetail from '../components/ProjectDetail.vue'

const projects = ref([])
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

const fetchProjects = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, due_date, pipeline_stage, client_id, client:clients(name)')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
    if (error) throw error
    projects.value = (data || []).map(p => {
      const client = /** @type {any} */ (p.client)
      return { ...p, client_name: (Array.isArray(client) ? client[0]?.name : client?.name) || '' }
    })
  } catch (e) {
    console.error(e)
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
    cells.push({ key: `prev-${day}`, day, isCurrentMonth: false, isToday: false, date, projects: getProjectsForDate(date) })
  }

  // Current month
  const todayStr = today.toDateString()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ key: `cur-${d}`, day: d, isCurrentMonth: true, isToday: date.toDateString() === todayStr, date, projects: getProjectsForDate(date) })
  }

  // Next month padding to fill grid
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    cells.push({ key: `next-${d}`, day: d, isCurrentMonth: false, isToday: false, date, projects: getProjectsForDate(date) })
  }

  return cells
})

const getProjectsForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return projects.value.filter(p => p.due_date?.split('T')[0] === dateStr)
}

const getProjectPillStyle = (stage) => {
  const base = 'background: var(--ink); color: var(--paper);'
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

const openProject = async (proj) => {
  const { data } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .eq('id', proj.id)
    .single()
  if (data) {
    selectedProject.value = data
    isDetailOpen.value = true
  }
}

onMounted(fetchProjects)
</script>
