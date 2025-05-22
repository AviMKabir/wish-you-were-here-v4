<template>
    <div class="signup-container">
      <h2>Wish you were here?</h2>
      <p class="subheader">Sign up to get notified when we have an opening!</p>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="phone">Phone Number:</label>
          <VueTelInput
            v-model="phoneNumber"
            :preferred-countries="['us', 'gb', 'ca', 'au', 'nz', 'in']"
            defaultCountry="US"
            mode="national"
            class="phone-input"
            :dropdown-options="{
              showDialCodeInList: true,
              showDialCodeInSelection: true,
              showFlags: true,
              showSearchBox: true
            }"
            :input-options="{
              showDialCode: false,
              placeholder: 'Enter phone number'
            }"
            @validate="onValidate"
            required
          />
          <small>We'll text you!</small>
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
        
        <div class="admin-link">
          <a href="#/admin" @click.prevent="router.push('/admin')">Admin</a>
        </div>
      </form>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { VueTelInput } from 'vue3-tel-input';
import 'vue3-tel-input/dist/vue3-tel-input.css';

const router = useRouter();
const phoneNumber = ref('');
const instagramHandle = ref('');
const message = ref('');
const isSuccess = ref(false);
const selectedCountry = ref('US');

const getCountryCode = (countryCode) => {
  // Map of country codes to their respective country codes
  const countryCodeMap = {
    'US': '1',
    'GB': '44',
    'CA': '1',
    'AU': '61',
    'NZ': '64',
    'IN': '91',
  };
  return countryCodeMap[countryCode] || '1'; // Default to US/Canada code if not found
};

const onValidate = (phone, validation = {}) => {
  const { country } = validation;
  if (country && country.iso2) {
    selectedCountry.value = country.iso2;
  }
};

const resetForm = () => {
  phoneNumber.value = '';
  instagramHandle.value = '';
};

const submitForm = async () => {
  if (!phoneNumber.value || !instagramHandle.value.trim()) {
    message.value = 'Please fill in all fields';
    isSuccess.value = false;
    return;
  }

  // Remove all non-digit characters from the phone number
  const rawPhoneNumber = phoneNumber.value.replace(/[^0-9]/g, '');
  
  // Check if the phone number is at least 10 digits (US number without country code)
  if (rawPhoneNumber.length < 10) {
    message.value = 'Please enter a valid 10-digit phone number';
    isSuccess.value = false;
    return;
  }

  // Format the phone number with country code
  let formattedPhoneNumber;
  
  // If the number starts with a country code (e.g., 1 for US/Canada), use as is
  if (rawPhoneNumber.length === 11 && rawPhoneNumber.startsWith('1')) {
    formattedPhoneNumber = `+${rawPhoneNumber}`;
  } 
  // If it's a 10-digit number, assume it's a US number and add +1
  else if (rawPhoneNumber.length === 10) {
    formattedPhoneNumber = `+1${rawPhoneNumber}`;
  }
  // For other cases, use the country code from the selected country
  else {
    const countryCode = getCountryCode(selectedCountry.value);
    formattedPhoneNumber = `+${countryCode}${rawPhoneNumber}`;
  }

  // Clean up Instagram handle (remove @ if included)
  const cleanInstagramHandle = instagramHandle.value.replace(/^@/, '');

  try {
    const { data, error } = await supabase
      .from('waitlist')
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

    // Success!
    console.log('Data inserted successfully:', data);
    message.value = 'Thanks for signing up! We\'ll be in touch soon.';
    isSuccess.value = true;
    
    // Reset form after successful submission
    resetForm();
    
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
  .phone-input {
    width: 100%;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }

  .vue-tel-input {
    border-radius: 4px !important;
    border: 1px solid #e0e0e0 !important;
    transition: all 0.2s ease;
    height: 40px;
    background: white;
    width: 100%;
    box-sizing: border-box;
  }
  
  .vue-tel-input:focus-within {
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 1px var(--primary-color);
  }

  /* Country dropdown */
  .vue-tel-input .vti__dropdown {
    padding: 0 8px;
    border-right: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
  }

  .vue-tel-input .vti__dropdown:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .vue-tel-input .vti__dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 1000;
    list-style: none;
    padding: 8px 0;
    margin: 0;
    width: 100%;
    max-height: 240px;
    overflow-y: auto;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .vue-tel-input .vti__dropdown-list.below {
    top: 100%;
    bottom: auto;
  }

  .vue-tel-input .vti__dropdown-list.above {
    top: auto;
    bottom: 100%;
  }

  .vue-tel-input .vti__dropdown-arrow {
    margin-left: 4px;
    transition: transform 0.2s ease;
  }

  .vue-tel-input.vti--dropdown-open .vti__dropdown-arrow {
    transform: rotate(180deg);
  }

  /* Country list items */
  .vue-tel-input .vti__dropdown-list li {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .vue-tel-input .vti__dropdown-list li:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  .vue-tel-input .vti__dropdown-list li.highlighted {
    background-color: rgba(0, 122, 255, 0.1);
  }

  /* Input field */
  .vue-tel-input input {
    border: none !important;
    border-radius: 20px !important;
    padding: 0 16px !important;
    height: 100% !important;
    font-size: 16px !important;
    box-shadow: none !important;
    outline: none !important;
  }

  .signup-container {
    max-width: 500px;
    width: 90%;
    margin: 20px auto 40px;
    padding: 25px 20px;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    min-height: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
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