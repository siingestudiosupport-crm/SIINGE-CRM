<template>
  <div class="flex min-h-screen w-full" style="background: var(--paper);">

    <!-- Sidebar -->
    <aside class="flex flex-col flex-shrink-0" style="width: 240px; background: var(--ink); color: var(--paper);">
      <!-- Logo block -->
      <div style="padding: 28px 24px 20px; border-bottom: 1px solid rgba(250,247,242,0.08);">
        <img src="../assets/siinge-logo-white.png" alt="SIINGE" style="height: 28px;" />
      </div>

      <!-- Nav -->
      <nav style="padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 2px;">
        <router-link
          to="/"
          class="siinge-nav-link"
          active-class="siinge-nav-active"
          exact
        >
          <Gauge :size="15" />
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/pipeline"
          class="siinge-nav-link"
          active-class="siinge-nav-active"
        >
          <Kanban :size="15" />
          <span>Pipeline</span>
        </router-link>

        <router-link
          to="/clients"
          class="siinge-nav-link"
          active-class="siinge-nav-active"
        >
          <Users :size="15" />
          <span>Clients</span>
        </router-link>

        <router-link
          to="/logs"
          class="siinge-nav-link"
          active-class="siinge-nav-active"
        >
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
      <header class="flex items-center justify-between flex-shrink-0" style="height: 72px; background: var(--paper); border-bottom: 1px solid var(--ink-5); padding: 0 32px;">
        <div>
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--ink-3); margin: 0 0 2px;">Studio CRM</p>
          <h2 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--ink); margin: 0; line-height: 1;">Welcome</h2>
        </div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--paper-2); border: 1px solid var(--ink-5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--ink-3);">
          S
        </div>
      </header>

      <div class="p-8 overflow-y-auto flex-1">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { Gauge, Kanban, Users, FileText } from 'lucide-vue-next'
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
