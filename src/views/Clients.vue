<template>
  <div class="flex flex-col h-full relative" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;">

    <!-- Page header -->
    <div class="flex justify-between items-center" style="padding: 20px 24px; border-bottom: 1px solid var(--ink);">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Clients Directory</h1>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Manage your leads and active clients.</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button
          @click="importModal.show = true"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--ink); border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; transition: all 120ms; display:flex;align-items:center;gap:6px;"
          @mouseenter="e => e.currentTarget.style.borderColor='var(--ink)'"
          @mouseleave="e => e.currentTarget.style.borderColor='var(--ink-5)'"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import CSV
        </button>
        <button
          @click="openModal()"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
          @mouseenter="e => e.target.style.opacity = '0.85'"
          @mouseleave="e => e.target.style.opacity = '1'"
        >+ Add Client</button>
      </div>
    </div>

    <div v-if="loading" class="p-8 text-center" style="color: var(--ink-4);">
      Loading clients...
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left" style="border-collapse: collapse;">
        <thead>
          <tr style="background: var(--paper-2); border-bottom: 1px solid var(--ink);">
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Name & Contact</th>
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Company</th>
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Contracts</th>
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Projects</th>
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Join Date</th>
            <th style="padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="clients.length === 0">
            <td colspan="6" style="padding: 32px; text-align: center; color: var(--ink-4); font-size: 13px;">No clients registered yet.</td>
          </tr>

          <tr v-for="client in clients" :key="client.id"
              @click="openClientDetail(client)"
              style="border-bottom: 1px solid var(--ink-5); cursor: pointer; transition: background 100ms;"
              @mouseenter="e => e.currentTarget.style.background = 'var(--paper)'"
              @mouseleave="e => e.currentTarget.style.background = 'transparent'"
          >
            <td style="padding: 14px 16px;">
              <div class="flex items-center gap-2" style="flex-wrap: wrap;">
                <div style="font-family: var(--font-display); font-style: italic; font-size: 19px; color: var(--ink); line-height: 1.2; letter-spacing: -0.01em;">{{ client.name }}</div>
                <span v-if="client.projects?.length" style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 2px 6px; border-radius: 2px; border: 1px solid var(--ink-5); color: var(--ink-3); background: var(--paper); white-space: nowrap;">
                  {{ client.projects.length }} {{ client.projects.length === 1 ? 'project' : 'projects' }}
                </span>
                <span v-if="client.lead_source === 'LinkedIn'" style="display:inline-flex; align-items:center; gap:3px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 2px 6px; border-radius: 2px; border: 1px solid #0a66c2; color: #0a66c2; background: rgba(10,102,194,0.08); white-space: nowrap;">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 17V9.99H6V17h2.34zM7.17 8.92a1.36 1.36 0 100-2.71 1.36 1.36 0 000 2.71zM18 17v-3.85c0-2.05-1.1-3-2.56-3-1.18 0-1.71.65-2 1.1V9.99h-2.34V17h2.34v-3.7c0-.2.01-.4.07-.54.16-.4.52-.8 1.13-.8.8 0 1.12.6 1.12 1.49V17H18z"/></svg>
                  LinkedIn
                </span>
                <span v-if="client.lead_source === 'Motion'" style="display:inline-flex; align-items:center; gap:3px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 2px 6px; border-radius: 2px; border: 1px solid #7c3aed; color: #7c3aed; background: rgba(124,58,237,0.08); white-space: nowrap;">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  Upwork
                </span>
              </div>
              <div style="font-size: 11px; color: var(--ink-4); margin-top: 2px;">{{ client.email }}</div>
              <div v-if="client.phone_number" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--ink-3); margin-top: 4px; padding: 2px 6px; border: 1px solid var(--ink-5); border-radius: 2px;">
                <span v-if="client.country">{{ client.country }}</span>
                <span v-if="client.country" style="color: var(--ink-5);">|</span>
                <span>{{ client.phone_number }}</span>
              </div>
            </td>
            <td style="padding: 14px 16px; font-size: 13px; color: var(--ink-2);">
              {{ client.company || 'N/A' }}
              <div v-if="client.investment_level && client.investment_level !== 'No especificado'" style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--positive); margin-top: 4px; font-weight: 600;">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Strategy Call
              </div>
            </td>
            <td style="padding: 14px 16px;">
              <div class="flex flex-col gap-1">
                <span v-if="client.nda_status" :style="getStatusChipStyle(client.nda_status)">NDA: {{ client.nda_status }}</span>
                <span v-for="proj in client.projects?.filter(p => p.sow_status)" :key="`${client.id}-${proj.id}`" :style="getStatusChipStyle(proj.sow_status)" style="font-size: 10px;">
                  SOW ({{ proj.title }}): {{ proj.sow_status }}
                </span>
              </div>
            </td>
            <td style="padding: 14px 16px;">
              <div v-if="client.projects?.length" style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--ink-2);">Active: {{ client.projects.filter(p => p.pipeline_stage !== 'Project Complete').length }}</span>
                <span style="font-size: 10px; color: var(--ink-4);">Completed: {{ client.projects.filter(p => p.pipeline_stage === 'Project Complete').length }}</span>
              </div>
              <span v-else style="font-size: 11px; color: var(--ink-5);">—</span>
            </td>
            <td style="padding: 14px 16px; font-family: var(--font-mono); font-size: 11px; color: var(--ink-4);">
              {{ new Date(client.created_at).toLocaleDateString() }}
            </td>
            <td style="padding: 14px 16px; text-align: center;">
              <div class="flex justify-center gap-2" @click.stop>
                <button v-if="client.scheduled_date" @click="markNoShow(client)"
                  style="padding: 4px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--critical); background: none; border: 1px solid rgba(194,65,12,0.3); border-radius: 2px; cursor: pointer; transition: all 120ms; white-space: nowrap;"
                  @mouseenter="e=>{ e.currentTarget.style.background='var(--critical)'; e.currentTarget.style.color='var(--bone)'; }"
                  @mouseleave="e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--critical)'; }"
                  title="Mark as No Show">
                  No Show
                </button>
                <button @click="openAddProject(client)" style="padding: 6px; color: var(--ink-4); background: none; border: none; cursor: pointer; border-radius: 2px; transition: color 120ms;" @mouseenter="e=>e.currentTarget.style.color='var(--positive)'" @mouseleave="e=>e.currentTarget.style.color='var(--ink-4)'" title="Add Project">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
                <button @click="openModal(client)" style="padding: 6px; color: var(--ink-4); background: none; border: none; cursor: pointer; border-radius: 2px; transition: color 120ms;" @mouseenter="e=>e.currentTarget.style.color='var(--ink)'" @mouseleave="e=>e.currentTarget.style.color='var(--ink-4)'" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button @click="confirmDelete(client)" style="padding: 6px; color: var(--ink-4); background: none; border: none; cursor: pointer; border-radius: 2px; transition: color 120ms;" @mouseenter="e=>e.currentTarget.style.color='var(--critical)'" @mouseleave="e=>e.currentTarget.style.color='var(--ink-4)'" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit/Add Client Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center p-4 z-[60] overflow-y-auto" style="background: rgba(14,14,12,0.45);">
      <div class="w-full max-w-2xl overflow-hidden my-8" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;" :class="'animate-slide-up'">
        <div class="flex justify-between items-center" style="padding: 16px 24px; border-bottom: 1px solid var(--bone-edge); background: var(--ink);">
          <h3 style="font-family: var(--font-display); font-style: italic; font-size: 20px; font-weight: 400; color: var(--paper); margin: 0;">{{ editingId ? 'Edit Client' : 'New Client' }}</h3>
          <button @click="closeModal" style="color: rgba(250,247,242,0.6); background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>
        <form @submit.prevent="saveClient" class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 md:col-span-1">
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Full Name</label>
              <input v-model="form.name" type="text" required style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Email</label>
              <input v-model="form.email" type="email" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Company</label>
              <input v-model="form.company" type="text" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Phone Number</label>
              <input v-model="form.phone_number" type="text" placeholder="+1 234 567 8900" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
            </div>
            <div class="col-span-2" style="border-top: 1px solid var(--ink-5); padding-top: 16px; margin-top: 4px;">
              <h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin: 0 0 16px;">Strategy Call Details</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Brand Stage</label>
                  <select v-model="form.brand_stage" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                    <option value="">Select...</option>
                    <option v-for="opt in withCurrent(BRAND_STAGE_OPTIONS, form.brand_stage)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Investment Level</label>
                  <select v-model="form.investment_level" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                    <option value="">Select...</option>
                    <option v-for="opt in withCurrent(INVESTMENT_LEVEL_OPTIONS, form.investment_level)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Timeline</label>
                  <select v-model="form.development_timeline" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                    <option value="">Select...</option>
                    <option v-for="opt in withCurrent(TIMELINE_OPTIONS, form.development_timeline)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Support Level</label>
                  <select v-model="form.support_level" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                    <option value="">Select...</option>
                    <option v-for="opt in withCurrent(SUPPORT_LEVEL_OPTIONS, form.support_level)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <div class="col-span-2">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Primary Issue / Need</label>
                  <select v-model="form.primary_issue" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'">
                    <option value="">Select...</option>
                    <option v-for="opt in withCurrent(PRIMARY_ISSUE_OPTIONS, form.primary_issue)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Meeting Date & Time</label>
                  <input v-model="form.scheduled_date" type="datetime-local" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Meeting Link (Optional)</label>
                  <input v-model="form.meeting_link" type="url" placeholder="https://..." style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3" style="padding-top: 20px; border-top: 1px solid var(--ink-5); margin-top: 20px;">
            <button type="button" @click="closeModal" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">Cancel</button>
            <button type="submit" :disabled="isSubmitting" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;" :style="isSubmitting ? 'opacity: 0.5;' : ''">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div v-if="showAddProjectModal" class="fixed inset-0 flex items-center justify-center p-4 z-[70]" style="background: rgba(14,14,12,0.45);">
      <div class="w-full max-w-lg flex flex-col" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; max-height: 90vh;" :class="'animate-slide-up'">
        <div class="flex justify-between items-center flex-shrink-0" style="padding: 16px 24px; border-bottom: 1px solid var(--bone-edge); background: var(--ink);">
          <div>
            <h3 style="font-family: var(--font-display); font-style: italic; font-size: 20px; font-weight: 400; color: var(--paper); margin: 0 0 2px;">Add Project</h3>
            <p style="font-size: 11px; color: rgba(250,247,242,0.5); margin: 0;">for {{ targetClient?.name }}</p>
          </div>
          <button @click="showAddProjectModal = false" style="color: rgba(250,247,242,0.6); background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>
        <form @submit.prevent="saveProject" class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Project Name *</label>
            <input v-model="projectForm.title" type="text" required placeholder="e.g. Brand Identity Redesign" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">$ Paid</label>
              <div style="display: flex; align-items: center; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); padding: 0 10px;">
                <span style="color: var(--ink-3); font-size: 13px; margin-right: 4px;">$</span>
                <input v-model="projectForm.amount_paid" type="number" min="0" step="0.01" placeholder="0" style="flex: 1; border: none; background: transparent; padding: 9px 0; font-family: var(--font-sans); font-size: 13px; color: var(--ink); outline: none;" />
              </div>
            </div>
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">$ Owed</label>
              <div style="display: flex; align-items: center; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); padding: 0 10px;">
                <span style="color: var(--ink-3); font-size: 13px; margin-right: 4px;">$</span>
                <input v-model="projectForm.amount_owed" type="number" min="0" step="0.01" placeholder="0" style="flex: 1; border: none; background: transparent; padding: 9px 0; font-family: var(--font-sans); font-size: 13px; color: var(--ink); outline: none;" />
              </div>
            </div>
          </div>
          <!-- Deliverables -->
          <div style="border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); padding: 12px;">
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 10px;">Deliverables</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">

              <div v-for="item in [
                { label: 'Trend / Market Analysis', model: 'deliverable_trend_analysis', dueField: 'deliverable_trend_analysis_due' },
                { label: 'Apparel Design', model: 'deliverable_design', dueField: 'deliverable_design_due' },
                { label: 'Branding / Packaging Design', model: 'deliverable_branding', dueField: 'deliverable_branding_due' },
                { label: 'Tech Pack', model: 'deliverable_tech_pack', dueField: 'deliverable_tech_pack_due' },
                { label: 'Product Development Mgmt', model: 'deliverable_product_dev', productDev: true },
                { label: 'Product Analysis X Refinement', model: 'deliverable_product_analysis', dueField: 'deliverable_product_analysis_due' },
                { label: 'In House Patternmaking', model: 'deliverable_in_house_patternmaking', dueField: 'deliverable_in_house_patternmaking_due' },
                { label: 'In House Proto', model: 'deliverable_in_house_proto', dueField: 'deliverable_in_house_proto_due' },
                { label: 'In House Manufacturing', model: 'deliverable_in_house_manufacturing', dueField: 'deliverable_in_house_manufacturing_due' },
              ]" :key="item.model" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 2px; padding: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                  <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" v-model="projectForm[item.model]" style="width: 14px; height: 14px; accent-color: var(--ink); flex-shrink: 0;" />
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-2);">{{ item.label }}</span>
                  </label>
                  <div v-if="item.dueField && projectForm[item.model]" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 150px;">
                    <span style="font-size: 9px; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em;">Due Date</span>
                    <input type="date" v-model="projectForm[item.dueField]" style="width: 100%; padding: 6px 8px; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); color: var(--ink); font-size: 12px;" />
                  </div>
                </div>
                <div v-if="item.productDev && projectForm.deliverable_product_dev" style="margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;">
                  <div v-for="sub in [
                    { label: 'Manu Quotes Due', model: 'deliverable_manu_quotes_due' },
                    { label: 'Initial Sample Due', model: 'deliverable_initial_sample_due' },
                    { label: 'Approved Sample Due', model: 'deliverable_approved_sample_due' },
                    { label: 'Size Range Approval Due', model: 'deliverable_size_range_due' },
                    { label: 'Bulk Due', model: 'deliverable_bulk_due' },
                  ]" :key="sub.model" style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 9px; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em;">{{ sub.label }}</span>
                    <input type="date" v-model="projectForm[sub.model]" style="width: 100%; padding: 6px 8px; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); color: var(--ink); font-size: 12px;" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="flex justify-end gap-3" style="padding-top: 12px; border-top: 1px solid var(--ink-5);">
            <button type="button" @click="showAddProjectModal = false" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">Cancel</button>
            <button type="submit" :disabled="isSavingProject" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;" :style="isSavingProject ? 'opacity: 0.5;' : ''">
              {{ isSavingProject ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ProjectDetail
      v-if="selectedProject"
      :is-open="isDetailOpen"
      :project="selectedProject"
      :refresh-token="cardRefreshToken"
      @close="isDetailOpen = false"
      @updated="fetchClients"
      @open-project="switchToProject"
      @add-project="openAddProject"
    />

    <!-- CSV Import Modal -->
    <div v-if="importModal.show" style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(14,14,12,0.45);" @click.self="resetImport">
      <div style="background:var(--bone);border:1px solid var(--bone-edge);border-radius:4px;box-shadow:var(--shadow-3);width:95%;max-width:640px;max-height:85vh;overflow-y:auto;">

        <!-- Header -->
        <div style="padding:18px 24px;border-bottom:1px solid var(--bone-edge);display:flex;justify-content:space-between;align-items:center;background:var(--paper-2);position:sticky;top:0;z-index:2;">
          <div>
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:var(--ink-4);margin:0 0 3px;">Import CSV</p>
            <h3 style="font-family:var(--font-display);font-style:italic;font-weight:400;font-size:18px;color:var(--ink);margin:0;letter-spacing:-0.02em;">
              {{ importModal.step === 1 ? 'Upload File' : importModal.step === 2 ? 'Map Columns' : importModal.step === 3 ? 'Preview' : 'Importing…' }}
            </h3>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="display:flex;gap:4px;">
              <span v-for="s in [1,2,3,4]" :key="s" style="width:20px;height:3px;border-radius:2px;" :style="s <= importModal.step ? 'background:var(--ink);' : 'background:var(--ink-5);'"></span>
            </div>
            <button @click="resetImport" style="background:none;border:none;font-size:20px;color:var(--ink-4);cursor:pointer;line-height:1;">&times;</button>
          </div>
        </div>

        <!-- Step 1: Upload -->
        <div v-if="importModal.step === 1" style="padding:32px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;">
          <label
            style="width:100%;border:2px dashed var(--bone-edge);border-radius:4px;padding:40px 24px;text-align:center;cursor:pointer;transition:border-color 120ms;"
            @dragover.prevent @drop.prevent="handleFileUpload($event)"
            @mouseenter="e=>e.currentTarget.style.borderColor='var(--ink)'"
            @mouseleave="e=>e.currentTarget.style.borderColor='var(--bone-edge)'"
          >
            <input type="file" accept=".csv" style="display:none;" @change="handleFileUpload($event)" />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style="font-size:13px;font-weight:600;color:var(--ink-2);margin:0 0 4px;">Click to upload or drag & drop</p>
            <p style="font-size:11px;color:var(--ink-4);margin:0;">CSV files only — LinkedIn Lead Form export</p>
          </label>
          <p style="font-size:11px;color:var(--ink-4);text-align:center;line-height:1.5;">
            Matching is done by <strong>email</strong>. If the client already exists, only empty fields are filled in.
          </p>
        </div>

        <!-- Step 2: Map Columns -->
        <div v-if="importModal.step === 2" style="padding:20px 24px;display:flex;flex-direction:column;gap:12px;">
          <p style="font-size:12px;color:var(--ink-3);margin:0;">Detected <strong>{{ importHeaders.length }} columns</strong> and <strong>{{ importRows.length }} rows</strong>. Map each column to a CRM field.</p>
          <div style="border:1px solid var(--bone-edge);border-radius:2px;overflow:hidden;">
            <div style="display:grid;grid-template-columns:1fr 1fr;background:var(--paper-2);padding:8px 12px;border-bottom:1px solid var(--bone-edge);">
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);">CSV Column</span>
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);">CRM Field</span>
            </div>
            <div v-for="(header, idx) in importHeaders" :key="header"
              style="display:grid;grid-template-columns:1fr 1fr;padding:8px 12px;align-items:center;"
              :style="idx < importHeaders.length - 1 ? 'border-bottom:1px solid var(--bone-edge);' : ''"
            >
              <span style="font-size:12px;color:var(--ink-2);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:8px;">{{ header }}</span>
              <select v-model="importMapping[header]"
                style="width:100%;padding:5px 8px;border:1px solid var(--bone-edge);border-radius:2px;background:var(--paper);color:var(--ink);font-size:12px;font-family:inherit;"
              >
                <option value="">— Skip —</option>
                <option v-for="f in CRM_IMPORT_FIELDS" :key="f.key" :value="f.key">{{ f.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 3: Preview -->
        <div v-if="importModal.step === 3" style="padding:20px 24px;display:flex;flex-direction:column;gap:12px;">
          <p style="font-size:12px;color:var(--ink-3);margin:0;">Preview of the first 5 rows. <strong>{{ importRows.length }} records</strong> will be imported in total.</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div v-for="(row, idx) in mappedPreview" :key="idx"
              style="border:1px solid var(--bone-edge);border-radius:2px;padding:10px 12px;background:var(--paper);display:flex;flex-direction:column;gap:4px;"
            >
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:12px;font-weight:600;color:var(--ink-2);">{{ row.name || '(no name)' }}</span>
                <span style="font-size:11px;color:var(--ink-4);font-family:var(--font-mono);">{{ row.email || '(no email)' }}</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <span v-for="[k,v] in Object.entries(row).filter(([k,v]) => v && k !== 'name' && k !== 'email')" :key="k"
                  style="font-size:10px;color:var(--ink-3);background:var(--bone);border:1px solid var(--bone-edge);border-radius:2px;padding:2px 6px;"
                >{{ k }}: {{ v }}</span>
              </div>
            </div>
          </div>
          <p v-if="!mappedPreview.some(r => r.email)" style="font-size:12px;color:var(--critical);font-weight:600;">⚠ No row has an email mapped. Matching won't work without email.</p>
        </div>

        <!-- Step 4: Results -->
        <div v-if="importModal.step === 4" style="padding:32px 24px;display:flex;flex-direction:column;align-items:center;gap:20px;">
          <div v-if="importRunning" style="text-align:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <p style="font-size:13px;color:var(--ink-3);margin:0;">Importing {{ importRows.length }} records…</p>
          </div>
          <div v-else style="width:100%;display:flex;flex-direction:column;gap:12px;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center;">
              <div style="background:var(--positive-soft);border:1px solid #B8C4A0;border-radius:4px;padding:16px 8px;">
                <p style="font-size:28px;font-weight:700;color:var(--positive);margin:0 0 4px;font-family:var(--font-display);font-style:italic;">{{ importResults.created }}</p>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--positive);margin:0;">Created</p>
              </div>
              <div style="background:var(--info-soft);border:1px solid #B6C0C7;border-radius:4px;padding:16px 8px;">
                <p style="font-size:28px;font-weight:700;color:var(--info);margin:0 0 4px;font-family:var(--font-display);font-style:italic;">{{ importResults.updated }}</p>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--info);margin:0;">Updated</p>
              </div>
              <div style="background:var(--paper-2);border:1px solid var(--bone-edge);border-radius:4px;padding:16px 8px;">
                <p style="font-size:28px;font-weight:700;color:var(--ink-3);margin:0 0 4px;font-family:var(--font-display);font-style:italic;">{{ importResults.skipped }}</p>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-4);margin:0;">Skipped</p>
              </div>
            </div>
            <div v-if="importResults.errors.length > 0" style="background:var(--critical-soft);border:1px solid var(--critical);border-radius:4px;padding:12px;">
              <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--critical);margin:0 0 6px;">Errors ({{ importResults.errors.length }})</p>
              <p v-for="e in importResults.errors" :key="e" style="font-size:11px;color:var(--critical);margin:2px 0;font-family:var(--font-mono);">{{ e }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:14px 24px;border-top:1px solid var(--bone-edge);display:flex;gap:8px;justify-content:flex-end;background:var(--paper-2);position:sticky;bottom:0;z-index:2;">
          <button v-if="importModal.step < 4" @click="resetImport" style="padding:7px 16px;border:1px solid var(--bone-edge);border-radius:2px;background:transparent;color:var(--ink-3);font-size:13px;cursor:pointer;">Cancel</button>
          <button v-if="importModal.step === 2" @click="importModal.step = 3" :disabled="!Object.values(importMapping).some(v => v === 'email')"
            style="padding:7px 16px;border:none;border-radius:2px;background:var(--ink);color:var(--paper);font-size:13px;font-weight:600;cursor:pointer;"
            :style="!Object.values(importMapping).some(v => v === 'email') ? 'opacity:0.4;cursor:not-allowed;' : ''"
          >Preview →</button>
          <button v-if="importModal.step === 3" @click="importModal.step = 2" style="padding:7px 16px;border:1px solid var(--bone-edge);border-radius:2px;background:transparent;color:var(--ink-3);font-size:13px;cursor:pointer;">Adjust mapping</button>
          <button v-if="importModal.step === 3" @click="runImport"
            style="padding:7px 16px;border:none;border-radius:2px;background:var(--ink);color:var(--paper);font-size:13px;font-weight:600;cursor:pointer;"
          >Import {{ importRows.length }} records</button>
          <button v-if="importModal.step === 4 && !importRunning" @click="resetImport" style="padding:7px 16px;border:none;border-radius:2px;background:var(--ink);color:var(--paper);font-size:13px;font-weight:600;cursor:pointer;">Done</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import ProjectDetail from '../components/ProjectDetail.vue'

const { confirm: showConfirm, alert: showAlert } = useConfirmModal()

// Strategy call dropdown options — must match the LinkedIn lead form exactly
const BRAND_STAGE_OPTIONS = [
  'Pre-launch with capital allocated for product development',
  'Generating sales with an early product line',
  'Scaling with multiple collections or expanding distribution (DTC/retail)',
  'Established brand investing in new product development or expansion',
]
const INVESTMENT_LEVEL_OPTIONS = [
  'Under $5,000',
  '$5,000–$10,000',
  '$10,000–$25,000',
  '$25,000+',
]
const TIMELINE_OPTIONS = [
  'Immediately',
  'Within 1–2 months',
  '3–6 months',
]
const SUPPORT_LEVEL_OPTIONS = [
  'Technical execution (tech packs, specs, and documentation)',
  'Product development management (we lead sampling, fit, and factory execution)',
  'Full product ownership (we lead design, development, and production from concept through launch)',
]
const PRIMARY_ISSUE_OPTIONS = [
  'Fit or quality issues are leading to returns or customer dissatisfaction',
  'Development is slow, inconsistent, or becoming too costly',
  'Difficulty sourcing or managing reliable manufacturers',
  'Missing or incomplete technical documentation (tech packs, specs, grading)',
  'Internal bandwidth is limited and we need a partner to take ownership',
]

// Keep a client's existing (possibly legacy/free-text) value selectable so
// editing an old client doesn't silently wipe data that predates these dropdowns.
const withCurrent = (options, current) =>
  current && !options.includes(current) ? [current, ...options] : options

const clients = ref([])
const loading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const editingId = ref(null)

// ─── CSV Import ───────────────────────────────────────────────────────────────
const CRM_IMPORT_FIELDS = [
  { key: 'name',                    label: 'Full Name' },
  { key: '_first_name',             label: 'First Name' },
  { key: '_last_name',              label: 'Last Name' },
  { key: 'email',                   label: 'Email' },
  { key: 'company',                 label: 'Company' },
  { key: 'phone_number',            label: 'Phone Number' },
  { key: 'country',                 label: 'Country' },
  { key: 'brand_stage',             label: 'Brand Stage' },
  { key: 'investment_level',        label: 'Investment Level' },
  { key: 'development_timeline',    label: 'Timeline' },
  { key: 'support_level',           label: 'Support Level' },
  { key: 'primary_issue',           label: 'Primary Issue' },
]

const importModal   = ref({ show: false, step: 1 })
const importHeaders = ref([])
const importRows    = ref([])
const importMapping = ref({})
const importRunning = ref(false)
const importResults = ref({ created: 0, updated: 0, skipped: 0, errors: [] })

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const parseRow = (line) => {
    const vals = []; let inQ = false, cur = ''
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++ } else inQ = !inQ }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = '' }
      else cur += ch
    }
    vals.push(cur.trim())
    return vals
  }
  const headers = parseRow(lines[0])
  const rows = lines.slice(1).map(l => {
    const v = parseRow(l)
    return headers.reduce((o, h, i) => { o[h] = v[i] || ''; return o }, {})
  }).filter(r => Object.values(r).some(v => v))
  return { headers, rows }
}

