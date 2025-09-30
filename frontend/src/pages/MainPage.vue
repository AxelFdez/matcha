<template>
  <!-- Bouton pour ouvrir/fermer la Sidebar -->
  <section class="container p-12 mx-auto px-4">
    <FilterBar
      @apply-filters="onApplyFilters"
      @reset-filters="onResetFilters"
    />
    <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" :key="componentKey" />
    <p v-else class="mt-12">Aucuns utilisateurs à afficher...</p>
  </section>


  <!-- Sidebar affichée dynamiquement -->
  <!-- <Sidebar v-if="open" @close="toggleSidebar"></Sidebar> -->
</template>

<script>
import ProfileCard from '@/components/ProfileCard.vue';
import FilterBar from '@/components/FilterBar.vue';
import { fetchData } from '../config/api';
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from 'vuex';

export default {
  name: "MainPage",
  components: {
    ProfileCard,
    FilterBar,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state);
    const userReady = computed(() => user.value && user.value.is_ready);
    const ws = computed(() => store.getters.getWebSocket);

    const tenUsers = ref([]);
    const componentKey = ref(0);
    const currentFilters = ref({});

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

    const buildQueryString = (filters) => {
      const params = new URLSearchParams();

      if (filters.ageGap && (filters.ageGap.min || filters.ageGap.max)) {
        params.append('ageGap', JSON.stringify(filters.ageGap));
      }

      if (filters.fameRatingGap && (filters.fameRatingGap.min || filters.fameRatingGap.max)) {
        params.append('fameRatingGap', JSON.stringify(filters.fameRatingGap));
      }

      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', JSON.stringify(filters.tags));
      }

      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }

      return params.toString();
    };

    const getTenUsers = async (filters = {}) => {
      const queryString = buildQueryString(filters);
      const url = queryString ? `/browseUsers?${queryString}` : '/browseUsers';

      const response = await fetchData(url, {
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

    const onApplyFilters = (filters) => {
      currentFilters.value = filters;
      getTenUsers(filters);
    };

    const onResetFilters = () => {
      currentFilters.value = {};
      getTenUsers();
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
      onApplyFilters,
      onResetFilters,
    };
  }
};
</script>
