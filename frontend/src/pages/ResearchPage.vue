<template>
  <div class="research-page">
    <!-- 🔍 Filtres -->
    <div class="filters space-y-6 mt-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par pseudo..."
        class="w-full max-w-md p-2 rounded-md border border-gray-300"
      />

      <div class="grid md:grid-cols-2 gap-6 text-white">
        <RangeSlider
          label="Tranche d'âge"
          range
          :min="18"
          :max="100"
          suffix=" ans"
          v-model:minValue="ageMin"
          v-model:maxValue="ageMax"
        />

        <RangeSlider
          label="Fame rating"
          range
          :min="0"
          :max="1000"
          v-model:minValue="fameMin"
          v-model:maxValue="fameMax"
        />

        <RangeSlider
          label="Distance maximale"
          :min="0"
          :max="20000"
          suffix=" km"
          v-model:modelValue="maxDistance"
        />
      </div>

      <!-- 🎯 Tags + Tri -->
      <div class="grid md:grid-cols-3 gap-6 mt-4 text-white">
        <div>
          <label class="block mb-1 text-sm font-semibold">Tags d'intérêt</label>
          <multiselect
            v-model="selectedTags"
            :options="allTags"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Chercher tags..."
            class="custom-multiselect"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-semibold">Trier par</label>
          <select v-model="sortBy" class="w-full p-2 rounded-md border border-gray-300">
            <option value="">Aucun</option>
            <option value="age">Âge</option>
            <option value="distance">Distance</option>
            <option value="famerating">Fame rating</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 text-sm font-semibold">Ordre</label>
          <select v-model="sortOrder" class="w-full p-2 rounded-md border border-gray-300">
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- 🧾 Résultats -->
    <div v-if="!loading && !error" class="mt-10 text-white">
      <p class="mb-4 text-sm text-gray-300">
        {{ filteredUsers.length }} utilisateur(s) trouvé(s)
      </p>

      <!-- Desktop -->
      <table class="users-table desktop-view" v-if="filteredUsers.length">
        <thead>
          <tr>
            <th>Photos</th>
            <th>Pseudo</th>
            <th>Âge</th>
            <th>Sexe</th>
            <th>Préférence</th>
            <th>Popularité</th>
            <th>Dernière connexion</th>
            <th>Intérêts</th>
            <th>Distance (km)</th>
            <th>Actions</th> <!-- ✅ nouvelle colonne -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <!-- <pre>
                {{ user.photos[0] }}
              </pre> -->
              <img
                :src="formatPhotoUrl((user.photos[user.profilepicture]))"
                class="small-photo"
                @error="e => e.target.style.display='none'"
              />
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.age }}</td>
            <td>{{ user.gender }}</td>
            <td>{{ user.sexualpreferences }}</td>
            <td>{{ user.famerating }}</td>
            <td>{{ formatDate(user.lastconnection) }}</td>
            <td>
              <span v-for="tag in user.interests" :key="tag" class="tag">{{ tag }}</span>
            </td>
            <td>{{ calculateDistance(user.location).toFixed(2) }} km</td>

            <!-- ✅ Bouton Voir Profil -->
            <td>
              <button
                @click="openProfile(user)"
                class="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
              >
                Voir Profil
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile -->
      <div class="mobile-view" v-if="filteredUsers.length">
        <div v-for="user in filteredUsers" :key="user.id" class="user-card">
          <div class="user-card-header">
            <h3>{{ user.username }}</h3>
          </div>
          <div class="user-card-body">
            <div class="user-photos">
              <img
                v-for="(photo, i) in user.photos.filter(p => p)"
                :key="i"
                :src="formatPhotoUrl(photo)"
                class="mobile-photo"
                @error="e => e.target.style.display='none'"
              />
            </div>
            <div class="user-info">
              <p><strong>Âge:</strong> {{ user.age }}</p>
              <p><strong>Sexe:</strong> {{ user.gender }}</p>
              <p><strong>Préférence:</strong> {{ user.sexualpreferences }}</p>
              <p><strong>Popularité:</strong> {{ user.famerating }}</p>
              <p><strong>Distance:</strong> {{ calculateDistance(user.location).toFixed(2) }} km</p>
              <p><strong>Dernière connexion:</strong> {{ formatDate(user.lastconnection) }}</p>
              <div class="user-tags">
                <span v-for="tag in user.interests" :key="tag" class="tag">{{ tag }}</span>
              </div>

              <!-- ✅ Bouton Voir Profil sur mobile -->
              <div class="mt-3 text-right">
                <button
                  @click="openProfile(user)"
                  class="px-3 py-1.5 rounded-md bg-white text-gray-800 text-sm font-medium border border-gray-300 hover:bg-pink-600 hover:text-white transition"
                >
                  Voir Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 🪟 Modal -->
    <TransitionRoot as="template" :show="open">
      <Dialog class="relative z-10" @close="open = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative my-8 w-9/12 transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
              >
                <ProfileInfos v-if="selectedUser" :user="selectedUser" />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import RangeSlider from "@/components/RangeSlider.vue";
