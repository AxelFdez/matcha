<template>
  <div class="login--error--email--container fade-In">

    <div class="text">
      <h3>{{ $t("errorTitle") }}</h3>
      <p
        id="sub--title"
        v-html="replace_newLine_to_br_tags($t('emailNotVerifiedText'))"
      ></p>
    </div>
    <div class="return--btn">
      <span
        @click="goToLoginPage"
        ><i class="fa-solid fa-circle-arrow-left"></i
      ></span>
    </div>
    <div class="send--email--verif">

      <TextButton :class="{ hide: reSendEmailClicked }" :btnName="$t('reSendEmail')" @click="sendEmail()"></TextButton>
      <div :class="{ spinner: reSendEmailClicked  && !serverResponse}"></div>

      <span
        :class="{ hide: !reSendEmailClicked }"
        class="fade-In"
        id="serverResponse"
        >
        <p v-if="serverResponse === 200" style="color: darkgreen">{{ $t("reSendEmail_emailSent") }}</p>
        <p v-if="serverResponse === 400" style="color: darkgreen">{{ $t("reSendEmail_alreadyVerified") }}</p>
        <p v-if="serverResponse === 404">{{ $t("reSendEmail_userNotMatch") }}</p>
        <p v-if="serverResponse === 503">{{ $t("reSendEmail_serverError") }}</p>
        </span
      >
    </div>
  </div>
</template>

  <script>
// import { useI18n } from "vue-i18n";
import { replace_newLine_to_br_tags } from "@/libft/libft.js";
import { ref } from "vue";
import TextButton from '@/components/TextButton.vue';
import { fetchData } from "../../config/api";

export default {
  name: "RegisterErrorEmailVerif",

  components: {
    TextButton,
  },

  props: {
    username: String,
  },

  methods: {
    goToLoginPage() {
      this.$store.commit('setIsLoginFormSent', false);
      this.$store.commit('setServerMessage', '');
      this.$router.push({ name: 'LoginPage' });
    },
    showChangeEmailForm() {
      this.reSendEmailClicked = true;
      this.changeEmailClicked = true;
    },
  },

  setup(props) {

    const reSendEmailClicked = ref(false);
    const serverResponse = ref(null);

    let inputs = ref({
      email: "",
    });


    async function sendEmail() {
      console.log("reSendEmail function ", props.username);
      reSendEmailClicked.value = true;
      const formData = {
        username: props.username,
      };
      try {
        const response = await fetchData("/reSendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = response.data;
        console.log("reSendEmail response:", responseData);
        // reSendEmailClicked.value = true;
        switch (response.response.status) {
          case 200:
            serverResponse.value = 200;
            break;
          case 400:
            serverResponse.value = 400;
            break;
          case 404:
            serverResponse.value = 404;
            break;
          case 503:
            serverResponse.value = 503;
            break;
          default:
            serverResponse.value = 503;
            console.error("Unexpected status:", response.response.status);
            break;
        }
      } catch (error) {
        console.error("Error reSendEmail:", error);
        serverResponse.value = 503;
      }
    }

    return {
      inputs,
      serverResponse,
      replace_newLine_to_br_tags,
      sendEmail,
      reSendEmailClicked,
    };
  },
};
</script>

  <style lang=scss>

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
  }

.login--error--email--container {
  position: relative;
  min-height: 170px;
  width: auto;
  max-width: 600px;
  margin: 25px;
  padding: 10px 20px 20px 20px;
  border-radius: 15px;
  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
  cursor: default;
  user-select: none;

  .text {
    h3 {
      margin: 0;
      padding: 0;
      color: white;
      text-align: center;
      font-weight: 900;
      text-transform: capitalize;
      font-size: calc(min(3vw + 2vh, 50px));
      text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
    }
    p {
      width: 80%;
      font-weight: 400;
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 1rem;

      // font-size: calc(min(1vw + 1.1vh, 15px));
      margin: 0 auto 0px auto;
      word-wrap: break-word;
    }
  }
  .return--btn {
    text-decoration: none;

    position: absolute;
    left: 15px;
    bottom: 15px;

    span {
      cursor: pointer;
      user-select: none;
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

  .send--email--verif {
    // margin: 0 auto 15px auto;
      display: grid;
      justify-content: center;
    // #btn {
    //   p {
    //     width: fit-content;
    //     margin: 10px 0 0 0;
    //     text-align: center;
    //     color: var(--dark-gray);
    //     font-style: italic;
    //     transition: all 0.1s;
    //     cursor: pointer;

    //     &:hover {
    //       text-decoration-line: underline;
    //       font-style: normal;
    //       color: white;
    //       font-weight: 700;
    //       transform: scale(1.05);
    //     }
    //   }
    // }

    #serverResponse {
      display: grid;
      justify-content: center;
      p {
        width: fit-content;
        margin: 10px 0 0px 0;
        // padding: 0 15px 0 15px;
        font-weight: 900;
        text-align: center;
        color: rgb(251, 122, 0);
        transition: all 0.1s;
      }
    }
  }
  .hide {
    display: none !important;
  }
}
</style>
