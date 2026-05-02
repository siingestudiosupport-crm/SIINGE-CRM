import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

import Dashboard from '../views/Dashboard.vue'
import Pipeline from '../views/Pipeline.vue'
import Clients from '../views/Clients.vue'
import Contracts from '../views/Contracts.vue'
import Calendar from '../views/Calendar.vue'
import FollowUps from '../views/FollowUps.vue'
import Templates from '../views/Templates.vue'
import ClientPortal from '../views/ClientPortal.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'pipeline', name: 'Pipeline', component: Pipeline },
      { path: 'clients', name: 'Clients', component: Clients },
      { path: 'calendar', name: 'Calendar', component: Calendar },
      { path: 'follow-ups', name: 'FollowUps', component: FollowUps },
      { path: 'templates', name: 'Templates', component: Templates },
      { path: 'logs', name: 'Logs', component: Contracts }
    ]
  },
  {
    path: '/portal/:clientId/:documentType/:projectId?',
    name: 'ClientPortal',
    component: ClientPortal,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router