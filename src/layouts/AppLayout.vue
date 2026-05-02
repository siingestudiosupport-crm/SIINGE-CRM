<template>
  <div class="flex min-h-screen w-full" style="background: var(--paper);">

    <!-- Sidebar -->
    <aside class="flex flex-col flex-shrink-0" style="width: 240px; background: var(--ink); color: var(--paper); position: sticky; top: 0; height: 100vh; overflow-y: auto;">
      <!-- Logo block -->
      <div style="padding: 20px 24px 16px; border-bottom: 1px solid rgba(250,247,242,0.08); display: flex; align-items: center; gap: 10px;">
        <img src="../assets/siinge-logo-white.png" alt="SIINGE" style="height: 28px; filter: brightness(0) invert(1); flex-shrink: 0;" />
        <div>
          <p style="font-family: var(--font-sans); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(250,247,242,0.9); margin: 0; line-height: 1.2;">SIINGE STUDIO</p>
          <p style="font-family: var(--font-sans); font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.22em; color: rgba(250,247,242,0.35); margin: 0; line-height: 1.2;">CRM</p>
        </div>
      </div>

      <!-- Nav -->
      <nav style="padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 2px;">
        <router-link to="/" class="siinge-nav-link" active-class="siinge-nav-active" exact>
          <Gauge :size="15" />
          <span>Dashboard</span>
        </router-link>

        <router-link to="/pipeline" class="siinge-nav-link" active-class="siinge-nav-active">
          <Kanban :size="15" />
          <span>Pipeline</span>
        </router-link>

        <router-link to="/clients" class="siinge-nav-link" active-class="siinge-nav-active">
          <Users :size="15" />
          <span>Clients</span>
        </router-link>

        <router-link to="/calendar" class="siinge-nav-link" active-class="siinge-nav-active">
          <CalendarDays :size="15" />
          <span>Calendar</span>
        </router-link>

        <!-- Divider -->
        <div style="height: 1px; background: rgba(250,247,242,0.08); margin: 8px 0;"></div>

        <router-link to="/follow-ups" class="siinge-nav-link" active-class="siinge-nav-active">
          <Bell :size="15" />
          <span style="flex: 1;">Follow-ups</span>
          <span
            v-if="overdueCount > 0"
            style="font-size: 9px; font-weight: 700; background: var(--ember); color: var(--paper); border-radius: 10px; padding: 1px 6px; min-width: 16px; text-align: center; line-height: 1.6;"
          >{{ overdueCount }}</span>
        </router-link>

        <router-link to="/templates" class="siinge-nav-link" active-class="siinge-nav-active">
          <Mail :size="15" />
          <span>Templates</span>
        </router-link>

        <!-- Divider -->
        <div style="height: 1px; background: rgba(250,247,242,0.08); margin: 8px 0;"></div>

        <router-link to="/logs" class="siinge-nav-link" active-class="siinge-nav-active">
          <FileText :size="15" />
          <span>Logs</span>
        </router-link>
      </nav>

      <div style="padding: 16px 24px; border-top: 1px solid rgba(250,247,242,0.08);">
        <p style="font-size: 10px; color: rgba(250,247,242,0.3); text-align: center; margin: 0; text-transform: uppercase; letter-spacing: 0.14em;">SIINGE Studio</p>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- TopBar -->
      <header class="flex items-center justify-between flex-shrink-0" style="height: 72px; background: var(--paper); border-bottom: 1px solid var(--ink-5); padding: 0 32px; position: relative; z-index: 40;">
        <div>
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 2px;">Studio CRM</p>
          <h2 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--ink); margin: 0; line-height: 1;">Welcome</h2>
        </div>

        <div class="flex items-center gap-3">
          <!-- Notification bell -->
          <div style="position: relative;">
            <button
              @click="togglePanel"
              style="position: relative; width: 36px; height: 36px; border-radius: 2px; background: transparent; border: 1px solid var(--ink-5); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 120ms;"
              @mouseenter="e => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--ink)' }"
              @mouseleave="e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--ink-5)' }"
            >
              <Bell :size="15" style="color: var(--ink-3);" />
              <span
                v-if="overdueCount > 0"
                style="position: absolute; top: -5px; right: -5px; font-size: 8px; font-weight: 700; background: var(--ember); color: var(--paper); border-radius: 10px; padding: 1px 5px; min-width: 14px; text-align: center; line-height: 1.6;"
              >{{ overdueCount }}</span>
            </button>

            <!-- Notification panel -->
            <div
              v-if="panelOpen"
              style="position: absolute; top: calc(100% + 8px); right: 0; width: 340px; background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: 0 8px 32px rgba(14,14,12,0.15); z-index: 50; overflow: hidden;"
            >
              <!-- Panel header -->
              <div style="padding: 14px 16px; border-bottom: 1px solid var(--bone-edge); display: flex; justify-content: space-between; align-items: center;">
                <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0;">Follow-ups</p>
                <span style="font-size: 10px; color: var(--ink-5); margin: 0;">{{ notifications.length }} pending</span>
              </div>

              <!-- Empty state -->
              <div v-if="notifications.length === 0" style="padding: 32px 16px; text-align: center;">
                <p style="font-size: 13px; color: var(--ink-4); margin: 0; font-style: italic;">All caught up.</p>
              </div>

              <!-- Items -->
              <div v-else style="max-height: 380px; overflow-y: auto;">
                <router-link
                  v-for="item in notifications"
                  :key="item.id"
                  to="/follow-ups"
                  @click="panelOpen = false"
                  style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--bone-edge); text-decoration: none; transition: background 120ms;"
                  @mouseenter="e => e.currentTarget.style.background = 'var(--paper-2)'"
                  @mouseleave="e => e.currentTarget.style.background = 'transparent'"
                >
                  <!-- Color dot -->
                  <span :style="`width: 7px; height: 7px; border-radius: 50%; background: ${TRIGGER_META[item.trigger_type]?.color || 'var(--ink-5)'}; flex-shrink: 0; margin-top: 5px;`"></span>

                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
                      <span style="font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.client_name }}</span>
                      <span :style="`font-size: 9px; font-weight: 700; white-space: nowrap; color: ${isOverdue(item.due_at) ? 'var(--critical)' : 'var(--ink-4)'};`">
                        {{ daysLabel(item.due_at) }}
                      </span>
                    </div>
                    <p style="font-size: 11px; color: var(--ink-4); margin: 0;">{{ TRIGGER_META[item.trigger_type]?.label }}</p>
                  </div>
                </router-link>
              </div>

              <!-- Footer -->
              <router-link
                to="/follow-ups"
                @click="panelOpen = false"
                style="display: block; padding: 11px 16px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); text-decoration: none; border-top: 1px solid var(--bone-edge); transition: background 120ms;"
                @mouseenter="e => e.currentTarget.style.background = 'var(--paper-2)'"
                @mouseleave="e => e.currentTarget.style.background = 'transparent'"
              >View all follow-ups</router-link>
            </div>
          </div>

          <!-- Avatar -->
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--paper-2); border: 1px solid var(--ink-5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--ink-3);">
            S
          </div>
        </div>
      </header>

      <!-- Click outside to close panel -->
      <div v-if="panelOpen" class="fixed inset-0 z-30" @click="panelOpen = false"></div>

      <div class="p-8 overflow-y-auto flex-1">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Gauge, Kanban, Users, FileText, CalendarDays, Bell, Mail } from 'lucide-vue-next'
