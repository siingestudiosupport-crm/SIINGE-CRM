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
      <div class="w-full max-w-lg overflow-hidden" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px;" :class="'animate-slide-up'">
        <div class="flex justify-between items-center" style="padding: 16px 24px; border-bottom: 1px solid var(--bone-edge); background: var(--ink);">
          <div>
            <h3 style="font-family: var(--font-display); font-style: italic; font-size: 20px; font-weight: 400; color: var(--paper); margin: 0 0 2px;">Add Project</h3>
            <p style="font-size: 11px; color: rgba(250,247,242,0.5); margin: 0;">for {{ targetClient?.name }}</p>
          </div>
          <button @click="showAddProjectModal = false" style="color: rgba(250,247,242,0.6); background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>
        <form @submit.prevent="saveProject" class="p-6 space-y-4">
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
            <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">Milestones</label>
            <textarea v-model="projectForm.milestones" rows="3" placeholder="• Phase 1: Discovery&#10;• Phase 2: Design&#10;• Phase 3: Delivery" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none; resize: none;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
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
          <label class="flex items-center gap-3" style="padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; cursor: pointer; background: var(--paper);">
            <input type="checkbox" v-model="projectForm.in_menu_hub" style="width: 14px; height: 14px; accent-color: var(--ink);" />
            <span style="font-size: 13px; color: var(--ink-2);">Added to Menu Hub</span>
          </label>
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
const projectForm = ref({ title: '', amount_paid: null, amount_owed: null, milestones: '', due_date: '', in_menu_hub: false, hub_project_id: null })
const hubProjects = ref([])
const loadingHubProjects = ref(false)

const openAddProject = async (client) => {
  targetClient.value = client
  projectForm.value = { title: '', amount_paid: null, amount_owed: null, milestones: '', due_date: '', in_menu_hub: false, hub_project_id: null }
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
      in_menu_hub: projectForm.value.in_menu_hub,
      hub_project_id: projectForm.value.hub_project_id || null,
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
      supabase.from('projects').select('id, title, pipeline_stage, client_id, sow_status, sow_sent_date, sow_signed_date')
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
      brand_stage: '', investment_level: '', development_timeline: '', support_level: '', primary_issue: ''
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
