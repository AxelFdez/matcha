<template>
  <section>
    <template v-if="!$store.getters.getIsConnected">
      <div class="home">
        <div class="main--title fade-In">
          <h1 class="title--line--1">swipe right,</h1>
          <h1 class="title--line--2">match,</h1>
          <h1 class="title--line--3" id="date">date !</h1>
        </div>
        <router-link class="create--account--btn" :to="{ name: 'RegisterPage', params: {} }">
          <span>{{ $t("accountCreate_btn") }}</span>
        </router-link>
      </div>
    </template>
    <template v-if="$store.getters.getIsConnected">
      <MainPage />
    </template>
  </section>
</template>

<script>
import { useI18n } from "vue-i18n";
import MainPage from "@/pages/MainPage.vue";
// import GeoLocation from '@/components/Geolocation.vue';
// import { onMounted, onUnmounted } from "vue";

export default {
  name: "HomePage",

  components: {
    MainPage,
  },



  setup() {
    const { t } = useI18n();
    // Utilisation de la fonction de traduction
    const accountCreate_btn = t("accountCreate_btn");

    // Initialisation de WebSocket
    // function initWebSocket() {
    //       const userId = localStorage.getItem('userId');
    //       let ws = new WebSocket('ws://192.148.1.12:8081/?id=' + userId);

    //       ws.onopen = function() {
    //         console.log('Connection is open ...');
    //         let message = JSON.stringify({type: 'test', userId: userId , message: 'Hello Server!'});
    //         ws.send(message);
    //       };

    //       ws.onmessage = function(messageEvent) {
    //           console.log('Server says: ' + messageEvent.data);
    //           // if (messageEvent.data.type === 'pingLocation') {
    //               console.log('I PASSED HERE');
    //               ws.send(JSON.stringify({type: 'newLocation', userId: userId, location: GeoLocation}));
    //           // }
    //       };

    //       ws.onclose = function() {
    //           console.log('Connection is closed.');
    //       };

    //       ws.onerror = function(error) {
    //           console.log('Error detected: ' + error);
    //       };
    // }

    // // Nettoyer et fermer la connexion WebSocket lors du démontage du composant
    // function cleanupWebSocket(ws) {
    //   if (ws) {
    //     ws.close();
    //   }
    // }

    // function submitTest(ws) {
    //   let message = JSON.stringify({type: 'like', userId:'66406489327b4f1c5543f281' , message: {user: 'Axesnake', userLiked: 'Axou'}});
    //   ws.send(message);
    // }

    function handleFileUpload(event, selectedFiles) {
      selectedFiles.value = event.target.files;
    }

    async function submitPhotos(selectedFiles) {
  console.log("selectedFiles = ", selectedFiles.value);
  if (!selectedFiles.value) {
    alert("Please select files first.");
    return;
  }

  const formData = new FormData();
  for (let file of selectedFiles.value) {
    formData.append('photos', file);
  }

  // Vérification de ce qui est ajouté à formData
  formData.forEach((value, key) => {
    console.log(`${key}: ${value.name}`); // Assumant que 'value' est un fichier
  });

  // try {
  //   const response = await fetch('/updateUser', {
  //     method: 'POST',
  //     body: formData,
  //     // En-tête Content-Type doit être omis pour permettre au navigateur de le définir
  //     headers: {
  //       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQxYmUwYmMyNjczNjYwN2NhZDg4NTciLCJlbWFpbCI6ImF4ZXNuYWtlQGhvdG1haWwuZnIiLCJpYXQiOjE3MTU1OTY4MTgsImV4cCI6MTcxNTU5NzcxOH0.F-yk4q2UVD5kiyu45t6GGnYHI4ooU4xcm7juW521LB0',
  //     },
  //   });
  //   const result = await response.json();
  //   console.log(result);
  // } catch (error) {
  //   console.error('Error uploading files:', error);
  // }
}

    // onMounted(initWebSocket);
    // onUnmounted(cleanupWebSocket);

    return { handleFileUpload, submitPhotos, accountCreate_btn};
  },
};
</script>


<style lang="scss" scoped>
@keyframes slide-from-left {
  0% {
    transform: translateX(-150%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-from-right {
  0% {
    transform: translateX(150%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-from-bottom {
  0% {
    transform: translateY(250%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.home {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 100vh;
  user-select: none;

  .main--title {
    // margin-top: 80px;
    cursor: default;
    height: fit-content;
    margin-top: 50px;

    h1 {
      display: grid;
      justify-content: center;
      color: white;
      text-transform: capitalize;
      font-size: calc(min(5vw + 4.5vh, 150px));
      font-weight: 500;
      margin: 15px;

      &.title--line--1 {
        animation: slide-from-left 1s forwards;
      }
      &.title--line--2 {
        animation: slide-from-right 1.2s forwards;
      }
      &.title--line--3 {
        animation: slide-from-bottom 1.3s forwards;
      }

    }

    #date {
      font-weight: 900;
      text-transform: uppercase;
    }

    @media (min-width: 200px) and (max-width: 700px) {
      margin-top: 100px;
    }
  }

  .create--account--btn {
    justify-self: center;
    text-decoration: none;
    height: fit-content;
    z-index: 1200;

    span {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      width: 200px;
      border-radius: 15px;

      color: rgb(255, 255, 255);

      background-image: linear-gradient(to right, #ff24a7, #8890fe);
      /* Dégradé de couleur */

      font-size: 1.2rem;
      font-weight: 500;
      transition: all 0.3s;
      opacity: 1;
      cursor: pointer;

      &:hover {
        // background-image: linear-gradient(to right, #ff24a78a, #8890fe90);
        /* Dégradé de couleur */
        opacity: 0.8;
        transform: scale(1.15);
        // color: black;
        color: var(--light-pink);
      }
    }
  }
}
</style>