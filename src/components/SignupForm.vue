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
        <h2 class="title-case">Wish You Were Here?</h2>
        <p class="subheader">Join our exclusive waitlist to be the first to know when we have an opening!</p>
        <button @click="nextStep" class="primary-button">Get Started</button>
      </div>
      
      <!-- Step 2: Phone Number -->
      <div v-else-if="currentStep === 2" key="phone" class="step-container">
        <h2 class="single-line">How can we reach you?</h2>
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
        <h2 class="title-case">What's Your Instagram?</h2>
        <p class="subheader">So we can get to know you better</p>
        <div class="form-group">
          <input
            type="text"
            v-model="instagramHandle"
            placeholder="@yourhandle"
            @keyup.enter="nextStep"
          />
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button type="button" @click="nextStep" class="primary-button">
            Continue
          </button>
        </div>
      </div>
      
      <!-- Step 4: Day Selection -->
      <div v-else-if="currentStep === 4" key="day-selection" class="step-container">
        <h2>Select Available Days</h2>
        <p class="subheader">Choose all days that work for you (next 28 days)</p>
        <div class="calendar-grid">
          <button 
            v-for="day in dayOptions" 
            :key="day.value"
            @click="toggleDay(day.value)"
            :class="{'selected': selectedDays.includes(day.value)}"
            class="day-button"
          >
            <span class="day-name">{{ day.label.split(',')[0] }}</span>
            <span class="day-date">{{ day.label.split(' ')[2] }}</span>
            <span class="month">{{ day.label.split(' ')[1] }}</span>
          </button>
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button 
            type="button" 
            @click="nextStep" 
            class="primary-button"
            :disabled="selectedDays.length === 0"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 5: Time Selection -->
      <div v-else-if="currentStep === 5" key="time-selection" class="step-container">
        <h2>Select Available Times</h2>
        <p class="subheader">Choose all time slots that work for you</p>
        <div class="time-grid">
          <button 
            v-for="time in timeOptions" 
            :key="time.value"
            @click="toggleTime(time.value)"
            :class="{'selected': selectedTimes.includes(time.value)}"
            class="time-button"
          >
            {{ time.label }}
          </button>
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button 
            type="button" 
            @click="nextStep" 
            class="primary-button"
            :disabled="selectedTimes.length === 0"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 6: Food Preference -->
      <div v-else-if="currentStep === 6" key="food-preference" class="step-container">
        <h2>What's your favorite type of food?</h2>
        <p class="subheader">Choose one or more options</p>
        <div class="preference-buttons">
          <button 
            v-for="option in foodOptions" 
            :key="option.value"
            @click="toggleFoodPreference(option.value)"
            :class="{'selected': selectedFoods.includes(option.value)}"
            class="preference-button"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="button-group">
          <button type="button" @click="prevStep" class="secondary-button">Back</button>
          <button 
            type="button" 
            @click="submitForm" 
            class="primary-button"
            :disabled="selectedFoods.length === 0"
          >
            Submit
          </button>
        </div>
      </div>
      
      <!-- Success Step -->
      <div v-else-if="currentStep === totalSteps" key="success" class="step-container success-container">
        <div class="success-icon">✓</div>
        <h2 class="single-line">You're on the list! 🎉</h2>
        <p class="subheader">We'll text you at {{ phoneNumber }} as soon as we have an opening.</p>
        <p class="success-message">Thanks for joining our community!</p>
        <p class="subheader">Share with friends who might be interested!</p>
        <div class="share-buttons">
          <button @click="shareLink" class="share-button primary-button">
            <span v-if="!isCopied">Share Link</span>
            <span v-else>Copied! ✓</span>
          </button>
          <a 
            :href="`sms:?&body=Check out this cool spot! ${windowLocation}`" 
            class="share-button secondary-button"
          >
            Text a Friend
          </a>
        </div>
        
        <div class="social-follow">
          <p>Follow <a href="https://instagram.com/wishyouwerehere360" target="_blank" class="instagram-link">@wishyouwerehere360</a> & <a href="https://instagram.com/orlandofoodienews" target="_blank" class="instagram-link">@orlandofoodienews</a></p>
        </div>
      </div>
    </transition>
    
    <div v-if="currentStep < 7" class="admin-link">
      <a href="#/admin" @click.prevent="router.push('/admin')">Admin</a>
      <div class="credit">
        <p>by <a href="https://instagram.com/orlandofoodienews" target="_blank" class="instagram-link">@orlandofoodienews</a></p>
      </div>
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
const selectedDay = ref('');
const selectedTime = ref('');
const selectedDays = ref([]);
const selectedTimes = ref([]);
const selectedFoods = ref([]);
const currentStep = ref(1);
const totalSteps = 7;

