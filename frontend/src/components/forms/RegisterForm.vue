<template>
  <div>

    <div class="register--container" v-if="!$store.getters.getIsRegisterFormSent">
      <h3>{{ $t("registerTitle") }}</h3>
      <h3 id="sub--title">{{ $t("registerSubTitle") }}</h3>
      <form class="register--form" @submit.prevent="submitForm">
        <input
          name="username"
          v-model="inputs.userName"
          :maxlength="maxLength"
          type="text"
          :placeholder="$t('userName')"
        />
        <input
          name="firstname"
          v-model="inputs.firstName"
          :maxlength="maxLength"
          type="text"
          :placeholder="$t('firstName')"
          :class="{
            'text-red': inputs.firstName.length > 0 && !inputs.firstNameValid,
            'text-green': inputs.firstNameValid,
          }"
        />
        <input
          name="lastname"
          v-model="inputs.lastName"
          :maxlength="maxLength"
          type="text"
          :placeholder="$t('lastName')"
          :class="{
            'text-red': inputs.lastName.length > 0 && !inputs.lastNameValid,
            'text-green': inputs.lastNameValid,
          }"
        />
        <input
          name="email"
          v-model="inputs.email"
          type="email"
          placeholder="e-mail"
          :class="{
            'text-red': !validateEmail(inputs.email),
            'text-green': validateEmail(inputs.email),
          }"
        />
        <div class="password-input-wrapper">
          <input
            name="password"
            v-model="inputs.password"
            :class="{
              'text-red': inputs.password.length > 0 && !inputs.passwordValid,
              'text-green': inputs.passwordValid,
            }"
            :type="inputs.showPassword ? 'text' : 'password'"
            :placeholder="$t('password')"
          />
          <button
            type="button"
            class="password-toggle-btn"
            @click="inputs.showPassword = !inputs.showPassword"
            v-if="inputs.password.length > 0">
            {{ inputs.showPassword ? '👁️' : '👁️' }}
          </button>
        </div>

        <!-- Password strength indicator -->
        <div v-if="inputs.password.length > 0" class="password-strength-tooltip">
          <div class="strength-header">
            <span class="strength-label">Force du mot de passe :</span>
            <span
              class="strength-value"
              :class="passwordStrength.class">
              {{ passwordStrength.label }}
            </span>
          </div>
          <div class="strength-criteria">
            <div class="criterion" :class="{ valid: passwordCriteria.minLength }">
              Au moins 8 caractères
            </div>
            <div class="criterion" :class="{ valid: passwordCriteria.hasUppercase }">
              Une lettre majuscule
            </div>
            <div class="criterion" :class="{ valid: passwordCriteria.hasLowercase }">
              Une lettre minuscule
            </div>
            <div class="criterion" :class="{ valid: passwordCriteria.hasDigit }">
              Un chiffre
            </div>
            <div class="criterion" :class="{ valid: passwordCriteria.hasSpecial }">
              Un caractère spécial (@$!%*?&)
            </div>
            <div class="criterion" :class="{ valid: passwordCriteria.noCommonWords }">
              Pas de mots communs
            </div>
          </div>
        </div>

        <button

          class="send--registration--btn"
          type="submit"
          :class="{'disabled--btn': !isFormValid}"
          :disabled="!isFormValid">
          {{ $t("send") }}
        </button>
      </form>
    </div>

    <RegisterSuccess v-if="$store.getters.getServerMessage === 'registerSuccess'" />
    <RegisterErrorUserName v-if="$store.getters.getServerMessage === 'userExist'" />
    <RegisterErrorEmail v-if="$store.getters.getServerMessage === 'emailExist'"/>
    <RegisterErrorServer v-if="$store.getters.getServerMessage === 'serverError'" />

  </div>
</template>

<script>

import { ref, watch } from "vue";
import { validateEmail } from "@/libft/libft.js";
import { useStore } from "vuex";
import RegisterSuccess from "@/components/forms/RegisterSuccess.vue";
import RegisterErrorServer from "@/components/forms/RegisterErrorServer.vue";
import RegisterErrorUserName from "@/components/forms/RegisterErrorUserName.vue";
import RegisterErrorEmail from "@/components/forms/RegisterErrorEmail.vue";

