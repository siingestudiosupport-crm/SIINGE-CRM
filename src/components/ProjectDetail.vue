<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-end justify-end">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div class="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-slide-in">
      
      <div class="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ project?.title || 'Project Detail' }}</h2>
          <div class="flex items-center gap-2 mt-2">
            <p class="text-sm text-blue-600 font-bold">{{ project?.client?.name || 'Unknown Client' }}</p>
            <span v-if="project?.client?.client_tier" :class="['text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border', getTierClass(project.client.client_tier)]">
              {{ project.client.client_tier }}
            </span>
          </div>
          <div v-if="project?.client?.phone_number" class="flex items-center gap-2 mt-1">
            <span v-if="project?.client?.country" class="text-xs text-gray-500 font-medium">{{ project.client.country }}</span>
            <span v-if="project?.client?.country" class="text-gray-300 text-xs">|</span>
            <span class="text-xs text-gray-500 font-medium tracking-tight">📞 {{ project.client.phone_number }}</span>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-800 text-2xl leading-none transition-colors">&times;</button>
      </div>

      <div class="flex border-b border-gray-200 px-6 bg-gray-50">
        <button 
          @click="activeTab = 'Overview'"
          :class="['py-3 mr-6 text-sm font-bold transition-colors border-b-2', 
                   activeTab === 'Overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
        >
          Overview
        </button>
        <button 
          @click="activeTab = 'Contracts'"
          :class="['py-3 text-sm font-bold transition-colors border-b-2', 
                   activeTab === 'Contracts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
        >
          Contracts & SOW
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 bg-white" v-if="project">
        
        <div v-if="activeTab === 'Overview'" class="space-y-6">
          
          <section v-if="suggestedAction" class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
            <div class="flex items-start gap-3">
              <span class="text-xl">🔔</span>
              <div>
                <p class="text-[10px] font-black text-amber-700 uppercase tracking-widest">Suggested Action</p>
                <p class="text-sm text-amber-900 font-bold">{{ suggestedAction.title }}</p>
                <p class="text-xs text-amber-700 mt-1 italic leading-relaxed">{{ suggestedAction.desc }}</p>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Pipeline Stage</label>
              <select v-model="project.pipeline_stage" @change="updateOverview" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800 transition-all shadow-sm">
                <option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Proposal Value</label>
              <div class="flex items-center border border-gray-300 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm transition-all">
                <span class="text-gray-500 mr-1 font-bold">$</span>
                <input v-model="project.proposal_value" @blur="updateOverview" type="number" class="w-full bg-transparent border-none p-2.5 outline-none text-sm font-bold text-gray-800" placeholder="0.00" />
              </div>
            </div>
          </section>

          <section v-if="project?.client && (project.client.investment_level || project.client.brand_stage)" class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
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

          <section v-if="project.pipeline_stage === 'Churn'" class="p-5 bg-red-50 border border-red-200 rounded-xl animate-fade-in shadow-sm">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-red-600">📉</span>
              <label class="block text-xs font-black text-red-700 uppercase tracking-widest">Reason for Loss (Required)</label>
            </div>
            <select v-model="project.loss_reason" @change="updateOverview" class="w-full border border-red-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none text-red-900 font-bold shadow-sm transition-all">
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
              <select v-if="project.client" v-model="project.client.client_tier" @change="updateClientTier" class="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer outline-none transition-colors hover:text-blue-600">
                <option value="Early-stage">Early-stage</option>
                <option value="Established">Established</option>
                <option value="High-value">High-value</option>
              </select>
              <p v-else class="text-xs text-gray-400 italic">No client data</p>
            </div>
          </section>

          <section v-if="timeToClose" class="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex justify-between items-center shadow-sm">
            <div>
              <p class="text-[10px] font-black text-green-700 uppercase tracking-widest">Time to Close</p>
              <p class="text-xs text-green-600 mt-0.5 font-medium">From initial intake to signed SOW</p>
            </div>
            <div class="text-center">
               <span class="text-3xl font-black text-green-800">{{ timeToClose }}</span>
               <p class="text-[9px] font-bold text-green-700 uppercase">Days</p>
            </div>
          </section>

          <section>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Internal Notes (Team Only)</label>
              <span class="text-[9px] text-gray-400 font-bold uppercase">Autosave on blur</span>
            </div>
            <textarea 
              v-model="project.internal_notes" 
              @blur="updateOverview"
              placeholder="Private notes about negotiations, specific founder traits, or red flags..."
              class="w-full border border-gray-300 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-gray-700 shadow-inner"
            ></textarea>
          </section>
        </div>

        <div v-if="activeTab === 'Contracts'" class="space-y-6 pb-20">
          
          <template v-if="project?.client">
            
            <div class="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 flex justify-between items-center shadow-sm">
              <div>
                <h3 class="font-bold text-gray-800 text-sm tracking-tight">Non-Disclosure Agreement</h3>
                <div class="text-[10px] space-y-1.5 mt-1.5">
                  <p v-if="project.client.nda_sent_date" class="text-gray-500 font-medium">📤 Sent: <span class="text-gray-700">{{ formatDate(project.client.nda_sent_date) }}</span></p>
                  <p v-if="project.client.nda_opened_at" class="text-blue-600 font-black flex items-center gap-1.5">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    EYES ON: Opened at {{ formatDate(project.client.nda_opened_at) }}
                  </p>
                  <p v-if="project.client.nda_signed_date" class="text-green-600 font-black uppercase flex items-center gap-1">
                    ✅ Signed & Verified: {{ formatDate(project.client.nda_signed_date) }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2.5">
                <span :class="getStatusClass(project.client.nda_status)" class="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                  {{ project.client.nda_status || 'Pending' }}
                </span>
                <button v-if="project.client.nda_sent_date" @click="resetDocument('NDA')" class="text-[9px] text-blue-500 hover:text-blue-700 underline font-black cursor-pointer uppercase tracking-tighter">🔄 Reset / Resend</button>
              </div>
            </div>

            <div class="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 flex justify-between items-center shadow-sm">
              <div>
                <h3 class="font-bold text-gray-800 text-sm tracking-tight">Scope of Work (SOW)</h3>
                <div class="text-[10px] space-y-1.5 mt-1.5">
                  <p v-if="project.client.sow_sent_date" class="text-gray-500 font-medium">📤 Sent: <span class="text-gray-700">{{ formatDate(project.client.sow_sent_date) }}</span></p>
                  <p v-if="project.client.sow_opened_at" class="text-blue-600 font-black flex items-center gap-1.5">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    EYES ON: Opened at {{ formatDate(project.client.sow_opened_at) }}
                  </p>
                  <p v-if="project.client.sow_signed_date" class="text-green-600 font-black uppercase flex items-center gap-1">
                    ✅ Signed & Verified: {{ formatDate(project.client.sow_signed_date) }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2.5">
                <span :class="getStatusClass(project.client.sow_status)" class="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                  {{ project.client.sow_status || 'Pending' }}
                </span>
                <button v-if="project.client.sow_sent_date" @click="resetDocument('SOW')" class="text-[9px] text-blue-500 hover:text-blue-700 underline font-black cursor-pointer uppercase tracking-tighter">🔄 Reset / Resend</button>
              </div>
            </div>

            <div v-if="!['Sent', 'Signed'].includes(project.client.sow_status)" class="p-6 border border-gray-200 rounded-2xl bg-white shadow-md animate-fade-in">
              <div class="mb-6 border-b border-gray-100 pb-4">
                <h3 class="font-bold text-gray-800 text-sm uppercase tracking-tighter">Live SOW Editor</h3>
                <p class="text-[11px] text-gray-500 mt-1 font-medium italic">Edit these sections. They will be dynamically injected into the legal PDF.</p>
              </div>

              <div class="space-y-6">
                <div>
                  <label class="block text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest">1. Deliverables (Section 2)</label>
                  <textarea 
                    v-model="project.client.sow_deliverables" 
                    rows="6" 
                    class="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-medium text-gray-700 shadow-inner"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest">2. Timeline & Milestones (Section 3)</label>
                  <textarea 
                    v-model="project.client.sow_timeline" 
                    rows="5" 
                    class="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-medium text-gray-700 shadow-inner"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest">3. Fees & Payment (Section 5)</label>
                  <textarea 
                    v-model="project.client.sow_fees_payment" 
                    rows="7" 
                    class="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-medium text-gray-700 shadow-inner"
                  ></textarea>
                </div>
              </div>
            </div>

            <div v-if="availableDocs.length > 0" class="p-6 border border-blue-200 rounded-2xl bg-blue-50 shadow-lg relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-10 text-4xl">📧</div>
              <div class="flex items-center gap-2 mb-4">
                <h3 class="font-black text-blue-900 text-xs uppercase tracking-widest">Unified Dispatch Center</h3>
              </div>
              
              <div class="flex gap-8 mb-6 px-1">
                <label v-if="availableDocs.includes('NDA')" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" value="NDA" v-model="selectedDocs" class="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 transition-all shadow-sm" />
                  <span class="text-sm font-black text-blue-800 group-hover:text-blue-950">NDA</span>
                </label>
                <label v-if="availableDocs.includes('SOW')" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" value="SOW" v-model="selectedDocs" class="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 transition-all shadow-sm" />
                  <span class="text-sm font-black text-blue-800 group-hover:text-blue-950">SOW</span>
                </label>
              </div>

              <button 
                @click="saveAndPrepareEmail" 
                :disabled="selectedDocs.length === 0"
                class="w-full bg-blue-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Details & Prepare Dispatch
              </button>
            </div>

            <div v-if="project.client.nda_pdf_path || project.client.sow_pdf_path" class="pt-8 border-t border-gray-200 space-y-4 mt-8">
              <div class="flex items-center gap-2 px-1">
                <span class="text-green-600 text-lg">🛡️</span>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Document Vault (Signed Only)</p>
              </div>
              
              <button v-if="project.client.nda_status === 'Signed' && project.client.nda_pdf_path" 
                @click="downloadFromVault(project.client.nda_pdf_path)" 
                class="w-full bg-white text-green-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-green-500 hover:bg-green-50 transition-all flex justify-center items-center gap-4 shadow-sm group">
                <svg class="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Signed NDA PDF
              </button>

              <button v-if="project.client.sow_status === 'Signed' && project.client.sow_pdf_path" 
                @click="downloadFromVault(project.client.sow_pdf_path)" 
                class="w-full bg-white text-green-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-green-500 hover:bg-green-50 transition-all flex justify-center items-center gap-4 shadow-sm group">
                <svg class="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Signed SOW PDF
              </button>
            </div>

          </template>
          
          <div v-else class="p-16 text-center bg-gray-50 border border-gray-200 rounded-3xl">
            <div class="text-5xl mb-6 opacity-20">📂</div>
            <p class="text-sm font-black text-gray-400 uppercase tracking-widest">No client record found for this project.</p>
          </div>

        </div>

      </div>
    </div>

    <div v-if="showEmailModal" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-slide-up">
        
        <div class="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-3">
             <div class="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
               <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
             </div>
             <h3 class="font-black text-gray-800 uppercase tracking-widest text-xs">Review & Send Dispatch</h3>
          </div>
          <button @click="showEmailModal = false" class="text-gray-400 hover:text-gray-800 text-2xl font-bold transition-colors">&times;</button>
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

          <div class="mt-6">
            <div class="flex justify-between items-center mb-3">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Construction</label>
              <div class="flex bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200">
                <button type="button" @click="emailViewMode = 'preview'" :class="['px-5 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all', emailViewMode === 'preview' ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700']">Client View</button>
                <button type="button" @click="emailViewMode = 'code'" :class="['px-5 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all', emailViewMode === 'code' ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700']">HTML Editor</button>
              </div>
            </div>
            
            <div v-if="emailViewMode === 'preview'" class="w-full border-2 border-gray-100 rounded-2xl p-8 text-sm bg-white shadow-inner max-h-[380px] overflow-y-auto prose prose-sm max-w-none transition-all" v-html="emailData.body"></div>
            
            <textarea v-else v-model="emailData.body" rows="14" class="w-full border-2 border-gray-100 rounded-2xl p-6 text-sm font-mono bg-gray-900 text-green-400 shadow-inner focus:border-blue-500 outline-none transition-all"></textarea>
          </div>
        </div>

        <div class="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <button @click="showEmailModal = false" class="px-8 py-3 text-gray-500 font-black uppercase tracking-widest hover:bg-gray-200 rounded-xl transition-all text-[10px]">
            Cancel Dispatch
          </button>
          <button @click="dispatchEmail" :disabled="isSendingEmail" class="px-10 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95 disabled:opacity-50">
            <span>{{ isSendingEmail ? 'Disseminating...' : 'Confirm & Dispatch to Client' }}</span>
            <span v-if="!isSendingEmail" class="animate-pulse">🚀</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  isOpen: Boolean,
  project: Object
})