import { supabase } from '../lib/supabaseClient'

const TRIGGER_META = {
  proposal_3d:        { label: 'Proposal Follow-up',  color: 'var(--caution)'  },
  proposal_7d:        { label: 'Second Follow-up',    color: 'var(--ember)'    },
  proposal_weekly:    { label: 'Weekly Follow-up',    color: 'var(--ember)'    },
  call_completed_24h: { label: 'Post-Call Nudge',     color: 'var(--info)'     },
  cold_30d:           { label: 'Cold Re-engagement',  color: 'var(--ink-3)'    },
  review_request:     { label: 'Request Review',      color: 'var(--positive)' },
}

const notifications = ref([])
const panelOpen     = ref(false)

const overdueCount = computed(() =>
  notifications.value.filter(i => isOverdue(i.due_at)).length
)

const isOverdue  = (due_at) => new Date(due_at) <= new Date()

const daysLabel  = (due_at) => {
  const diff = Math.round((new Date(due_at) - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  return `In ${diff}d`
}

const togglePanel = () => { panelOpen.value = !panelOpen.value }

onMounted(async () => {
  const { data } = await supabase
    .from('email_queue')
    .select('id, client_name, trigger_type, due_at, sent_at, project_id')
    .is('completed_at', null)
    .is('sent_at', null)
    .order('due_at', { ascending: true })

  if (!data?.length) { notifications.value = []; return }

  const projectIds = [...new Set(data.filter(i => i.project_id).map(i => i.project_id))]
  let snoozeMap = {}
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, snooze_until')
      .in('id', projectIds)
    if (projects) projects.forEach(p => { snoozeMap[p.id] = p.snooze_until })
  }

  const now = new Date()
  notifications.value = data.filter(i => {
    if (!i.project_id) return true
    const snooze = snoozeMap[i.project_id]
    return !snooze || new Date(snooze) <= now
  })
})
</script>

<style scoped>
.siinge-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(250, 247, 242, 0.55);
  text-decoration: none;
  transition: color 120ms;
  border-left: 2px solid transparent;
}
.siinge-nav-link:hover {
  color: var(--paper);
}
.siinge-nav-active {
  color: var(--paper) !important;
  border-left-color: var(--ember) !important;
}
</style>
