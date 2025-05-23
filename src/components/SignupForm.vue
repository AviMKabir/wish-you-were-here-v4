<template>
  <div class="signup-container">
    <div class="progress-indicator">
      <div 
        v-for="step in totalSteps" 
        :key="step"
        class="progress-step"
        :class="{ 'active': currentStep >= step, 'completed': currentStep > step }"
      ></div>
    </div>
    
    <transition name="fade" mode="out-in">
      <!-- Step 1: Welcome -->
      <div v-if="currentStep === 1" key="welcome" class="step-container">
        <h2>Wish you were here?</h2>
        <p class="subheader">Join our exclusive waitlist to be the first to know when we have an opening!</p>
        <button @click="nextStep" class="primary-button">Get Started</button>
      </div>
      
      <!-- Step 2: Phone Number -->
      <div v-else-if="currentStep === 2" key="phone" class="step-container">
        <h2>How can we reach you?</h2>
        <p class="subheader">We'll text you when we have an opening</p>
        <div class="form-group">
          <input
            type="tel"
            v-model="phoneNumber"
            class="phone-input"
            placeholder="(123) 456-7890"
            required
          />
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button type="button" @click="validatePhone" :disabled="!phoneNumber.trim()" class="primary-button">
            Continue
          </button>
        </div>
      </div>
      
      <!-- Step 3: Instagram Handle -->
      <div v-else-if="currentStep === 3" key="instagram" class="step-container">
        <h2>What's your Instagram?</h2>
        <p class="subheader">So we can get to know you better (optional)</p>
        <div class="form-group">
          <input
            type="text"
            v-model="instagramHandle"
            placeholder="@yourhandle"
            @keyup.enter="validateInstagram"
          />
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button type="button" @click="submitForm" class="primary-button">
            {{ instagramHandle.trim() ? 'Submit' : 'Skip' }}
          </button>
        </div>
      </div>
      
      <!-- Step 4: Success -->
      <div v-else-if="currentStep === 4" key="success" class="step-container success-container">
        <div class="success-icon">✓</div>
        <h2>You're on the list! 🎉</h2>
        <p class="subheader">We'll text you at {{ phoneNumber }} as soon as we have an opening.</p>
        <p class="success-message">Thanks for joining our community!</p>
        <p class="subheader">Share with friends who might be interested!</p>
        <button @click="resetForm" class="primary-button">Done</button>
      </div>
    </transition>
    
    <div v-if="currentStep < 4" class="admin-link">
      <a href="#/admin" @click.prevent="router.push('/admin')">Admin</a>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const phoneNumber = ref('');
const instagramHandle = ref('');
const currentStep = ref(1);
const totalSteps = 4;
const message = ref('');
const isSuccess = ref(false);

const validatePhone = () => {
  // Remove all non-digit characters
  const rawPhoneNumber = phoneNumber.value.replace(/\D/g, '');
  
  // Check if the phone number is at least 10 digits
  if (rawPhoneNumber.length < 10) {
    alert('Please enter a valid 10-digit phone number');
    return;
  }
  
  // Format the phone number with US country code by default if it's 10 digits
  if (rawPhoneNumber.length === 10) {
    phoneNumber.value = `(${rawPhoneNumber.slice(0,3)}) ${rawPhoneNumber.slice(3,6)}-${rawPhoneNumber.slice(6)}`;
  }
  
  nextStep();
};

const validateInstagram = () => {
  // Remove @ if user included it
  if (instagramHandle.value.startsWith('@')) {
    instagramHandle.value = instagramHandle.value.slice(1);
  }
  nextStep();
};

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const resetForm = () => {
  phoneNumber.value = '';
  instagramHandle.value = '';
  currentStep.value = 1;
};