const emit = defineEmits(['close', 'updated'])

// --- CONFIGURACIÓN DE TEMPLATES LEGALES ---
const defaultDeliverables = `Service Provider will deliver the following:\n• [INSERT DELIVERABLES]\n• [Be specific: outputs, formats, quantities]\n\nAny work not expressly listed above is considered out of scope.`;
const defaultTimeline = `Project Start Date: [INSERT]\n• Key Milestones (optional): [INSERT]\n• Final Delivery Date: [INSERT]\n\nTimeline is dependent on timely client feedback and materials.`;
const defaultFees = `Total Project Fee: $[INSERT]\n\nPayment Terms:\n• [INSERT STRUCTURE, e.g., 50% upfront]\n\nPayment is a condition precedent to commencement of Services.`;

// --- ESTADOS DE UI Y NEGOCIO ---
const activeTab = ref('Overview')
const emailViewMode = ref('preview')
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const selectedDocs = ref([])
const emailData = ref({ subject: '', body: '' })

const stages = [
  'Directory View', 'Intake Form Received', 'Call Booked', 'Proposal Sent', 
  'Contracts Signed', 'Invoice Paid', 'Follow Up Needed', 
  'Churn', 'Project Complete', 'Future Project Opp'
]

// --- LÓGICA DE CARGA INICIAL (SIN BORRAR NADA) ---
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project?.client) {
    const c = props.project.client;
    // Inyectar templates si las cajas están vacías
    if (!c.sow_deliverables) c.sow_deliverables = defaultDeliverables;
    if (!c.sow_timeline) c.sow_timeline = defaultTimeline;
    if (!c.sow_fees_payment) c.sow_fees_payment = defaultFees;
    
    // Auto-selección inteligente de lo que falta enviar
    selectedDocs.value = availableDocs.value;
    emailViewMode.value = 'preview';
  }
}, { immediate: true });