export default {
  name: "RegisterForm",
  components: {
    RegisterSuccess,
    RegisterErrorServer,
    RegisterErrorUserName,
    RegisterErrorEmail,
  },

  setup() {
    const store = useStore();
    // store.commit('setRegisterFormSent', true);
    // store.commit('setServerResponseValue', 503);
    // store.commit('setServerMessage', 'serverError');
    // store.commit('setIsLoading', true);
    // store.commit('setIsLoading', false);

    const maxLength = 50;

    // List of common English words that should not be used in passwords
    const COMMON_WORDS = [
      'password', 'welcome', 'monkey', 'dragon', 'master', 'sunshine', 'princess',
      'qwerty', 'football', 'baseball', 'basketball', 'letmein', 'trustno',
      'superman', 'batman', 'michael', 'shadow', 'mustang', 'summer', 'love',
      'hello', 'admin', 'user', 'test', 'login', 'access', 'secret', 'computer',
      'internet', 'service', 'flower', 'purple', 'orange', 'starwars', 'killer',
      'freedom', 'whatever', 'cookie', 'thomas', 'pepper', 'hunter', 'ranger',
      'jordan', 'jennifer', 'london', 'matthew', 'yankees', 'thunder', 'ginger',
      'buster', 'dakota', 'cowboy', 'silver', 'viking', 'falcon', 'warrior',
      'phoenix', 'champion', 'panther', 'knight', 'diamond', 'golden', 'pepper'
    ];

    // Validate name (firstname or lastname)
    const validateName = (name) => {
      if (!name || typeof name !== 'string') return false;
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) return false;
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
      return nameRegex.test(trimmedName);
    };

    // Validate password complexity
    const validatePassword = (password) => {
      if (!password || typeof password !== 'string') return false;
      if (password.length < 8) return false;

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) return false;

      // Check if password contains common English words
      const passwordLower = password.toLowerCase();
      for (const word of COMMON_WORDS) {
        if (passwordLower.includes(word)) return false;
      }

      return true;
    };
    // Input Object --------------------------------
    let inputs = ref({
      userName: "",
      firstName: "",
      firstNameValid: false,
      lastName: "",
      lastNameValid: false,
      email: "",
      emailValid: false,
      password: "",
      passwordValid: false,
      showPassword: false,
      location: null,
    });

    // Get user location on component mount
    async function getLocation() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          // Créer la structure de données avec latitude et longitude
          const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          // Assigner la structure de données à inputs.value.location
          inputs.value.location = location;
        }, function(error) {
          console.error("Erreur de géolocalisation: " + error.message);
          inputs.value.location = null;
        }, {
          maximumAge: 60000,
          timeout: 5000,
          enableHighAccuracy: true
        });
      } else {
        console.error("Géolocalisation n'est pas prise en charge par ce navigateur.");
        inputs.value.location = null;
      }
    }

    // Call getLocation on mount
    getLocation();

    watch(
      inputs,
      (newValue) => {
        // Validate email
        if (newValue.email.length != 0) {
          if (!validateEmail(newValue.email)) {
            inputs.value.emailValid = false;
            inputs.value.password = "";
            inputs.value.passwordValid = false;
          } else {
            inputs.value.emailValid = true;
          }
        }

        // Validate first name
        inputs.value.firstNameValid = validateName(newValue.firstName);

        // Validate last name
        inputs.value.lastNameValid = validateName(newValue.lastName);

        // Validate password
        if (newValue.password.length != 0) {
          inputs.value.passwordValid = validatePassword(newValue.password);
        } else {
          inputs.value.passwordValid = false;
        }
      },
      { deep: true }
    );
    function submitForm(event) {
      event.preventDefault();
      // Récupérer les données du formulaire
      const formData = {
        userName: event.target.username.value,
        firstName: event.target.firstname.value,
        lastName: event.target.lastname.value,
        email: event.target.email.value,
        password: event.target.password.value,
        location: inputs.value.location
      };

      store.commit('setIsLoading', true);
      setTimeout(() => {
        store.dispatch('submitRegisterForm', formData);

        // Réinitialiser le formulaire en gardant la localisation
        Object.keys(inputs.value).forEach(key => {
          if (key !== 'location' && typeof inputs.value[key] === 'string') {
            inputs.value[key] = ""; // Réinitialiser à une chaîne vide
          } else if (key !== 'location' && typeof inputs.value[key] === 'boolean') {
            inputs.value[key] = false; // Réinitialiser les booléens
          }
        });
      }, 1000);
    }

    return {
      inputs,
      maxLength,
      validateEmail,
      validateName,
      validatePassword,
      submitForm,
      getLocation
    };
  },
  computed: {
  isFormValid() {
    const {
      emailValid,
      firstNameValid,
      lastNameValid,
      passwordValid,
      userName,
      firstName,
      lastName
    } = this.inputs;
    return (
      emailValid &&
      firstNameValid &&
      lastNameValid &&
      passwordValid &&
      userName &&
      firstName &&
      lastName
    );
  },

  passwordCriteria() {
    const password = this.inputs.password;
    const passwordLower = password.toLowerCase();

    // Check for common words
    const COMMON_WORDS = [
      'password', 'welcome', 'monkey', 'dragon', 'master', 'sunshine', 'princess',
      'qwerty', 'football', 'baseball', 'basketball', 'letmein', 'trustno',
      'superman', 'batman', 'michael', 'shadow', 'mustang', 'summer', 'love',
      'hello', 'admin', 'user', 'test', 'login', 'access', 'secret', 'computer',
      'internet', 'service', 'flower', 'purple', 'orange', 'starwars', 'killer',
      'freedom', 'whatever', 'cookie', 'thomas', 'pepper', 'hunter', 'ranger',
      'jordan', 'jennifer', 'london', 'matthew', 'yankees', 'thunder', 'ginger',
      'buster', 'dakota', 'cowboy', 'silver', 'viking', 'falcon', 'warrior',
      'phoenix', 'champion', 'panther', 'knight', 'diamond', 'golden', 'pepper'
    ];

    let hasCommonWord = false;
    for (const word of COMMON_WORDS) {
      if (passwordLower.includes(word)) {
        hasCommonWord = true;
        break;
      }
    }

    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
      noCommonWords: !hasCommonWord
    };
  },

  passwordStrength() {
    const criteria = this.passwordCriteria;
    const validCount = Object.values(criteria).filter(v => v).length;

    if (validCount === 6) {
      return { label: 'Fort', class: 'strength-strong' };
    } else if (validCount >= 4) {
      return { label: 'Moyen', class: 'strength-medium' };
    } else {
      return { label: 'Faible', class: 'strength-weak' };
    }
  }
},
};
</script>