const submitForm = async () => {
  console.log('Form submitted with values:', {
    phoneNumber: phoneNumber.value,
    instagramHandle: instagramHandle.value
  });

  if (!phoneNumber.value || !instagramHandle.value.trim()) {
    console.log('Validation failed - missing fields');
    message.value = 'Please fill in all fields';
    isSuccess.value = false;
    return;
  }

  // Remove all non-digit characters from the phone number
  const rawPhoneNumber = phoneNumber.value.replace(/[^0-9]/g, '');
  console.log('Raw phone number:', rawPhoneNumber);
  
  // Check if the phone number is at least 10 digits
  if (rawPhoneNumber.length < 10) {
    console.log('Validation failed - phone number too short');
    message.value = 'Please enter a valid 10-digit phone number';
    isSuccess.value = false;
    return;
  }

  // Format the phone number with US country code by default
  const formattedPhoneNumber = rawPhoneNumber.length === 10 
    ? `+1${rawPhoneNumber}` 
    : `+${rawPhoneNumber}`;
  
  console.log('Formatted phone number:', formattedPhoneNumber);

  // Clean up Instagram handle (remove @ if included)
  const cleanInstagramHandle = instagramHandle.value.replace(/^@/, '');
  console.log('Cleaned Instagram handle:', cleanInstagramHandle);

  try {
    const { data, error } = await supabase
      .from('signups')
      .insert([
        { 
          phone_number: formattedPhoneNumber,
          instagram_handle: cleanInstagramHandle ? `@${cleanInstagramHandle}` : null
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
      message.value = 'Error submitting form. Please try again.';
      isSuccess.value = false;
      return;
    }

    // Success! Move to the success step
    console.log('Data inserted successfully:', data);
    message.value = 'Thanks for signing up! We\'ll be in touch soon.';
    isSuccess.value = true;
    
    // Navigate to the success step instead of resetting
    currentStep.value = 4;
    
  } catch (error) {
    console.error('Error:', error);
    message.value = 'An unexpected error occurred. Please try again.';
    isSuccess.value = false;
  }
};

defineOptions({
  name: 'SignupForm',
});
</script>
  
  <style scoped>
  .signup-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
  }
  
  .progress-indicator {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 2.5rem;
  }
  
  .progress-step {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #e0e0e0;
    transition: all 0.3s ease;
  }
  
  .progress-step.active {
    background-color: var(--primary-color);
    transform: scale(1.1);
  }
  
  .progress-step.completed {
    background-color: #4CAF50;
  }
  
  .step-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  .subheader {
    color: #666;
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
    line-height: 1.5;
  }
  
  .form-group {
    margin-bottom: 2rem;
    width: 100%;
  }
  
  .phone-input, input[type="text"] {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .phone-input:focus, input[type="text"]:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
    outline: none;
  }
  
  .form-group small {
    display: block;
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.8rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .primary-button {
    flex: 1;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .primary-button:not(:disabled):hover {
    background-color: #0069d9;
    transform: translateY(-1px);
  }
  
  .secondary-button {
    flex: 1;
    background-color: #f5f5f7;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .secondary-button:hover {
    background-color: rgba(0, 122, 255, 0.05);
  }
  
  .success-container {
    text-align: center;
    padding: 2rem 0;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    background-color: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin: 0 auto 1.5rem;
    animation: bounceIn 0.6s;
  }
  
  .success-message {
    color: #4CAF50;
    font-weight: 600;
    margin: 1rem 0 2rem;
  }
  
  .admin-link {
    margin-top: 2rem;
    text-align: center;
  }
  
  .admin-link a {
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
  }
  
  .admin-link a:hover {
    text-decoration: underline;
  }
  
  /* Animations */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }
  
  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  .signup-container {
    max-width: 500px;
    width: 95%;
    margin: 20px auto 40px;
    padding: 25px 15px;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    min-height: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  
  @media (max-width: 480px) {
    .signup-container {
      width: 92%;
      padding: 20px 12px;
    }
  }
  
  h2 {
    text-align: center;
    margin-bottom: 10px;
    color: #333;
  }
  
  .subheader {
    text-align: center;
    color: #666;
    margin: 0 auto 25px;
    padding: 0 10px;
    font-size: clamp(0.8em, 4vw, 1em);
    line-height: 1.4;
    white-space: normal;
    word-wrap: break-word;
    box-sizing: border-box;
    width: 100%;
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
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
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
    color: #ff4444;
    margin-top: 10px;
  }
  
  .admin-link {
    margin-top: 20px;
    text-align: center;
  }
  
  .admin-link a {
    color: #666;
    text-decoration: none;
    font-size: 0.9em;
    transition: color 0.2s;
  }
  
  .admin-link a:hover {
    color: #333;
    text-decoration: underline;
  }
  </style>