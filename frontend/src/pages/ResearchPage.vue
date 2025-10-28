<template>
  <div class="research-page">
    <h1>Recherche d'utilisateurs</h1>

    <!-- Filtres -->
    <div class="filters">
      <input v-model="searchQuery" type="text" placeholder="Rechercher par pseudo..." />
    </div>

    <!-- Vue Desktop: Tableau -->
    <table class="users-table desktop-view" v-if="!loading && !error">
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td class="all-photos">
            <img
              v-for="(photo, index) in user.photos.filter(p => p)"
              :key="index"
              :src="formatPhotoUrl(photo)"
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
          <td>{{ calculateDistance(user.location) }} km</td>
        </tr>
      </tbody>
    </table>

    <!-- Vue Mobile: Cards -->
    <div class="mobile-view" v-if="!loading && !error">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card">
        <!-- Photos -->
        <div class="card-photos">
          <img
            v-for="(photo, index) in user.photos.filter(p => p)"
            :key="index"
            :src="formatPhotoUrl(photo)"
            class="card-photo"
            @error="e => e.target.style.display='none'"
          />
        </div>

        <!-- Infos principales -->
        <div class="card-header">
          <h3>{{ user.username }}</h3>
          <span class="badge">⭐ {{ user.famerating }}</span>
        </div>

        <!-- Détails -->
        <div class="card-details">
          <div class="detail-row">
            <span class="label">Âge:</span>
            <span>{{ user.age }} ans</span>
          </div>
          <div class="detail-row">
            <span class="label">Sexe:</span>
            <span>{{ user.gender }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Préférence:</span>
            <span>{{ user.sexualpreferences }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Distance:</span>
            <span>{{ calculateDistance(user.location) }} km</span>
          </div>
          <div class="detail-row">
            <span class="label">Dernière connexion:</span>
            <span>{{ formatDate(user.lastconnection) }}</span>
          </div>
        </div>

        <!-- Intérêts -->
        <div class="card-interests">
          <span v-for="tag in user.interests" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

export default {
  name: "ResearchPage",
  setup() {
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const searchQuery = ref("");

    const currentUserLocation = ref([0, 0]);

    const formatPhotoUrl = (photoPath) => {
      if (!photoPath) return "";
      return `http://localhost:3000${photoPath.replace("/app", "")}`;
    };

    const calculateDistance = (loc) => {
      if (!loc || !loc.coordinates || !currentUserLocation.value) return "N/A";

      const [lon1, lat1] = currentUserLocation.value;
      const [lon2, lat2] = loc.coordinates;

      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371;

      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return (R * c).toFixed(2);
    };

    const fetchUsers = async () => {
      loading.value = true;
      error.value = null;

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Token manquant, utilisateur non authentifié");

        const response = await axios.get("http://localhost:3000/browseUsers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.currentUser) {
          currentUserLocation.value = response.data.currentUser.location.coordinates;
        }

        users.value = response.data.users;
      } catch (err) {
        console.error(err);
        error.value = err.response?.data?.message || "Erreur lors du chargement des utilisateurs";
      } finally {
        loading.value = false;
      }
    };

    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      return users.value.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleString();
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      error,
      searchQuery,
      filteredUsers,
      formatDate,
      calculateDistance,
      formatPhotoUrl,
    };
  },
};
</script>

<style scoped>
.research-page {
  padding: 2rem;
  color: white;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.filters {
  margin-bottom: 1.5rem;
  margin-top: 3rem;
}

.filters input {
  padding: 0.5rem;
  width: 100%;
  max-width: 300px;
  border-radius: 0.3rem;
  border: 1px solid #ccc;
  font-size: 1rem;
}

/* Vue Desktop - Tableau */
.desktop-view {
  display: table;
}

.mobile-view {
  display: none;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
}

.users-table th {
  background-color: rgba(255, 255, 255, 0.1);
  text-align: left;
}

.small-photo {
  width: 50px;
  height: 50px;
  border-radius: 0.3rem;
  object-fit: cover;
  margin-right: 0.3rem;
}

.tag {
  background-color: rgba(136, 144, 254, 0.3);
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  margin-right: 0.3rem;
  font-size: 0.85rem;
  display: inline-block;
  margin-bottom: 0.3rem;
}

.loading {
  margin-top: 2rem;
  font-weight: bold;
}

.error {
  margin-top: 2rem;
  color: red;
  font-weight: bold;
}

/* Vue Mobile - Cards */
.user-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-photos {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.card-photo {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.badge {
  background-color: rgba(255, 193, 7, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.card-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-row .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.card-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

/* Responsive Breakpoints */

/* Tablette */
@media (max-width: 1024px) {
  .research-page {
    padding: 1.5rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .small-photo {
    width: 40px;
    height: 40px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .research-page {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .filters {
    margin-top: 1.5rem;
  }

  .filters input {
    max-width: 100%;
  }

  /* Masquer le tableau sur mobile */
  .desktop-view {
    display: none;
  }

  /* Afficher les cards sur mobile */
  .mobile-view {
    display: block;
  }
}

/* Très petits écrans */
@media (max-width: 480px) {
  .research-page {
    padding: 0.75rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  .card-photo {
    width: 60px;
    height: 60px;
  }

  .card-header h3 {
    font-size: 1.1rem;
  }

  .detail-row {
    font-size: 0.9rem;
  }

  .tag {
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>