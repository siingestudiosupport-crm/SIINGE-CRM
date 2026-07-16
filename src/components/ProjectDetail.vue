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
        >Contracts</button>
        <button
          v-if="!project?.id"
          @click="activeTab = 'Projects'; fetchClientProjects()"
          :style="activeTab === 'Projects'
            ? 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink); border-bottom: 2px solid var(--ink); transition: color 120ms;'
            : 'padding: 12px 0; margin-right: 24px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink-4); border-bottom: 2px solid transparent; transition: color 120ms;'"
        >Projects</button>
        <button
          @click="activeTab = 'Contracts'; fetchClientProjects()"
          :style="activeTab === 'Contracts'
            ? 'padding: 12px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink); border-bottom: 2px solid var(--ink); transition: color 120ms;'
            : 'padding: 12px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border: none; background: none; cursor: pointer; color: var(--ink-4); border-bottom: 2px solid transparent; transition: color 120ms;'"
        >Contracts Log</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 bg-white" v-if="project">
        
        <div v-if="activeTab === 'Overview'" class="space-y-6">
          
          <section v-if="activeDueDates.length > 0" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; overflow: hidden;">
            <div style="padding: 10px 14px; background: var(--paper-2); border-bottom: 1px solid var(--bone-edge); display:flex; justify-content:space-between; align-items:center;">
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Due Dates</p>
              <button v-if="activeDueDates.length > 4" @click="showAllDueDates = true"
                style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ember);background:none;border:none;cursor:pointer;padding:0;">
                See all ({{ activeDueDates.length }})
              </button>
            </div>
            <div>
              <div v-for="(d, idx) in activeDueDates.slice(0, 4)" :key="d.label + idx"
                style="display: flex; justify-content: space-between; align-items: center; padding: 9px 14px;"
                :style="idx < Math.min(activeDueDates.length, 4) - 1 ? 'border-bottom: 1px solid var(--bone-edge);' : ''"
              >
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:7px;font-weight:800;letter-spacing:0.1em;padding:1px 4px;border-radius:1px;" :style="d.source==='HUB' ? 'background:rgba(139,92,246,0.12);color:#7c3aed;' : 'background:rgba(0,0,0,0.07);color:var(--ink-4);'">{{ d.source }}</span>
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3);">{{ d.label }}</span>
                </div>
                <span style="font-size: 11px; font-weight: 700; font-family: var(--font-mono);" :style="d.statusStyle">{{ d.formattedDate }}</span>
              </div>
            </div>
          </section>

          <!-- All Due Dates modal -->
          <div v-if="showAllDueDates" style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(14,14,12,0.45);" @click.self="showAllDueDates = false">
            <div style="background:var(--bone);border:1px solid var(--bone-edge);border-radius:4px;box-shadow:var(--shadow-3);width:90%;max-width:480px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
              <div style="padding:16px 20px;border-bottom:1px solid var(--bone-edge);display:flex;justify-content:space-between;align-items:center;background:var(--paper-2);flex-shrink:0;">
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:var(--ink-3);margin:0;">All Due Dates</p>
                <button @click="showAllDueDates = false" style="background:none;border:none;font-size:18px;color:var(--ink-4);cursor:pointer;line-height:1;">&times;</button>
              </div>
              <div style="overflow-y:auto;flex:1;">
                <div v-for="(d, idx) in activeDueDates" :key="d.label + idx"
                  style="display:flex;justify-content:space-between;align-items:center;padding:9px 20px;"
                  :style="idx < activeDueDates.length - 1 ? 'border-bottom:1px solid var(--bone-edge);' : ''"
                >
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:7px;font-weight:800;letter-spacing:0.1em;padding:1px 4px;border-radius:1px;" :style="d.source==='HUB' ? 'background:rgba(139,92,246,0.12);color:#7c3aed;' : 'background:rgba(0,0,0,0.07);color:var(--ink-4);'">{{ d.source }}</span>
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-3);">{{ d.label }}</span>
                  </div>
                  <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);" :style="d.statusStyle">{{ d.formattedDate }}</span>
                </div>
              </div>
            </div>
          </div>

          <section class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Pipeline Stage</label>
              <select v-model="localEdits.pipeline_stage" @change="onStageChange" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800 transition-all shadow-sm">
                <option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option>
              </select>
              <div v-if="hubStatus" style="margin-top: 7px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4);">Hub:</span>
                <span :style="`font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; padding: 2px 7px; border-radius: 2px; border: 1px solid; background: ${HUB_STAGE_COLORS[hubStatus] || 'var(--ink-4)'}18; color: ${HUB_STAGE_COLORS[hubStatus] || 'var(--ink-4)'}; border-color: ${HUB_STAGE_COLORS[hubStatus] || 'var(--ink-4)'}44;`">{{ hubStatus }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">{{ project?.id ? 'Proposal Value' : 'Client LTV' }}</label>
              <div v-if="project?.id" class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm transition-all">
                <span class="text-gray-500 mr-1 font-bold">$</span>
                <input v-model="localEdits.proposal_value" @input="recalculateOwed" type="number" class="w-full bg-transparent border-none p-2.5 outline-none text-sm font-bold text-gray-800" placeholder="0.00" />
              </div>
              <button
                v-if="project?.id && proposalHistory.length > 0"
                @click="showProposalHistory = true"
                type="button"
                style="margin-top: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ember); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline;"
              >View History ({{ proposalHistory.length }})</button>
              <div v-else class="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                <span class="text-gray-500 mr-1 font-bold">$</span>
                <span class="text-sm font-bold text-gray-800">{{ clientLTV.toLocaleString() }}</span>
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

          <section v-if="localEdits.pipeline_stage === 'Project Complete'" class="animate-fade-in" style="background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 4px; padding: 14px 16px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" v-model="localEdits.review_requested" style="width: 15px; height: 15px; accent-color: var(--positive); flex-shrink: 0;" />
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--positive);">Review Requested</span>
            </label>
          </section>

          <section v-if="localEdits.pipeline_stage === 'Request Review'" class="animate-fade-in" style="background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 4px; padding: 14px 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--positive)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5m-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11m3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--positive);">Review request added to follow-ups</span>
            </div>
            <p style="font-size: 11px; color: var(--positive); margin: 8px 0 0; font-style: italic; line-height: 1.4;">The client will receive a follow-up request to review the project.</p>
          </section>

          <!-- Saved loss reason — locked/read-only until the stage is changed away from Churn -->
          <section v-if="localEdits.pipeline_stage === 'Churn' && lossReasonSaved" class="p-5 animate-fade-in space-y-3" style="background: var(--critical-soft); border: 1px solid var(--critical); border-radius: 4px;">
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--critical);">Reason for Loss</label>
            </div>
            <div style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--critical); border-radius: 4px; background: white; font-size: 13px; font-weight: 700; color: var(--critical);">
              {{ localEdits.loss_reason }}
            </div>
            <div v-if="localEdits.loss_reason_notes" style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--critical); border-radius: 4px; background: white; font-family: var(--font-sans); font-size: 12px; color: var(--ink); line-height: 1.5; white-space: pre-wrap;">
              {{ localEdits.loss_reason_notes }}
            </div>
          </section>

          <section v-if="localEdits.pipeline_stage === 'Churn' && !lossReasonSaved" class="p-5 animate-fade-in space-y-3" style="background: var(--critical-soft); border: 1px solid var(--critical); border-radius: 4px;">
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--critical);">Reason for Loss (Required)</label>
            </div>
            <select v-model="localEdits.loss_reason" class="w-full border border-red-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none text-red-900 font-bold shadow-sm transition-all">
              <option value="" disabled>Select a reason...</option>
              <option value="Too expensive">Too expensive</option>
              <option value="Timeline mismatch">Timeline mismatch</option>
              <option value="Not ready / Just exploring">Not ready / Just exploring</option>
              <option value="Ghosted after call">Ghosted after call</option>
              <option value="Project cancelled">Project cancelled</option>
              <option value="Other">Other</option>
            </select>
            <textarea v-if="localEdits.loss_reason" v-model="localEdits.loss_reason_notes" rows="3" placeholder="Add notes about why this deal was lost..." style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--critical); border-radius: 4px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: white; outline: none; resize: vertical; line-height: 1.5;" @focus="e=>e.target.style.borderColor='var(--critical)'" @blur="e=>e.target.style.borderColor='var(--critical)'"></textarea>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Meeting Date</p>
              <input v-model="localEdits.scheduled_date" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium transition-all shadow-sm" />
              <p v-if="project.client?.no_show_date" class="mt-1 text-[10px] font-mono" style="color: var(--critical); opacity: 0.75;">
                No-show: {{ new Date(project.client.no_show_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
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

          <section v-if="project?.id">
            <div class="flex justify-between items-center" style="margin-bottom: 8px;">
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Snooze Follow-up Notifications</label>
              <button
                v-if="localEdits.snooze_until"
                @click="localEdits.snooze_until = ''; updateSnooze()"
                style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ember); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;"
              >Clear</button>
            </div>
            <div class="flex items-center gap-3">
              <input
                v-model="localEdits.snooze_until"
                type="date"
                @change="updateSnooze"
                style="flex: 1; padding: 9px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;"
                @focus="e => e.target.style.borderColor = 'var(--ink)'"
                @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
              />
              <span v-if="localEdits.snooze_until && new Date(localEdits.snooze_until) > new Date()" style="font-size: 11px; font-weight: 700; color: var(--caution); white-space: nowrap;">Snoozed</span>
            </div>
            <p style="font-size: 10px; color: var(--ink-5); margin: 4px 0 0; font-style: italic;">Set a date to pause notifications for this project until then.</p>
          </section>

          <section>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Internal Notes (Team Only)</label>
            <textarea
              v-model="localEdits.internal_notes"
              placeholder="Private notes about negotiations, specific founder traits, or red flags..."
              class="w-full border border-gray-300 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-gray-700 shadow-inner"
            ></textarea>
          </section>

          <section v-if="project?.id" style="border: 1px solid var(--bone-edge); border-radius: 4px; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 12px 16px; background: var(--paper-2); border-bottom: 1px solid var(--bone-edge); display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); margin: 0;">Project Deliverables</h3>
            </div>

            <div style="padding: 16px; background: var(--paper); display: flex; flex-direction: column; gap: 16px;">

              <!-- $ Paid / $ Owed -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-3); margin-bottom: 5px;">$ Paid (Total)</label>
                  <div style="display: flex; align-items: center; border: 1px solid var(--ink-5); border-radius: 2px; padding: 0 10px;" @focusin="e=>e.currentTarget.style.borderColor='var(--ink)'" @focusout="e=>e.currentTarget.style.borderColor='var(--ink-5)'">
                    <span style="color: var(--ink-4); font-size: 13px; margin-right: 4px; font-weight: 700;">$</span>
                    <input v-model="localEdits.amount_paid" type="number" min="0" step="0.01" placeholder="0" style="flex: 1; border: none; background: transparent; padding: 8px 0; font-family: var(--font-sans); font-size: 13px; color: var(--ink); outline: none; font-weight: 700;" readonly />
                  </div>
                  <p style="font-size: 10px; color: var(--ink-5); margin: 4px 0 0; font-style: italic;">Auto-calculated from payment records</p>
                </div>
                <div>
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-3); margin-bottom: 5px;">$ Owed</label>
                  <div style="display: flex; align-items: center; border: 1px solid var(--ink-5); border-radius: 2px; padding: 0 10px;">
                    <span style="color: var(--ink-4); font-size: 13px; margin-right: 4px; font-weight: 700;">$</span>
                    <input v-model="localEdits.amount_owed" type="number" min="0" step="0.01" placeholder="0" style="flex: 1; border: none; background: transparent; padding: 8px 0; font-family: var(--font-sans); font-size: 13px; color: var(--ink); outline: none; font-weight: 700;" readonly />
                  </div>
                  <p style="font-size: 10px; color: var(--ink-5); margin: 4px 0 0; font-style: italic;">Auto-calculated: Proposal Value − Paid</p>
                </div>
              </div>

              <!-- Payment Records History -->
              <div style="border-top: 1px solid var(--bone-edge); padding-top: 14px; margin-top: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3);">Payment Records</label>
                  <button
                    @click="addPaymentRecord"
                    style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 5px 10px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
                  >+ Add Payment</button>
                </div>
                <div v-if="localEdits.payment_records && localEdits.payment_records.length > 0" style="display: flex; flex-direction: column; gap: 10px;">
                  <div v-for="(record, idx) in localEdits.payment_records" :key="idx" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 2px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr 40px; gap: 10px; align-items: end;">
                    <div>
                      <label style="display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 4px;">Amount</label>
                      <div style="display: flex; align-items: center; border: 1px solid var(--ink-5); border-radius: 2px; padding: 0 8px;">
                        <span style="color: var(--ink-4); font-size: 12px; font-weight: 700;">$</span>
                        <input v-model.number="record.amount" type="number" min="0" step="0.01" placeholder="0" style="flex: 1; border: none; background: transparent; padding: 6px 0; font-family: var(--font-sans); font-size: 12px; color: var(--ink); outline: none; font-weight: 700;" @change="recalculateTotalPaid" />
                      </div>
                    </div>
                    <div>
                      <label style="display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 4px;">Payment Date</label>
                      <input v-model="record.date" type="date" style="width: 100%; padding: 6px 8px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 12px; color: var(--ink); background: var(--paper); outline: none;" @focus="e => e.target.style.borderColor='var(--ink)'" @blur="e => e.target.style.borderColor='var(--ink-5)'" />
                    </div>
                    <button
                      @click="localEdits.payment_records.splice(idx, 1); recalculateTotalPaid()"
                      style="padding: 6px 8px; background: transparent; border: 1px solid var(--ember); color: var(--ember); border-radius: 2px; cursor: pointer; font-weight: 700; font-size: 12px; transition: all 120ms;"
                    >×</button>
                  </div>
                </div>
                <div v-else style="text-align: center; padding: 16px; color: var(--ink-4); font-size: 12px;">
                  No payment records yet
                </div>
              </div>

              <!-- Deliverables list -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div
                  v-for="item in deliverableItems" :key="item.model"
                  style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 2px; padding: 12px;"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <input type="checkbox" v-model="localEdits[item.model]" style="width: 14px; height: 14px; accent-color: var(--ink);" />
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-2);">{{ item.label }}</span>
                    </label>
                    <div v-if="item.dueField && localEdits[item.model]" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 150px;">
                      <span style="font-size: 9px; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em;">Due Date</span>
                      <input type="date" v-model="localEdits[item.dueField]" style="width: 150px; padding: 7px 9px; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); color: var(--ink); font-size: 12px;" />
                    </div>
                  </div>

                  <div v-if="item.productDev && localEdits.deliverable_product_dev" style="margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
                    <div v-for="sub in productDevelopmentDueFields" :key="sub.model" style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-size: 9px; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em;">{{ sub.label }}</span>
                      <input type="date" v-model="localEdits[sub.model]" style="width: 100%; padding: 7px 9px; border: 1px solid var(--ink-5); border-radius: 2px; background: var(--paper); color: var(--ink); font-size: 12px;" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-3); margin-bottom: 6px;">Notes</label>
                <textarea v-model="localEdits.milestones" rows="3" placeholder="Project notes..." style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink-2); background: var(--paper); outline: none; resize: vertical; line-height: 1.6;" @focus="e=>e.target.style.borderColor='var(--ink)'" @blur.capture="e=>e.target.style.borderColor='var(--ink-5)'"></textarea>
              </div>


            </div>
          </section>
        </div>

        <!-- SOW TAB -->
        <div v-if="activeTab === 'SOW'" class="space-y-6 pb-20">
          <template v-if="project?.client">
            <div v-if="!project.sow_sent_date" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 20px;">
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
              <div style="display:flex; justify-content:flex-end; margin-top: 18px;">
                <button
                  @click="saveSowSection"
                  :disabled="isSaving"
                  style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 10px 22px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; display: inline-flex; align-items: center; gap: 8px;"
                  :style="isSaving ? 'opacity: 0.5; cursor: not-allowed;' : ''"
                  @mouseenter="e => !isSaving && (e.currentTarget.style.opacity = '0.75')"
                  @mouseleave="e => e.currentTarget.style.opacity = '1'"
                >
                  <svg v-if="isSaving" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

            <div v-else style="padding: 16px; background: var(--positive-soft); border: 1px solid #B8C4A0; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <span style="font-size: 13px; color: var(--positive); font-weight: 600;">SOW already sent — content is locked.</span>
              <button @click="resetDocument('SOW')" style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper); border: 1px solid var(--ink-5); border-radius: 2px; padding: 5px 10px; cursor: pointer; white-space: nowrap; flex-shrink: 0;">Reset SOW</button>
            </div>

            <div v-if="!project.sow_sent_date" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 16px;">
              <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 10px;">Sent Outside CRM?</p>
              <p style="font-size: 11px; color: var(--ink-4); margin: 0 0 12px; font-style: italic;">If the SOW was sent via email or another tool, enter the sent date to trigger follow-ups automatically.</p>
              <div class="flex items-center gap-3">
                <input
                  v-model="localEdits.manual_sow_date"
                  type="date"
                  :max="new Date().toISOString().substring(0, 10)"
                  style="flex: 1; padding: 8px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;"
                  @focus="e => e.target.style.borderColor = 'var(--ink)'"
                  @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
                />
                <button
                  @click="markSowSentManually"
                  :disabled="!localEdits.manual_sow_date"
                  style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; white-space: nowrap;"
                  :style="!localEdits.manual_sow_date ? 'opacity: 0.4; cursor: not-allowed;' : ''"
                >Mark as Sent</button>
              </div>
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
              <button @click="downloadDocs" :disabled="selectedDocs.length === 0 || isDownloading"
                class="w-full mt-3 bg-white text-blue-700 border-2 border-blue-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-blue-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isDownloading ? 'Generating…' : 'Save & Download PDFs' }}
              </button>
              <p class="text-[11px] text-blue-500 font-bold mt-2 px-1">Downloads the documents signed and dated, to send them yourself. Doesn't mark them as sent.</p>
            </div>

            <div v-if="availableDocs.length === 0" class="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-center text-sm text-gray-500 font-medium">
              All documents have been dispatched. View status in the Contracts Log tab.
            </div>

            <!-- Documents signed outside the portal (downloaded, signed by hand and returned) -->
            <div v-if="project?.client?.nda_status !== 'Signed' || (project?.id && project?.sow_status !== 'Signed')"
              style="padding: 16px; border: 1px solid var(--bone-edge); border-radius: 4px; background: var(--bone);">
              <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-2); margin: 0 0 6px;">Signed Outside the Portal</h3>
              <p style="font-size: 11px; color: var(--ink-4); margin: 0 0 12px; font-style: italic;">If the client returned a signed copy by email or in person, enter the date they signed it.</p>

              <div v-for="doc in ['NDA', 'SOW']" :key="doc">
                <div v-if="doc === 'NDA' ? project?.client?.nda_status !== 'Signed' : (project?.id && project?.sow_status !== 'Signed')"
                  class="flex items-center gap-3" style="margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--ink-3); width: 34px;">{{ doc }}</span>
                  <input
                    v-model="localEdits[doc === 'NDA' ? 'manual_nda_signed_date' : 'manual_sow_signed_date']"
                    type="date"
                    :max="new Date().toISOString().substring(0, 10)"
                    style="flex: 1; padding: 8px 12px; border: 1px solid var(--ink-5); border-radius: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--ink); background: var(--paper); outline: none;"
                    @focus="e => e.target.style.borderColor = 'var(--ink)'"
                    @blur="e => e.target.style.borderColor = 'var(--ink-5)'"
                  />
                  <button
                    @click="markDocSignedManually(doc)"
                    :disabled="!localEdits[doc === 'NDA' ? 'manual_nda_signed_date' : 'manual_sow_signed_date']"
                    style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; white-space: nowrap;"
                    :style="!localEdits[doc === 'NDA' ? 'manual_nda_signed_date' : 'manual_sow_signed_date'] ? 'opacity: 0.4; cursor: not-allowed;' : ''"
                  >Mark as Signed</button>
                </div>
              </div>
            </div>

            <!-- Reset contracts -->
            <div v-if="project?.client?.nda_sent_date || project?.sow_sent_date || project?.client?.sow_sent_date"
              style="display: flex; gap: 10px; padding-top: 4px;">
              <button v-if="project?.client?.nda_sent_date" @click="resetDocument('NDA')"
                style="flex: 1; font-family: var(--font-sans); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper); border: 1px solid var(--ink-5); border-radius: 2px; padding: 7px 10px; cursor: pointer; transition: all 120ms;"
                @mouseenter="e=>(e.currentTarget.style.color='var(--ink)',e.currentTarget.style.borderColor='var(--ink)')"
                @mouseleave="e=>(e.currentTarget.style.color='var(--ink-4)',e.currentTarget.style.borderColor='var(--ink-5)')">
                Reset NDA
              </button>
              <button v-if="project?.sow_sent_date || project?.client?.sow_sent_date" @click="resetDocument('SOW')"
                style="flex: 1; font-family: var(--font-sans); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: var(--paper); border: 1px solid var(--ink-5); border-radius: 2px; padding: 7px 10px; cursor: pointer; transition: all 120ms;"
                @mouseenter="e=>(e.currentTarget.style.color='var(--ink)',e.currentTarget.style.borderColor='var(--ink)')"
                @mouseleave="e=>(e.currentTarget.style.color='var(--ink-4)',e.currentTarget.style.borderColor='var(--ink-5)')">
                Reset SOW
              </button>
            </div>
          </template>
        </div>

        <!-- PROJECTS TAB -->
        <div v-if="activeTab === 'Projects'" class="pb-20" style="display: flex; flex-direction: column; gap: 10px;">
          <button
            @click="emit('add-project', project?.client)"
            style="width: 100%; font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 11px 16px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; display: flex; align-items: center; justify-content: center; gap: 6px;"
            @mouseenter="e => e.currentTarget.style.opacity = '0.85'"
            @mouseleave="e => e.currentTarget.style.opacity = '1'"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Project
          </button>
          <div v-if="allClientProjects.length === 0" style="padding: 32px; text-align: center; color: var(--ink-4); font-size: 12px; font-style: italic;">
            No projects yet.
          </div>
          <button
            v-for="proj in allClientProjects"
            :key="proj.id"
            @click="emit('open-project', proj)"
            class="w-full"
            :style="`padding: 14px 16px; background: var(--bone); border: 1px solid ${proj.pipeline_stage === 'Project Complete' ? 'var(--bone-edge)' : 'var(--bone-edge)'}; border-radius: 4px; cursor: pointer; transition: border-color 120ms; text-align: left; opacity: ${proj.pipeline_stage === 'Project Complete' ? '0.65' : '1'};`"
            @mouseenter="e => e.currentTarget.style.borderColor = 'var(--ink)'"
            @mouseleave="e => e.currentTarget.style.borderColor = 'var(--bone-edge)'"
          >
            <!-- Row 1: title + stage -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
              <span style="font-family: var(--font-display); font-style: italic; font-size: 18px; color: var(--ink); letter-spacing: -0.01em; line-height: 1.2;">{{ proj.title }}</span>
              <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4); white-space: nowrap; flex-shrink: 0; margin-top: 4px;">{{ proj.pipeline_stage }}</span>
            </div>
            <!-- Row 2: NDA/SOW chips + amount -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <span v-if="project?.client?.nda_status" :style="getStatusClass(project.client.nda_status) + ' padding: 2px 6px; font-size: 8px;'">NDA: {{ project.client.nda_status }}</span>
                <span v-if="project?.sow_status" :style="getStatusClass(project.sow_status) + ' padding: 2px 6px; font-size: 8px;'">SOW: {{ project.sow_status }}</span>
              </div>
              <span v-if="proj.amount_paid || proj.amount_owed" style="font-size: 11px; font-weight: 700; color: var(--ink-3); font-family: var(--font-mono); white-space: nowrap;">
                ${{ (proj.amount_paid || 0).toLocaleString() }} / ${{ ((proj.amount_paid || 0) + (proj.amount_owed || 0)).toLocaleString() }}
              </span>
            </div>
            <!-- Row 3: next milestone -->
            <div v-if="getNextMilestone(proj)" style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--caution);">{{ getNextMilestone(proj).label }}</span>
              <span style="font-size: 10px; color: var(--ink-4);">Due {{ getNextMilestone(proj).formatted }}</span>
            </div>
          </button>
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

              <div v-if="!project || !clientProjects.find(p => p.id === project.id)"
                style="padding: 20px; text-align: center; color: var(--ink-4); font-size: 12px; font-style: italic; border: 1px dashed var(--ink-5); border-radius: 4px;">
                No SOWs drafted yet. Open a project from Pipeline to draft and dispatch a SOW.
              </div>

              <div v-else class="space-y-3">
                <div v-for="proj in clientProjects.filter(p => p.id === project.id)" :key="proj.id"
                  style="background: var(--paper); border: 1px solid var(--bone-edge); border-radius: 4px; padding: 14px 16px;">

                  <div class="flex justify-between items-start" style="margin-bottom: 8px;">
                    <div>
                      <h4 style="font-family: var(--font-display); font-style: italic; font-size: 17px; color: var(--ink); margin: 0 0 2px; letter-spacing: -0.01em;">{{ proj.title }}</h4>
                      <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-4); margin: 0;">{{ proj.pipeline_stage }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                      <span v-if="proj.sow_sent_date || ['Sent','Signed'].includes(proj.sow_status)" :class="getStatusClass(proj.sow_signed_date ? 'Signed' : 'Sent')">
                        {{ proj.sow_signed_date ? 'Signed' : 'Sent' }}
                      </span>
                      <span v-else style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-5);">Draft</span>
                      <button v-if="proj.sow_sent_date" @click="resetDocument('SOW')"
                        style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-4); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;">
                        Reset
                      </button>
                    </div>
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

      <div v-if="project" class="flex-shrink-0 flex justify-between items-center" style="padding: 12px 24px; border-top: 1px solid var(--bone-edge); background: var(--paper-2);">
        <button v-if="project?.id" @click="deleteProject"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 8px 16px; background: transparent; color: var(--critical); border: 1px solid var(--critical); border-radius: 2px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: opacity 120ms;"
          @mouseenter="e=>e.currentTarget.style.opacity='0.7'" @mouseleave="e=>e.currentTarget.style.opacity='1'">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete Project
        </button>
        <span v-else></span>
        <div class="flex items-center gap-3">
          <span v-if="savedFlash" style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--positive);">Saved ✓</span>
          <button
            v-if="activeTab === 'Overview'"
            @click="project?.id ? updateOverview() : updateClientCard()"
            :disabled="isSaving"
            style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms; display: inline-flex; align-items: center; gap: 6px;"
            :style="isSaving ? 'opacity: 0.5; cursor: not-allowed;' : ''"
            @mouseenter="e => !isSaving && (e.currentTarget.style.opacity = '0.75')"
            @mouseleave="e => (e.currentTarget.style.opacity = '1')"
          >
            <svg v-if="isSaving" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
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
              <input v-model="emailData.to" type="email" class="col-span-5 text-sm font-bold text-gray-800 bg-transparent outline-none focus:text-blue-600 transition-colors" />
            </div>
            <div class="grid grid-cols-6 items-center border-b border-gray-100 pb-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest col-span-1">CC</span>
              <input v-model="emailData.cc" type="text" class="col-span-5 text-sm font-bold text-gray-800 bg-transparent outline-none focus:text-blue-600 transition-colors" />
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

    <div v-if="showSowPreviewModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4" style="background: rgba(14,14,12,0.5);">
      <div class="w-full max-w-2xl overflow-hidden flex flex-col animate-slide-up" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3);">

        <div class="px-8 py-5 flex justify-between items-center" style="background: var(--ink); border-bottom: 1px solid rgba(250,247,242,0.1);">
          <div class="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            <h3 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--paper); margin: 0;">SOW Preview</h3>
          </div>
          <button @click="closeSowPreview()" style="color: rgba(250,247,242,0.5); background: none; border: none; font-size: 22px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>

        <div class="p-8 flex-1 space-y-6 overflow-y-auto" style="min-height: 520px;">
          <div v-if="isGeneratingSowPreview" class="h-full flex items-center justify-center text-sm text-gray-500">Generating PDF preview…</div>
          <div v-else-if="pdfPreviewError" class="h-full flex items-center justify-center text-sm text-red-600">{{ pdfPreviewError }}</div>
          <div v-else class="h-full">
            <iframe v-if="pdfPreviewUrl" :src="pdfPreviewUrl + '#toolbar=0&navpanes=0&scrollbar=0'" class="w-full h-full" frameborder="0" style="min-height: 500px; border: 1px solid rgba(15,23,42,0.08); border-radius: 8px;"></iframe>
            <div v-else class="h-full flex items-center justify-center text-sm text-gray-500">No preview available.</div>
          </div>
        </div>

        <div class="flex justify-end gap-3" style="padding: 20px 32px; border-top: 1px solid var(--bone-edge); background: var(--paper-2);">
          <button @click="closeSowPreview()" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;">
            Back to Edit
          </button>
          <button @click="downloadDocs" :disabled="isDownloading" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 20px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer;" :style="isDownloading ? 'opacity: 0.5; cursor: not-allowed;' : ''">
            {{ isDownloading ? 'Generating…' : 'Download PDFs' }}
          </button>
          <button @click="continueFromSowPreview" :disabled="isSaving" style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 24px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;" :style="isSaving ? 'opacity: 0.5; cursor:not-allowed;' : ''">
            {{ isSaving ? 'Saving...' : 'Continue to Dispatch' }}
          </button>
        </div>

      </div>
    </div>

    <!-- Proposal Value History modal -->
    <div v-if="showProposalHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(14,14,12,0.5);" @click="showProposalHistory = false">
      <div @click.stop style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3); width: 100%; max-width: 420px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;">
        <div class="flex justify-between items-center" style="padding: 16px 20px; background: var(--paper-2); border-bottom: 1px solid var(--bone-edge);">
          <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-2); margin: 0;">Proposal Value History</h3>
          <button @click="showProposalHistory = false" style="color: var(--ink-4); background: none; border: none; font-size: 20px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>
        <div style="padding: 12px 20px; overflow-y: auto;">
          <div
            v-for="(entry, idx) in [...proposalHistory].reverse()"
            :key="idx"
            style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--bone-edge);"
          >
            <span style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--ink);">${{ Number(entry.value).toLocaleString() }}</span>
            <span style="font-size: 11px; color: var(--ink-4);">{{ new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
          </div>
          <p v-if="proposalHistory.length === 0" style="text-align: center; color: var(--ink-4); font-size: 12px; padding: 20px 0; font-style: italic;">No changes recorded yet.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { hubSupabase } from '../lib/hubClient'
import { useConfirmModal } from '../composables/useConfirmModal'
import { PDFDocument, StandardFonts, rgb, PDFRef } from 'pdf-lib'
import html2pdf from 'html2pdf.js'
import { generateSOWHTML } from '../utils/sowTemplate'
import { getSOWPdfBlob } from '../utils/sowPdfmake'
import { createPortalToken, generatePortalLink } from '../utils/portalTokens'

const props = defineProps({
  isOpen: Boolean,
  project: Object,
  // Bumped by the parent after a project is created, so the client card's
  // Projects tab reloads its list without reopening the card.
  refreshToken: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'updated', 'open-project', 'add-project'])
const { confirm: showConfirm, alert: showAlert } = useConfirmModal()

const defaultDeliverables = `Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n• [Include anything that defines scope clearly]\nAny work not expressly listed above is considered out of scope.`;
const defaultTimeline = `• Project Start Date: [INSERT]\n• Key Milestones (optional): [INSERT]\n• Final Delivery Date: [INSERT]\nTimeline is dependent on timely client feedback, approvals, and provision of required materials.`;
const defaultFees = `Total Project Fee: $[INSERT]\nPayment Terms:\n• [INSERT STRUCTURE]\nPayment is a condition precedent to commencement of Services. No work shall begin until\npayment has been received.\nAll payments are non-refundable once Services have commenced.\nAny Services outside the defined Deliverables shall be billed at $[INSERT RATE] or pursuant to\na separate written agreement.\nFailure to make timely payment may result in suspension of Services without liability.`;

const activeTab = ref('Overview')
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const savedFlash = ref(false)
const isSaving = ref(false)
let savedFlashTimer = null
const flashSaved = () => {
  savedFlash.value = true
  clearTimeout(savedFlashTimer)
  savedFlashTimer = setTimeout(() => { savedFlash.value = false }, 1800)
}
const selectedDocs = ref(/** @type {string[]} */ ([]))
const emailData = ref({ to: '', cc: '', subject: '', messageText: '', buttonsHtml: '' })
const showSowPreviewModal = ref(false)
const isDownloading = ref(false)
const pdfPreviewUrl = ref('')
const isGeneratingSowPreview = ref(false)
const pdfPreviewError = ref('')

const hubStatus = ref(null)

const HUB_STAGE_COLORS = {
  'Concept & Design':          '#f97316',
  'Quote':                     '#0ea5e9',
  'Material & Trim Sourcing':  '#8b5cf6',
  'Sample Development':        '#d946ef',
  'Final Tech Pack & Bulk Prep': '#14b8a6',
  'Quality Inspection':        '#eab308',
  'Shipping & Logistics':      '#3b82f6',
  'Project Completion':        '#22c55e',
}

const fetchHubStatus = async () => {
  const id = props.project?.hub_project_id
  if (!id) { hubStatus.value = null; return }
  const { data } = await hubSupabase.from('projects').select('status').eq('id', id).single()
  hubStatus.value = data?.status || null
}

const hubStageDates = ref([])
const showAllDueDates = ref(false)
const fetchHubStageDates = async () => {
  const crmId = props.project?.id
  if (!crmId) { hubStageDates.value = []; return }

  const fetchStages = async (projectId) => {
    const { data } = await hubSupabase
      .from('project_stages')
      .select('stage_name, due_date')
      .eq('project_id', projectId)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
    return data || []
  }

  // Try 1: Hub project ID = CRM project ID (projects synced via addToHub)
  let stages = await fetchStages(crmId)
  if (stages.length > 0) { hubStageDates.value = stages; return }

  // Try 2: Hub project has crm_project_id = CRM project ID
  const { data: hubProj } = await hubSupabase
    .from('projects').select('id').eq('crm_project_id', crmId).maybeSingle()
  if (hubProj) { hubStageDates.value = await fetchStages(hubProj.id); return }

  // Try 3: Match by project name
  const projectName = props.project?.title
  if (projectName) {
    const { data: hubByName } = await hubSupabase
      .from('projects').select('id').ilike('project_name', projectName).maybeSingle()
    if (hubByName) { hubStageDates.value = await fetchStages(hubByName.id); return }
  }

  hubStageDates.value = []
}


const deliverableItems = [
  { label: 'Trend / Market Analysis',       model: 'deliverable_trend_analysis', dueField: 'deliverable_trend_analysis_due' },
  { label: 'Apparel Design',                model: 'deliverable_design', dueField: 'deliverable_design_due' },
  { label: 'Branding / Packaging Design',   model: 'deliverable_branding', dueField: 'deliverable_branding_due' },
  { label: 'Tech Pack',                     model: 'deliverable_tech_pack', dueField: 'deliverable_tech_pack_due' },
  { label: 'Product Development Mgmt',      model: 'deliverable_product_dev', productDev: true },
  { label: 'Product Analysis X Refinement', model: 'deliverable_product_analysis', dueField: 'deliverable_product_analysis_due' },
  { label: 'In House Patternmaking',        model: 'deliverable_in_house_patternmaking', dueField: 'deliverable_in_house_patternmaking_due' },
  { label: 'In House Proto',               model: 'deliverable_in_house_proto', dueField: 'deliverable_in_house_proto_due' },
  { label: 'In House Manufacturing',        model: 'deliverable_in_house_manufacturing', dueField: 'deliverable_in_house_manufacturing_due' },
  { label: 'Fitting Date',                  model: 'deliverable_fitting', dueField: 'deliverable_fitting_due' },
]

const productDevelopmentDueFields = [
  { label: 'Manu Quotes Due', model: 'deliverable_manu_quotes_due' },
  { label: 'Initial Sample Due', model: 'deliverable_initial_sample_due' },
  { label: 'Approved Sample Due', model: 'deliverable_approved_sample_due' },
  { label: 'Size Range Approval Due', model: 'deliverable_size_range_due' },
  { label: 'Bulk Due', model: 'deliverable_bulk_due' },
]

const buildLocalEdits = (p) => {
  const c = p?.client || {}
  return {
    pipeline_stage: p?.pipeline_stage || '',
    proposal_value: p?.proposal_value || null,
    internal_notes: p?.internal_notes || '',
    loss_reason: p?.loss_reason || '',
    client_tier: c?.client_tier || '',
    sow_deliverables: p?.sow_deliverables || defaultDeliverables,
    sow_timeline: p?.sow_timeline || defaultTimeline,
    sow_fees_payment: p?.sow_fees_payment || defaultFees,
    amount_paid: p?.amount_paid || null,
    amount_owed: Math.max((Number(p?.proposal_value) || 0) - (Number(p?.amount_paid) || 0), 0),
    payment_records: p?.payment_records ? JSON.parse(typeof p.payment_records === 'string' ? p.payment_records : JSON.stringify(p.payment_records)) : [],
    milestones: p?.milestones || '',
    due_date: p?.due_date || '',
    scheduled_date: p?.scheduled_date ? p.scheduled_date.substring(0, 16) : '',
    in_menu_hub: p?.in_menu_hub || false,
    review_requested: p?.review_requested || false,
    loss_reason_notes: p?.loss_reason_notes || '',
    snooze_until: p?.snooze_until ? p.snooze_until.substring(0, 10) : '',
    manual_sow_date: '',
    manual_nda_signed_date: '',
    manual_sow_signed_date: '',
    deliverable_trend_analysis: p?.deliverable_trend_analysis || false,
    deliverable_trend_analysis_due: p?.deliverable_trend_analysis_due || '',
    deliverable_design: p?.deliverable_design || false,
    deliverable_design_due: p?.deliverable_design_due || '',
    deliverable_tech_pack: p?.deliverable_tech_pack || false,
    deliverable_tech_pack_due: p?.deliverable_tech_pack_due || '',
    deliverable_product_analysis: p?.deliverable_product_analysis || false,
    deliverable_product_analysis_due: p?.deliverable_product_analysis_due || '',
    deliverable_product_dev: p?.deliverable_product_dev || false,
    deliverable_manu_quotes_due: p?.deliverable_manu_quotes_due || '',
    deliverable_initial_sample_due: p?.deliverable_initial_sample_due || '',
    deliverable_fitting: p?.deliverable_fitting || false,
    deliverable_fitting_due: p?.deliverable_fitting_due || '',
    deliverable_approved_sample_due: p?.deliverable_approved_sample_due || '',
    deliverable_size_range_due: p?.deliverable_size_range_due || '',
    deliverable_bulk_due: p?.deliverable_bulk_due || '',
    deliverable_branding: p?.deliverable_branding || false,
    deliverable_branding_due: p?.deliverable_branding_due || '',
    deliverable_in_house_patternmaking: p?.deliverable_in_house_patternmaking || false,
    deliverable_in_house_patternmaking_due: p?.deliverable_in_house_patternmaking_due || '',
    deliverable_in_house_proto: p?.deliverable_in_house_proto || false,
    deliverable_in_house_proto_due: p?.deliverable_in_house_proto_due || '',
    deliverable_in_house_manufacturing: p?.deliverable_in_house_manufacturing || false,
    deliverable_in_house_manufacturing_due: p?.deliverable_in_house_manufacturing_due || '',
  }
}

// Copia local de los campos editables — nunca mutamos la prop directamente
const localEdits = ref(buildLocalEdits(props.project))

// A Churn project's loss reason locks (read-only) once saved. Selecting any
// other stage clears it, so returning to Churn starts fresh and editable.
const lossReasonSaved = ref(!!props.project?.loss_reason)
const onStageChange = () => {
  lossReasonSaved.value = false
  if (localEdits.value.pipeline_stage !== 'Churn') {
    localEdits.value.loss_reason = ''
    localEdits.value.loss_reason_notes = ''
  }
}

// Proposal value change history — parsed from the project's JSONB column.
const parseProposalHistory = (p) => {
  if (!p?.proposal_value_history) return []
  try {
    const raw = typeof p.proposal_value_history === 'string'
      ? JSON.parse(p.proposal_value_history)
      : p.proposal_value_history
    return Array.isArray(raw) ? raw : []
  } catch { return [] }
}
const proposalHistory = ref(parseProposalHistory(props.project))
const showProposalHistory = ref(false)

const PIPELINE_STAGES = [
  'Intake Form Received', 'Call Booked', 'Proposal Sent',
  'Contracts Signed', 'Invoice Paid', 'Project In Progress', 'Follow Up Needed',
  'Request Review', 'Project Complete', 'Future Project Opp', 'Churn'
]
// 'Directory View' is an internal placeholder for clients that don't have a
// project yet. It must NOT be selectable on a real project — the Pipeline board
// has no Directory View column, so a project set to it disappears from the board.
const stages = computed(() => props.project?.id ? PIPELINE_STAGES : ['Directory View', ...PIPELINE_STAGES])

const clientProjects = ref(/** @type {any[]} */ ([]))
const allClientProjects = ref(/** @type {any[]} */ ([]))

const fetchClientProjects = async () => {
  if (!props.project?.client_id) return

  const { data: all, error: allErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', props.project.client_id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  if (allErr) { console.error('fetchClientProjects:', allErr.message); return }
  // Completed projects go to the bottom
  const active    = (all || []).filter(p => p.pipeline_stage !== 'Project Complete')
  const completed = (all || []).filter(p => p.pipeline_stage === 'Project Complete')
  allClientProjects.value = [...active, ...completed]

  const { data: sow, error: sowErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', props.project.client_id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  if (sowErr) console.error('fetchClientProjects sow:', sowErr.message)
  clientProjects.value = sow || []
}

// Declarado ANTES del watch que lo usa para evitar TDZ
const availableDocs = computed(() => {
  const docs = []
  const nda = props.project?.client?.nda_status
  const sow = props.project?.sow_status
  if (!props.project?.id) {
    // Vista tarjeta de cliente: solo NDA
    if (nda !== 'Sent' && nda !== 'Signed') docs.push('NDA')
  } else {
    // Vista proyecto en pipeline: NDA si aún no fue enviado (primer proyecto), siempre SOW
    if (nda !== 'Sent' && nda !== 'Signed') docs.push('NDA')
    if (!props.project?.sow_sent_date) docs.push('SOW')
  }
  return docs
})

watch(() => props.project?.id, async (newId, oldId) => {
  allClientProjects.value = []
  clientProjects.value = []
  if (newId && newId !== oldId && props.isOpen && props.project) {
    localEdits.value = buildLocalEdits(props.project)
    lossReasonSaved.value = !!props.project.loss_reason
    proposalHistory.value = parseProposalHistory(props.project)
    selectedDocs.value = availableDocs.value
    fetchHubStatus()
    fetchHubStageDates()
  }
  if (props.isOpen && !props.project?.id && props.project?.client_id) {
    await fetchClientProjects()
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project) {
    localEdits.value = buildLocalEdits(props.project)
    lossReasonSaved.value = !!props.project.loss_reason
    proposalHistory.value = parseProposalHistory(props.project)
    selectedDocs.value = availableDocs.value
    if (!props.project?.id) fetchClientProjects()
    fetchHubStatus()
    fetchHubStageDates()
  }
}, { immediate: true })

// Reload the client card's project list when the parent signals a new project
// was created from the Add Project modal.
watch(() => props.refreshToken, () => {
  if (props.isOpen && !props.project?.id && props.project?.client_id) fetchClientProjects()
})

const activeDueDates = computed(() => {
  const today = new Date(); today.setHours(0,0,0,0)
  const toEntry = (label, dateStr, source) => {
    const date = new Date(dateStr + 'T12:00:00')
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    return {
      label, source,
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      statusStyle: diff < 0 ? 'color: var(--critical);' : diff === 0 ? 'color: var(--caution);' : diff <= 7 ? 'color: var(--ember);' : 'color: var(--ink-2);',
      diff,
    }
  }

  const crmFields = [
    { field: 'due_date', label: 'Main Due Date' },
    ...deliverableItems.filter(i => i.dueField).map(i => ({ field: i.dueField, label: i.label })),
    ...productDevelopmentDueFields.map(s => ({ field: s.model, label: s.label })),
  ]
  const crmDates = crmFields
    .filter(f => localEdits.value[f.field])
    .map(f => toEntry(f.label, localEdits.value[f.field], 'CRM'))

  const hubDates = hubStageDates.value.map(s => toEntry(s.stage_name, s.due_date, 'HUB'))

  return [...crmDates, ...hubDates].sort((a, b) => a.diff - b.diff)
})

const timeToClose = computed(() => {
  const p = props.project
  if (!p || !p.created_at || (!p.closed_at && !p.sow_signed_date)) return null
  const start = new Date(p.created_at)
  const end = new Date(p.closed_at || p.sow_signed_date)
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
})

const clientLTV = computed(() => {
  return clientProjects.value.reduce((sum, p) => sum + (Number(p.amount_paid) || 0) + (Number(p.amount_owed) || 0), 0)
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

  // Every payment with an amount must have a valid date, otherwise it would
  // be untrackable in the dashboard's time-based reporting.
  const invalidPayment = (localEdits.value.payment_records || []).some(
    r => Number(r.amount) > 0 && (!r.date || !/^\d{4}-\d{2}-\d{2}$/.test(r.date))
  )
  if (invalidPayment) {
    await showAlert('Every payment with an amount must have a date. Please complete the missing payment dates before saving.', 'Missing Payment Date')
    return
  }

  isSaving.value = true
  try {
    const isClosingStage = ['Contracts Signed', 'Invoice Paid', 'Project Complete', 'Request Review', 'Churn'].includes(localEdits.value.pipeline_stage)

    // Append to proposal value history only when the value actually changed.
    const newProposal = Number(localEdits.value.proposal_value) || 0
    const oldProposal = Number(props.project.proposal_value) || 0
    let history = proposalHistory.value
    if (newProposal !== oldProposal) {
      history = [...history, { value: newProposal, date: new Date().toISOString() }]
      proposalHistory.value = history
    }

    const updates = {
      pipeline_stage: localEdits.value.pipeline_stage,
      internal_notes: localEdits.value.internal_notes,
      proposal_value: localEdits.value.proposal_value || 0,
      proposal_value_history: history.length > 0 ? JSON.stringify(history) : null,
      loss_reason: localEdits.value.pipeline_stage === 'Churn' ? localEdits.value.loss_reason : null,
      loss_reason_notes: localEdits.value.pipeline_stage === 'Churn' ? localEdits.value.loss_reason_notes : null,
      closed_at: isClosingStage ? (props.project.closed_at || new Date().toISOString()) : props.project.closed_at,
      amount_paid: localEdits.value.amount_paid || 0,
      amount_owed: localEdits.value.amount_owed || 0,
      milestones: localEdits.value.milestones || null,
      due_date: localEdits.value.due_date || null,
      scheduled_date: localEdits.value.scheduled_date || null,
      in_menu_hub: localEdits.value.in_menu_hub,
      review_requested: localEdits.value.review_requested,
      deliverable_design: localEdits.value.deliverable_design,
      deliverable_design_due: localEdits.value.deliverable_design_due || null,
      deliverable_tech_pack: localEdits.value.deliverable_tech_pack,
      deliverable_tech_pack_due: localEdits.value.deliverable_tech_pack_due || null,
      deliverable_product_analysis: localEdits.value.deliverable_product_analysis,
      deliverable_product_analysis_due: localEdits.value.deliverable_product_analysis_due || null,
      deliverable_product_dev: localEdits.value.deliverable_product_dev,
      deliverable_trend_analysis: localEdits.value.deliverable_trend_analysis,
      deliverable_trend_analysis_due: localEdits.value.deliverable_trend_analysis_due || null,
      deliverable_branding: localEdits.value.deliverable_branding,
      deliverable_branding_due: localEdits.value.deliverable_branding_due || null,
      deliverable_in_house_patternmaking: localEdits.value.deliverable_in_house_patternmaking,
      deliverable_in_house_patternmaking_due: localEdits.value.deliverable_in_house_patternmaking_due || null,
      deliverable_in_house_proto: localEdits.value.deliverable_in_house_proto,
      deliverable_in_house_proto_due: localEdits.value.deliverable_in_house_proto_due || null,
      deliverable_in_house_manufacturing: localEdits.value.deliverable_in_house_manufacturing,
      deliverable_in_house_manufacturing_due: localEdits.value.deliverable_in_house_manufacturing_due || null,
      deliverable_manu_quotes_due: localEdits.value.deliverable_manu_quotes_due || null,
      deliverable_initial_sample_due: localEdits.value.deliverable_initial_sample_due || null,
      deliverable_fitting: localEdits.value.deliverable_fitting,
      deliverable_fitting_due: localEdits.value.deliverable_fitting_due || null,
      deliverable_approved_sample_due: localEdits.value.deliverable_approved_sample_due || null,
      deliverable_size_range_due: localEdits.value.deliverable_size_range_due || null,
      deliverable_bulk_due: localEdits.value.deliverable_bulk_due || null,
      payment_records: localEdits.value.payment_records && localEdits.value.payment_records.length > 0 ? JSON.stringify(localEdits.value.payment_records) : null,
    }
    const { error: updateErr } = await supabase.from('projects').update(updates).eq('id', props.project.id)
    if (updateErr) throw updateErr

    // Add review request to follow-ups when moving to Project Complete or Request Review
    const oldStage = props.project.pipeline_stage
    const newStage = localEdits.value.pipeline_stage
    const shouldQueueReview = (newStage === 'Project Complete' && oldStage !== 'Project Complete') ||
                               (newStage === 'Request Review' && oldStage !== 'Request Review')
    if (shouldQueueReview) {
      await supabase.from('email_queue').insert({
        client_id: props.project.client_id,
        client_name: props.project.client?.name || '',
        client_email: props.project.client?.email || '',
        project_id: props.project.id,
        project_title: props.project.title || '',
        trigger_type: 'review_request',
        due_at: new Date().toISOString(),
      })
    }

    if (props.project.hub_project_id) {
      await hubSupabase.from('projects').update({ crm_stage: localEdits.value.pipeline_stage }).eq('id', props.project.hub_project_id)
    }
    // Lock the loss reason as read-only once it's saved on a Churn project.
    if (localEdits.value.pipeline_stage === 'Churn' && localEdits.value.loss_reason) {
      lossReasonSaved.value = true
    }
    flashSaved()
    emit('updated')
  } catch (e) {
    console.error("Error updating overview:", e)
    await showAlert('Error saving changes: ' + (e.message || e), 'Save Failed')
  } finally {
    isSaving.value = false
  }
}

// Client card (no project yet): Stage / Notes / Proposal Value live on the
// projects table, but a bare client has no project row — so we persist them
// onto the clients table instead, keeping the card's UI exactly the same.
const updateClientCard = async () => {
  if (!props.project?.client_id) return
  isSaving.value = true
  try {
    const updates = {
      pipeline_stage: localEdits.value.pipeline_stage || null,
      internal_notes: localEdits.value.internal_notes || null,
      client_tier: localEdits.value.client_tier || null,
      scheduled_date: localEdits.value.scheduled_date || null,
      loss_reason: localEdits.value.pipeline_stage === 'Churn' ? localEdits.value.loss_reason : null,
      loss_reason_notes: localEdits.value.pipeline_stage === 'Churn' ? localEdits.value.loss_reason_notes : null,
    }
    const { error } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
    if (error) throw error
    // Lock the loss reason as read-only once it's saved, same as project mode.
    if (localEdits.value.pipeline_stage === 'Churn' && localEdits.value.loss_reason) {
      lossReasonSaved.value = true
    }
    flashSaved()
    emit('updated')
  } catch (e) {
    console.error('Error saving client card:', e)
    await showAlert('Error saving changes: ' + (e.message || e), 'Save Failed')
  } finally {
    isSaving.value = false
  }
}

const saveSowContent = async () => {
  if (!props.project?.id || !props.project?.client_id) return
  const sowContent = {
    sow_deliverables: localEdits.value.sow_deliverables,
    sow_timeline: localEdits.value.sow_timeline,
    sow_fees_payment: localEdits.value.sow_fees_payment,
  }
  const { error: projErr } = await supabase.from('projects').update(sowContent).eq('id', props.project.id)
  if (projErr) throw projErr
}

const formatPdfDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const fetchBase64 = async (url) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

const buildSowPdf = async (forDownload = false, flatten = true) => {
  if (!props.project?.client) throw new Error('Missing client for SOW preview')

  const studioSignatureBase64 = await fetchBase64('/signature.png').catch(() => null)

  const today = new Date().toISOString()
  const htmlContent = generateSOWHTML({
    date_1: formatPdfDate(props.project.sow_sent_date || props.project.client?.sow_sent_date || today),
    date_2: formatPdfDate(props.project.client?.sow_signed_date || ''),
    date_3: formatPdfDate(props.project.sow_sent_date || props.project.client?.sow_sent_date || today),
    company_name: props.project.client.company || '',
    full_address: props.project.client.full_address || '',
    business_name: props.project.client.business_name || '',
    client_name: props.project.client.name || '',
    client_title: props.project.client.title || '',
    deliverables: localEdits.value.sow_deliverables,
    timeline: localEdits.value.sow_timeline,
    fees_payment: localEdits.value.sow_fees_payment,
    signatureImageBase64: null, // No signature for preview
    studioSignatureBase64,
  })

  const element = document.createElement('div')
  element.innerHTML = htmlContent

  const pdfArrayBuffer = await html2pdf()
    .set({
      margin: 0,
      filename: `SOW_${props.project.client.company}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .from(element)
    .outputPdf('arraybuffer')

  return new Uint8Array(pdfArrayBuffer)
}

const generateSowPdfPreview = async () => {
  if (!props.project?.client) return
  isGeneratingSowPreview.value = true
  pdfPreviewError.value = ''
  try {
    const pdfBytes = await buildSowPdf(false, true)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = URL.createObjectURL(blob)
    showSowPreviewModal.value = true
  } catch (e) {
    console.error('Error generating SOW PDF preview:', e)
    pdfPreviewError.value = e.message || 'Unable to build PDF preview.'
  } finally {
    isGeneratingSowPreview.value = false
  }
}

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Downloads the selected documents so they can be sent by hand instead of through the portal.
// Both go out already signed by the studio and dated today; the client only fills in their own block.
const downloadDocs = async () => {
  if (!props.project?.client) return
  isDownloading.value = true
  try {
    if (selectedDocs.value.includes('SOW')) await saveSowContent()

    const today = formatPdfDate(new Date().toISOString())
    const safeName = (props.project.client.company || props.project.client.name || 'Client').replace(/[^a-z0-9]/gi, '_')

    if (selectedDocs.value.includes('SOW')) {
      const studioSignatureBase64 = await fetchBase64('/signature.png').catch(() => null)
      // Everything the client fills in by hand is left blank on purpose — we only
      // print our own side (studio signature + dates).
      const blob = await getSOWPdfBlob({
        date_1: today,
        date_2: '',
        date_3: today,
        full_address: '',
        business_name: '',
        client_name: '',
        client_title: '',
        deliverables: localEdits.value.sow_deliverables,
        timeline: localEdits.value.sow_timeline,
        fees_payment: localEdits.value.sow_fees_payment,
        signatureImageBase64: null, // the client signs this one by hand
        studioSignatureBase64,
      })
      triggerDownload(blob, `SOW_${safeName}.pdf`)
    }

    if (selectedDocs.value.includes('NDA')) {
      // Sierra's signature is already printed on the template, so only the dates are filled.
      // Left unflattened on purpose: the client fills and signs the form in their PDF reader.
      const pdfDoc = await PDFDocument.load(await fetch('/mutual_nda.pdf').then(r => r.arrayBuffer()))
      const pdfForm = pdfDoc.getForm()
      for (const field of ['date_1', 'date_3']) {
        try { pdfForm.getTextField(field).setText(today) } catch (e) { console.warn('NDA field not found:', field) }
      }
      const bytes = await pdfDoc.save()
      triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `NDA_${safeName}.pdf`)
    }

    emit('updated')
  } catch (e) {
    await showAlert('Error generating the PDF: ' + (e.message || e), 'Download Failed')
  } finally {
    isDownloading.value = false
  }
}

const saveSowSection = async () => {
  if (!props.project?.id) return
  isSaving.value = true
  try {
    await saveSowContent()
    flashSaved()
    emit('updated')
  } catch (e) {
    console.error('Error saving SOW:', e)
    await showAlert('Error saving SOW: ' + (e.message || e), 'Save Failed')
  } finally {
    isSaving.value = false
  }
}

const updateClientTier = async () => {
  if (!props.project?.client_id) return
  await supabase.from('clients').update({ client_tier: localEdits.value.client_tier }).eq('id', props.project.client_id)
  emit('updated')
}

const todayLocalISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const addPaymentRecord = () => {
  if (!localEdits.value.payment_records) localEdits.value.payment_records = []
  localEdits.value.payment_records.push({ amount: null, date: todayLocalISO() })
}

const recalculateTotalPaid = () => {
  const records = localEdits.value.payment_records || []
  const total = records.reduce((sum, record) => sum + (Number(record.amount) || 0), 0)
  localEdits.value.amount_paid = total
  recalculateOwed()
}

// Owed is always Proposal Value minus what's been paid (never negative).
const recalculateOwed = () => {
  const proposal = Number(localEdits.value.proposal_value) || 0
  const paid = Number(localEdits.value.amount_paid) || 0
  localEdits.value.amount_owed = Math.max(proposal - paid, 0)
}


const resetSowToTemplates = async () => {
  localEdits.value.sow_deliverables = defaultDeliverables
  localEdits.value.sow_timeline = defaultTimeline
  localEdits.value.sow_fees_payment = defaultFees

  if (showSowPreviewModal.value) {
    await generateSowPdfPreview()
  }
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
  await supabase.from('projects').update({ archived_at: new Date().toISOString() }).eq('id', props.project.id)
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
  if (type === 'NDA') {
    await supabase.from('clients').update({
      nda_status: null,
      nda_sent_date: null,
      nda_opened_at: null,
      nda_signed_date: null,
      nda_signature: null,
      nda_client_name: null,
      nda_client_title: null,
      nda_pdf_path: null
    }).eq('id', props.project.client_id)
  } else if (type === 'SOW' && props.project?.id) {
    await supabase.from('projects').update({ sow_status: null, sow_sent_date: null, sow_signed_date: null, sow_pdf_path: null, sow_opened_at: null, sow_signature: null, sow_client_name: null, sow_client_title: null }).eq('id', props.project.id)
  }

  emit('updated')
}

const getCallDateText = () => {
  // The meeting set on the client card is stored in scheduled_date.
  // Fall back to call_date for any legacy data that used it.
  const meetingDate = props.project?.call_date
    || props.project?.scheduled_date
    || props.project?.client?.scheduled_date
  if (!meetingDate) return '[date of call]'

  const callDate = new Date(meetingDate)
  if (isNaN(callDate.getTime())) return '[date of call]'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Normalize dates to compare just the day part
  const callDateNorm = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate())
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayNorm = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (callDateNorm.getTime() === todayNorm.getTime()) {
    return 'today'
  } else if (callDateNorm.getTime() === yesterdayNorm.getTime()) {
    return 'yesterday'
  } else {
    // Days difference (negative = past)
    const diffDays = Math.round((callDateNorm - todayNorm) / (1000 * 60 * 60 * 24))

    // Within the last 6 days (same calendar week or very recent) → "on Monday"
    if (diffDays >= -6) {
      return `on ${days[callDate.getDay()]}`
    }

    // 7–13 days ago (previous week) → "last Wednesday"
    if (diffDays >= -13) {
      return `last ${days[callDate.getDay()]}`
    }

    // Older than 2 weeks → fallback to a plain date
    return `on ${callDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  }
}

const buildEmailData = () => {
  const baseUrl = window.location.origin
  const clientName = props.project.client.name
  const docsText = selectedDocs.value.join(' and ')
  emailData.value.to = props.project.client.email
  emailData.value.subject = `Document Request: ${docsText} from SIINGE STUDIO`
  const firstName = clientName.split(' ')[0]
  const callDateText = getCallDateText()
  const projectName = props.project.title || '[project name]'

  emailData.value.messageText = `Hi ${firstName},\n\nIt was great catching up with you ${callDateText} and talking through the details of your project. I put together a structured scope based on everything we discussed so you have a clear picture of how this would move forward.\n\nI've outlined the deliverables, timeline, and how we'll approach development for the ${projectName}.\n\nPlease review and sign the Scope of Work by clicking on the link below.\n\n[SIGNATURE_LINKS]\n\nOnce those are complete, I'll send through the invoice and we'll get started!`

  let linksHtml = ''
  if (selectedDocs.value.includes('SOW')) {
    const sowLink = `${baseUrl}/portal/${props.project.client_id}/sow/${props.project.id}`
    linksHtml += `<a href="${sowLink}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Review and Sign SOW</a>`
  }
  if (selectedDocs.value.includes('NDA')) {
    const ndaLink = `${baseUrl}/portal/${props.project.client_id}/nda`
    if (linksHtml) linksHtml += '<br/>'
    linksHtml += `<a href="${ndaLink}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Review and Sign NDA</a>`
  }
  emailData.value.buttonsHtml = linksHtml ? `<p style="font-family:sans-serif;color:#374151;margin:16px 0 0">${linksHtml}</p>` : ''
}

const saveAndPrepareEmail = async () => {
  if (!props.project?.client) return
  try {
    buildEmailData()
    if (selectedDocs.value.includes('SOW')) {
      await saveSowContent()
      await generateSowPdfPreview()
      return
    }
    showEmailModal.value = true
  } catch (e) {
    await showAlert('Critical error preparing dispatch: ' + (e.message || e), 'Error')
  }
}

const closeSowPreview = () => {
  showSowPreviewModal.value = false
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = ''
  }
}

const continueFromSowPreview = async () => {
  if (!props.project?.client) return
  try {
    if (selectedDocs.value.includes('SOW') && !props.project.sow_sent_date) {
      await saveSowContent()
    }
    closeSowPreview()
    showEmailModal.value = true
  } catch (e) {
    await showAlert('Critical error saving SOW: ' + (e.message || e), 'Error')
  }
}

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true
    const sentDate = new Date().toISOString()

    // Generate tokens for each document
    const portalLinks = {}
    for (const doc of selectedDocs.value) {
      const docType = doc.toLowerCase()
      const projectId = docType === 'sow' ? props.project?.id : null
      const { token, error: tokenError } = await createPortalToken(
        props.project.client_id,
        docType,
        projectId,
        48 // 48 hour expiration
      )
      if (tokenError) throw new Error(`Failed to create ${doc} token: ${tokenError}`)
      portalLinks[docType] = generatePortalLink(props.project.client_id, docType, projectId, token)
    }

    // Build links HTML
    let linksHtml = ''
    if (selectedDocs.value.includes('SOW') && portalLinks.sow) {
      linksHtml += `<a href="${portalLinks.sow}" style="color:#2563eb;text-decoration:underline;font-weight:600">Review and Sign SOW</a>`
    }
    if (selectedDocs.value.includes('NDA') && portalLinks.nda) {
      if (linksHtml) linksHtml += ' & '
      linksHtml += `<a href="${portalLinks.nda}" style="color:#2563eb;text-decoration:underline;font-weight:600">Review and Sign NDA</a>`
    }

    // Replace placeholder with actual links before converting to HTML
    let messageWithLinks = emailData.value.messageText.replace('[SIGNATURE_LINKS]', linksHtml)
    let emailHtml = messageWithLinks.split('\n').map(l => l ? `<p style="font-family:sans-serif;color:#374151;margin:0 0 8px">${l}</p>` : '').join('')

    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.value.to,
        cc: emailData.value.cc,
        subject: emailData.value.subject,
        html: emailHtml,
        client_id: props.project.client_id,
        doc_type: selectedDocs.value.join('_')
      }
    })

    if (emailError) throw new Error('Email gateway failed: ' + emailError.message)

    const updates = {}
    if (selectedDocs.value.includes('NDA')) { updates.nda_status = 'Sent'; updates.nda_sent_date = sentDate }

    if (Object.keys(updates).length) {
      const { error: dbError } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
      if (dbError) throw dbError
    }

    if (selectedDocs.value.includes('SOW') && props.project?.id) {
      await supabase.from('projects').update({ sow_status: 'Sent', sow_sent_date: sentDate }).eq('id', props.project.id)
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

    const ccMessage = emailData.value.cc ? ` CC sent to ${emailData.value.cc}` : ''
    await showAlert(`Documents dispatched successfully!${ccMessage}`, 'Success')
    showEmailModal.value = false
    selectedDocs.value = []
    emit('updated')
  } catch (err) {
    await showAlert('Failed to send: ' + err.message, 'Error')
  } finally {
    isSendingEmail.value = false
  }
}

const getNextMilestone = (proj) => {
  const candidates = [
    { label: 'Trend Analysis',          date: proj.deliverable_trend_analysis && proj.deliverable_trend_analysis_due },
    { label: 'Design',                  date: proj.deliverable_design && proj.deliverable_design_due },
    { label: 'Branding',                date: proj.deliverable_branding && proj.deliverable_branding_due },
    { label: 'Tech Pack',               date: proj.deliverable_tech_pack && proj.deliverable_tech_pack_due },
    { label: 'Product Analysis',        date: proj.deliverable_product_analysis && proj.deliverable_product_analysis_due },
    { label: 'Manu Quotes',             date: proj.deliverable_product_dev && proj.deliverable_manu_quotes_due },
    { label: 'Initial Sample',          date: proj.deliverable_product_dev && proj.deliverable_initial_sample_due },
    { label: 'Fitting',                 date: proj.deliverable_fitting && proj.deliverable_fitting_due },
    { label: 'Approved Sample',         date: proj.deliverable_product_dev && proj.deliverable_approved_sample_due },
    { label: 'Size Range Approval',     date: proj.deliverable_product_dev && proj.deliverable_size_range_due },
    { label: 'Bulk',                    date: proj.deliverable_product_dev && proj.deliverable_bulk_due },
    { label: 'Patternmaking',           date: proj.deliverable_in_house_patternmaking && proj.deliverable_in_house_patternmaking_due },
    { label: 'Proto',                   date: proj.deliverable_in_house_proto && proj.deliverable_in_house_proto_due },
    { label: 'Manufacturing',           date: proj.deliverable_in_house_manufacturing && proj.deliverable_in_house_manufacturing_due },
  ].filter(c => c.date)
  if (!candidates.length) return null
  candidates.sort((a, b) => new Date(a.date) - new Date(b.date))
  const next = candidates[0]
  return { label: next.label, formatted: new Date(next.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
}

const updateSnooze = async () => {
  if (!props.project?.id) return
  await supabase.from('projects')
    .update({ snooze_until: localEdits.value.snooze_until || null })
    .eq('id', props.project.id)
  emit('updated')
}

const markSowSentManually = async () => {
  if (!localEdits.value.manual_sow_date || !props.project?.client_id || !props.project?.id) return
  const sentDate = new Date(localEdits.value.manual_sow_date).toISOString()
  try {
    await supabase.from('projects')
      .update({ sow_status: 'Sent', sow_sent_date: sentDate })
      .eq('id', props.project.id)
    await supabase.from('activity_logs').insert({
      event_type:    'sow_sent',
      client_id:     props.project.client_id,
      client_name:   props.project.client?.name || '',
      project_id:    props.project.id,
      project_title: props.project.title,
      notes:         `SOW marked as sent manually on ${localEdits.value.manual_sow_date}`
    })
    localEdits.value.manual_sow_date = ''
    await showAlert('SOW marked as sent. Follow-up reminders have been queued.', 'Done')
    emit('updated')
  } catch (e) {
    await showAlert('Error: ' + e.message, 'Error')
  }
}

// For documents signed outside the portal (downloaded, signed by hand and returned).
// There is no signature image to store — only the status and the date get recorded.
const markDocSignedManually = async (type) => {
  const field = type === 'NDA' ? 'manual_nda_signed_date' : 'manual_sow_signed_date'
  const dateInput = localEdits.value[field]
  if (!dateInput || !props.project?.client_id) return
  const signedDate = new Date(dateInput).toISOString()

  try {
    if (type === 'NDA') {
      const { error } = await supabase.from('clients')
        .update({ nda_status: 'Signed', nda_signed_date: signedDate })
        .eq('id', props.project.client_id)
      if (error) throw error
    } else if (props.project?.id) {
      const { error } = await supabase.from('projects')
        .update({ sow_status: 'Signed', sow_signed_date: signedDate })
        .eq('id', props.project.id)
      if (error) throw error
    }

    await supabase.from('activity_logs').insert({
      event_type:    type.toLowerCase() + '_signed',
      client_id:     props.project.client_id,
      client_name:   props.project.client?.name || '',
      project_id:    props.project.id || null,
      project_title: props.project.title || null,
      notes:         `${type} marked as signed manually on ${dateInput}`
    })

    localEdits.value[field] = ''
    await showAlert(`${type} marked as signed. Follow-up reminders have been stopped.`, 'Done')
    emit('updated')
  } catch (e) {
    await showAlert('Error: ' + (e.message || e), 'Error')
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f9fafb; }
::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
