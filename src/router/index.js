import { createRouter, createWebHashHistory } from 'vue-router';
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
  // Use hash mode for GitHub Pages compatibility
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

export default router;
