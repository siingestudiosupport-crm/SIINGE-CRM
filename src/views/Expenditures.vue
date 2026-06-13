<template>
  <div class="min-h-full" style="background: var(--paper);">

    <!-- Header -->
    <div class="flex justify-between items-start mb-8" style="flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 32px; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em;">Expenditures</h1>
        <p style="font-size: 14px; color: var(--ink-3); margin: 0;">Track sampling costs, supplies, travel, ads, labor, and taxes.</p>
      </div>
      <button
        @click="openAddForm"
        style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 10px 18px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: all 120ms; display: flex; align-items: center; gap: 8px;"
        @mouseenter="e => e.currentTarget.style.background = 'var(--ink-2)'"
        @mouseleave="e => e.currentTarget.style.background = 'var(--ink)'"
      >
        <Plus :size="13" />
        Add Expenditure
      </button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      <div v-for="cat in CATEGORIES" :key="cat.key"
        style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 16px 18px;">
        <p style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ cat.key }}</p>
        <p style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--critical); margin: 0;">${{ categoryTotal(cat.key).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-5" style="flex-wrap: wrap;">
      <div class="flex items-center gap-1" style="flex-wrap: wrap;">
        <button
          @click="filterCat = ''"
          style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 6px 12px; border-radius: 2px; cursor: pointer; transition: all 120ms;"
          :style="filterCat === ''
            ? 'background: var(--ink); color: var(--paper); border: 1px solid var(--ink);'
            : 'background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5);'"
        >All</button>
        <button v-for="cat in CATEGORIES" :key="cat.key"
          @click="filterCat = cat.key"
          style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 6px 12px; border-radius: 2px; cursor: pointer; transition: all 120ms;"
          :style="filterCat === cat.key
            ? 'background: var(--ink); color: var(--paper); border: 1px solid var(--ink);'
            : 'background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5);'"
        >{{ cat.label }}</button>
      </div>
      <div style="height: 20px; width: 1px; background: var(--ink-5);"></div>
      <input type="date" v-model="filterStart"
        style="padding: 6px 10px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: var(--bone); outline: none;"
        @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
      <input type="date" v-model="filterEnd"
        style="padding: 6px 10px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: var(--bone); outline: none;"
        @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
      <button v-if="filterStart || filterEnd" @click="filterStart = ''; filterEnd = ''"
        style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 6px 10px; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer;">
        Clear
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center" style="height: 200px; color: var(--ink-4);">
      <div class="animate-spin h-7 w-7 mr-3" style="border: 2px solid var(--ink-5); border-top-color: var(--ember); border-radius: 50%;"></div>
      Loading...
    </div>

    <!-- Empty state -->
    <div v-else-if="filtered.length === 0" style="text-align: center; padding: 80px 0; color: var(--ink-4);">
      <p style="font-size: 15px; font-style: italic;">No expenditures found.</p>
      <p style="font-size: 12px; margin-top: 6px;">Add your first expenditure to start tracking costs.</p>
    </div>

    <!-- Table -->
    <div v-else style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--bone-edge);">
            <th style="padding: 12px 16px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Date</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Category</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Description</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Project</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Amount</th>
            <th style="padding: 12px 16px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exp in filtered" :key="exp.id"
            style="border-bottom: 1px solid var(--bone-edge); transition: background 120ms;"
            @mouseenter="e => e.currentTarget.style.background = 'var(--paper)'"
            @mouseleave="e => e.currentTarget.style.background = 'transparent'"
          >
            <td style="padding: 13px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); white-space: nowrap;">{{ formatDate(exp.date) }}</td>
            <td style="padding: 13px 16px;">
              <span :style="`font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 2px 7px; border-radius: 2px; ${exp.category === 'Sampling Costs' ? 'background: rgba(217,119,6,0.12); color: var(--caution);' : 'background: var(--paper-2); color: var(--ink-3);'}`">
                {{ exp.category }}
              </span>
            </td>
            <td style="padding: 13px 16px; font-size: 13px; font-weight: 500; color: var(--ink);">
              {{ exp.description }}
              <span v-if="exp.notes" style="display: block; font-size: 11px; color: var(--ink-4); font-weight: 400;">{{ exp.notes }}</span>
            </td>
            <td style="padding: 13px 16px; font-size: 12px; color: var(--ink-3);">{{ projectName(exp.project_id) || '—' }}</td>
            <td style="padding: 13px 16px; font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--critical); text-align: right; white-space: nowrap;">${{ Number(exp.amount).toLocaleString() }}</td>
            <td style="padding: 13px 16px; text-align: right; white-space: nowrap;">
              <button @click="openEdit(exp)"
                style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 4px 8px; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; margin-right: 6px; transition: all 120ms;"
                @mouseenter="e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }"
                @mouseleave="e => { e.currentTarget.style.borderColor = 'var(--ink-5)'; e.currentTarget.style.color = 'var(--ink-3)'; }"
              >Edit</button>
              <button @click="confirmDelete(exp)"
                style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 4px 8px; background: transparent; color: var(--critical); border: 1px solid rgba(194,65,12,0.3); border-radius: 2px; cursor: pointer; transition: all 120ms;"
                @mouseenter="e => { e.currentTarget.style.background = 'var(--critical)'; e.currentTarget.style.color = 'var(--bone)'; }"
                @mouseleave="e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--critical)'; }"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(14,14,12,0.6);" @click.self="closeForm">
      <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; width: 100%; max-width: 500px; padding: 32px; box-shadow: 0 20px 60px rgba(14,14,12,0.3);">
        <h2 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 24px; color: var(--ink); margin: 0 0 24px;">
          {{ editingId ? 'Edit Expenditure' : 'Add Expenditure' }}
        </h2>

        <div class="space-y-4">

          <!-- Category -->
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Category *</label>
            <select v-model="form.category"
              style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box; cursor: pointer;"
              @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
              <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">{{ cat.key }}</option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Date *</label>
            <input type="date" v-model="form.date"
              style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box;"
              @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
          </div>

          <!-- Description -->
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Description *</label>
            <input type="text" v-model="form.description" placeholder="e.g. Fabric samples for Brand X"
              style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box;"
              @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
          </div>

          <!-- Amount -->
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Amount (USD) *</label>
            <input type="number" v-model="form.amount" placeholder="0.00" min="0" step="0.01"
              style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-mono); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box;"
              @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
          </div>

          <!-- Client + Project — only for Sampling Costs -->
          <template v-if="form.category === 'Sampling Costs'">
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Client</label>
              <select v-model="form.client_id"
                style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box; cursor: pointer;"
                @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                <option value="">— Select client —</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div v-if="form.client_id">
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Project</label>
              <select v-model="form.project_id"
                style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box; cursor: pointer;"
                @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                <option value="">— No specific project —</option>
                <option v-for="p in projectsForClient" :key="p.id" :value="p.id">{{ p.title || p.id }}</option>
              </select>
            </div>
          </template>

          <!-- Notes -->
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin-bottom: 8px;">Notes</label>
            <textarea v-model="form.notes" placeholder="Optional notes..." rows="2"
              style="width: 100%; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; box-sizing: border-box; resize: vertical;"
              @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
          </div>
        </div>

        <div v-if="formError" style="margin-top: 12px; font-size: 12px; color: var(--critical);">{{ formError }}</div>

        <div class="flex gap-3 mt-6">
          <button @click="closeForm"
            style="flex: 1; padding: 10px; font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer;">
            Cancel
          </button>
          <button @click="saveExpenditure" :disabled="saving"
            style="flex: 2; padding: 10px; font-family: var(--font-sans); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: all 120ms;"
            @mouseenter="e => !saving && (e.currentTarget.style.background = 'var(--ink-2)')"
            @mouseleave="e => e.currentTarget.style.background = 'var(--ink)'">
            {{ saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Expenditure') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(14,14,12,0.6);" @click.self="deleteTarget = null">
      <div style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; width: 100%; max-width: 380px; padding: 28px; box-shadow: 0 20px 60px rgba(14,14,12,0.3);">
        <h3 style="font-size: 16px; font-weight: 600; color: var(--ink); margin: 0 0 8px;">Delete expenditure?</h3>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0 0 20px;">
          "{{ deleteTarget.description }}" — ${{ Number(deleteTarget.amount).toLocaleString() }} on {{ formatDate(deleteTarget.date) }}
        </p>
        <div class="flex gap-3">
          <button @click="deleteTarget = null" style="flex: 1; padding: 9px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; background: transparent; color: var(--ink-3); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer;">Cancel</button>
          <button @click="deleteExpenditure" style="flex: 1; padding: 9px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; background: var(--critical); color: var(--bone); border: 1px solid var(--critical); border-radius: 2px; cursor: pointer;">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { supabase } from '../lib/supabaseClient'

const CATEGORIES = [
  { key: 'Sampling Costs',     label: 'Sampling' },
  { key: 'Supplies/Equipment', label: 'Supplies' },
  { key: 'Travel Costs',       label: 'Travel' },
  { key: 'Ad Costs',           label: 'Ads' },
  { key: 'Labor Costs',        label: 'Labor' },
  { key: 'Taxes',              label: 'Taxes' },
]

const loading  = ref(true)
const saving   = ref(false)
const expenditures = ref([])
const projects     = ref([])
const clients      = ref([])

const filterCat   = ref('')
const filterStart = ref('')
const filterEnd   = ref('')

const showForm     = ref(false)
const editingId    = ref(null)
const deleteTarget = ref(null)
const formError    = ref('')

const emptyForm = () => ({ category: 'Sampling Costs', date: '', description: '', amount: '', client_id: '', project_id: '', notes: '' })
const form = ref(emptyForm())

const projectsForClient = computed(() => {
  if (!form.value.client_id) return projects.value
  const result = projects.value.filter(p => p.client_id === form.value.client_id)
  console.log('[Expenditures] filtering projects for client_id:', form.value.client_id, '→ found:', result.length, '| sample project client_ids:', projects.value.slice(0,5).map(p => p.client_id))
  return result
})

watch(() => form.value.client_id, () => { form.value.project_id = '' })

const filtered = computed(() => {
  return expenditures.value.filter(e => {
    if (filterCat.value && e.category !== filterCat.value) return false
    if (filterStart.value && e.date < filterStart.value) return false
    if (filterEnd.value && e.date > filterEnd.value) return false
    return true
  }).sort((a, b) => b.date.localeCompare(a.date))
})

const categoryTotal = (cat) =>
  expenditures.value.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)

const projectName = (id) => {
  if (!id) return null
  const p = projects.value.find(p => p.id === id)
  return p ? (p.title || null) : null
}

const formatDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[Number(m)-1]} ${Number(day)}, ${y}`
}

const openAddForm = () => {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
}

const openEdit = (exp) => {
  editingId.value = exp.id
  const project = exp.project_id ? projects.value.find(p => p.id === exp.project_id) : null
  form.value = {
    category:    exp.category,
    date:        exp.date,
    description: exp.description,
    amount:      exp.amount,
    client_id:   project?.client_id || '',
    project_id:  exp.project_id || '',
    notes:       exp.notes || '',
  }
  formError.value = ''
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
}

const saveExpenditure = async () => {
  formError.value = ''
  if (!form.value.category)    { formError.value = 'Category is required.'; return }
  if (!form.value.date)        { formError.value = 'Date is required.'; return }
  if (!form.value.description) { formError.value = 'Description is required.'; return }
  if (!form.value.amount || Number(form.value.amount) <= 0) { formError.value = 'Amount must be greater than 0.'; return }

  saving.value = true
  try {
    const payload = {
      category:    form.value.category,
      date:        form.value.date,
      description: form.value.description,
      amount:      Number(form.value.amount),
      project_id:  form.value.category === 'Sampling Costs' ? (form.value.project_id || null) : null,
      notes:       form.value.notes || null,
    }

    if (editingId.value) {
      const { error } = await supabase.from('expenditures').update(payload).eq('id', editingId.value)
      if (error) throw error
      const idx = expenditures.value.findIndex(e => e.id === editingId.value)
      if (idx !== -1) expenditures.value[idx] = { ...expenditures.value[idx], ...payload }
    } else {
      const { data, error } = await supabase.from('expenditures').insert(payload).select().single()
      if (error) throw error
      expenditures.value.push(data)
    }
    closeForm()
  } catch (err) {
    formError.value = err.message || 'Error saving expenditure.'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (exp) => { deleteTarget.value = exp }

const deleteExpenditure = async () => {
  if (!deleteTarget.value) return
  const { error } = await supabase.from('expenditures').delete().eq('id', deleteTarget.value.id)
  if (!error) expenditures.value = expenditures.value.filter(e => e.id !== deleteTarget.value.id)
  deleteTarget.value = null
}

onMounted(async () => {
  const [expRes, projRes, clientsRes] = await Promise.all([
    supabase.from('expenditures').select('*').order('date', { ascending: false }),
    supabase.from('projects').select('id, title, client_id').is('archived_at', null).order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name')
  ])
  expenditures.value = expRes.data || []
  projects.value     = projRes.data || []
  clients.value      = clientsRes.data || []
  console.log('[Expenditures] projects loaded:', projects.value.length, projects.value.slice(0,3))
  console.log('[Expenditures] clients loaded:', clients.value.length, clients.value.slice(0,3))
  if (projRes.error) console.error('[Expenditures] projects error:', projRes.error)
  if (clientsRes.error) console.error('[Expenditures] clients error:', clientsRes.error)
  loading.value = false
})
</script>
