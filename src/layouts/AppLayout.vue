<template>
  <div class="flex min-h-screen bg-gray-50 w-full">
    <aside class="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-blue-400">Client CRM</h1>
        <p class="text-xs text-slate-400 mt-1">Control Panel</p>
      </div>
      
      <nav class="mt-2 px-4 space-y-2 flex-1">
        <router-link 
          to="/" 
          class="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-blue-600 text-white hover:bg-blue-600"
        >
          <span>Dashboard</span>
        </router-link>

        <router-link 
          to="/pipeline" 
          class="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-blue-600 text-white hover:bg-blue-600"
        >
          <span>Pipeline (Kanban)</span>
        </router-link>

        <router-link 
          to="/clients" 
          class="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-blue-600 text-white hover:bg-blue-600"
        >
          <span>Clients</span>
        </router-link>

        <router-link 
          to="/contracts" 
          class="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-blue-600 text-white hover:bg-blue-600"
        >
          <span>Contracts</span>
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-slate-800">
        <p class="text-xs text-slate-500 text-center">Vercel & Supabase</p>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
        <h2 class="text-lg font-semibold text-gray-700">Welcome</h2>
        <div class="flex items-center">
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            J
          </div>
        </div>
      </header>
      
      <div class="p-8 overflow-y-auto flex-1">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
// Main layout structure. No complex logic needed here yet.
</script>