// Generate next 28 days
const generateNext28Days = () => {
  const days = [];
  const today = new Date();
  // Set to start of day to avoid timezone issues
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate();
    
    // Format date as YYYY-MM-DD without time
    const formattedDate = date.toISOString().split('T')[0];
    
    days.push({
      value: formattedDate, // YYYY-MM-DD format
      label: `${dayName}, ${month} ${dayNum}`,
      date: formattedDate
    });
  }
  
  return days;
};

// Generate time slots from 8 AM to 10 PM
const generateTimeSlots = () => {
  const times = [];
  for (let hour = 8; hour <= 22; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const timeString = `${displayHour}:00 ${period}`;
    
    times.push({
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: timeString
    });
  }
  return times;
};

const dayOptions = generateNext28Days();
const timeOptions = generateTimeSlots();

const foodOptions = [
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'indian', label: 'Indian' },
  { value: 'american', label: 'American' },
  { value: 'thai', label: 'Thai' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'anything', label: 'Anything!' }
];
const message = ref('');
const isSuccess = ref(false);
const isSubmitting = ref(false);
const isCopied = ref(false);
const windowLocation = typeof window !== 'undefined' ? window.location.href : '';

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
  selectedDay.value = '';
  selectedTime.value = '';
  selectedFoods.value = [];
  currentStep.value = 1;
};