// --- MÉTRICAS Y LÓGICA COMPUTADA (RESTAURADA) ---
const availableDocs = computed(() => {
  const docs = [];
  const nda = props.project?.client?.nda_status;
  const sow = props.project?.client?.sow_status;
  if (nda !== 'Sent' && nda !== 'Signed') docs.push('NDA');
  if (sow !== 'Sent' && sow !== 'Signed') docs.push('SOW');
  return docs;
});

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

// --- HELPERS VISUALES (ESTILO SIERRA) ---
const getStatusClass = (s) => {
  if (s === 'Signed') return 'bg-green-100 text-green-700 border border-green-200'
  if (s === 'Sent') return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-gray-100 text-gray-500 border border-gray-200'
}

const getTierClass = (t) => {
  if (t === 'High-value') return 'bg-purple-100 text-purple-700 border-purple-200'
  if (t === 'Established') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// --- ACCIONES DE BASE DE DATOS (RESTAURADAS CON PIPELINE COMPLETO) ---
const updateOverview = async () => {
  if (!props.project?.id) return
  try {
    const updates = { 
      pipeline_stage: props.project.pipeline_stage,
      internal_notes: props.project.internal_notes,
      proposal_value: props.project.proposal_value || 0,
      loss_reason: props.project.pipeline_stage === 'Churn' ? props.project.loss_reason : null,
      closed_at: (props.project.pipeline_stage === 'Contracts Signed' || props.project.pipeline_stage === 'Churn') ? new Date().toISOString() : null
    }
    await supabase.from('projects').update(updates).eq('id', props.project.id)
    emit('updated')
  } catch (e) { console.error("Error updating overview:", e) }
}

const updateClientTier = async () => {
  if (!props.project?.client_id) return
  await supabase.from('clients').update({ client_tier: props.project.client.client_tier }).eq('id', props.project.client_id)
  emit('updated')
}

const resetDocument = async (type) => {
  if (!confirm(`Are you sure you want to reset the ${type}? It will clear the status and allow you to re-edit and re-send.`)) return;
  const key = type.toLowerCase();
  const updates = { [`${key}_status`]: null, [`${key}_sent_date`]: null, [`${key}_opened_at`]: null };
  await supabase.from('clients').update(updates).eq('id', props.project.client_id);
  emit('updated');
}

// --- LOGICA DE ENVÍO DE CORREOS (CON TRACKING Y CC) ---
const saveAndPrepareEmail = async () => {
  if (!props.project?.client) return
  try {
    // 1. Persistir cambios de SOW antes de enviar
    const { error } = await supabase.from('clients').update({ 
      sow_deliverables: props.project.client.sow_deliverables,
      sow_timeline: props.project.client.sow_timeline,
      sow_fees_payment: props.project.client.sow_fees_payment
    }).eq('id', props.project.client_id)

    if (error) throw error
    
    // 2. Construir editor de correo
    const baseUrl = window.location.origin
    const clientName = props.project.client.name
    const docsText = selectedDocs.value.join(' and ')
    emailData.value.subject = `Document Request: ${docsText} from SIINGE STUDIO`

    let htmlBody = `<p style="font-family: sans-serif; color: #374151;">Hi ${clientName},</p>
    <p style="font-family: sans-serif; color: #374151;">Please review and sign the requested documents for our upcoming collaboration. Click the buttons below to access your secure portal:</p>
    <div style="margin: 35px 0;">`

    if (selectedDocs.value.includes('NDA')) {
      const link = `${baseUrl}/portal/${props.project.client_id}/nda`
      htmlBody += `<a href="${link}" style="display:inline-block; margin-bottom:12px; margin-right:12px; padding:15px 28px; background-color:#1e293b; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-family:sans-serif; font-size: 14px; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Review & Sign NDA</a>`
    }

    if (selectedDocs.value.includes('SOW')) {
      const link = `${baseUrl}/portal/${props.project.client_id}/sow`
      htmlBody += `<a href="${link}" style="display:inline-block; margin-bottom:12px; padding:15px 28px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-family:sans-serif; font-size: 14px; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Review & Sign SOW</a>`
    }

    htmlBody += `</div><p style="font-family: sans-serif; color: #374151;">Best regards,<br><strong>SIINGE STUDIO Team</strong></p>`

    emailData.value.body = htmlBody
    showEmailModal.value = true
  } catch (e) { alert('Critical error saving SOW: ' + e.message) }
}

const dispatchEmail = async () => {
  try {
    isSendingEmail.value = true
    const sentDate = new Date().toISOString()

    // LLAMADA A EDGE FUNCTION CON TAGS PARA TRACKING DE APERTURA
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: { 
        to: props.project.client.email, 
        subject: emailData.value.subject, 
        html: emailData.value.body,
        client_id: props.project.client_id, // Metadata para el webhook de apertura
        doc_type: selectedDocs.value.join('+') // NDA, SOW o NDA+SOW
      }
    });

    if (emailError) throw new Error('Email gateway failed: ' + emailError.message);

    // Actualizar estados en DB
    const updates = {};
    if (selectedDocs.value.includes('NDA')) { updates.nda_status = 'Sent'; updates.nda_sent_date = sentDate; }
    if (selectedDocs.value.includes('SOW')) { updates.sow_status = 'Sent'; updates.sow_sent_date = sentDate; }
    
    const { error: dbError } = await supabase.from('clients').update(updates).eq('id', props.project.client_id)
    if (dbError) throw dbError

    alert('Documents dispatched successfully! CC sent to sierra@siinge.studio')
    showEmailModal.value = false
    selectedDocs.value = []
    emit('updated')

  } catch (err) {
    alert('Failed to send: ' + err.message)
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