// LinkedIn Lead Form V2 — exact column → CRM field mapping
const LINKEDIN_COLUMN_MAP = {
  'first name':                                                          '_first_name',
  'last name':                                                           '_last_name',
  'email address':                                                       'email',
  'how would you best describe your brand\'s current stage of growth?': 'brand_stage',
  'what type of product development support are you looking for?':      'support_level',
  'when are you planning to begin development?':                        'development_timeline',
  'company':                                                             'company',
  'phone':                                                               'phone_number',
  'phone number':                                                        'phone_number',
  'country':                                                             'country',
}

// Map LinkedIn answer text → CRM dropdown value (keyword-based, order matters).
// LinkedIn's answer wording differs from the CRM dropdowns, so we match on
// distinctive keywords rather than exact strings.
const VALUE_NORMALIZER = {
  brand_stage: [
    { match: 'pre-launch',       value: 'Pre-launch with capital allocated for product development' },
    { match: 'prelaunch',        value: 'Pre-launch with capital allocated for product development' },
    { match: 'generating sales', value: 'Generating sales with an early product line' },
    { match: 'scaling',          value: 'Scaling with multiple collections or expanding distribution (DTC/retail)' },
    { match: 'established',       value: 'Established brand investing in new product development or expansion' },
  ],
  support_level: [
    { match: 'tech pack',         value: 'Technical execution (tech packs, specs, and documentation)' },
    { match: 'technical',         value: 'Technical execution (tech packs, specs, and documentation)' },
    { match: 'documentation',     value: 'Technical execution (tech packs, specs, and documentation)' },
    { match: 'sampling',          value: 'Product development management (we lead sampling, fit, and factory execution)' },
    { match: 'factory execution', value: 'Product development management (we lead sampling, fit, and factory execution)' },
    { match: 'management',        value: 'Product development management (we lead sampling, fit, and factory execution)' },
    { match: 'full product',      value: 'Full product ownership (we lead design, development, and production from concept through launch)' },
    { match: 'ownership',         value: 'Full product ownership (we lead design, development, and production from concept through launch)' },
    { match: 'concept',           value: 'Full product ownership (we lead design, development, and production from concept through launch)' },
  ],
  development_timeline: [
    { match: 'immediate', value: 'Immediately' },
    { match: '1-2',       value: 'Within 1–2 months' },
    { match: '1–2',       value: 'Within 1–2 months' },
    { match: '3-6',       value: '3–6 months' },
    { match: '3–6',       value: '3–6 months' },
  ],
}

