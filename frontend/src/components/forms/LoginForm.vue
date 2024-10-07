<template>
  <div>
    <div class="login--container" v-if="!$store.getters.getIsLoginFormSent">
      <h3>Matcha</h3>
      <form class="login--form" @submit.prevent="submitForm">
        <input name="username" v-model="inputs.username" :maxlength="maxLength" type="text" :placeholder="$t('userName')" />
        <input name="password" v-model="inputs.password" type="password" :placeholder="$t('password')" />
        <button :class="{ 'disabled--btn': !isFormValid }" :disabled="!isFormValid">
          {{ $t("connect") }}
        </button>
        <router-link class="router--btn" :to="{ name: 'ForgotPassPage', params: {} }">
          <TextButton :btnName="$t('forgotPassword')"></TextButton>
        </router-link>
      </form>
    </div>
    <!-- Inclure le composant GeoLocation -->
    <GeoLocation @location-updated="updateCoordinates" @location-error="handleLocationError" />
    <!-- Afficher un message d'erreur si nécessaire -->
    <div v-if="locationError" class="error-message">
      <p>{{ locationError }}</p>
    </div>
    <LoginSuccess v-if="$store.getters.getServerMessage === 'success'"></LoginSuccess>
    <LoginFail v-if="$store.getters.getServerMessage === 'loginFail'"></LoginFail>
    <LoginErrorPassword v-if="$store.getters.getServerMessage === 'wrongPassword'"></LoginErrorPassword>
    <LoginErrorEmailVerif :username="inputs.username" v-if="$store.getters.getServerMessage === 'emailNotVerif'"></LoginErrorEmailVerif>
    <LoginErrorServer v-if="$store.getters.getServerMessage === 'serverError'"></LoginErrorServer>
  </div>
</template>

<script>

import { ref, watch } from "vue";
import { useStore } from "vuex";
import LoginSuccess from "@/components/forms/LoginSuccess.vue";
import LoginErrorServer from "@/components/forms/LoginErrorServer.vue";
import LoginFail from "@/components/forms/LoginFail.vue";
import LoginErrorPassword from "@/components/forms/LoginErrorPassword.vue";
import LoginErrorEmailVerif from "@/components/forms/LoginErrorEmailVerif.vue";
import TextButton from '@/components/TextButton.vue';
import GeoLocation from '@/components/Geolocation.vue';

export default {
  name: "LoginForm",
  components: {
    LoginSuccess,
    LoginErrorServer,
    LoginFail,
    LoginErrorPassword,
    LoginErrorEmailVerif,
    TextButton,
    GeoLocation
  },

  setup() {

    const store = useStore();
    // store.commit('setServerMessage', 'success');
    const maxLength = 15;
    // inputs
    let inputs = ref({
      username: "",
      password: "",
    });

    const coordinates = ref(null);
    const locationError = ref(null);

    // Fonction pour mettre à jour les coordonnées lorsque l'événement est émis
    function updateCoordinates(coords) {
      coordinates.value = coords;
    }

    // Fonction pour gérer les erreurs de géolocalisation
    function handleLocationError(error) {
      locationError.value = error;
    }

    watch(
      inputs,
      (newValue) => {
        if (newValue.username == "") {
          inputs.value.password = "";
        }
      },
      { deep: true }
    );

    function submitForm(event) {
      event.preventDefault();
      store.commit('setIsLoading', true);
      // Récupérer les données du formulaire
      const formData = {
        username: event.target.username.value,
        password: event.target.password.value,
        location: coordinates.value,
      };

      setTimeout(() => {

        store.dispatch('submitLoginForm', formData);
        inputs.value.password = "";
      }, 1000);
    }

    return {

      maxLength,
      inputs,
      submitForm,
      LoginSuccess,
      LoginFail,
      LoginErrorEmailVerif,
      LoginErrorPassword,
      LoginErrorServer,
      TextButton,
      updateCoordinates,
      locationError,
      handleLocationError
    };
  },
  computed: {
    isFormValid() {
      const { username, password } = this.inputs;
      return username && password;
    }
  },
};
</script>

<style lang="scss">
.login--container {
  //   border: solid 1px red;
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

  .login--form {
    display: grid;
    justify-items: center;
    // width: 80%;

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

    // .submit--btn {

    button {
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
    
    .router--btn {
      text-decoration: none;
      margin: 15px 0 0 0;
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
  }
}
</style>