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
      <div class="dashboard-header">
        <button @click="logout" class="logout-button">Logout</button>
        
        <div class="filters">
          <div class="filter-group">
            <label>Filter by Date:</label>
            <input 
              type="date" 
              v-model="filters.selectedDate" 
              class="filter-input"
              @change="applyFilters"
            >
          </div>
          
          <div class="filter-group">
            <label>Filter by Time:</label>
            <select v-model="filters.selectedTime" class="filter-input" @change="applyFilters">
              <option value="">All Times</option>
              <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Filter by Food:</label>
            <select v-model="filters.selectedFood" class="filter-input" @change="applyFilters">
              <option value="">All Food Preferences</option>
              <option v-for="food in foodOptions" :key="food" :value="food">{{ food }}</option>
            </select>
          </div>
          
          <button @click="resetFilters" class="secondary-button">Reset Filters</button>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div class="filter-summary" v-if="filters.selectedDate || filters.selectedTime || filters.selectedFood">
          <span>Showing results for: </span>
          <span v-if="filters.selectedDate" class="filter-tag">
            {{ formatDate(filters.selectedDate) }}
            <span @click="filters.selectedDate = ''; applyFilters();" class="remove-filter">×</span>
          </span>
          <span v-if="filters.selectedTime" class="filter-tag">
            {{ filters.selectedTime }}
            <span @click="filters.selectedTime = ''; applyFilters();" class="remove-filter">×</span>
          </span>
          <span v-if="filters.selectedFood" class="filter-tag">
            {{ filters.selectedFood }}
            <span @click="filters.selectedFood = ''; applyFilters();" class="remove-filter">×</span>
          </span>
        </div>
        
        <p v-if="filteredSignups.length === 0" class="no-users">
          {{ signups.length === 0 ? 'No users signed up yet.' : 'No users match the selected filters.' }}
        </p>
        <div v-else class="users-grid">
          <div v-for="(user, index) in filteredSignups" :key="index" class="user-card">
            <div class="user-info">
              <div class="user-phone">{{ user.phone_number }}</div>
              <div class="user-handle">{{ user.instagram_handle }}</div>
              <div v-if="user.selected_days && user.selected_days.length > 0" class="user-section">
                <div class="section-title">Selected Days:</div>
                <div class="selected-items">
                  <span v-for="(day, index) in user.selected_days" :key="index" class="selected-item">
                    {{ formatDate(day) }}
                  </span>
                </div>
              </div>
              <div v-if="user.selected_times && user.selected_times.length > 0" class="user-section">
                <div class="section-title">Selected Times:</div>
                <div class="selected-items">
                  <span v-for="(time, index) in user.selected_times" :key="'time-'+index" class="selected-item">
                    {{ time }}
                  </span>
                </div>
              </div>
              <div v-if="user.food_preferences && Array.isArray(user.food_preferences) && user.food_preferences.length > 0" class="user-section">
                <div class="section-title">Food Preferences:</div>
                <div class="selected-items">
                  <span v-for="(food, index) in user.food_preferences" :key="'food-'+index" class="selected-item">
                    {{ food }}
                  </span>
                </div>
              </div>
              <div v-else-if="user.food_preferences && typeof user.food_preferences === 'string'" class="user-section">
                <div class="section-title">Food Preferences:</div>
                <div class="selected-items">
                  <span class="selected-item">
                    {{ user.food_preferences }}
                  </span>
                </div>
              </div>
            </div>
            <div class="user-actions">
              <a :href="'sms:' + user.phone_number" class="action-btn sms-btn">
                <i class="fas fa-comment"></i>
                <span>Text</span>
              </a>
              <a :href="'https://instagram.com/' + user.instagram_handle.replace('@', '')"
                 target="_blank"
                 class="action-btn insta-btn">
                <i class="fab fa-instagram"></i>
                <span>IG</span>
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
      filteredSignups: [],
      isLoading: false,
      error: null,
      filters: {
        selectedDate: '',
        selectedTime: '',
        selectedFood: ''
      },
      timeOptions: [
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
      ],
      foodOptions: [
        'Vegan', 'Vegetarian', 'Meat Lover', 'Pescatarian',
        'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'
      ]
    };
  },
  created() {
    // No persistent authentication - user needs to log in each time
    // Debug: Log the time options for verification
    console.log('Available time options:', this.timeOptions);
  },
  methods: {
    applyFilters() {
      this.filteredSignups = this.signups.filter(user => {
        // Filter by date
        if (this.filters.selectedDate) {
          const hasMatchingDay = user.selected_days?.some(day => {
            return day === this.filters.selectedDate;
          });
          if (!hasMatchingDay) return false;
        }
        
        // Filter by time
        if (this.filters.selectedTime) {
          // Convert both times to 24-hour format for comparison
          const normalizeTime = (timeStr) => {
            // Handle different time formats (e.g., '8:00 AM' or '08:00 AM')
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          };
          
          const targetTime = normalizeTime(this.filters.selectedTime);
          const hasMatchingTime = user.selected_times?.some(time => {
            if (!time) return false;
            try {
              return normalizeTime(time) === targetTime;
            } catch (e) {
              console.warn('Error normalizing time:', time, e);
              return false;
            }
          });
          
          console.log('Time check:', {
            selectedTime: this.filters.selectedTime,
            userTimes: user.selected_times,
            normalizedTarget: targetTime,
            hasMatchingTime
          });
          
          if (!hasMatchingTime) return false;
        }
        
        // Filter by food preference
        if (this.filters.selectedFood) {
          if (Array.isArray(user.food_preferences)) {
            if (!user.food_preferences.includes(this.filters.selectedFood)) return false;
          } else if (user.food_preferences !== this.filters.selectedFood) {
            return false;
          }
        }
        
        return true;
      });
    },
    
    resetFilters() {
      this.filters = {
        selectedDate: '',
        selectedTime: '',
        selectedFood: ''
      };
      this.filteredSignups = [...this.signups];
    },
    
    async login() {
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
        this.filteredSignups = [...this.signups];
        
        // Debug: Log the first user's selected times if available
        if (this.signups.length > 0 && this.signups[0].selected_times) {
          console.log('First user selected times:', this.signups[0].selected_times);
        }
        
      } catch (err) {
        console.error('Error fetching signups:', err);
        this.error = 'Failed to load signups. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      // Format as YYYY-MM-DD without time
      if (typeof dateString === 'string' && dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Fallback to locale string if format is unexpected
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      return date.toISOString().split('T')[0];
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.filters {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
}

.filter-summary {
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filter-tag {
  background-color: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-filter {
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0.25rem;
}

.remove-filter:hover {
  color: #e53e3e;
}

.secondary-button {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.secondary-button:hover {
  background-color: #e2e8f0;
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
  margin-bottom: 0.5rem;
}

.user-section {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #0ea5e9;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4a5568;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.selected-item {
  background-color: white;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #2d3748;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
}

/* Special styling for food preferences */
.user-section:has(.section-title:contains('Food')) {
  background-color: #f0f9ff;
  border-left-color: #0ea5e9;
}

/* Special styling for days */
.user-section:has(.section-title:contains('Days')) {
  background-color: #f0fdf4;
  border-left-color: #10b981;
}

/* Special styling for times */
.user-section:has(.section-title:contains('Times')) {
  background-color: #eff6ff;
  border-left-color: #3b82f6;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  display: block;
  padding: 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 80px;
  box-sizing: border-box;
  text-align: center;
  position: relative;
}

.action-btn i {
  margin-right: 5px;
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