import Multiselect from "vue-multiselect";
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";
import ProfileInfos from "@/components/ProfileInfos.vue";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  name: "ResearchPage",
  components: { RangeSlider, Multiselect, Dialog, DialogPanel, TransitionChild, TransitionRoot, ProfileInfos },
  setup() {
    const store = useStore();
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const searchQuery = ref("");

    const ageMin = ref(18);
    const ageMax = ref(100);
    const fameMin = ref(0);
    const fameMax = ref(1000);
    const maxDistance = ref(20000);
    const sortBy = ref("");
    const sortOrder = ref("asc");
    const selectedTags = ref([]);

    const open = ref(false);
    const selectedUser = ref(null);

    const openProfile = (user) => {
      selectedUser.value = user;
      open.value = true;
    };

    const formatPhotoUrl = (photoPath) =>
      photoPath && photoPath.startsWith("/")
        ? `http://localhost:3000${photoPath}`
        : `http://localhost:3000/${photoPath}`;

    const calculateDistance = (loc) => {
      if (!loc?.coordinates) return Infinity;

      // Utiliser le store comme ProfileInfos
      const currentUserLocation = store.getters.getLocation;
      if (!currentUserLocation) return Infinity;

      // Format GeoJSON: coordinates[0] = longitude, coordinates[1] = latitude
      const lat1 = currentUserLocation.latitude || currentUserLocation.coordinates?.[1];
      const lon1 = currentUserLocation.longitude || currentUserLocation.coordinates?.[0];
      const lat2 = loc.coordinates?.[1];
      const lon2 = loc.coordinates?.[0];

      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

      const R = 6371; // Rayon de la Terre en km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const fetchUsers = async () => {
      loading.value = true;
      error.value = null;
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Token manquant, utilisateur non authentifié");
        const response = await axios.get("http://localhost:3000/browseUsers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        users.value = response.data.users;
      } catch (err) {
        error.value = err.response?.data?.message || "Erreur lors du chargement des utilisateurs";
      } finally {
        loading.value = false;
      }
    };

    const allTags = computed(() => {
      const tags = new Set();
      users.value.forEach((u) => u.interests?.forEach((t) => tags.add(t)));
      return Array.from(tags);
    });

    const filteredUsers = computed(() => {
      let filtered = users.value.filter((user) => {
        const matchesSearch = user.username
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
        const withinAge = user.age >= ageMin.value && user.age <= ageMax.value;
        const withinFame =
          user.famerating >= fameMin.value && user.famerating <= fameMax.value;
        const distance = calculateDistance(user.location);
        const withinDistance = distance <= maxDistance.value;
        const tagList = selectedTags.value.map((t) => t.toLowerCase());
        const hasTags =
          tagList.length === 0 ||
          tagList.every((tag) =>
            user.interests.some((i) => i.toLowerCase().includes(tag))
          );
        return matchesSearch && withinAge && withinFame && withinDistance && hasTags;
      });

      if (sortBy.value) {
        filtered.sort((a, b) => {
          let valA, valB;
          if (sortBy.value === "distance") {
            valA = calculateDistance(a.location);
            valB = calculateDistance(b.location);
          } else {
            valA = a[sortBy.value];
            valB = b[sortBy.value];
          }
          return sortOrder.value === "asc" ? valA - valB : valB - valA;
        });
      }
      return filtered;
    });

    const resetFilters = () => {
      searchQuery.value = "";
      ageMin.value = 18;
      ageMax.value = 100;
      fameMin.value = 0;
      fameMax.value = 1000;
      maxDistance.value = 20000;
      selectedTags.value = [];
      sortBy.value = "";
      sortOrder.value = "asc";
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

    onMounted(fetchUsers);

    return {
      users,
      loading,
      error,
      searchQuery,
      filteredUsers,
      formatDate,
      calculateDistance,
      formatPhotoUrl,
      ageMin,
      ageMax,
      fameMin,
      fameMax,
      maxDistance,
      sortBy,
      sortOrder,
      resetFilters,
      selectedTags,
      allTags,
      open,
      selectedUser,
      openProfile,
    };
  },
};
</script>