<style lang="scss">
.password-input-wrapper {
  position: relative;
  width: 100%;

  .password-toggle-btn {
    position: absolute;
    top : 5px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--purple);
    font-size: 1.2rem;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
      transform: scale(1.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        transform: none;
      }
    }
  }
}

.password-strength-tooltip {
  width: 100%;
  padding: 12px;
  margin: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;

  .strength-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;

    .strength-label {
      font-weight: 600;
      color: #333;
    }

    .strength-value {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;

      &.strength-weak {
        color: #d32f2f;
        background-color: #ffebee;
      }

      &.strength-medium {
        color: #f57c00;
        background-color: #fff3e0;
      }

      &.strength-strong {
        color: #388e3c;
        background-color: #e8f5e9;
      }
    }
  }

  .strength-criteria {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .criterion {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      font-size: 0.8rem;
      transition: color 0.3s ease;

      &.valid {
        color: #388e3c;
        font-weight: 600;
      }
    }
  }
}

.register--container {
  // border: solid 1px red;

  // border: solid 1px red;
  width: auto;
  //   max-width: 700px;
  height: auto;
  padding: 10px 35px 45px 35px;
  border-radius: 15px;
  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
  cursor: default;
  user-select: none;

  h3 {
    margin: 10px 0 0 0;
    color: white;
    text-align: center;
    font-weight: 900;
    text-transform: capitalize;
    font-size: calc(min(3vw + 2vh, 70px));
    text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
  }

  #sub--title {
    font-weight: 600;
    font-size: calc(min(2vw + 1.6vh, 50px));
    margin-bottom: 10px;
  }

  .register--form {
    display: grid;
    justify-items: center;

    input {
      padding: 6px;
      margin: 10px;
      width: 100%;
      border: none;
      outline: none;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      // font-size: 1.2rem;
      background-color: var(--purple-placeholder-bg);
      color: var(--purple);
    }

    input::placeholder {
      color: white;
      font-weight: 400;
    }

    .password-input-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      margin-top : 10px;

      input {
        width: 100%;
        margin: 0;
      }

    }

    .send--registration--btn {
      margin-top: 25px;
      height: 45px;
      width: 180px;
      border-radius: 10px;
      border: none;
      color: white;
      font-weight: 600;
      font-size: 1.2rem;

      transition: all 0.4s;
      cursor: pointer;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.381);

      background-image: linear-gradient(to right, #ff24a7af, #8890feb2);

      &:hover {
        background-image: linear-gradient(to right, #ff24a78a, #8890fe90);
        /* Dégradé de couleur */
        color: var(--purple);
        transform: scale(1.1);
      }
    }

    .disabled--btn {
      cursor: default;

      &:hover {
        background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
        color: white;
        transform: none;
      }
    }

    @media (min-width: 800px) {
      width: 70%;
      margin: auto;
    }
  }

  .disabled--input {
    opacity: 0.5;
  }
}

// .disabled {
//     /* Vos styles pour le bouton désactivé */
//     opacity: 0.5; /* Par exemple, réduire l'opacité */
//     cursor: none; /* Changer le curseur */
// }
</style>
