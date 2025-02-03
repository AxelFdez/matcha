<template>
<!--  <div class="main&#45;&#45;page&#45;&#45;container">-->
<!--    <section class="main&#45;&#45;page&#45;&#45;research">-->

<!--    </section>-->
    <section class="container p-12 mx-auto px-4">
      <!-- <div  v-if="userReady.value"> -->
        <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" :key="componentKey" />
        <p v-else class="mt-12">Aucuns utilisateurs à afficher...</p>

      <!-- </div> -->
      <!-- <div v-else> -->
        <!-- <p>Your Profile is not fill</p> -->
      <!-- </div> -->
    </section>
<!--  </div>-->
</template>

<script>
import ProfileCard from '@/components/ProfileCard.vue';
import { fetchData } from '../config/api';
import { ref, computed } from "vue";
import { onMounted } from "vue";
import { useStore } from 'vuex';
import { watch } from 'vue';


export default {
  name: "MainPage",
  components: {
    ProfileCard
  },
  setup() {
    const user = computed(() => store.state);
    const userReady = computed(() => user.value && user.value.is_ready);
    const ws = computed(() => store.getters.getWebSocket);
    const store = useStore();


    const tenUsers = ref([]);
    const componentKey = ref(0);

    watch(ws, (newWs) => {
      if (newWs) {
        newWs.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "success") {
            // Faire une animation de like ou matcha ici
            tenUsers.value.shift();
            if (tenUsers.value.length === 0) {
              getTenUsers();
            }
            else {
            // recree un nouveau ProfileCard
              componentKey.value++;
            }
          }
        };
      }
    }, { immediate: true });

    const getTenUsers = async () => {
      const response = await fetchData("/browseUsers", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + localStorage.getItem('accessToken'),
        },
      });
      const data = await response.json();
      if (data) {
        tenUsers.value = data.users;
        componentKey.value++;
      }
    };


    onMounted(() => {
      if (!userReady.value) {
        store.commit('setIsLoadingStartApp', false);
        return;
      }
      getTenUsers();
    });

    return {tenUsers, userReady, componentKey};
  }
};
</script>

<style lang="scss">
.main--page--container {
  display: flex;
  align-items: center;
  justify-content: center;

  //height: 100vh;

  h1 {
    font-size: 5rem;
    font-weight: 900;
    color: white;
  }
}

button {
  position: relative;
  margin-top: 100px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #ff24a7d3;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #8890fee5;
  }
}
p {
  color: white;
  // padding-top : 150px;
}
</style>