<style scoped>
/* --- Général --- */
.research-page {
  padding: 2rem;
  color: white;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: white;
}

.filters {
  margin-bottom: 1.5rem;
  margin-top: 5rem;

}

/* --- Input recherche --- */
input[type="text"] {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

input[type="text"]::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

input[type="text"]:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 36, 167, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 36, 167, 0.1);
  outline: none;
}

/* --- Select --- */
select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  cursor: pointer;
}

select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 36, 167, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 36, 167, 0.1);
  outline: none;
}

select option {
  background: #222;
  color: white;
}

/* --- Multiselect --- */
.custom-multiselect {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}

.custom-multiselect :deep(.multiselect__tags) {
  background: transparent;
  border: none;
  padding: 0.375rem 2.5rem 0 0.5rem;
  min-height: 38px;
}

.custom-multiselect :deep(.multiselect__input) {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 0 0 0.375rem;
  margin-bottom: 0;
}

.custom-multiselect :deep(.multiselect__input)::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.custom-multiselect :deep(.multiselect__placeholder) {
  color: rgba(255, 255, 255, 0.4);
  padding-left: 0.375rem;
  margin-bottom: 0;
}

.custom-multiselect :deep(.multiselect__single) {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}

.custom-multiselect :deep(.multiselect__tag) {
  background: linear-gradient(135deg, rgba(255, 36, 167, 0.3), rgba(136, 144, 254, 0.3));
  border: 1px solid rgba(255, 36, 167, 0.4);
  color: white;
  padding: 0.25rem 1.625rem 0.25rem 0.625rem;
  margin-bottom: 0.25rem;
  margin-right: 0.5rem;
}

.custom-multiselect :deep(.multiselect__tag-icon) {
  background: transparent;
  line-height: 20px;
}

.custom-multiselect :deep(.multiselect__tag-icon:hover) {
  background: rgba(255, 36, 167, 0.3);
}

.custom-multiselect :deep(.multiselect__tag-icon:after) {
  color: rgba(255, 255, 255, 0.8);
}

.custom-multiselect :deep(.multiselect__tag-icon:hover:after) {
  color: #ff24a7;
}

.custom-multiselect :deep(.multiselect__select) {
  height: 38px;
  padding: 0;
  width: 40px;
  background: transparent;
}

.custom-multiselect :deep(.multiselect__select:before) {
  border-color: rgba(255, 255, 255, 0.6) transparent transparent;
  top: 60%;
}

.custom-multiselect :deep(.multiselect__content-wrapper) {
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  backdrop-filter: blur(10px);
  z-index: 9999;
  position: absolute;
}

.custom-multiselect :deep(.multiselect__content) {
  background: transparent;
}

.custom-multiselect :deep(.multiselect__option) {
  color: white;
  padding: 0.75rem;
  min-height: auto;
}

.custom-multiselect :deep(.multiselect__option--highlight) {
  background: linear-gradient(to right, rgba(255, 36, 167, 0.2), rgba(136, 144, 254, 0.2));
  color: white;
}

.custom-multiselect :deep(.multiselect__option--selected) {
  background: rgba(255, 36, 167, 0.3);
  color: white;
  font-weight: 500;
}

.custom-multiselect :deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: rgba(255, 36, 167, 0.4);
  color: white;
}

.custom-multiselect :deep(.multiselect--active) {
  border-color: rgba(255, 36, 167, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 36, 167, 0.1);
}

/* --- Tableau utilisateurs --- */
.users-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.users-table th,
.users-table td {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
}

.users-table th {
  background-color: rgba(255, 255, 255, 0.1);
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

.users-table tbody tr {
  transition: background 0.2s ease;
}

.users-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}

.small-photo {
  width: 50px;
  height: 50px;
  border-radius: 0.3rem;
  object-fit: cover;
  margin-right: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tag {
  background-color: rgba(136, 144, 254, 0.3);
  border: 1px solid rgba(136, 144, 254, 0.4);
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  margin-right: 0.3rem;
  font-size: 0.85rem;
  display: inline-block;
  margin-bottom: 0.3rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
}

.error {
  color: #ff6b6b;
}

/* --- Vue mobile --- */
.mobile-view {
  display: none;
}

.user-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.user-card-header h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #ff24a7;
}

.user-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mobile-photo {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.user-tags {
  margin-top: 0.75rem;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
  .mobile-view {
    display: block;
  }

  .research-page {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
