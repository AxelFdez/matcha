<template>
  <div class="forgot--pass--container">
    <h3>{{ $t("resetPassword") }}</h3>
    <div v-if="!$store.getters.getIsForgotFormSent">
      <p>{{ $t("resetPasswordInfo") }}</p>
      <form action="" class="forgot--pass--form" @submit.prevent="submitForm">
        <input
          name="email"
          v-model="inputs.email"
          :class="{
            'text-red': !validateEmail(inputs.email),
            'text-green': validateEmail(inputs.email),
          }"
          type="text"
          placeholder="e-mail"
        />
        <button
          :class="{ 'disabled--btn': !inputs.emailValid }"
          :disabled="!isFormValid"
        >
          {{ $t("send") }}
        </button>
      </form>
    </div>

    <div v-if="$store.getters.getServerMessage === 'emailSent'">
      <p>{{ $t("forgotPasswordEmaiSentSuccess") }}</p>
    </div>
    <div v-if="$store.getters.getServerMessage === 'emailNotMatch'">
      <p>{{ $t("forgotPasswordEmaiSentFail") }}</p>
    </div>
    <div v-if="$store.getters.getServerMessage === 'serverError'">
      <p>{{ $t("serverErrorText") }}</p>
    </div>

    <div class="return--btn">
      <span @click="goToLoginPage"
        ><i class="fa-solid fa-circle-arrow-left"></i
      ></span>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { validateEmail } from "../../libft/libft.js";
import { useStore } from "vuex";

export default {
  name: "ForgotPassForm",

  methods: {
    goToLoginPage() {
    // const store = useStore();

    if (!this.$store.getters.getIsForgotFormSent) {
        this.$router.push({ name: "LoginPage" });
    }
    this.$store.commit("setIsForgotFormSent", false);
    this.$store.commit("setServerMessage", "");
    },
  },

  setup() {
    const store = useStore();

    let inputs = ref({
      email: "",
      emailValid: false,
    });

    watch(
      inputs,
      (newValue) => {
        if (newValue.email.length != 0) {
          if (!validateEmail(newValue.email)) {
            inputs.value.emailValid = false;
          } else {
            inputs.value.emailValid = true;
          }
        }
      },
      { deep: true }
    );

    function submitForm(event) {
      //   store.commit("isForgotFormSent", true);
      event.preventDefault();
      console.log(event.target.email.value);
      store.commit("setIsLoading", true);
      // Récupérer les données du formulaire
      const formData = {
        email: event.target.email.value,
      };
      console.log("submitFormForgot");
      setTimeout(() => {
        store.dispatch("forgotPasswordForm", formData);
      }, 1000);
    }

    return {
      validateEmail,
      inputs,
      submitForm,
    };
  },
  computed: {
    isFormValid() {
      const { emailValid } = this.inputs;
      return emailValid;
    },
  },
};
</script>

<style lang="scss">
.forgot--pass--container {
  position: relative;
  display: grid;
  justify-items: center;
  margin: 0px 20px 20px 20px;
  width: 370px;
  height: auto;
  padding: 40px;
  border-radius: 15px;
  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
  cursor: default;
  user-select: none;

  h3 {
    margin: -13px 0 15px 0;
    color: white;
    text-align: center;
    font-weight: 900;
    font-size: 1.9rem;
    text-transform: capitalize;
    text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
  }

  p {
    // border: solid 1px red;
    margin: 0px 0 10px 0;
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
  }

  .forgot--pass--form {
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

    button {
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
  }
  .return--btn {
    // text-decoration: none;

    position: absolute;
    left: 15px;
    bottom: 15px;

    span {
      cursor: pointer;
      //   user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: white;
      transition: all ease-in-out 0.3s;
      &:hover {
        color: var(--light-pink);
      }
    }
  }
}
</style>