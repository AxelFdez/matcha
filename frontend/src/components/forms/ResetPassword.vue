<template>
  <div class="resetPassword--container">
    <h3>{{ $t("resetPassword") }}</h3>
    <form class="resetPassword--form" @submit.prevent="submitForm">
      <input name="newPassword" type="password" :placeholder="$t('password')" v-model="inputs.newPassword" required
        :maxlength="maxLength" />
      <input name="confirmPassword" type="password" :placeholder="$t('confirmPassword')"
        v-model="inputs.confirmPassword" required :maxlength="maxLength" />
      <button :class="{ 'disabled--btn': !isFormValid }" :disabled="!isFormValid" class="submit--btn" type="submit">
        {{ $t("resetPassword") }}
      </button>
    </form>
    <div v-if="passwordResetAction.type === 'success'" class="password--reset--msg--success">
      <p>{{passwordResetAction.message}}</p>
    </div>
    <div v-if="passwordResetAction.type === 'warning'" class="password--reset--msg--error">
      <p>{{passwordResetAction.message}}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex"; // Importer useStore
import { useRouter } from "vue-router"; // Importer useRouter pour la navigation
// import TextButton from '@/components/TextButton.vue';
import { fetchData } from "@/config/api";
import { useRoute } from 'vue-router';


export default {
  name: "ResetPassword",
  // components: {
  // TextButton,
  // },
  setup() {
    const store = useStore(); // Obtenir l'instance du store
    const router = useRouter(); // Obtenir l'instance du routeur
    const route = useRoute();

    const maxLength = 15;
    const inputs = ref({
      newPassword: "",
      confirmPassword: "",
    });

    // Définir isFormValid comme une propriété computed pour une réactivité optimale
    const isFormValid = computed(() => {
      return (
        inputs.value.newPassword === inputs.value.confirmPassword &&
        inputs.value.newPassword.length > 0 &&
        inputs.value.confirmPassword.length > 0
      );
    });

    // Propriété pour afficher un message de succès
    const passwordResetAction = ref(0);

    // Méthode asynchrone pour soumettre le formulaire
    async function submitForm(event) {
      event.preventDefault();
      store.commit('setIsLoading', true);
      const token = route.query.token;
      const email = route.query.email;
      const data = {
        password: inputs.value.newPassword,
        confirmPassword: inputs.value.confirmPassword,
        token: token,
        email: email
      };
      try {
        const response = await fetchData("/resetPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        console.log("Réponse du serveur:", responseData);
        // Afficher un message de succès
        if (responseData.status === 200) {
          passwordResetAction.value = responseData.alert;
        } else {
          passwordResetAction.value = responseData.alert;
        }
      } catch (error) {
        console.error("Erreur lors de la soumission du formulaire:", error);
        passwordResetAction.value = error.alert;
        // Optionnel : Afficher un message d'erreur à l'utilisateur
      } finally {
        store.commit('setIsLoading', false);
        setTimeout(() => {
          passwordResetAction.value = 0;
          // Naviguer vers la page de connexion après le message
          router.push({ name: "LoginPage" });
        }, 5000);
      }
    }

    return {
      inputs,
      maxLength,
      submitForm,
      isFormValid,
      passwordResetAction,
    };
  }
}
</script>

<style scoped>
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
  }

  input::placeholder {
    color: white;
    font-weight: 400;
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
