<template>
  <!-- Bouton pour ouvrir/fermer la Sidebar -->
  <FwbButton @click="toggleSidebar" class="absolute mt-44">Ouvrir Sidebar</FwbButton>
  <section class="container p-12 mx-auto px-4">
    <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" :key="componentKey" />
    <p v-else class="mt-12">Aucuns utilisateurs à afficher...</p>
  </section>


  <!-- Sidebar affichée dynamiquement -->
  <Sidebar v-if="open" @close="toggleSidebar"></Sidebar>
</template>

<script>
import ProfileCard from '@/components/ProfileCard.vue';
import Sidebar from '@/components/sidebar.vue';
import { fetchData } from '../config/api';
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from 'vuex';
import { FwbButton } from 'flowbite-vue';

export default {
  name: "MainPage",
  components: {
    ProfileCard,
    Sidebar,
    FwbButton
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state);
    const userReady = computed(() => user.value && user.value.is_ready);
    const ws = computed(() => store.getters.getWebSocket);

    // État pour la Sidebar
    const open = ref(false);

    // Fonction pour ouvrir/fermer la Sidebar
    const toggleSidebar = () => {
      open.value = !open.value;
    };

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
      open, // Ajout de `open` pour gérer l'affichage de la Sidebar
      toggleSidebar
    };
  }
};
</script>
