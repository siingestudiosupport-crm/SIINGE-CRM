<template>
  <div class="min-h-full p-4 md:p-8" style="background: var(--paper);">

    <div style="margin-bottom: 32px;">
      <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em;">Email Templates</h1>
      <p style="font-size: 14px; color: var(--ink-3); margin: 0;">Edit the follow-up templates linked to each trigger. Use <code style="font-family: var(--font-mono); font-size: 12px; background: var(--bone); padding: 1px 5px; border-radius: 2px;">[Client Name]</code> as a variable — it will be replaced automatically.</p>
    </div>

    <div v-if="loading" class="flex items-center gap-3" style="color: var(--ink-4); padding: 40px 0;">
      <div class="animate-spin h-5 w-5" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Loading templates...
    </div>

    <div v-else style="border: 1px solid var(--bone-edge); border-radius: 4px; overflow: hidden;">
      <div
        v-for="(tpl, idx) in orderedTemplates"
        :key="tpl.id"
        :style="`border-bottom: ${idx < orderedTemplates.length - 1 ? '1px solid var(--bone-edge)' : 'none'};`"
      >
        <!-- Collapsed header row -->
        <button
          @click="toggle(tpl.id)"
          class="w-full"
          :style="`display: flex; align-items: center; gap: 14px; padding: 14px 20px 14px 17px; border: none; text-align: left; cursor: pointer; transition: background 120ms; border-left: 3px solid ${expandedId === tpl.id ? (TRIGGER_META[tpl.trigger_type]?.color || 'var(--ink-5)') : 'transparent'}; background: ${expandedId === tpl.id ? 'var(--paper)' : 'var(--bone)'};`"
        >
          <!-- Color dot -->
          <span :style="`width: 7px; height: 7px; border-radius: 50%; background: ${TRIGGER_META[tpl.trigger_type]?.color || 'var(--ink-5)'}; flex-shrink: 0;`"></span>

          <!-- Label -->
          <span style="font-size: 13px; font-weight: 600; color: var(--ink);">{{ TRIGGER_META[tpl.trigger_type]?.label }}</span>

          <!-- Separator + timing -->
          <span style="font-size: 12px; color: var(--ink-4);">·</span>
          <span style="font-size: 12px; color: var(--ink-4); flex: 1;">{{ TRIGGER_META[tpl.trigger_type]?.timing }}</span>

          <!-- Pending count badge -->
          <span
            v-if="queueByTrigger[tpl.trigger_type]?.length"
            :style="`font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; padding: 2px 7px; border-radius: 10px; background: ${TRIGGER_META[tpl.trigger_type]?.color}22; color: ${TRIGGER_META[tpl.trigger_type]?.color}; border: 1px solid ${TRIGGER_META[tpl.trigger_type]?.color}44; white-space: nowrap;`"
          >{{ queueByTrigger[tpl.trigger_type].length }} pending</span>

          <!-- Saved flash -->
          <span
            v-if="savedId === tpl.id"
            style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--positive);"
          >Saved</span>

          <!-- Last edited (collapsed only) -->
          <span
            v-else-if="tpl.updated_at && expandedId !== tpl.id"
            style="font-size: 10px; color: var(--ink-5); font-family: var(--font-mono); white-space: nowrap;"
          >{{ formatDate(tpl.updated_at) }}</span>

          <!-- Chevron -->
          <svg
            :style="`width: 14px; height: 14px; color: var(--ink-4); flex-shrink: 0; transition: transform 200ms; transform: rotate(${expandedId === tpl.id ? 180 : 0}deg);`"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Pending items list — always visible when there are items -->
        <div
          v-if="queueByTrigger[tpl.trigger_type]?.length"
          :style="`border-top: 1px solid var(--bone-edge); background: ${expandedId === tpl.id ? 'var(--paper)' : 'var(--bone)'};`"
        >
          <div style="padding: 0 20px 0 40px;">
            <div
              v-for="item in queueByTrigger[tpl.trigger_type]"
              :key="item.id"
              style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--bone-edge);"
              :style="item === queueByTrigger[tpl.trigger_type].at(-1) ? 'border-bottom: none; padding-bottom: 10px;' : ''"
            >
              <div style="display: flex; align-items: baseline; gap: 8px; min-width: 0; flex: 1;">
                <span style="font-size: 12px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.client_name }}</span>
                <span v-if="item.project_title" style="font-size: 11px; color: var(--ink-4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">· {{ item.project_title }}</span>
              </div>
              <span :style="`font-size: 10px; font-weight: 700; font-family: var(--font-mono); white-space: nowrap; color: ${isOverdue(item.due_at) ? 'var(--critical)' : 'var(--ink-4)'};`">
                {{ daysLabel(item.due_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Expanded edit form -->
        <div
          v-if="expandedId === tpl.id"
          style="background: var(--paper); border-top: 1px solid var(--bone-edge); padding: 20px;"
        >
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Subject Line</label>
              <input
                v-model="tpl.subject"
                type="text"
                style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;"
                @focus="e => e.target.style.borderColor = 'var(--ink)'"
                @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
              />
            </div>
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Email Body</label>
              <textarea
                v-model="tpl.body"
                rows="10"
                style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.6;"
                @focus="e => e.target.style.borderColor = 'var(--ink)'"
                @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
              ></textarea>
            </div>
            <div class="flex items-center justify-between">
              <p v-if="tpl.updated_at" style="font-size: 10px; color: var(--ink-5); font-family: var(--font-mono); margin: 0;">
                Last saved {{ formatDate(tpl.updated_at) }}
              </p>
              <div v-else></div>
              <button
                @click="save(tpl)"
                :disabled="savingId === tpl.id"
                style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; border-radius: 2px; cursor: pointer; transition: all 120ms;"
                :style="savedId === tpl.id
                  ? 'background: var(--positive); color: var(--paper); border: 1px solid var(--positive);'
                  : savingId === tpl.id
                    ? 'background: var(--ink); color: var(--paper); border: 1px solid var(--ink); opacity: 0.5; cursor: not-allowed;'
                    : 'background: var(--ink); color: var(--paper); border: 1px solid var(--ink);'"
              >
                {{ savedId === tpl.id ? 'Saved!' : savingId === tpl.id ? 'Saving...' : 'Save Template' }}
              </button>
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

const TRIGGER_ORDER = ['proposal_3d', 'proposal_7d', 'proposal_weekly', 'call_completed_24h', 'cold_30d', 'review_request']

const TRIGGER_META = {
  proposal_3d:         { label: 'Proposal Follow-up',   timing: '3 days after SOW sent',           color: 'var(--caution)' },
  proposal_7d:         { label: 'Second Follow-up',     timing: '7 days after SOW sent, no reply', color: 'var(--ember)'   },
  proposal_weekly:     { label: 'Weekly Follow-up',     timing: 'Weekly until close or churn',     color: 'var(--ember)'   },
  call_completed_24h:  { label: 'Post-Call Nudge',      timing: '24h after strategy call',         color: 'var(--info)'    },
  cold_30d:            { label: 'Cold Re-engagement',   timing: '30 days of inactivity',           color: 'var(--ink-3)'   },
  review_request:      { label: 'Request Review',       timing: 'After project complete',          color: 'var(--positive)' },
}

const templates      = ref([])
const queueByTrigger = ref({})
const loading        = ref(true)
const savingId       = ref(null)
const savedId        = ref(null)
const expandedId     = ref(null)

const orderedTemplates = computed(() =>
  TRIGGER_ORDER
    .map(t => templates.value.find(tpl => tpl.trigger_type === t))
    .filter(Boolean)
)

onMounted(async () => {
  const [tplRes, qRes] = await Promise.all([
    supabase.from('email_templates').select('*'),
    supabase.from('email_queue')
      .select('id, client_name, project_title, trigger_type, due_at')
      .is('completed_at', null)
      .is('sent_at', null)
      .order('due_at', { ascending: true }),
  ])

  templates.value = tplRes.data || []

  const map = {}
  for (const item of (qRes.data || [])) {
    if (!map[item.trigger_type]) map[item.trigger_type] = []
    map[item.trigger_type].push(item)
  }
  queueByTrigger.value = map

  loading.value = false
})

const toggle = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const save = async (tpl) => {
  savingId.value = tpl.id
  const now = new Date().toISOString()
  await supabase
    .from('email_templates')
    .update({ subject: tpl.subject, body: tpl.body, updated_at: now })
    .eq('id', tpl.id)
  tpl.updated_at = now
  savingId.value = null
  savedId.value = tpl.id
  setTimeout(() => { if (savedId.value === tpl.id) savedId.value = null }, 2000)
}

const isOverdue = (due_at) => new Date(due_at) <= new Date()

const daysLabel = (due_at) => {
  const diff = Math.round((new Date(due_at) - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  return `In ${diff}d`
}

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>
