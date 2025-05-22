<template>
  <div id="app">
    <div class="logo-container">
      <router-link to="/">
        <img src="./assets/img/wishyouwereherelogo.jpg" alt="Wish You Were Here Logo">
      </router-link>
    </div>

    <main>
      <router-view @signup-success="addUserData" :users="users" />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
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
:root {
  --primary-color: #007AFF;
  --text-color: #1D1D1F;
  --background-color: #FFFFFF;
  --secondary-background: #F5F5F7;
  --safe-area-inset-top: env(safe-area-inset-top, 20px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 20px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

/* Modern Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base Styles */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.5;
  margin: 0;
  padding: 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

#app {
  width: 100%;
  max-width: 500px; /* iPhone width */
  margin: 0 auto;
  padding: 0 16px;
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: calc(16px + var(--safe-area-inset-left));
  padding-right: calc(16px + var(--safe-area-inset-right));
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Logo Container */
.logo-container {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: var(--secondary-background);
  margin: 1.5rem auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* Make the logo container a clickable link */
.logo-container a {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

/* Ensure form elements are touch-friendly */
input, textarea, button, select {
  font-size: 16px; /* Prevent iOS zoom on focus */
}

/* Header & Navigation */
.app-header {
  background-color: transparent;
  padding: 0.5rem 0 1rem;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
}

nav {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  width: 100%;
  flex-wrap: wrap;
}

.nav-button {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  text-align: center;
  flex: 1;
  max-width: 45%;
  min-width: 120px;
  box-sizing: border-box;
}

.nav-button:hover {
  background-color: rgba(0, 122, 255, 0.1);
  text-decoration: none;
}

.nav-button.router-link-active,
.nav-button.active {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

/* Ensure links have proper cursor */
a {
  cursor: pointer;
}

main {
  padding: 20px;
}
</style>