<template>
  <div class="admin-dashboard-container">
    <div v-if="!isAuthenticated" class="login-container">
      <h2>Admin Login</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Enter admin password"
          />
        </div>
        <button type="submit" class="nav-button">Login</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </form>
    </div>

    <div v-else class="dashboard-content">
      <button @click="logout" class="logout-button">Logout</button>
      
      <div v-if="isLoading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <p v-if="signups.length === 0" class="no-users">No users signed up yet.</p>
        <div v-else class="users-grid">
          <div v-for="(user, index) in signups" :key="index" class="user-card">
            <div class="user-info">
              <div class="user-phone">{{ user.phone_number }}</div>
              <div class="user-handle">{{ user.instagram_handle }}</div>
            </div>
            <div class="user-actions">
              <a :href="'sms:' + user.phone_number" class="action-btn sms-btn">
                <i class="fas fa-comment"></i> Text
              </a>
              <a :href="'https://instagram.com/' + user.instagram_handle.replace('@', '')"
                 target="_blank"
                 class="action-btn insta-btn">
                <i class="fab fa-instagram"></i> IG
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      isAuthenticated: false,
      password: '',
      loginError: '',
      signups: [],
      isLoading: false,
      error: null
    };
  },
  created() {
    // No persistent authentication - user needs to log in each time
  },
  methods: {
    login() {
      // Use the environment variable for the admin password
      if (this.password === import.meta.env.VITE_ADMIN_PASSWORD) {
        this.isAuthenticated = true;
        this.loginError = '';
        this.fetchSignups();
      } else {
        this.loginError = 'Incorrect password';
        this.password = '';
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.password = '';
      this.signups = [];
    },
    async fetchSignups() {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Fetching signups from Supabase...');
        const { data, error } = await supabase
          .from('signups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log('Fetched signups:', data);
        this.signups = data || [];
        
      } catch (err) {
        console.error('Error fetching signups:', err);
        this.error = 'Failed to load signups. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
  }
}
</script>

<style scoped>
.admin-dashboard-container {
  padding: 20px;
  max-width: 100%;
  margin: 0;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.dashboard-content {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.logout-button {
  display: block;
  width: 100%;
  max-width: 200px;
  margin: 0 auto 2rem;
  padding: 0.75rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #c82333;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0 10px;
}

.user-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  margin-bottom: 0.5rem;
}

.user-phone {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.user-handle {
  color: #666;
  font-size: 0.95rem;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.sms-btn {
  background-color: #28a745;
  color: white;
}

.sms-btn:hover {
  background-color: #218838;
}

.insta-btn {
  background-color: #e4405f;
  color: white;
}

.insta-btn:hover {
  background-color: #c9304c;
}

.loading, .no-users {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.error {
  color: #dc3545;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  text-align: center;
}

/* Login form styles */
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login-form label {
  font-weight: 500;
  color: #495057;
}

.login-form input[type="password"] {
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 25px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.login-form input[type="password"]:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.nav-button {
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s;
  width: 100%;
}

.nav-button:hover {
  background-color: #0069d9;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-dashboard-container {
    padding: 15px;
  }
  
  .users-grid {
    grid-template-columns: 1fr;
  }
  
  .user-card {
    padding: 1rem;
  }
  
  .logout-button {
    max-width: 100%;
  }
}
</style>