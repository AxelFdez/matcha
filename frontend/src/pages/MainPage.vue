<template>
  <!-- Bouton pour ouvrir/fermer la Sidebar -->
  <section class="container p-12 mx-auto px-4">
    <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" :key="componentKey" />
    <p v-else class="mt-12">Aucuns utilisateurs à afficher...</p>
  </section>


  <!-- Sidebar affichée dynamiquement -->
  <!-- <Sidebar v-if="open" @close="toggleSidebar"></Sidebar> -->
</template>

<script>
import ProfileCard from '@/components/ProfileCard.vue';
import { fetchData } from '../config/api';
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from 'vuex';

export default {
  name: "MainPage",
  components: {
    ProfileCard,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state);
    const userReady = computed(() => user.value && user.value.is_ready);
    const ws = computed(() => store.getters.getWebSocket);

    const tenUsers = ref([]);
    const componentKey = ref(0);

    watch(ws, (newWs) => {
      if (newWs) {
        newWs.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "success") {
            tenUsers.value.shift();
            if (tenUsers.value.length === 0) {
              getTenUsers();
            } else {
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
        },
      });
      if (response) {
        tenUsers.value = response.data.users;
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

    return {
      tenUsers,
      userReady,
      componentKey,
    };
  }
};
</script>
