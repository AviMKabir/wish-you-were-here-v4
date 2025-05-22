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
      </form>
    </div>
  </template>
  
  <script>
  import { VueTelInput } from 'vue3-tel-input';
  import 'vue3-tel-input/dist/vue3-tel-input.css';
  import { supabase } from '../supabase'

export default {
    name: 'SignupForm',
    components: { VueTelInput },
    data() {
      return {
        phoneNumber: '',
        instagramHandle: '',
        message: '',
        isSuccess: false,
        selectedCountry: 'US',
        formattedPhone: ''
      };
    },
    methods: {
      getCountryCode(countryCode) {
        // Add more country codes as needed
        const countryCodes = {
          'us': '1',
          'gb': '44',
          'ca': '1',
          'au': '61',
          'nz': '64',
          'in': '91'
        };
        return countryCodes[countryCode.toLowerCase()] || '1'; // Default to US
      },
      
      onValidate(phone, validation = {}) {
        const { country } = validation;
        if (country && country.iso2) {
          this.selectedCountry = country.iso2;
        } else if (!this.selectedCountry) {
          this.selectedCountry = 'US'; // Default to US if no country is selected
        }
        
        // Handle case where phone might be an object
        const phoneStr = phone && typeof phone === 'object' 
          ? (phone.number || phone.nationalNumber || '') 
          : String(phone || '');
          
        this.formattedPhone = phoneStr ? phoneStr.replace(/[^0-9+]/g, '') : '';
      },
      async submitForm() {
        console.log('Form submitted with values:', {
          phoneNumber: this.phoneNumber,
          instagramHandle: this.instagramHandle,
          selectedCountry: this.selectedCountry,
          formattedPhone: this.formattedPhone
        });

        // Basic validation
        if (!this.instagramHandle || !this.instagramHandle.trim()) {
          this.message = 'Please enter your Instagram handle';
          this.isSuccess = false;
          console.log('Validation failed - missing Instagram handle');
          return;
        }
        
        const instagramHandle = this.instagramHandle.trim();
        
        // Get the raw phone number from the formatted phone or directly from input
        let rawPhoneNumber = '';
        if (this.formattedPhone) {
          rawPhoneNumber = this.formattedPhone.replace(/[^0-9]/g, '');
        } else if (this.phoneNumber && typeof this.phoneNumber === 'object') {
          // Handle case where phoneNumber is an object (from vue-tel-input)
          const num = this.phoneNumber.number || this.phoneNumber.nationalNumber || '';
          rawPhoneNumber = num.replace(/[^0-9]/g, '');
        } else if (typeof this.phoneNumber === 'string') {
          rawPhoneNumber = this.phoneNumber.replace(/[^0-9]/g, '');
        }
        
        console.log('Raw phone number:', rawPhoneNumber);
        
        if (rawPhoneNumber.length < 10) {
          this.message = 'Please enter a valid 10-digit phone number';
          this.isSuccess = false;
          console.log('Validation failed - invalid phone number');
          return;
        }

        try {
          // Format Instagram handle if it doesn't start with @
          const formattedInstagramHandle = instagramHandle.startsWith('@') 
            ? instagramHandle 
            : `@${instagramHandle}`;

          // Format phone number with country code if not already included
          let phoneNumber = rawPhoneNumber;
          const countryCode = this.getCountryCode(this.selectedCountry);
          
          // Remove any existing country code to prevent duplication
          if (phoneNumber.startsWith(countryCode)) {
            phoneNumber = phoneNumber.substring(countryCode.length);
          } else if (phoneNumber.startsWith(`1${countryCode}`)) {
            // Handle case where US/Canada might have an extra 1
            phoneNumber = phoneNumber.substring(countryCode.length + 1);
          }
          
          // Add the country code
          phoneNumber = `+${countryCode}${phoneNumber}`;
          
          console.log('Submitting with:', {
            phoneNumber,
            instagramHandle: formattedInstagramHandle,
            countryCode: this.selectedCountry
          });

          const { data, error } = await supabase
            .from('signups')
            .insert([
              {
                phone_number: phoneNumber,
                instagram_handle: formattedInstagramHandle,
                created_at: new Date().toISOString()
              }
            ])
            .select();

          console.log('Supabase response:', { data, error });

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          this.message = 'Thank you for signing up!';
          this.isSuccess = true;
          this.resetForm();
        } catch (error) {
          console.error('Error in form submission:', error);
          this.message = error.message || 'An error occurred. Please try again.';
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
    margin: 20px auto 40px;
    padding: 30px 25px;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    min-height: auto;
    display: flex;
    flex-direction: column;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 10px;
    color: #333;
  }
  
  .subheader {
    text-align: center;
    color: #666;
    margin-bottom: 25px;
    font-size: 0.95em;
    white-space: nowrap;
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
    color: red;
    text-align: center;
    margin-top: 15px;
  }
  </style>