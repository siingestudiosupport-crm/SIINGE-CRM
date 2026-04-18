<template>
  <div class="flex flex-col h-full" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;">

    <!-- Header -->
    <div class="flex justify-between items-center flex-shrink-0" style="padding: 20px 24px; border-bottom: 1px solid var(--ink);">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Activity Logs</h1>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Full history of all CRM events.</p>
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Search by client or project..."
          style="border: none; border-bottom: 1px solid var(--ink-5); padding: 8px 0; font-size: 13px; font-family: var(--font-sans); color: var(--ink-3); background: transparent; outline: none; width: 220px; font-style: italic;"
          @focus="e => e.target.style.borderColor = 'var(--ink)'"
          @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
        />
        <select v-model="filterType"
          style="border: 1px solid var(--ink-5); border-radius: 2px; padding: 7px 10px; font-size: 12px; font-family: var(--font-sans); color: var(--ink-2); background: var(--paper); outline: none;">
          <option value="all">All Events</option>
          <option value="project_created">Project Created</option>
          <option value="project_deleted">Project Deleted</option>
          <option value="nda_sent">NDA Sent</option>
          <option value="sow_sent">SOW Sent</option>
          <option value="nda_signed">NDA Signed</option>
          <option value="sow_signed">SOW Signed</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center" style="color: var(--ink-4);">
      <div class="animate-spin h-6 w-6" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
    </div>

    <div v-else-if="filteredLogs.length === 0" class="flex-1 flex flex-col items-center justify-center gap-3" style="color: var(--ink-4);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em;">No activity found</p>
    </div>

    <div v-else class="flex-1 overflow-auto">
      <table class="w-full text-left" style="border-collapse: collapse; font-size: 13px;">
        <thead style="position: sticky; top: 0; z-index: 10; background: var(--paper-2); border-bottom: 1px solid var(--ink);">
          <tr>
            <th style="padding: 10px 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Event</th>
            <th style="padding: 10px 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Client</th>
            <th style="padding: 10px 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Project</th>
            <th style="padding: 10px 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Notes</th>
            <th style="padding: 10px 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in filteredLogs"
            :key="log.id"
            style="border-bottom: 1px solid var(--ink-5); transition: background 100ms;"
            @mouseenter="e => e.currentTarget.style.background = 'var(--paper)'"
            @mouseleave="e => e.currentTarget.style.background = 'transparent'"
          >
            <td style="padding: 14px 24px;">
              <span :style="getEventChipStyle(log.event_type)">{{ formatEventType(log.event_type) }}</span>
            </td>
            <td style="padding: 14px 24px;">
              <div style="font-family: var(--font-display); font-style: italic; font-size: 18px; color: var(--ink); letter-spacing: -0.01em;">{{ log.client_name }}</div>
            </td>
            <td style="padding: 14px 24px; font-size: 12px; color: var(--ink-3);">{{ log.project_title || '—' }}</td>
            <td style="padding: 14px 24px; font-size: 12px; color: var(--ink-4); max-width: 260px;">{{ log.notes || '—' }}</td>
            <td style="padding: 14px 24px; font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); white-space: nowrap;">{{ formatDate(log.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between flex-shrink-0" style="padding: 10px 24px; border-top: 1px solid var(--ink-5); background: var(--paper-2);">
      <p style="font-size: 11px; color: var(--ink-4); font-family: var(--font-mono); margin: 0;">{{ filteredLogs.length }} event{{ filteredLogs.length !== 1 ? 's' : '' }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const logs = ref([])
const loading = ref(true)
const search = ref('')
const filterType = ref('all')

const fetchLogs = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    logs.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const filteredLogs = computed(() => {
  let rows = logs.value
  if (filterType.value !== 'all') rows = rows.filter(r => r.event_type === filterType.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    rows = rows.filter(r =>
      r.client_name?.toLowerCase().includes(q) ||
      r.project_title?.toLowerCase().includes(q)
    )
  }
  return rows
})

const formatEventType = (type) => {
  const map = {
    project_created: 'Project Created',
    project_deleted: 'Project Deleted',
    nda_sent: 'NDA Sent',
    sow_sent: 'SOW Sent',
    nda_signed: 'NDA Signed',
    sow_signed: 'SOW Signed',
  }
  return map[type] || type
}

const getEventChipStyle = (type) => {
  const base = 'display:inline-flex;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;padding:3px 8px;border-radius:2px;border:1px solid;white-space:nowrap;'
  if (type === 'project_created') return base + 'background:#EFF6FF;color:var(--info);border-color:#BFDBFE;'
  if (type === 'project_deleted') return base + 'background:var(--critical-soft);color:var(--critical);border-color:var(--critical);'
  if (type === 'nda_sent' || type === 'sow_sent') return base + 'background:var(--caution-soft);color:var(--caution);border-color:#DBC68A;'
  if (type === 'nda_signed' || type === 'sow_signed') return base + 'background:var(--positive-soft);color:var(--positive);border-color:#B8C4A0;'
  return base + 'background:var(--paper-2);color:var(--ink-4);border-color:var(--ink-5);'
}

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

onMounted(fetchLogs)
</script>
