import { createRouter, createWebHistory } from 'vue-router';
import SignupForm from '../components/SignupForm.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: SignupForm
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard
  },
  // Redirect any unknown paths to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory('/wish-you-were-here-v4/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    return { top: 0 };
  }
});

export default router;
