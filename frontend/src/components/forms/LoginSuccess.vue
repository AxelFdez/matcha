<template>
  <div class="login--success--container fade-In">
    <div class="text">
      <h1>{{ $t("hello") }} {{ $store.getters.getUserName }}</h1>
      <h3 v-html="replace_newLine_to_br_tags($t('loginSuccessText'))"></h3>
    </div>
  </div>
</template>

<script>

import { replace_newLine_to_br_tags } from "@/libft/libft.js";
import { useStore } from "vuex";

import { useRouter } from 'vue-router';
import { onMounted } from "vue";
export default {
  name: "LoginSuccess",

  setup() {

    const store = useStore();
    const router = useRouter();
    const goToMainPage = () => {

      setTimeout(() => {
        store.commit('setIsConnected', true);
        store.commit('setIsLoginFormSent', false);
        store.commit('setServerMessage', '');
        router.push({ name: 'MainPage' });
      }, 4000)
    }

    onMounted(goToMainPage);
    return {

      replace_newLine_to_br_tags,
      goToMainPage,
    };
  },
};
</script>

<style lang=scss>
.login--success--container {
  height: auto;
  width: auto;
  max-width: 500px;
  margin: 0 25px 0 25px;
  padding: 25px;
  border-radius: 15px;
  background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
  cursor: default;
  user-select: none;

  .text {
    h1 {
      // padding: 25px 10px 0px 10px;
      margin: 0;
      color: white;
      text-align: center;
      font-weight: 900;
      text-transform: capitalize;
      font-size: calc(min(3.5vw + 2.5vh, 60px));
      text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
    }

    h3 {
      // border: solid 1px red;
      margin: 0;
      padding: 0px 15px 25px 15px;
      color: white;
      text-align: center;
      font-weight: 600;
      text-transform: capitalize;
      font-size: calc(min(1.5vw + 1vh, 40px));
      text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
    }
  }
}
</style>