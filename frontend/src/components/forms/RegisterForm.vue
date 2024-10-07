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
        />
        <input
          name="lastname"
          v-model="inputs.lastName"
          :maxlength="maxLength"
          type="text"
          :placeholder="$t('lastName')"
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
        <input
          name="password"
          v-model="inputs.password"
          :disabled="!inputs.emailValid"
          :class="{
            'text-green': inputs.samePassword,
            'disabled--input': !inputs.emailValid,
          }"
          type="password"
          :placeholder="$t('password')"
        />
        <input
          v-model="inputs.repeatPassword"
          :disabled="!inputs.emailValid"
          :class="{
            'text-red': !inputs.samePassword,
            'text-green': inputs.samePassword,
            'disabled--input': !inputs.emailValid,
          }"
          type="password"
          :placeholder="$t('passwordConfirm')"
        />

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

    const maxLength = 15;
    // Input Object --------------------------------
    let inputs = ref({
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      emailValid: false,
      password: "",
      repeatPassword: "",
      samePassword: false,
    });

    watch(
      inputs,
      (newValue) => {
        if (newValue.email.length != 0) {
          if (!validateEmail(newValue.email)) {
            inputs.value.emailValid = false;
            inputs.value.password = "";
            inputs.value.repeatPassword = "";
            inputs.value.samePassword = false;
          } else {
            inputs.value.emailValid = true;
          }
        }
        if (newValue.password.length != 0) {
          if (newValue.repeatPassword != inputs.value.password) {
            inputs.value.samePassword = false;
          } else {
            inputs.value.samePassword = true;
          }
        }
      },
      { deep: true }
    );
    function submitForm(event) {
      event.preventDefault();

      console.log('submit form register');
      // Récupérer les données du formulaire
      const formData = {
        userName: event.target.username.value,
        firstName: event.target.firstname.value,
        lastName: event.target.lastname.value,
        email: event.target.email.value,
        password: event.target.password.value
      };

      store.commit('setIsLoading', true);
      setTimeout(() => {

        store.dispatch('submitRegisterForm', formData)
        Object.keys(inputs.value).forEach(key => {
          inputs.value[key] = ""; // Réinitialiser à une chaîne vide
        });
      }, 1000);
    }

    // Object.keys(inputs.value).forEach(key => {
    //   if (typeof inputs.value[key] !== 'string') {
    //     inputs.value[key] = null; // Réinitialiser à null ou à la valeur par défaut
    //   } else {
    //     inputs.value[key] = ""; // Réinitialiser à une chaîne vide
    //   }
    // });
    // async function submitRegisterForm() {
    //   store.commit('setIsLoading', true);

    //   try {
    //     // Envoyer les données du formulaire au backend Node.js
    //     const response = await fetch("/register-form", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(this.inputs),
    //     });
    //     const responseData = await response.json();
    //     switch (response.status) {
    //       case 201:
    //         store.commit('setServerMessage', 'registerSuccess');
    //         break;
    //       case 409:
    //         if (responseData.message === 'Username already exists') {
    //           store.commit('setServerMessage', 'userExist');
    //         }
    //         if (responseData.message === 'Email already exists') {
    //           store.commit('setServerMessage', 'emailExist');
    //         }
    //         break;
    //       case 503:
    //         store.commit('setServerMessage', 'serverError');
    //         break;
    //     }
    //   } catch (error) {
    //     console.error("Error submitting form:", error);
    //   } finally {
    //     store.commit('setIsRegisterFormSent', true);
    //     store.commit('setIsLoading', false);
    //   }
    // }
    async function getLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("Latitude: " + position.coords.latitude);
      console.log("Longitude: " + position.coords.longitude);
       // Créer la structure de données avec latitude et longitude
       const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      // Assigner la structure de données à inputs.value.location
      inputs.value.location = location;
    }, function(error) {
      console.error("Erreur de géolocalisation: " + error.message);
      inputs.value.location = "Erreur de géolocalisation";
    }, {
      maximumAge: 60000,
      timeout: 5000,
      enableHighAccuracy: true
    });
  } else {
    console.error("Géolocalisation n'est pas prise en charge par ce navigateur.");
    inputs.value.location = "Géolocalisation non prise en charge";
  }
}

    return {
      inputs,
      maxLength,
      validateEmail,
      submitForm,
      getLocation
    };
  },
  computed: {
  isFormValid() {
    const { samePassword, emailValid, userName, firstName, lastName } = this.inputs;
    return samePassword && emailValid && userName && firstName && lastName;
  }
},
};
</script>

<style lang="scss">
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

      /* Couleur du placeholder */
    }

    .send--registration--btn {
      margin-top: 25px;

      // padding: 10px 30px 10px 30px;

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
      opacity: 0.6;
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
