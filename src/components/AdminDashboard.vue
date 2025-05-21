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
        <button type="submit">Login</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </form>
    </div>

    <div v-else>
      <div class="header-container">
        <h2>User Sign-ups</h2>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <p v-if="signups.length === 0">No users signed up yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Instagram Handle</th>
              <th>Signed Up At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in signups" :key="user.id">
              <td>{{ user.phone_number }}</td>
              <td>{{ user.instagram_handle }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <a :href="'sms:' + user.phone_number" target="_blank" class="action-btn sms-btn">Text</a>
                <a :href="'https://instagram.com/' + user.instagram_handle.replace('@', '')"
                   target="_blank"
                   class="action-btn insta-btn">IG Profile</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      signups: [],
      loading: false,
      error: null,
      isAuthenticated: false,
      password: '',
      loginError: null
    }
  },
  created() {
    // Check if already authenticated
    const isAuth = localStorage.getItem('isAdminAuthenticated')
    if (isAuth === 'true') {
      this.isAuthenticated = true
      this.fetchSignups()
    }
  },
  methods: {
    login() {
      if (this.password === import.meta.env.VITE_ADMIN_PASSWORD) {
        this.isAuthenticated = true
        this.loginError = null
        localStorage.setItem('isAdminAuthenticated', 'true')
        this.password = ''
        this.fetchSignups()
      } else {
        this.loginError = 'Invalid password'
        this.password = ''
      }
    },

    logout() {
      this.isAuthenticated = false
      localStorage.removeItem('isAdminAuthenticated')
      this.signups = []
    },

    async fetchSignups() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('signups')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.signups = data
      } catch (error) {
        console.error('Error fetching signups:', error)
        this.error = 'Failed to load signups'
      } finally {
        this.loading = false
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
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #555;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.action-btn {
  display: inline-block;
  padding: 6px 12px;
  margin: 2px;
  border-radius: 4px;
  text-decoration: none;
  color: white;
  font-size: 0.9em;
  text-align: center;
  transition: background-color 0.2s;
}

.sms-btn {
  background-color: #28a745;
}

.sms-btn:hover {
  background-color: #218838;
}

.insta-btn {
  background-color: #e4405f;
}

.insta-btn:hover {
  background-color: #c9304c;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff4444;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ff4444;
  border-radius: 4px;
}
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>