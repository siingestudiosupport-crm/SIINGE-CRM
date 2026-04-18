import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

import Dashboard from '../views/Dashboard.vue'
import Pipeline from '../views/Pipeline.vue'
import Clients from '../views/Clients.vue'
import Contracts from '../views/Contracts.vue'
import ClientPortal from '../views/ClientPortal.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'pipeline', name: 'Pipeline', component: Pipeline },
      { path: 'clients', name: 'Clients', component: Clients },
      { path: 'logs', name: 'Logs', component: Contracts }
    ]
  },
  {
    // AHORA USA :clientId
    path: '/portal/:clientId/:documentType',
    name: 'ClientPortal',
    component: ClientPortal,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router