function normalizeValue(field, raw) {
  const rules = VALUE_NORMALIZER[field]
  if (!rules || !raw) return raw
  const lower = raw.toLowerCase().replace(/["""]/g, '').trim()
  for (const { match, value } of rules) {
    if (lower.includes(match)) return value
  }
  return raw
}

// Strip ALL punctuation (apostrophes, question marks, etc.) so header matching
// is immune to smart-quote vs straight-quote and other encoding differences.
const normalizeKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Pre-normalize the LinkedIn map keys once for reliable lookup
const NORMALIZED_LINKEDIN_MAP = Object.fromEntries(
  Object.entries(LINKEDIN_COLUMN_MAP).map(([k, v]) => [normalizeKey(k), v])
)

function autoMapColumns(headers) {
  const mapping = {}
  for (const h of headers) {
    const hl = normalizeKey(h)
    // Exact LinkedIn match first (punctuation-insensitive)
    if (NORMALIZED_LINKEDIN_MAP[hl]) { mapping[h] = NORMALIZED_LINKEDIN_MAP[hl]; continue }
    // Generic fallback patterns
    const PATTERNS = {
      email:                ['email', 'correo'],
      name:                 ['full name', 'nombre completo'],
      _first_name:          ['firstname', 'nombre'],
      _last_name:           ['lastname', 'apellido'],
      company:              ['company name', 'organization', 'empresa'],
      phone_number:         ['mobile', 'telefono', 'cell'],
      country:              ['location', 'país', 'pais'],
      brand_stage:          ['brand stage', 'brand status'],
      investment_level:     ['investment level', 'budget'],
      development_timeline: ['timeframe'],
      support_level:        ['support type'],
      primary_issue:        ['challenge', 'issue', 'problema'],
    }
    let matched = ''
    for (const [field, pats] of Object.entries(PATTERNS)) {
      if (pats.some(p => hl.includes(p))) { matched = field; break }
    }
    mapping[h] = matched
  }
  return mapping
}

function handleFileUpload(event) {
  const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const { headers, rows } = parseCSV(e.target.result)
    importHeaders.value = headers
    importRows.value = rows
    importMapping.value = autoMapColumns(headers)
    importModal.value.step = 3 // skip manual mapping, go straight to preview
  }
  reader.readAsText(file)
}

// Treat null, empty, and common placeholder strings as "fillable"
const PLACEHOLDER_VALUES = ['', 'no especificado', 'not specified', 'na', 'n/a', 'none', '-', 'null']
function isEmptyValue(v) {
  return v == null || PLACEHOLDER_VALUES.includes(String(v).toLowerCase().trim())
}

function buildClientObj(row) {
  const obj = {}; let first = '', last = ''
  for (const [col, field] of Object.entries(importMapping.value)) {
    if (!field || !row[col]) continue
    const raw = row[col].replace(/^"+|"+$/g, '').trim() // strip extra quotes
    if (field === '_first_name') first = raw
    else if (field === '_last_name') last = raw
    else obj[field] = normalizeValue(field, raw)
  }
  if (first || last) obj.name = [first, last].filter(Boolean).join(' ')
  return obj
}

const mappedPreview = computed(() => importRows.value.slice(0, 5).map(buildClientObj))

async function runImport() {
  importRunning.value = true
  importModal.value.step = 4
  const res = { created: 0, updated: 0, skipped: 0, errors: [] }
  for (const row of importRows.value) {
    try {
      const obj = buildClientObj(row)
      if (!obj.email) { res.skipped++; continue }
      const email = obj.email.toLowerCase().trim()
      const { data: existing } = await supabase.from('clients').select('*').eq('email', email).maybeSingle()
      if (existing) {
        const updates = {}
        for (const [k, v] of Object.entries(obj)) { if (isEmptyValue(existing[k]) && v) updates[k] = v }
        updates.lead_source = 'LinkedIn' // tag merged clients as LinkedIn-sourced
        await supabase.from('clients').update(updates).eq('id', existing.id)
        res.updated++
      } else {
        await supabase.from('clients').insert([{ ...obj, email, lead_source: 'LinkedIn' }])
        res.created++
      }
    } catch (e) { res.errors.push(row.email || 'unknown') }
  }
  importResults.value = res
  importRunning.value = false
  fetchClients()
}

function resetImport() {
  importModal.value = { show: false, step: 1 }
  importHeaders.value = []; importRows.value = []; importMapping.value = {}
  importResults.value = { created: 0, updated: 0, skipped: 0, errors: [] }
  importRunning.value = false
}
// ─────────────────────────────────────────────────────────────────────────────

const isDetailOpen = ref(false)
const selectedProject = ref(null)
// Bumped after creating a project so an open client card reloads its Projects tab.
const cardRefreshToken = ref(0)

const showAddProjectModal = ref(false)
const isSavingProject = ref(false)
const targetClient = ref(null)
const projectForm = ref({ title: '', amount_paid: null, amount_owed: null, milestones: '', deliverable_trend_analysis: false, deliverable_trend_analysis_due: '', deliverable_design: false, deliverable_design_due: '', deliverable_branding: false, deliverable_branding_due: '', deliverable_tech_pack: false, deliverable_tech_pack_due: '', deliverable_product_dev: false, deliverable_manu_quotes_due: '', deliverable_initial_sample_due: '', deliverable_approved_sample_due: '', deliverable_size_range_due: '', deliverable_bulk_due: '', deliverable_product_analysis: false, deliverable_product_analysis_due: '', deliverable_in_house_patternmaking: false, deliverable_in_house_patternmaking_due: '', deliverable_in_house_proto: false, deliverable_in_house_proto_due: '', deliverable_in_house_manufacturing: false, deliverable_in_house_manufacturing_due: '' })

const openAddProject = (client) => {
  targetClient.value = client
  projectForm.value = { title: '', amount_paid: null, amount_owed: null, milestones: '', deliverable_trend_analysis: false, deliverable_trend_analysis_due: '', deliverable_design: false, deliverable_design_due: '', deliverable_branding: false, deliverable_branding_due: '', deliverable_tech_pack: false, deliverable_tech_pack_due: '', deliverable_product_dev: false, deliverable_manu_quotes_due: '', deliverable_initial_sample_due: '', deliverable_approved_sample_due: '', deliverable_size_range_due: '', deliverable_bulk_due: '', deliverable_product_analysis: false, deliverable_product_analysis_due: '', deliverable_in_house_patternmaking: false, deliverable_in_house_patternmaking_due: '', deliverable_in_house_proto: false, deliverable_in_house_proto_due: '', deliverable_in_house_manufacturing: false, deliverable_in_house_manufacturing_due: '' }
  showAddProjectModal.value = true
}

const saveProject = async () => {
  try {
    isSavingProject.value = true
    const { data: newProj, error } = await supabase.from('projects').insert([{
      client_id: targetClient.value.id,
      title: projectForm.value.title,
      pipeline_stage: 'Intake Form Received',
      amount_paid: projectForm.value.amount_paid || 0,
      amount_owed: projectForm.value.amount_owed || 0,
      milestones: projectForm.value.milestones || null,
      deliverable_trend_analysis: projectForm.value.deliverable_trend_analysis,
      deliverable_trend_analysis_due: projectForm.value.deliverable_trend_analysis_due || null,
      deliverable_design: projectForm.value.deliverable_design,
      deliverable_design_due: projectForm.value.deliverable_design_due || null,
      deliverable_branding: projectForm.value.deliverable_branding,
      deliverable_branding_due: projectForm.value.deliverable_branding_due || null,
      deliverable_tech_pack: projectForm.value.deliverable_tech_pack,
      deliverable_tech_pack_due: projectForm.value.deliverable_tech_pack_due || null,
      deliverable_product_dev: projectForm.value.deliverable_product_dev,
      deliverable_manu_quotes_due: projectForm.value.deliverable_manu_quotes_due || null,
      deliverable_initial_sample_due: projectForm.value.deliverable_initial_sample_due || null,
      deliverable_approved_sample_due: projectForm.value.deliverable_approved_sample_due || null,
      deliverable_size_range_due: projectForm.value.deliverable_size_range_due || null,
      deliverable_bulk_due: projectForm.value.deliverable_bulk_due || null,
      deliverable_product_analysis: projectForm.value.deliverable_product_analysis,
      deliverable_product_analysis_due: projectForm.value.deliverable_product_analysis_due || null,
      deliverable_in_house_patternmaking: projectForm.value.deliverable_in_house_patternmaking,
      deliverable_in_house_patternmaking_due: projectForm.value.deliverable_in_house_patternmaking_due || null,
      deliverable_in_house_proto: projectForm.value.deliverable_in_house_proto,
      deliverable_in_house_proto_due: projectForm.value.deliverable_in_house_proto_due || null,
      deliverable_in_house_manufacturing: projectForm.value.deliverable_in_house_manufacturing,
      deliverable_in_house_manufacturing_due: projectForm.value.deliverable_in_house_manufacturing_due || null,
    }]).select().single()
    if (error) throw error
    await supabase.from('activity_logs').insert({
      event_type: 'project_created',
      client_id: targetClient.value.id,
      client_name: targetClient.value.name,
      project_id: newProj.id,
      project_title: newProj.title,
      notes: 'Stage: Intake Form Received'
    })
    showAddProjectModal.value = false
    await fetchClients()
    cardRefreshToken.value++ // reload the open client card's Projects tab, if any
    await showAlert(`Project "${projectForm.value.title}" created and added to the pipeline.`, 'Project Created')
  } catch (err) {
    await showAlert(err.message, 'Error')
  } finally {
    isSavingProject.value = false
  }
}

const form = ref({
  name: '', email: '', company: '', phone_number: '', country: '', lead_source: 'Manual Entry',
  brand_stage: '', investment_level: '', development_timeline: '', support_level: '', primary_issue: ''
})

const getStatusChipStyle = (status) => {
  const base = 'display: inline-flex; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 3px 6px; border-radius: 2px; border: 1px solid; white-space: nowrap; width: max-content;'
  if (status === 'Signed') return base + 'background: var(--positive-soft); color: var(--positive); border-color: #B8C4A0;'
  if (status === 'Sent')   return base + 'background: var(--caution-soft); color: var(--caution); border-color: #DBC68A;'
  return base + 'background: var(--paper-2); color: var(--ink-4); border-color: var(--ink-5);'
}

const fetchClients = async () => {
  try {
    loading.value = true
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, title, pipeline_stage, client_id, sow_status, sow_sent_date, sow_signed_date').is('archived_at', null)
    ])
    if (clientsRes.error) throw clientsRes.error
    const projectsByClient = {}
    for (const p of (projectsRes.data || [])) {
      if (!projectsByClient[p.client_id]) projectsByClient[p.client_id] = []
      projectsByClient[p.client_id].push(p)
    }
    clients.value = (clientsRes.data || []).map(c => ({
      ...c,
      projects: projectsByClient[c.id] || []
    }))
    if (selectedProject.value?.client?.id) {
      const fresh = clients.value.find(c => c.id === selectedProject.value.client.id)
      if (fresh) selectedProject.value = { ...selectedProject.value, client: fresh }
    }
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const switchToProject = (proj) => {
  const client = selectedProject.value?.client
  selectedProject.value = { ...proj, client, client_id: client?.id }
}

const openClientDetail = (client) => {
  selectedProject.value = {
    id: null,
    title: `Client Profile: ${client.name}`,
    client: client,
    client_id: client.id,
    pipeline_stage: client.pipeline_stage || 'Directory View',
    internal_notes: client.internal_notes || '',
    created_at: client.created_at,
    scheduled_date: client.scheduled_date,
    meeting_link: client.meeting_link
  }
  isDetailOpen.value = true
}

const openModal = (client = null) => {
  if (client) {
    editingId.value = client.id
    form.value = { ...client }
  } else {
    editingId.value = null
    form.value = {
      name: '', email: '', company: '', phone_number: '', country: '', lead_source: 'Manual Entry',
      brand_stage: '', investment_level: '', development_timeline: '', support_level: '', primary_issue: '',
      scheduled_date: '', meeting_link: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveClient = async () => {
  try {
    isSubmitting.value = true
    const nullify = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null)
    const { projects: _projects, ...formFields } = form.value
    const payload = {
      ...formFields,
      email:                nullify(form.value.email),
      company:              nullify(form.value.company),
      phone_number:         nullify(form.value.phone_number),
      country:              nullify(form.value.country),
      brand_stage:          nullify(form.value.brand_stage),
      investment_level:     nullify(form.value.investment_level),
      development_timeline: nullify(form.value.development_timeline),
      support_level:        nullify(form.value.support_level),
      primary_issue:        nullify(form.value.primary_issue),
      scheduled_date:       form.value.scheduled_date || null,
      meeting_link:         nullify(form.value.meeting_link),
    }
    if (editingId.value) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editingId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('clients').insert([payload])
      if (error) throw error
    }
    closeModal()
    fetchClients()
  } catch (err) {
    await showAlert(err.message, 'Error')
  } finally { isSubmitting.value = false }
}

const markNoShow = async (client) => {
  const confirmed = await showConfirm({
    title: 'Mark as No Show',
    message: `${client.name} didn't show up to their meeting? This will clear the scheduled date and queue a no-show follow-up email.`,
    confirmText: 'Mark No Show',
    cancelText: 'Cancel',
    isDangerous: false
  })
  if (!confirmed) return
  try {
    await supabase.from('clients').update({ scheduled_date: null, meeting_link: null }).eq('id', client.id)
    const dueAt = new Date()
    dueAt.setHours(dueAt.getHours() + 1)
    await supabase.from('email_queue').insert({
      client_id:    client.id,
      client_name:  client.name,
      trigger_type: 'no_show',
      due_at:       dueAt.toISOString(),
    })
    await supabase.from('activity_logs').insert({
      event_type: 'no_show',
      client_id:  client.id,
      notes:      'Client did not show up to scheduled meeting. No-show email queued.',
    })
    fetchClients()
  } catch (err) {
    await showAlert(err.message, 'Error')
  }
}

const confirmDelete = async (client) => {
  const confirmed = await showConfirm({
    title: 'Delete Client',
    message: `Are you sure you want to delete ${client.name}? This will also delete all their projects and signed contracts.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (confirmed) {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id)
      if (error) throw error
      fetchClients()
    } catch (err) {
      await showAlert(err.message, 'Error')
    }
  }
}

onMounted(fetchClients)
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.22s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
