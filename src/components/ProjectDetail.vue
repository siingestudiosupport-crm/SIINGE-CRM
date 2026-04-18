<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-end justify-end">
    <div class="absolute inset-0 transition-opacity" style="background: rgba(14,14,12,0.4);" @click="$emit('close')"></div>

    <div class="relative w-full max-w-xl h-full flex flex-col animate-slide-in" style="background: var(--bone); box-shadow: var(--shadow-3);">

      <div class="p-6 border-b flex justify-between items-start" style="background: var(--paper-2); border-color: var(--bone-edge);">
        <div>
          <h2 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--ink); margin: 0 0 8px; letter-spacing: -0.02em;">{{ project?.title || 'Project Detail' }}</h2>
          <div class="flex items-center gap-2">
            <p style="font-size: 13px; font-weight: 600; color: var(--ink-2);">{{ project?.client?.name || 'Unknown Client' }}</p>
            <span v-if="project?.client?.client_tier" :style="getTierChipStyle(project.client.client_tier)">
              {{ project.client.client_tier }}
            </span>
          </div>
          <div v-if="project?.client?.phone_number" class="flex items-center gap-2 mt-1">
            <span v-if="project?.client?.country" style="font-size: 11px; color: var(--ink-4);">{{ project.client.country }}</span>
            <span v-if="project?.client?.country" style="color: var(--ink-5); font-size: 11px;">|</span>
            <span style="font-size: 11px; color: var(--ink-4); font-family: var(--font-mono);">{{ project.client.phone_number }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button v-if="project?.id" @click="deleteProject" title="Delete project"
            style="color: var(--ink-4); background: none; border: none; cursor: pointer; padding: 2px; transition: color 120ms; display: flex; align-items: center;"
            @mouseenter="e=>e.currentTarget.style.color='var(--critical)'" @mouseleave="e=>e.currentTarget.style.color='var(--ink-4)'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <button @click="$emit('close')" style="color: var(--ink-4); background: none; border: none; font-size: 22px; cursor: pointer; line-height: 1; padding: 0; transition: color 120ms;" @mouseenter="e=>e.target.style.color='var(--ink)'" @mouseleave="e=>e.target.style.color='var(--ink-4)'">&times;</button>
        </div>
      </div>

      <div class="flex px-6" style="background: var(--paper-2); border-bottom: 1px solid var(--bone-edge);">
        <button
          @click="activeTab = 'Overview'"
          :style="activeTab === 'Overview'
            ? 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink); border-bottom: 2px solid var(--ink); transition: color 120ms;'
            : 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink-4); border-bottom: 2px solid transparent; transition: color 120ms;'"
        >Overview</button>
        <button
          v-if="project?.id"
          @click="activeTab = 'SOW'"
          :style="activeTab === 'SOW'
            ? 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink); border-bottom: 2px solid var(--ink); transition: color 120ms;'
            : 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink-4); border-bottom: 2px solid transparent; transition: color 120ms;'"
        >SOW</button>
        <button
          v-if="!project?.id"
          @click="activeTab = 'Contracts'"
          :style="activeTab === 'Contracts'
            ? 'padding: 12px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink); border-bottom: 2px solid var(--ink); transition: color 120ms;'
            : 'padding: 12px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink-4); border-bottom: 2px solid transparent; transition: color 120ms;'"
        >Contracts Log</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 bg-white" v-if="project">
        
        <div v-if="activeTab === 'Overview'" class="space-y-6">
          
          <section v-if="suggestedAction" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 16px;">
            <div class="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ember)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              <div>
                <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ember); margin: 0 0 4px;">Suggested Action</p>
                <p style="font-size: 13px; font-weight: 600; color: var(--ink); margin: 0 0 4px;">{{ suggestedAction.title }}</p>
                <p style="font-size: 12px; color: var(--ink-3); margin: 0; font-style: italic; line-height: 1.5;">{{ suggestedAction.desc }}</p>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Pipeline Stage</label>
              <select v-model="localEdits.pipeline_stage" @change="updateOverview" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800 transition-all shadow-sm">
                <option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Proposal Value</label>
              <div class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm transition-all">
                <span class="text-gray-500 mr-1 font-bold">$</span>
                <input v-model="localEdits.proposal_value" @blur="updateOverview" type="number" class="w-full bg-transparent border-none p-2.5 outline-none text-sm font-bold text-gray-800" placeholder="0.00" />
              </div>
            </div>
          </section>

          <section v-if="!project?.id && project?.client && (project.client.investment_level || project.client.brand_stage)" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div class="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <h3 class="font-bold text-gray-800 uppercase tracking-tighter text-xs">Strategy Call Intake</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-y-5 gap-x-4">
              <div class="group">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tighter group-hover:text-blue-500 transition-colors">Brand Stage</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.brand_stage || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tighter">Investment Level</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.investment_level || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tighter">Development Timeline</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.development_timeline || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tighter">Required Support</p>
                <p class="text-sm text-gray-800 font-medium">{{ project.client.support_level || 'N/A' }}</p>
              </div>
              
              <div class="col-span-2 pt-2">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-tighter">Primary Issue / Need</p>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 relative text-sm italic text-gray-700 leading-relaxed shadow-inner">
                  "{{ project.client.primary_issue || 'No specific issue mentioned in the intake form.' }}"
                </div>
              </div>
            </div>
          </section>

          <section v-if="localEdits.pipeline_stage === 'Churn'" class="p-5 animate-fade-in" style="background: var(--critical-soft); border: 1px solid var(--critical); border-radius: 4px;">
            <div class="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--critical);">Reason for Loss (Required)</label>
            </div>
            <select v-model="localEdits.loss_reason" @change="updateOverview" class="w-full border border-red-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none text-red-900 font-bold shadow-sm transition-all">
              <option value="" disabled>Select a reason...</option>
              <option value="Too expensive">Too expensive</option>
              <option value="Timeline mismatch">Timeline mismatch</option>
              <option value="Not ready / Just exploring">Not ready / Just exploring</option>
              <option value="Ghosted after call">Ghosted after call</option>
              <option value="Project cancelled">Project cancelled</option>
              <option value="Other">Other</option>
            </select>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Meeting Date</p>
              <p class="font-bold text-gray-800 text-sm">
                {{ project.scheduled_date ? new Date(project.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled' }}
              </p>
              <a v-if="project.meeting_link" :href="project.meeting_link" target="_blank" class="mt-2 w-max inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow hover:shadow-md">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Join Meeting
              </a>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Client Tier</p>
              <select v-if="project.client" v-model="localEdits.client_tier" @change="updateClientTier" class="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer outline-none transition-colors hover:text-blue-600">
                <option value="Early-stage">Early-stage</option>
                <option value="Established">Established</option>
                <option value="High-value">High-value</option>
              </select>
              <p v-else class="text-xs text-gray-400 italic">No client data</p>
            </div>
          </section>

          <section v-if="timeToClose" class="p-5 flex justify-between items-center" style="background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 4px;">
            <div>
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--positive); margin: 0 0 2px;">Time to Close</p>
              <p style="font-size: 11px; color: var(--positive); margin: 0; font-style: italic;">From initial intake to signed SOW</p>
            </div>
            <div class="text-center">
              <span style="font-family: var(--font-display); font-style: italic; font-size: 40px; color: var(--positive); line-height: 1; letter-spacing: -0.02em;">{{ timeToClose }}</span>
              <p style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--positive); margin: 0;">Days</p>
            </div>
          </section>

          <section>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Internal Notes (Team Only)</label>
              <span class="text-[9px] text-gray-400 font-bold uppercase">Autosave on blur</span>
            </div>
            <textarea
              v-model="localEdits.internal_notes"
              @blur="updateOverview"
              placeholder="Private notes about negotiations, specific founder traits, or red flags..."
              class="w-full border border-gray-300 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-gray-700 shadow-inner"
            ></textarea>
          </section>

          <section v-if="project?.id" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4">
            <h3 class="font-bold text-gray-800 uppercase tracking-tighter text-xs border-b border-gray-100 pb-3">Project Financials & Logistics</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">$ Paid</label>
                <div class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                  <span class="text-gray-500 mr-1 font-bold text-sm">$</span>
                  <input v-model="localEdits.amount_paid" @blur="updateOverview" type="number" min="0" step="0.01" placeholder="0" class="w-full bg-transparent border-none py-2.5 outline-none text-sm font-bold text-gray-800" />
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">$ Owed</label>
                <div class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                  <span class="text-gray-500 mr-1 font-bold text-sm">$</span>
                  <input v-model="localEdits.amount_owed" @blur="updateOverview" type="number" min="0" step="0.01" placeholder="0" class="w-full bg-transparent border-none py-2.5 outline-none text-sm font-bold text-gray-800" />
                </div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Due Date</label>
              <input v-model="localEdits.due_date" @blur="updateOverview" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Milestones</label>
              <textarea v-model="localEdits.milestones" @blur="updateOverview" rows="4" placeholder="• Phase 1: Discovery&#10;• Phase 2: Design&#10;• Phase 3: Delivery" class="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-gray-700 shadow-inner resize-none"></textarea>
            </div>
            <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <input type="checkbox" v-model="localEdits.in_menu_hub" @change="updateOverview" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span class="text-sm font-medium text-gray-700">Added to Menu Hub</span>
            </label>
          </section>
        </div>

        <!-- SOW TAB -->
        <div v-if="activeTab === 'SOW'" class="space-y-6 pb-20">
          <template v-if="project?.client">
            <div v-if="!['Sent', 'Signed'].includes(project.client.sow_status)" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 20px;">
              <div class="flex justify-between items-start" style="margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--bone-edge);">
                <div>
                  <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-2); margin: 0 0 3px;">Live SOW Editor</h3>
                  <p style="font-size: 11px; color: var(--ink-4); margin: 0; font-style: italic;">Edit each section before dispatching.</p>
                </div>
                <button @click="resetSowToTemplates"
                  style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ember); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline;">
                  Reset to templates
                </button>
              </div>
              <div class="space-y-5">
                <div>
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">1. Deliverables (Section 2)</label>
                  <textarea v-model="localEdits.sow_deliverables" rows="6" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.6;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
                </div>
                <div>
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">2. Timeline & Milestones (Section 3)</label>
                  <textarea v-model="localEdits.sow_timeline" rows="5" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.6;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
                </div>
                <div>
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 6px;">3. Fees & Payment (Section 5)</label>
                  <textarea v-model="localEdits.sow_fees_payment" rows="8" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.6;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
                </div>
              </div>
            </div>

            <div v-else style="padding: 16px; background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 4px; font-size: 13px; color: var(--positive); font-weight: 600;">
              SOW already {{ project.client.sow_status.toLowerCase() }} — content is locked. Use Contracts Log → Reset to re-edit.
            </div>

            <div v-if="availableDocs.length > 0" class="p-6 border border-blue-200 rounded-2xl bg-blue-50 shadow-lg relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-10 text-4xl">📧</div>
              <h3 class="font-black text-blue-900 text-xs uppercase tracking-widest mb-4">Dispatch Center</h3>
              <div class="flex gap-8 mb-6 px-1">
                <label v-if="availableDocs.includes('NDA')" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" value="NDA" v-model="selectedDocs" class="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 shadow-sm" />
                  <span class="text-sm font-black text-blue-800 group-hover:text-blue-950">NDA</span>
                </label>
                <label v-if="availableDocs.includes('SOW')" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" value="SOW" v-model="selectedDocs" class="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 shadow-sm" />
                  <span class="text-sm font-black text-blue-800 group-hover:text-blue-950">SOW</span>
                </label>
              </div>
              <button @click="saveAndPrepareEmail" :disabled="selectedDocs.length === 0"
                class="w-full bg-blue-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Save & Prepare Dispatch
              </button>
            </div>

            <div v-if="availableDocs.length === 0" class="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-center text-sm text-gray-500 font-medium">
              All documents have been dispatched. View status in the Contracts Log tab.
            </div>
          </template>
        </div>

        <!-- CONTRACTS LOG TAB (client directory view) -->
        <div v-if="activeTab === 'Contracts'" class="space-y-6 pb-20">
          <template v-if="project?.client">

            <!-- NDA -->
            <div>
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Non-Disclosure Agreement</p>
              <div style="background: var(--paper); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 16px;">
                <div class="flex justify-between items-start">
                  <div class="space-y-1.5">
                    <p v-if="!project.client.nda_sent_date" style="font-size: 12px; color: var(--ink-4); font-style: italic;">Not yet dispatched.</p>
                    <p v-if="project.client.nda_sent_date" style="font-size: 11px; color: var(--ink-3);">Sent: <span style="font-family: var(--font-mono); color: var(--ink-2);">{{ formatDate(project.client.nda_sent_date) }}</span></p>
                    <p v-if="project.client.nda_opened_at" style="font-size: 11px; color: var(--info); display: flex; align-items: center; gap: 6px;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--info); display: inline-block; flex-shrink: 0;"></span>
                      Opened: <span style="font-family: var(--font-mono);">{{ formatDate(project.client.nda_opened_at) }}</span>
                    </p>
                    <p v-if="project.client.nda_signed_date" style="font-size: 11px; font-weight: 700; color: var(--positive);">
                      Signed: <span style="font-family: var(--font-mono);">{{ formatDate(project.client.nda_signed_date) }}</span>
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <span :class="getStatusClass(project.client.nda_status)">{{ project.client.nda_status || 'Pending' }}</span>
                    <button v-if="project.client.nda_sent_date" @click="resetDocument('NDA')"
                      style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;">
                      Reset
                    </button>
                  </div>
                </div>
                <button v-if="project.client.nda_status === 'Signed' && project.client.nda_pdf_path"
                  @click="downloadFromVault(project.client.nda_pdf_path)"
                  class="w-full flex items-center justify-center gap-3"
                  style="margin-top: 12px; padding: 10px; background: var(--positive-soft); color: var(--positive); border: 1px solid #B8C4A0; border-radius: 2px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer; transition: opacity 120ms;"
                  @mouseenter="e=>e.currentTarget.style.opacity='0.8'" @mouseleave="e=>e.currentTarget.style.opacity='1'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Signed NDA
                </button>
              </div>
            </div>

            <!-- SOW log por proyecto -->
            <div>
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Scope of Work — by Project</p>

              <div v-if="clientProjects.length === 0"
                style="padding: 20px; text-align: center; color: var(--ink-4); font-size: 12px; font-style: italic; border: 1px dashed var(--ink-5); border-radius: 4px;">
                No SOWs drafted yet. Open a project from Pipeline to draft and dispatch a SOW.
              </div>

              <div v-else class="space-y-3">
                <div v-for="proj in clientProjects" :key="proj.id"
                  style="background: var(--paper); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 14px 16px;">

                  <div class="flex justify-between items-start" style="margin-bottom: 8px;">
                    <div>
                      <h4 style="font-family: var(--font-display); font-style: italic; font-size: 17px; color: var(--ink); margin: 0 0 2px; letter-spacing: -0.01em;">{{ proj.title }}</h4>
                      <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4); margin: 0;">{{ proj.pipeline_stage }}</p>
                    </div>
                    <span v-if="proj.sow_sent_date" :class="getStatusClass(proj.sow_signed_date ? 'Signed' : 'Sent')">
                      {{ proj.sow_signed_date ? 'Signed' : 'Sent' }}
                    </span>
                    <span v-else style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-5);">Draft</span>
                  </div>

                  <div v-if="proj.sow_sent_date" class="space-y-1">
                    <p style="font-size: 11px; color: var(--ink-3);">Sent: <span style="font-family: var(--font-mono); color: var(--ink-2);">{{ formatDate(proj.sow_sent_date) }}</span></p>
                    <p v-if="proj.sow_signed_date" style="font-size: 11px; font-weight: 700; color: var(--positive);">Signed: <span style="font-family: var(--font-mono);">{{ formatDate(proj.sow_signed_date) }}</span></p>
                  </div>

                  <button v-if="proj.sow_signed_date && proj.sow_pdf_path"
                    @click="downloadFromVault(proj.sow_pdf_path)"
                    class="w-full flex items-center justify-center gap-3"
                    style="margin-top: 10px; padding: 9px; background: var(--positive-soft); color: var(--positive); border: 1px solid #B8C4A0; border-radius: 2px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer; transition: opacity 120ms;"
                    @mouseenter="e=>e.currentTarget.style.opacity='0.8'" @mouseleave="e=>e.currentTarget.style.opacity='1'">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Signed SOW
                  </button>
                </div>
              </div>
            </div>

          </template>

          <div v-else style="padding: 48px; text-align: center; color: var(--ink-4);">
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em;">No client record found for this project.</p>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showEmailModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4" style="background: rgba(14,14,12,0.5);">
      <div class="w-full max-w-2xl overflow-hidden flex flex-col animate-slide-up" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3);">

        <div class="px-8 py-5 flex justify-between items-center" style="background: var(--ink); border-bottom: 1px solid rgba(250,247,242,0.1);">
          <div class="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--paper); margin: 0;">Review & Send Dispatch</h3>
          </div>
          <button @click="showEmailModal = false" style="color: rgba(250,247,242,0.5); background: none; border: none; font-size: 22px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>

        <div class="p-8 flex-1 space-y-5 overflow-y-auto">
          <div class="space-y-3">
            <div class="grid grid-cols-6 items-center border-b border-gray-100 pb-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest col-span-1">To</span>
              <span class="col-span-5 text-sm font-bold text-gray-700">{{ project?.client?.email }}</span>
            </div>
            <div class="grid grid-cols-6 items-center border-b border-gray-100 pb-2">
              <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest col-span-1">CC</span>
              <span class="col-span-5 text-sm font-black text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded">sierra@siinge.studio</span>
            </div>
            <div class="grid grid-cols-6 items-center border-b border-gray-100 pb-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest col-span-1">Subject</span>
              <input v-model="emailData.subject" type="text" class="col-span-5 text-sm font-bold text-gray-800 bg-transparent outline-none focus:text-blue-600 transition-colors" />
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</label>
            <textarea v-model="emailData.messageText" rows="6" class="w-full border-2 border-gray-100 rounded-2xl p-6 text-sm bg-white shadow-inner focus:border-blue-500 outline-none transition-all resize-none"></textarea>
            <div class="border-2 border-gray-100 rounded-2xl p-6 bg-gray-50">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Signature Links</p>
              <div v-html="emailData.buttonsHtml"></div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3" style="padding: 20px 32px; border-top: 1px solid var(--bone-edge); background: var(--paper-2);">
          <button @click="showEmailModal = false" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">
            Cancel Dispatch
          </button>
          <button @click="dispatchEmail" :disabled="isSendingEmail" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;" :style="isSendingEmail ? 'opacity: 0.5;' : ''">
            {{ isSendingEmail ? 'Disseminating...' : 'Confirm & Dispatch to Client' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useConfirmModal } from '../composables/useConfirmModal'

const props = defineProps({
  isOpen: Boolean,
  project: Object
})

const emit = defineEmits(['close', 'updated'])
const { confirm: showConfirm, alert: showAlert } = useConfirmModal()

const defaultDeliverables = `Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n• [Include anything that defines scope clearly]\nAny work not expressly listed above is considered out of scope.`;
const defaultTimeline = `• Project Start Date: [INSERT]\n• Key Milestones (optional): [INSERT]\n• Final Delivery Date: [INSERT]\nTimeline is dependent on timely client feedback, approvals, and provision of required materials.`;
const defaultFees = `Total Project Fee: $[INSERT]\nPayment Terms:\n• [INSERT STRUCTURE]\nPayment is a condition precedent to commencement of Services. No work shall begin until\npayment has been received.\nAll payments are non-refundable once Services have commenced.\nAny Services outside the defined Deliverables shall be billed at $[INSERT RATE] or pursuant to\na separate written agreement.\nFailure to make timely payment may result in suspension of Services without liability.`;

const activeTab = ref('Overview')
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const selectedDocs = ref([])
const emailData = ref({ subject: '', messageText: '', buttonsHtml: '' })

// Copia local de los campos editables — nunca mutamos la prop directamente
const localEdits = ref({
  pipeline_stage: '', proposal_value: null, internal_notes: '',
  loss_reason: '', client_tier: '',
  sow_deliverables: '', sow_timeline: '', sow_fees_payment: '',
  amount_paid: null, amount_owed: null, milestones: '', due_date: '', in_menu_hub: false
})

const stages = [
  'Directory View', 'Intake Form Received', 'Call Booked', 'Proposal Sent',
  'Contracts Signed', 'Invoice Paid', 'Follow Up Needed',
  'Churn', 'Project Complete', 'Future Project Opp'
]

const clientProjects = ref([])

const fetchClientProjects = async () => {
  if (!props.project?.client_id) return
  const { data } = await supabase
    .from('projects')
    .select('id, title, created_at, pipeline_stage, sow_deliverables, sow_sent_date, sow_signed_date, sow_pdf_path')
    .eq('client_id', props.project.client_id)
    .order('created_at', { ascending: false })
  clientProjects.value = (data || []).filter(p => p.sow_deliverables || p.sow_sent_date)
}

// Declarado ANTES del watch que lo usa para evitar TDZ
const availableDocs = computed(() => {
  const docs = []
  const nda = props.project?.client?.nda_status
  const sow = props.project?.client?.sow_status
  if (!props.project?.id) {
    // Vista tarjeta de cliente: solo NDA
    if (nda !== 'Sent' && nda !== 'Signed') docs.push('NDA')
  } else {
    // Vista proyecto en pipeline: solo SOW
    if (sow !== 'Sent' && sow !== 'Signed') docs.push('SOW')
  }
  return docs
})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project) {
    const p = props.project
    const c = p.client
    localEdits.value = {
      pipeline_stage: p.pipeline_stage || '',
      proposal_value: p.proposal_value || null,
      internal_notes: p.internal_notes || '',
      loss_reason: p.loss_reason || '',
      client_tier: c?.client_tier || '',
      sow_deliverables: defaultDeliverables,
      sow_timeline: defaultTimeline,
      sow_fees_payment: defaultFees,
      amount_paid: p.amount_paid || null,
      amount_owed: p.amount_owed || null,
      milestones: p.milestones || '',
      due_date: p.due_date || '',
      in_menu_hub: p.in_menu_hub || false,
    }
    selectedDocs.value = availableDocs.value
    if (!props.project?.id) fetchClientProjects()
  }
}, { immediate: true })