const shareLink = async () => {
  try {
    if (navigator.share) {
      // Use Web Share API if available (mobile devices)
      await navigator.share({
        title: 'Check this out!',
        text: 'Join me at this amazing place!',
        url: windowLocation,
      });
    } else {
      // Fallback for desktop
      await navigator.clipboard.writeText(windowLocation);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    }
  } catch (err) {
    console.error('Error sharing:', err);
    // Fallback to copy to clipboard if sharing fails
    try {
      await navigator.clipboard.writeText(windowLocation);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (e) {
      console.error('Error copying to clipboard:', e);
      alert('Could not copy link. Please copy it manually: ' + windowLocation);
    }
  }
};

const toggleFoodPreference = (food) => {
  const index = selectedFoods.value.indexOf(food);
  if (index === -1) {
    selectedFoods.value.push(food);
  } else {
    selectedFoods.value.splice(index, 1);
  }
};

const toggleDay = (day) => {
  const index = selectedDays.value.indexOf(day);
  if (index === -1) {
    selectedDays.value.push(day);
  } else {
    selectedDays.value.splice(index, 1);
  }
};

const toggleTime = (time) => {
  const index = selectedTimes.value.indexOf(time);
  if (index === -1) {
    selectedTimes.value.push(time);
  } else {
    selectedTimes.value.splice(index, 1);
  }
};

const submitForm = async () => {
  try {
    // Format the data to send to Supabase
    const formData = {
      phone_number: phoneNumber.value.replace(/[^0-9]/g, ''), // Clean phone number
      instagram_handle: instagramHandle.value.replace(/^@/, ''), // Remove @ if included
      selected_days: selectedDays.value,
      selected_times: selectedTimes.value,
      food_preferences: selectedFoods.value,
      created_at: new Date().toISOString()
    };
    
    console.log('Submitting form data:', formData);
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('signups')
      .insert([formData])
      .select();
    
    if (error) {
      console.error('Error saving to Supabase:', error);
      alert('There was an error submitting your information. Please try again.');
      return;
    }
    
    console.log('Successfully saved to Supabase:', data);
    nextStep();
    
  } catch (error) {
    console.error('Error in submitForm:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
};
</script>
  
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');

:root {
  --primary-color: #0f4c1c; /* Even darker green */
  --primary-light: #3d6e3d;
  --primary-dark: #002200;
  --secondary-color: #e8f5e9;
  --accent-color: #6baa6e;
  --dark-color: #0a2e0d;
  --light-color: #f8f9fa;
  --text-color: #263238;
  --text-light: #6c757d;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  color: var(--dark-color);
  line-height: 1.2;
  text-transform: capitalize;
}

.title-case, .single-line {
  white-space: nowrap;
  font-size: 1.7rem;
  line-height: 1.3;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .title-case {
    white-space: normal;
    font-size: 1.8rem;
    line-height: 1.2;
  }
}
  /* Progress Indicator Styles */
  .progress-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin: 2rem 0 3rem;
    padding: 0 1rem;
  }
  
  .progress-step {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #e0e0e0;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    font-size: 0;
  }
  
  .progress-step.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    transform: scale(1.1);
  }
  
  .progress-step.completed {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    font-size: 12px;
  }
  
  .progress-step.completed::after {
    content: '✓';
    display: block;
    color: white;
    font-size: 12px;
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin: 0 0 2rem;
    padding: 0 0.25rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin: 0 0 2rem;
    padding: 0 0.5rem;
  }
  
  .day-button {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid #e9ecef;
    background: white;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.5rem 0.25rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-color);
    min-width: 0;
    overflow: hidden;
  }
  
  .day-button:hover {
    border-color: #888;
  }
  
  .day-button.selected {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  }
  
  .day-name {
    font-size: 0.8em;
    font-weight: 600;
  }
  
  .day-date {
    font-size: 1.1em;
    font-weight: bold;
    margin: 2px 0;
  }
  
  .month {
    font-size: 0.7em;
    opacity: 0.8;
  }
  
  .time-button {
    padding: 0.75rem 0.5rem;
    border: 2px solid #e9ecef;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    color: var(--text-color);
  }
  
  .time-button:hover {
    border-color: #888;
  }
  
  .time-button.selected {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 2rem 0 0;
    padding: 0;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .button-group .secondary-button {
    order: 2;
    margin-top: 0.5rem;
  }
  
  .button-group .primary-button {
    order: 1;
  }
  
  .preference-button {
    padding: 1.25rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    color: #1f2937; /* Dark gray text for better contrast */
    font-size: 1rem;
    font-weight: 500; /* Slightly bolder text */
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    margin: 0.25rem 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .preference-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .preference-button.selected {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  }

  .share-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;
    width: 100%;
  }

  .share-button {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .share-button.secondary-button {
    background-color: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
  }

  .share-button.secondary-button:hover {
    background-color: #e2e8f0;
  }

  .primary-button {
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
    margin: 0 auto;
    min-width: 180px;
    text-align: center;
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
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
  }
  
  .secondary-button:hover {
    background-color: rgba(0, 122, 255, 0.05);
  }
  
  .success-container {
    text-align: center;
    padding: 2rem 0;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .success-icon {
    width: 100px;
    height: 100px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin: 0 auto 2rem;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .step-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0.5rem 0.5rem 2.5rem;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
  
  .credit {
    margin-top: 0.5rem;
  }
  
  .credit p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
  
  .instagram-link {
    color: #8a3ab9;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .instagram-link:hover {
    color: #6a2c8c;
    text-decoration: underline;
  }
  
  .social-follow {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .social-follow p {
    color: #666;
    font-size: 0.95rem;
    margin: 0;
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
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
    background-color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    .signup-container {
      padding: 0 1rem 3rem;
    }
    
    .step-container {
      padding: 1.5rem 0 3rem;
    }
    
    h2 {
      font-size: 1.8rem;
      margin: 1rem 0 0.75rem;
    }
    
    .subheader {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .button-group {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .primary-button,
    .secondary-button {
      padding: 0.9rem 1.5rem;
      font-size: 1rem;
    }
  }
  
  h2 {
    text-align: center;
    margin: 1.5rem 0 1rem;
    color: var(--dark-color);
    font-size: 2.2rem;
    letter-spacing: -0.5px;
  }
  
  .subheader {
    text-align: center;
    color: var(--text-light);
    margin: 1rem auto 2rem;
    padding: 0 0.5rem;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 500px;
    font-weight: 400;
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
    padding: 1rem 1.25rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
  }
  
  input[type="tel"]:focus,
  input[type="text"]:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
    background-color: #fff;
  }
  
  small {
    display: block;
    margin-top: 5px;
    color: #777;
    font-size: 0.85em;
  }
  
  button {
    width: 100%;
    padding: 1rem 2rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
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