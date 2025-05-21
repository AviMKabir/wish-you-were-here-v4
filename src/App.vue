<template>
  <div id="app">
    <header>
      <nav>
        <button @click="currentView = 'signup'" :class="{ active: currentView === 'signup' }">Sign Up</button>
        <button @click="currentView = 'admin'" :class="{ active: currentView === 'admin' }">Admin Dashboard</button>
      </nav>
    </header>

    <main>
      <SignupForm v-if="currentView === 'signup'" @signup-success="addUserData" />
      <AdminDashboard v-if="currentView === 'admin'" :users="users" />
    </main>
  </div>
</template>

<script>
import SignupForm from './components/SignupForm.vue';
import AdminDashboard from './components/AdminDashboard.vue';

export default {
  name: 'App',
  components: {
    SignupForm,
    AdminDashboard,
  },
  data() {
    return {
      currentView: 'signup', // Default view
      users: [], // This array will hold your sign-up data
    };
  },
  created() {
    // Load users from localStorage when the app starts
    const storedUsers = localStorage.getItem('dinnerClubUsers');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  },
  methods: {
    addUserData(newUserData) {
      // Check if user already exists based on phone number (simple check)
      const existingUserIndex = this.users.findIndex(user => user.phoneNumber === newUserData.phoneNumber);

      if (existingUserIndex !== -1) {
        // If user exists, update their record (e.g., if they update their handle)
        this.users.splice(existingUserIndex, 1, newUserData);
      } else {
        // If user doesn't exist, add them to the array
        this.users.push(newUserData);
      }

      // Sort users by creation date, newest first
      this.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Save the updated users array to localStorage
      localStorage.setItem('dinnerClubUsers', JSON.stringify(this.users));
    },
  },
};
</script>

<style>
/* Basic global styles */
body {
  font-family: Arial, sans-serif;
  background-color: #f4f7f6;
  margin: 0;
  padding: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  background-color: #333;
  padding: 15px 0;
  text-align: center;
}

nav button {
  background: none;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 0 10px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 2px solid transparent;
}

nav button:hover {
  background-color: #555;
}

nav button.active {
  background-color: #007bff;
  border-bottom-color: #007bff;
}

main {
  padding: 20px;
}
</style>