const suggestedAction = computed(() => {
  const p = props.project
  const c = p?.client
  if (!p || !c) return null
  if (p.pipeline_stage === 'Project Complete') return { title: 'Post-Project Follow-up', desc: 'In 30 days, check-in for next collection or upsell development.' }
  if (c.sow_status === 'Sent' && !c.sow_signed_date) return { title: 'Proposal Follow-up', desc: 'No response yet? Follow up in 3 days to maintain momentum.' }
  if (p.pipeline_stage === 'Call Booked') return { title: 'High Priority: Send Proposal', desc: 'Call completed. Send SOW within the next 24 hours to secure the deal.' }
  if (c.client_tier === 'Early-stage' && p.pipeline_stage === 'Intake Form Received') return { title: 'Nurture Lead', desc: 'Early-stage founder. Re-engage if no meeting is booked.' }
  return null
})

const timeToClose = computed(() => {
  const p = props.project
  if (!p || !p.created_at || (!p.closed_at && !p.client?.sow_signed_date)) return null
  const start = new Date(p.created_at)
  const end = new Date(p.closed_at || p.client.sow_signed_date)
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
})

const getStatusClass = (s) => {
  const base = 'text-[10px] px-3 py-1 rounded font-bold uppercase tracking-widest '
  if (s === 'Signed') return base + 'bg-[var(--positive-soft)] text-[var(--positive)] border border-[#B8C4A0]'
  if (s === 'Sent')   return base + 'bg-[var(--caution-soft)] text-[var(--caution)] border border-[#DBC68A]'
  return base + 'bg-[var(--paper-2)] text-[var(--ink-4)] border border-[var(--ink-5)]'
}

