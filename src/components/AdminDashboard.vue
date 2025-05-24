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
        <button type="submit" class="login-submit-button">
          Login
        </button>
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
              <option v-for="food in foodOptions" :key="food.value" :value="food.value">{{ food.label }}</option>
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
        { value: 'italian', label: 'Italian' },
        { value: 'mexican', label: 'Mexican' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'indian', label: 'Indian' },
        { value: 'american', label: 'American' },
        { value: 'thai', label: 'Thai' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'anything', label: 'Anything!' }
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
.login-submit-button {
  display: block !important;
  background-color: var(--primary-color) !important;
  color: white !important;
  border: none !important;
  padding: 0.8rem 2rem !important;
  border-radius: 0 !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  font-family: 'Poppins', sans-serif !important;
  margin: 0.5rem auto 0 !important;
  width: 100% !important;
  text-align: center !important;
  box-sizing: border-box !important;
}

.login-submit-button:hover,
.login-submit-button:active,
.login-submit-button:focus {
  background-color: #0d3d16 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(15, 76, 28, 0.2) !important;
  outline: none !important;
}
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.admin-dashboard-container {
  padding: 15px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  color: var(--text-color, #333);
  background: #fff;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: var(--light-color);
  padding: 1.5rem;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  align-items: end;
  width: 100%;
  box-sizing: border-box;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  background-color: #fff;
}

.filter-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 76, 28, 0.1);
}

.sec.logout-button {
  padding: 0.5rem 1.5rem;
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Poppins', sans-serif;
  margin-left: auto;
}

.secondary-button {
  padding: 0.7rem 1.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--dark-color);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Poppins', sans-serif;
  margin-top: auto;
}

.secondary-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.login-form input[type="submit"],
.nav-button {
  display: inline-block;
  background-color: var(--primary-color) !important;
  color: white !important;
  border: none !important;
  padding: 0.8rem 2rem !important;
  border-radius: 0 !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  font-family: 'Poppins', sans-serif !important;
  margin: 0.5rem auto 0 !important;
  min-width: 100% !important;
  text-align: center !important;
  box-sizing: border-box !important;
}

/* Force green hover state for all button variations */
.nav-button:hover,
.login-form input[type="submit"]:hover,
.login-form input[type="submit"]:hover:active,
.login-form input[type="submit"]:hover:focus,
.nav-button:hover:active,
.nav-button:hover:focus,
button.nav-button:hover,
input[type="submit"].nav-button:hover,
button[type="submit"]:hover,
.login-form button[type="submit"]:hover {
  background-color: #0d3d16 !important;
  background-image: none !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(15, 76, 28, 0.2) !important;
  border-color: transparent !important;
  outline: none !important;
}

.nav-button:disabled,
.login-form input[type="submit"]:disabled {
  opacity: 0.7 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.user-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-color);
}

.user-info {
  margin-bottom: 0.5rem;
  width: 100%;
  word-break: break-word;
}

.user-phone {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-phone::before {
  content: '📱';
  font-size: 1rem;
}

.user-handle {
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-handle::before {
  content: '📸';
  font-size: 1rem;
}

.section-title {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.selected-item {
  display: inline-block;
  background: var(--light-color);
  padding: 0.35rem 0.8rem;
  border-radius: 0;
  margin: 0.2rem;
  font-size: 0.85rem;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.selected-item:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.login-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2.5rem;
  background: white;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.login-container h2 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-width: 80px;
}

.sms-btn {
  background-color: #f0f0f0;
  color: #333;
}

.insta-btn {
  background-color: #f0f0f0;
  color: #e1306c;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sms-btn:hover {
  background-color: #e0e0e0;
}

.insta-btn:hover {
  background-color: #f8e1e8;
}

@media (max-width: 768px) {
  .user-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 100%;
    padding: 0.75rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;  /* Reduced from 0.5rem */
  margin-top: 1.25rem;  /* Reduced from 1.5rem */
}

.login-form .form-group {
  text-align: left;
  margin-bottom: 0.5rem;  /* Reduced from 1rem */
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
  font-weight: 500;
}

.login-form input[type="password"] {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #fff;
}

.login-form input[type="password"]:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
  background-color: #fff;
}

/* Nav button styles consolidated above with !important to ensure they take precedence */

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-dashboard-container {
    padding: 10px;
  }
  
  .dashboard-content {
    padding: 0 5px;
  }
  
  .filters {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .users-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
  
  .user-card {
    padding: 0.75rem;
    width: 100%;
    margin: 0 auto;
  }
  
  .logout-button {
    display: inline-block;
    background-color: #f44336;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 0;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
    margin: 0 auto 1.5rem;
    min-width: 180px;
    text-align: center;
    max-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .logout-button:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
  }
  
  .secondary-button {
    width: 100%;
  }
}
</style>