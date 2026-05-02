<template>
  <div class="flex flex-col h-full relative" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;">

    <!-- Page header -->
    <div class="flex justify-between items-center" style="padding: 20px 24px; border-bottom: 1px solid var(--ink);">
      <div>
        <h1 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 28px; color: var(--ink); margin: 0 0 4px; letter-spacing: -0.02em;">Clients Directory</h1>
        <p style="font-size: 13px; color: var(--ink-3); margin: 0;">Manage your leads and active clients.</p>
      </div>
      <button
        @click="openModal()"
        style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
        @mouseenter="e => e.target.style.opacity = '0.85'"
        @mouseleave="e => e.target.style.opacity = '1'"
      >+ Add Client</button>
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
                  <input v-model="form.brand_stage" type="text" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Investment Level</label>
                  <input v-model="form.investment_level" type="text" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Timeline</label>
                  <input v-model="form.development_timeline" type="text" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
                <div class="col-span-2 md:col-span-1">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Support Level</label>
                  <input v-model="form.support_level" type="text" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
                </div>
                <div class="col-span-2">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Primary Issue / Need</label>
                  <textarea v-model="form.primary_issue" rows="2" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; resize: vertical;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
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
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Due Date</label>
            <input v-model="projectForm.due_date" type="date" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" />
          </div>
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Link Hub Project</label>
            <select v-model="projectForm.hub_project_id" :disabled="loadingHubProjects" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; appearance: none; cursor: pointer;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'" @change="onHubProjectSelect">
              <option :value="null">{{ loadingHubProjects ? 'Loading...' : '— No link —' }}</option>
              <option v-for="p in hubProjects" :key="p.id" :value="p.id">
                {{ p.project_name }}{{ p.client_name ? ` · ${p.client_name}` : '' }}{{ p.status ? ` (${p.status})` : '' }}
              </option>
            </select>
          </div>
          <button
            type="button"
            @click="projectForm.add_to_hub = !projectForm.add_to_hub"
            :style="projectForm.add_to_hub
              ? 'width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 2px; border: 1px solid #B8C4A0; background: var(--positive-soft); cursor: pointer; font-family: var(--font-sans);'
              : 'width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 2px; border: 1px solid var(--ink-5); background: var(--paper); cursor: pointer; font-family: var(--font-sans);'"
          >
            <svg v-if="projectForm.add_to_hub" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--positive)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            <span :style="projectForm.add_to_hub ? 'font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--positive);' : 'font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3);'">
              {{ projectForm.add_to_hub ? 'Added to Manu Hub' : 'Add to Manu Hub' }}
            </span>
          </button>

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
      @close="isDetailOpen = false"
      @updated="fetchClients"
      @open-project="switchToProject"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { hubSupabase } from '../lib/hubClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import ProjectDetail from '../components/ProjectDetail.vue'

const { confirm: showConfirm, alert: showAlert } = useConfirmModal()

const clients = ref([])
const loading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const editingId = ref(null)

const isDetailOpen = ref(false)
const selectedProject = ref(null)

const showAddProjectModal = ref(false)
const isSavingProject = ref(false)
const targetClient = ref(null)
const projectForm = ref({ title: '', amount_paid: null, amount_owed: null, milestones: '', due_date: '', add_to_hub: false, hub_project_id: null, deliverable_trend_analysis: false, deliverable_trend_analysis_due: '', deliverable_design: false, deliverable_design_due: '', deliverable_branding: false, deliverable_branding_due: '', deliverable_tech_pack: false, deliverable_tech_pack_due: '', deliverable_product_dev: false, deliverable_manu_quotes_due: '', deliverable_initial_sample_due: '', deliverable_approved_sample_due: '', deliverable_size_range_due: '', deliverable_bulk_due: '', deliverable_product_analysis: false, deliverable_product_analysis_due: '', deliverable_in_house_patternmaking: false, deliverable_in_house_patternmaking_due: '', deliverable_in_house_proto: false, deliverable_in_house_proto_due: '', deliverable_in_house_manufacturing: false, deliverable_in_house_manufacturing_due: '' })
const hubProjects = ref([])
const loadingHubProjects = ref(false)

const openAddProject = async (client) => {
  targetClient.value = client
  projectForm.value = { title: '', amount_paid: null, amount_owed: null, milestones: '', due_date: '', add_to_hub: false, hub_project_id: null, deliverable_trend_analysis: false, deliverable_trend_analysis_due: '', deliverable_design: false, deliverable_design_due: '', deliverable_branding: false, deliverable_branding_due: '', deliverable_tech_pack: false, deliverable_tech_pack_due: '', deliverable_product_dev: false, deliverable_manu_quotes_due: '', deliverable_initial_sample_due: '', deliverable_approved_sample_due: '', deliverable_size_range_due: '', deliverable_bulk_due: '', deliverable_product_analysis: false, deliverable_product_analysis_due: '', deliverable_in_house_patternmaking: false, deliverable_in_house_patternmaking_due: '', deliverable_in_house_proto: false, deliverable_in_house_proto_due: '', deliverable_in_house_manufacturing: false, deliverable_in_house_manufacturing_due: '' }
  loadingHubProjects.value = true
  showAddProjectModal.value = true
  const { data } = await hubSupabase.from('projects').select('id, project_name, client_name, status').order('created_at', { ascending: false })
  hubProjects.value = data || []
  loadingHubProjects.value = false
}

const onHubProjectSelect = () => {
  const selected = hubProjects.value.find(p => p.id === projectForm.value.hub_project_id)
  if (selected) projectForm.value.title = selected.project_name
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
      due_date: projectForm.value.due_date || null,
      hub_project_id: projectForm.value.hub_project_id || null,
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
    if (projectForm.value.add_to_hub) {
      const { data: newHubProject, error: hubError } = await hubSupabase
        .from('projects')
        .insert([{ project_name: newProj.title, client_name: targetClient.value.name || '', status: 'active' }])
        .select('id')
        .single()
      if (!hubError && newHubProject) {
        await supabase.from('projects').update({ hub_project_id: newHubProject.id }).eq('id', newProj.id)
      }
    }
    await supabase.from('activity_logs').insert({
      event_type: 'project_created',
      client_id: targetClient.value.id,
      client_name: targetClient.value.name,
      project_id: newProj.id,
      project_title: newProj.title,
      notes: 'Stage: Intake Form Received'
    })
    showAddProjectModal.value = false
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
    pipeline_stage: 'Directory View',
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
