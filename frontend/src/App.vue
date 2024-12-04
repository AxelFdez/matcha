<template>
  <div class="fade-In">
    <!-- <div class="fade-blur-bg">
      <div class="overlay"></div>

    </div>
    <div class="centered-content">
      <img src="../public/src/feu.png" alt="Your Image" class="animated-image" />
    </div> -->
    <LoadingStartApp v-if="$store.getters.getIsLoadingStartApp"></LoadingStartApp>
    <LoadingCmp v-if="$store.getters.getIsLoading"></LoadingCmp>
    <div v-if="$store.getters.getIsReady">

         <Header></Header>
        <router-view> </router-view>
<!--         <Footer></Footer>-->

    </div>
  </div>
</template>


<script>
import Header from "./components/header/HeaderCmp.vue";
import Footer from "./components/footer/FooterCmp.vue";
import LoadingStartApp from "./components/LoadingStartApp.vue";
import LoadingCmp from "./components/LoadingCmp.vue";
import { onMounted } from "vue";
import { useStore } from "vuex";
import { fetchData } from "./config/api"

// import { useRouter } from 'vue-router';
// import { useStore } from "vuex";
// import { computed } from "vue";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    LoadingStartApp,
    LoadingCmp,
  },

  setup() {
    const store = useStore();
    console.log('store ', store);
    onMounted(() => {

      store.commit('setIsLoadingStartApp', true);
      setTimeout(() => {
        if (localStorage.getItem('accessToken')) {
          console.log('AAAAA');
          checkAccessToken();
          store.commit('setIsLoadingStartApp', false);

        } else {
          console.log('BBBBB');

          store.commit('setIsReady', true);
          store.commit('setIsLoadingStartApp', false);
        }
      }, 2000);

    });

    async function checkAccessToken() {
      console.log('check Token');

      try {
        const response = await fetchData("/verifyToken", {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'refreshToken': localStorage.getItem('refreshToken'),
          },
        });
        const responseData = await response.json();
        if (response.status === 200) {

          if (responseData.accessToken) {
            localStorage.setItem('accessToken', responseData.accessToken)
            console.log('ACCESS Token');

          }

          // await store.dispatch('initWebSocket');
          await store.dispatch('getUserInfos', localStorage.getItem('userName'));
          if (store.getters.getVerified === true) {
            store.commit('setIsReady', true);
            store.commit('setIsConnected', true);
          }
          else {
            store.commit('setIsReady', true);
            store.commit('setIsConnected', false);
          }

        } else if (response.status >= 400) {

          store.commit('setIsReady', true);
          store.commit('setIsConnected', false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
        store.commit('setIsReady', true);
        store.commit('setIsConnected', false);
      }
    }
  }
};
</script>

<style lang="scss">
@import url("./style/reset.css");
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

:root {
  --gray: rgb(103, 102, 102);
  --light-gray: rgb(201, 200, 200);
  --light-light-gray: rgba(219, 219, 219, 0.381);
  --light-pink: #f790ce;
  --pink: #f82ea7;
  --purple: #9336cd;
  --purple-placeholder-bg: #f1a3fcd7;
  --dark-gray: rgb(71, 70, 70);
}

#app {
  font-family: "Roboto", sans-serif;
  /* padding: 0px 20px; */
  // background: url(../public/src/couple-bg.jpg) fixed center/cover;
  background-color: rgb(34, 34, 34);

  height: 100vh;
}


.hidden-element {
  display: none !important;
}

.fade-In {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.text-red {
  color: red !important;
}

.text-green {
  color: rgb(64, 169, 64) !important;
}

.spinner {

  width: 25px;
  height: 25px;
  margin: auto;
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-top: 6px solid #f25dff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

.no-scroll {
  overflow: hidden;
}
</style>