const getTierChipStyle = (t) => {
  const base = 'display:inline-flex;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;padding:3px 6px;border-radius:2px;border:1px solid;white-space:nowrap;'
  if (t === 'High-value')  return base + 'background:var(--positive-soft);color:var(--positive);border-color:#B8C4A0;'
  if (t === 'Established') return base + 'background:var(--info-soft);color:var(--info);border-color:#B6C0C7;'
  return base + 'background:var(--paper-2);color:var(--ink-4);border-color:var(--ink-5);'
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const updateOverview = async () => {
  if (!props.project?.id) return
  try {
    const isClosingStage = localEdits.value.pipeline_stage === 'Contracts Signed' || localEdits.value.pipeline_stage === 'Churn'
    const updates = {
      pipeline_stage: localEdits.value.pipeline_stage,
      internal_notes: localEdits.value.internal_notes,
      proposal_value: localEdits.value.proposal_value || 0,
      loss_reason: localEdits.value.pipeline_stage === 'Churn' ? localEdits.value.loss_reason : null,
      closed_at: isClosingStage ? (props.project.closed_at || new Date().toISOString()) : props.project.closed_at,
      amount_paid: localEdits.value.amount_paid || 0,
      amount_owed: localEdits.value.amount_owed || 0,
      milestones: localEdits.value.milestones || null,
      due_date: localEdits.value.due_date || null,
      in_menu_hub: localEdits.value.in_menu_hub,
    }
    await supabase.from('projects').update(updates).eq('id', props.project.id)
    emit('updated')
  } catch (e) { console.error("Error updating overview:", e) }
}

const updateClientTier = async () => {
  if (!props.project?.client_id) return
  await supabase.from('clients').update({ client_tier: localEdits.value.client_tier }).eq('id', props.project.client_id)
  emit('updated')
}

const resetSowToTemplates = () => {
  localEdits.value.sow_deliverables = defaultDeliverables
  localEdits.value.sow_timeline = defaultTimeline
  localEdits.value.sow_fees_payment = defaultFees
}

const deleteProject = async () => {
  const confirmed = await showConfirm({
    title: 'Delete Project',
    message: `Delete "${props.project.title}"? This cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (!confirmed) return
  await supabase.from('activity_logs').insert({
    event_type: 'project_deleted',
    client_id: props.project.client_id,
    client_name: props.project.client?.name || '',
    project_id: props.project.id,
    project_title: props.project.title,
    notes: `Stage: ${props.project.pipeline_stage || '—'}`
  })
  await supabase.from('projects').delete().eq('id', props.project.id)
  emit('updated')
  emit('close')
}

const resetDocument = async (type) => {
  const confirmed = await showConfirm({
    title: 'Reset Document',
    message: `Are you sure you want to reset the ${type}? It will clear the status and allow you to re-edit and re-send.`,
    confirmText: 'Reset',
    cancelText: 'Cancel',
    isDangerous: true
  })
  if (!confirmed) return
  const key = type.toLowerCase()
  const updates = { [`${key}_status`]: null, [`${key}_sent_date`]: null, [`${key}_opened_at`]: null }
  await supabase.from('clients').update(updates).eq('id', props.project.client_id)
  emit('updated')
}

const saveAndPrepareEmail = async () => {
  if (!props.project?.client) return
  try {
    // Solo guardar campos SOW si se va a enviar el SOW y aún no está enviado/firmado
    if (selectedDocs.value.includes('SOW') && !['Sent', 'Signed'].includes(props.project.client.sow_status)) {
      const sowContent = {
        sow_deliverables: localEdits.value.sow_deliverables,
        sow_timeline: localEdits.value.sow_timeline,
        sow_fees_payment: localEdits.value.sow_fees_payment,
      }
      // Guarda en proyecto (fuente de verdad)
      const { error: projErr } = await supabase.from('projects').update(sowContent).eq('id', props.project.id)
      if (projErr) throw projErr
      // Copia al cliente para que el portal de firma pueda leerlo
      const { error: clientErr } = await supabase.from('clients').update(sowContent).eq('id', props.project.client_id)
      if (clientErr) throw clientErr
    }

    const baseUrl = window.location.origin
    const clientName = props.project.client.name
    const docsText = selectedDocs.value.join(' and ')
    emailData.value.subject = `Document Request: ${docsText} from SIINGE STUDIO`
    emailData.value.messageText = `Hi ${clientName},\n\nPlease review and sign the requested documents for our upcoming collaboration. Click the buttons below to access your secure portal:\n\nBest regards,\nSIINGE STUDIO Team`

    let buttonsHtml = `<div style="margin: 10px 0;">`
    if (selectedDocs.value.includes('NDA')) {
      const link = `${baseUrl}/portal/${props.project.client_id}/nda`
      buttonsHtml += `<a href="${link}" style="display:inline-block; margin-bottom:12px; margin-right:12px; padding:15px 28px; background-color:#1e293b; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-family:sans-serif; font-size: 14px;">Review & Sign NDA</a>`
    }
    if (selectedDocs.value.includes('SOW')) {
      const link = `${baseUrl}/portal/${props.project.client_id}/sow`
      buttonsHtml += `<a href="${link}" style="display:inline-block; margin-bottom:12px; padding:15px 28px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-family:sans-serif; font-size: 14px;">Review & Sign SOW</a>`
    }
    buttonsHtml += `</div>`
    emailData.value.buttonsHtml = buttonsHtml
    showEmailModal.value = true
  } catch (e) {
    await showAlert('Critical error saving SOW: ' + e.message, 'Error')
  }
}

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true
    const sentDate = new Date().toISOString()

    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: props.project.client.email,
        cc: 'sierra@siinge.studio',
        subject: emailData.value.subject,
        html: emailData.value.messageText.split('\n').map(l => l ? `<p style="font-family:sans-serif;color:#374151;margin:0 0 8px">${l}</p>` : '').join('') + emailData.value.buttonsHtml,
        client_id: props.project.client_id,
        doc_type: selectedDocs.value.join('+')
      }
    })

    if (emailError) throw new Error('Email gateway failed: ' + emailError.message)

    const updates = {}
    if (selectedDocs.value.includes('NDA')) { updates.nda_status = 'Sent'; updates.nda_sent_date = sentDate }
    if (selectedDocs.value.includes('SOW')) { updates.sow_status = 'Sent'; updates.sow_sent_date = sentDate }

    const { error: dbError } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
    if (dbError) throw dbError

    // Registrar sow_sent_date en el proyecto para el log por proyecto
    if (selectedDocs.value.includes('SOW') && props.project?.id) {
      await supabase.from('projects').update({ sow_sent_date: sentDate }).eq('id', props.project.id)
    }

    for (const doc of selectedDocs.value) {
      await supabase.from('activity_logs').insert({
        event_type: doc.toLowerCase() + '_sent',
        client_id: props.project.client_id,
        client_name: props.project.client?.name || '',
        project_id: props.project.id || null,
        project_title: props.project.title || null,
        notes: `${doc} dispatched via email to ${props.project.client.email}`
      })
    }

    await showAlert('Documents dispatched successfully! CC sent to sierra@siinge.studio', 'Success')
    showEmailModal.value = false
    selectedDocs.value = []
    emit('updated')
  } catch (err) {
    await showAlert('Failed to send: ' + err.message, 'Error')
  } finally {
    isSendingEmail.value = false
  }
}

const downloadFromVault = async (path) => {
  try {
    const { data, error } = await supabase.storage.from('contracts').createSignedUrl(path, 60)
    if (error) throw error
    window.open(data.signedUrl, '_blank')
  } catch (e) { console.error("Vault access error:", e) }
}
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f9fafb; }
::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>