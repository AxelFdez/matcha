<template>
  <div class="resetPassword--container">
    <h3>{{ $t("resetPassword") }}</h3>
    <form class="resetPassword--form" @submit.prevent="submitForm">
      <div class="password-input-wrapper">
        <input
          name="newPassword"
          v-model="inputs.newPassword"
          required
          :maxlength="maxLength"
          :type="inputs.showPassword ? 'text' : 'password'"
          :placeholder="$t('password')"
          :class="{
            'text-red': inputs.newPassword.length > 0 && !inputs.passwordValid,
            'text-green': inputs.passwordValid,
          }"
        />
        <button
          type="button"
          class="password-toggle-btn"
          @click="inputs.showPassword = !inputs.showPassword"
          v-if="inputs.newPassword.length > 0"
        >
          {{ inputs.showPassword ? "👁️" : "👁️" }}
        </button>
      </div>

      <!-- Password strength indicator -->
      <div v-if="inputs.newPassword.length > 0" class="password-strength-tooltip">
        <div class="strength-header">
          <span class="strength-label">Force du mot de passe :</span>
          <span class="strength-value" :class="passwordStrength.class">
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
          <div class="criterion" :class="{ valid: passwordCriteria.hasDigit }">Un chiffre</div>
          <div class="criterion" :class="{ valid: passwordCriteria.hasSpecial }">
            Un caractère spécial (@$!%*?&)
          </div>
          <div class="criterion" :class="{ valid: passwordCriteria.noCommonWords }">
            Pas de mots communs
          </div>
        </div>
      </div>

      <input
        name="confirmPassword"
        type="password"
        :placeholder="$t('passwordConfirm')"
        v-model="inputs.confirmPassword"
        required
        :maxlength="maxLength"
        :class="{
          'text-red': inputs.confirmPassword.length > 0 && !inputs.passwordMatch,
          'text-green': inputs.passwordMatch,
        }"
      />
      <button
        :class="{ 'disabled--btn': !isFormValid }"
        :disabled="!isFormValid"
        class="submit--btn"
        type="submit"
      >
        {{ $t("resetPassword") }}
      </button>
    </form>
    <div v-if="passwordResetAction.type === 'success'" class="password--reset--msg--success">
      <p>{{ passwordResetAction.message }}</p>
    </div>
    <div v-if="passwordResetAction.type === 'warning'" class="password--reset--msg--error">
      <p>{{ passwordResetAction.message }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { fetchData } from "@/config/api";
import { useRoute } from "vue-router";

export default {
  name: "ResetPassword",
  // components: {
  // TextButton,
  // },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const maxLength = 50;

    // List of common English words that should not be used in passwords
    const COMMON_WORDS = [
      "password",
      "welcome",
      "monkey",
      "dragon",
      "master",
      "sunshine",
      "princess",
      "qwerty",
      "football",
      "baseball",
      "basketball",
      "letmein",
      "trustno",
      "superman",
      "batman",
      "michael",
      "shadow",
      "mustang",
      "summer",
      "love",
      "hello",
      "admin",
      "user",
      "test",
      "login",
      "access",
      "secret",
      "computer",
      "internet",
      "service",
      "flower",
      "purple",
      "orange",
      "starwars",
      "killer",
      "freedom",
      "whatever",
      "cookie",
      "thomas",
      "pepper",
      "hunter",
      "ranger",
      "jordan",
      "jennifer",
      "london",
      "matthew",
      "yankees",
      "thunder",
      "ginger",
      "buster",
      "dakota",
      "cowboy",
      "silver",
      "viking",
      "falcon",
      "warrior",
      "phoenix",
      "champion",
      "panther",
      "knight",
      "diamond",
      "golden",
      "pepper",
    ];

    // Validate password complexity
    const validatePassword = (password) => {
      if (!password || typeof password !== "string") return false;
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

    const inputs = ref({
      newPassword: "",
      confirmPassword: "",
      passwordValid: false,
      passwordMatch: false,
      showPassword: false,
    });

    // Password criteria computed
    const passwordCriteria = computed(() => {
      const password = inputs.value.newPassword || "";

      if (!password) {
        return {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasDigit: false,
          hasSpecial: false,
          noCommonWords: false,
        };
      }

      const passwordLower = password.toLowerCase();

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
        noCommonWords: !hasCommonWord,
      };
    });

    // Password strength computed
    const passwordStrength = computed(() => {
      const criteria = passwordCriteria.value;
      const validCount = Object.values(criteria).filter((v) => v).length;

      if (validCount === 6) {
        return { label: "Fort", class: "strength-strong" };
      } else if (validCount >= 4) {
        return { label: "Moyen", class: "strength-medium" };
      } else {
        return { label: "Faible", class: "strength-weak" };
      }
    });

    // Update validation flags
    const updateValidation = () => {
      inputs.value.passwordValid = validatePassword(inputs.value.newPassword);
      inputs.value.passwordMatch =
        inputs.value.newPassword === inputs.value.confirmPassword &&
        inputs.value.newPassword.length > 0;
    };

    // Watch inputs for validation
    watch(
      inputs,
      () => {
        updateValidation();
      },
      { deep: true }
    );

    // Définir isFormValid comme une propriété computed pour une réactivité optimale
    const isFormValid = computed(() => {
      return (
        inputs.value.passwordValid &&
        inputs.value.passwordMatch &&
        inputs.value.newPassword.length > 0 &&
        inputs.value.confirmPassword.length > 0
      );
    });

    // Propriété pour afficher un message de succès
    const passwordResetAction = ref({ type: null, message: "" });

    // Méthode asynchrone pour soumettre le formulaire
    async function submitForm(event) {
      event.preventDefault();
      store.commit("setIsLoading", true);
      const token = route.query.token;
      const email = route.query.email;
      const data = {
        password: inputs.value.newPassword,
        confirmPassword: inputs.value.confirmPassword,
        token: token,
        email: email,
      };
      try {
        const { response, data: responseData } = await fetchData("/resetPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        // console.log("Réponse du serveur:", responseData);

        // Afficher un message de succès ou d'erreur
        if (responseData && responseData.alert) {
          passwordResetAction.value = responseData.alert;
        } else {
          passwordResetAction.value = { type: "warning", message: "Une erreur est survenue" };
        }

        // Rediriger vers la page de connexion après 3 secondes en cas de succès
        if (response.ok && responseData.alert.type === "success") {
          setTimeout(() => {
            router.push({ name: "LoginPage" });
          }, 3000);
        }
      } catch (error) {
        // console.error("Erreur lors de la soumission du formulaire:", error);
        passwordResetAction.value = { type: "warning", message: "Erreur de connexion au serveur" };
      } finally {
        store.commit("setIsLoading", false);
      }
    }

    return {
      inputs,
      maxLength,
      submitForm,
      isFormValid,
      passwordResetAction,
      passwordCriteria,
      passwordStrength,
    };
  },
};
</script>

<style scoped>
.password-input-wrapper {
  position: relative;
  width: 100%;

  .password-toggle-btn {
    position: absolute;
    top: 0px;
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

.resetPassword--container {
  display: grid;
  justify-items: center;
  margin: 0px 20px 20px 20px;
  width: auto;
  height: auto;
  padding: 40px 35px 35px 35px;
  border-radius: 15px;
  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
  cursor: default;
  user-select: none;

  h3 {
    margin: -20px 0 15px 0;
    color: white;
    text-align: center;
    font-weight: 900;
    font-size: 4rem;
    text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);

    @media (min-width: 200px) and (max-width: 400px) {
      font-size: 2.5rem;
    }
  }
}

.resetPassword--form {
  display: grid;
  justify-items: center;
  width: 80%;

  input {
    padding: 6px;
    margin: 10px;
    width: 100%;
    border: none;
    outline: none;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    background-color: var(--purple-placeholder-bg);
    color: var(--purple);

    &.text-red {
      border: 2px solid #d32f2f;
      color: #d32f2f;
    }

    &.text-green {
      border: 2px solid #388e3c;
      color: #388e3c;
    }
  }

  input::placeholder {
    color: white;
    font-weight: 400;
  }

  .password-input-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
    margin-top: 10px;

    input {
      width: 100%;
      margin: 0;
    }
  }
}

.submit--btn {
  margin-top: 25px;
  height: 45px;
  width: 180px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.4s;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.381);

  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);

  &:hover {
    background-image: linear-gradient(to right, #ff24a78a, #8890fe90);
    color: var(--purple);
    transform: scale(1.1);
  }
}

.disabled--btn {
  opacity: 0.6;
  cursor: default;

  &:hover {
    background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
    color: white;
    transform: none;
  }
}

.password--reset--msg--success {
  margin-top: 20px;
  color: green;
  text-align: center;
}

.password--reset--msg--error {
  margin-top: 20px;
  color: red;
  text-align: center;
}
</style>
