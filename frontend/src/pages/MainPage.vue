<template>
  <!-- Bouton pour ouvrir/fermer la Sidebar -->
  <section class="container p-12 mx-auto px-4">
    <FilterBar
      @apply-filters="onApplyFilters"
      @reset-filters="onResetFilters"
    />
    <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" :key="componentKey" />
    <p v-else class="mt-12 text-white">Aucuns utilisateurs à afficher pour le moment...</p>
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
import { useRouter } from 'vue-router';

export default {
  name: "MainPage",
  components: {
    ProfileCard,
    FilterBar,
  },
  setup() {
  const store = useStore();
  const router = useRouter();
  const user = computed(() => store.state);
  const userReady = computed(() => user.value?.ready);

  const userGender = computed(() => user.value?.gender);
  const userSexPref = computed(() => user.value?.sex_pref);

  const ws = computed(() => store.getters.getWebSocket);

  const tenUsers = ref([]);
  const componentKey = ref(0);
  const currentFilters = ref({});

  watch(ws, (newWs) => {
    if (newWs) {
      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "success") {
          if (tenUsers.value && Array.isArray(tenUsers.value) && tenUsers.value.length > 0) {
            tenUsers.value.shift();
          }

          if (!tenUsers.value || tenUsers.value.length === 0) {
            getTenUsers(currentFilters.value);
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
        console.log('ageGap before stringify:', filters.ageGap, 'types:', typeof filters.ageGap.min, typeof filters.ageGap.max);
        const stringified = JSON.stringify(filters.ageGap);
        console.log('ageGap after stringify:', stringified);
        params.append('ageGap', stringified);
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

      if (filters.sexPref) {
        params.append('sexPref', filters.sexPref);
      }
      if (filters.gender) {
        params.append('gender', filters.gender);
      }

      return params.toString();
    };

    const getTenUsers = async (filters = {}) => {


      filters = {
        ...filters,
        sexPref: userSexPref.value,
        gender: userGender.value
      };
      const queryString = buildQueryString(filters);
      const url = queryString ? `/browseUsers?${queryString}` : '/browseUsers';

      console.log('getTenUsers - URL:', url);
      console.log('getTenUsers - filters:', filters);

      const response = await fetchData(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('getTenUsers - response:', response);

      if (response) {
        tenUsers.value = response.data.users;
        componentKey.value++;
      }
    };

    const onApplyFilters = (filters) => {
      console.log('onApplyFilters received:', filters);
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
        router.push('/ProfilePage?setup=true');
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
