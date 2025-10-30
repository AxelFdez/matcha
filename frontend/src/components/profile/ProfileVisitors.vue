<template>
  <div class="profile-visitors-container">
    <h4>
      <i class="fa-solid fa-eye"></i>
      Visiteurs de votre profil
      <span class="count" v-if="visitors.length > 0">({{ visitors.length }})</span>
    </h4>

    <div v-if="isLoading" class="loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Chargement...</p>
    </div>

    <div v-else-if="visitors.length === 0" class="no-visitors">
      <i class="fa-solid fa-users-slash"></i>
      <p>Aucune visite pour le moment</p>
    </div>

    <div v-else class="visitors-table">
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Utilisateur</th>
            <th>Âge</th>
            <th>Localisation</th>
            <th>Fame Rating</th>
            <th>Dernière visite</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visitor in visitors" :key="visitor.id" class="visitor-row">
            <td class="photo-cell">
              <img
                :src="getProfilePhoto(visitor)"
                :alt="visitor.username"
                class="profile-photo"
                @error="handleImageError"
              />
            </td>
            <td class="username-cell">
              <strong>{{ visitor.username }}</strong>
              <span class="name">{{ visitor.firstname }} {{ visitor.lastname }}</span>
            </td>
            <td>{{ visitor.age }} ans</td>
            <td class="location-cell">
              <i class="fa-solid fa-location-dot"></i>
              {{ visitor.city }}, {{ visitor.country }}
            </td>
            <td class="fame-cell">
              <div class="fame-rating">
                <i class="fa-solid fa-star"></i>
                {{ visitor.fameRating || 0 }}
              </div>
            </td>
            <td class="date-cell">{{ formatDate(visitor.visitedAt) }}</td>
            <td class="action-cell">
              <button @click="openProfileModal(visitor)" class="view-profile-btn">
                <i class="fa-solid fa-user"></i>
                Voir le profil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour afficher le profil -->
    <TransitionRoot as="template" :show="isModalOpen">
      <Dialog class="relative z-50" @close="isModalOpen = false">
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

        <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
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
                <ProfileInfos v-if="selectedVisitor" :user="selectedVisitor" />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import ProfileInfos from "@/components/ProfileInfos.vue";

export default {
  name: "ProfileVisitors",
  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    ProfileInfos,
  },
  setup() {
    const store = useStore();
    const isLoading = ref(true);
    const isModalOpen = ref(false);
    const selectedVisitor = ref(null);

    const visitors = computed(() => store.getters.getProfileVisitors);

    onMounted(async () => {
      await store.dispatch("fetchProfileVisitors");
      isLoading.value = false;
    });

    const getProfilePhoto = (visitor) => {
      if (visitor.photos && visitor.photos.length > 0) {
        const photoIndex = visitor.profilepicture || 0;
        const photo = visitor.photos[photoIndex] || visitor.photos[0];
        return photo || "/src/default-avatar-img.jpeg";
      }
      return "/src/default-avatar-img.jpeg";
    };

    const handleImageError = (event) => {
      event.target.src = "/src/default-avatar-img.jpeg";
    };

    const formatDate = (dateString) => {
      if (!dateString) return "Date inconnue";
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays}j`;

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    };

    const openProfileModal = (visitor) => {
      // Transformer l'objet visitor pour correspondre au format attendu par ProfileInfos
      const formattedVisitor = {
        ...visitor,
        location: {
          coordinates: [visitor.latitude || 48.8566, visitor.longitude || 2.3522], // Coordonnées par défaut si non disponibles
          city: visitor.city || "Inconnue",
          country: visitor.country || "Inconnu",
        },
      };

      selectedVisitor.value = formattedVisitor;
      isModalOpen.value = true;
    };

    return {
      visitors,
      isLoading,
      isModalOpen,
      selectedVisitor,
      getProfilePhoto,
      handleImageError,
      formatDate,
      openProfileModal,
    };
  },
};
</script>

<style lang="scss" scoped>
.profile-visitors-container {
  width: 100%;
  padding: 1.5rem;

  h4 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: #a602e7;
    }

    .count {
      font-size: 1rem;
      color: #6b7280;
      font-weight: 400;
    }
  }
}

.loading,
.no-visitors {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;

  i {
    font-size: 3rem;
    color: #a602e7;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
  }
}

.visitors-table {
  width: 100%;
  max-height: 600px;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;

    thead {
      background: linear-gradient(135deg, #a602e7 0%, #e702a0 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 10;

      th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    tbody {
      tr.visitor-row {
        border-bottom: 1px solid #e5e7eb;

        &:hover {
          background: rgba(166, 2, 231, 0.05);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 1rem;
        vertical-align: middle;
      }

      .photo-cell {
        .profile-photo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e5e7eb;
        }
      }

      .username-cell {
        strong {
          display: block;
          color: #1f2937;
          font-size: 1rem;
        }

        .name {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
        }
      }

      .location-cell {
        i {
          color: #a602e7;
          margin-right: 0.25rem;
        }
      }

      .fame-cell {
        .fame-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          color: #f59e0b;

          i {
            color: #f59e0b;
          }
        }
      }

      .date-cell {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .action-cell {
        .view-profile-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #a602e7 0%, #e702a0 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          white-space: nowrap;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(166, 2, 231, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .visitors-table {
    table {
      font-size: 0.875rem;

      th,
      td {
        padding: 0.75rem 0.5rem;
      }

      .photo-cell .profile-photo {
        width: 40px;
        height: 40px;
      }

      .action-cell .view-profile-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .visitors-table {
    table {
      display: block;
      overflow-x: auto;

      thead {
        display: none;
      }

      tbody {
        display: block;

        tr {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;

          &:hover {
            transform: none;
          }
        }

        td {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border: none;

          &::before {
            content: attr(data-label);
            font-weight: 600;
            color: #6b7280;
          }

          &.photo-cell,
          &.action-cell {
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
