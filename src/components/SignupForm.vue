<template>
    <div class="signup-container">
      <h2>Join the Dinner Club!</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            v-model="phoneNumber"
            required
            placeholder="e.g., +15551234567"
          />
          <small>Include country code (e.g., +1 for USA).</small>
        </div>
  
        <div class="form-group">
          <label for="instagramHandle">Instagram Handle:</label>
          <input
            type="text"
            id="instagramHandle"
            v-model="instagramHandle"
            required
            placeholder="e.g., @foodvlogcompany"
          />
          <small>Start with '@' (optional but good practice).</small>
        </div>
  
        <button type="submit">Sign Up!</button>
  
        <p v-if="message" :class="{ 'success-message': isSuccess, 'error-message': !isSuccess }">
          {{ message }}
        </p>
      </form>
    </div>
  </template>
  
  <script>
  import { supabase } from '../supabase'

export default {
    name: 'SignupForm',
    data() {
      return {
        phoneNumber: '',
        instagramHandle: '',
        message: '',
        isSuccess: false,
      };
    },
    methods: {
      async submitForm() {
        // Basic validation
        if (!this.phoneNumber || !this.instagramHandle) {
          this.message = 'Please fill in all fields';
          this.isSuccess = false;
          return;
        }

        try {
          // Format Instagram handle if it doesn't start with @
          const formattedInstagramHandle = this.instagramHandle.startsWith('@') 
            ? this.instagramHandle 
            : `@${this.instagramHandle}`;

          const { error } = await supabase
            .from('signups')
            .insert([
              {
                phone_number: this.phoneNumber,
                instagram_handle: formattedInstagramHandle
              }
            ]);

          if (error) throw error;

          this.message = 'Thank you for signing up!';
          this.isSuccess = true;
          this.resetForm();
        } catch (error) {
          console.error('Error:', error);
          this.message = 'An error occurred. Please try again.';
          this.isSuccess = false;
        }
      },
      resetForm() {
        this.phoneNumber = '';
        this.instagramHandle = '';
  
        // Optionally clear message after a few seconds
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
    },
  };
  </script>
  
  <style scoped>
  .signup-container {
    max-width: 500px;
    margin: 50px auto;
    padding: 30px;
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
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }
  
  input[type="tel"],
  input[type="text"] {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  input[type="tel"]:focus,
  input[type="text"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  small {
    display: block;
    margin-top: 5px;
    color: #777;
    font-size: 0.85em;
  }
  
  button {
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .success-message {
    color: green;
    text-align: center;
    margin-top: 15px;
  }
  
  .error-message {
    color: red;
    text-align: center;
    margin-top: 15px;
  }
  </style>