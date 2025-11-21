<script setup>
import { defineProps } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { ref, onMounted, computed } from "vue";
import { fetchData } from "@/config/api";
import { useStore } from "vuex";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import { Date } from "core-js";

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ ProfilePicture: {} }),
  },
  center: {
    type: Array,
    default: () => [48.8566, 2.3522], // Default to Paris coordinates
  },
  zoom: {
    type: Number,
    default: 15,
  },
  tileUrl: {
    type: String,
    default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
});
const modules = [Navigation, Pagination, Scrollbar, A11y];
const store = useStore();

/* WebSocket setup */
const username = store.getters.getUserName;
const userId = localStorage.getItem("userId");
const ws = store.getters.getWebSocket;

const loadImages = async (username) => {
  try {
    // Filtrer les photos null/undefined avant de charger
    const validPhotos = props.user.photos
      .map((photo, index) => (photo !== null && photo !== undefined ? index : null))
      .filter((index) => index !== null);

    if (validPhotos.length === 0) {
      photos.value = [imgPlaceholder];
      return;
    }

    const imagePromises = validPhotos.map(async (index) => {
      const response = await fetch(
        `${process.env.VUE_APP_API_URL.replace(/\/app$/, "")}/getPhotos/${username}?index=${index}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) return null;

      const blob = await response.blob();
      return {
        url: URL.createObjectURL(blob),
        originalIndex: index,
      };
    });

    let loadedPhotos = await Promise.all(imagePromises);

    // Filtrer les photos qui n'ont pas pu être chargées
    loadedPhotos = loadedPhotos.filter((photo) => photo !== null);

    // 🎯 Mettre la photo de profil en premier si l'index existe
    const profilePictureIndex = props.user?.profilepicture;
    if (profilePictureIndex !== undefined && profilePictureIndex !== null) {
      const profilePhotoIndex = loadedPhotos.findIndex(
        (photo) => photo.originalIndex === profilePictureIndex
      );
      if (profilePhotoIndex !== -1) {
        const profilePhoto = loadedPhotos[profilePhotoIndex];
        // Retirer la photo de profil de sa position actuelle
        loadedPhotos.splice(profilePhotoIndex, 1);
        // Ajouter la photo de profil en première position
        loadedPhotos.unshift(profilePhoto);
      }
    }

    // Extraire seulement les URLs
    photos.value =
      loadedPhotos.length > 0 ? loadedPhotos.map((photo) => photo.url) : [imgPlaceholder];
  } catch (err) {
    // // console.error("Erreur chargement images:", err);
    photos.value = [imgPlaceholder];
  }
};

const calculateTimeSince = (date) => {
  const lastConnectionDate = new Date(date);
  const now = new Date();
  const diffInMs = now - lastConnectionDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInMinutes} minutes ago`;
  }
};

const lastConnectionTime = computed(() => {
  return calculateTimeSince(props.user.lastconnection);
});

/* 📏 Calcul de la distance entre deux users */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
};

const userDistance = computed(() => {
  const currentUserLocation = store.getters.getLocation;
  const otherUserLocation = props.user?.location;

  if (!currentUserLocation || !otherUserLocation) {
    // console.log('❌ Missing location data');
    return null;
  }

  // Format GeoJSON: coordinates[0] = longitude, coordinates[1] = latitude
  const lat1 = currentUserLocation.latitude || currentUserLocation.coordinates?.[1];
  const lon1 = currentUserLocation.longitude || currentUserLocation.coordinates?.[0];
  const lat2 = otherUserLocation.coordinates?.[1];
  const lon2 = otherUserLocation.coordinates?.[0];

  if (!lat1 || !lon1 || !lat2 || !lon2) {
    // console.log('❌ Invalid coordinates');
    return null;
  }

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const formatted = distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;

  return formatted;
});

const photos = ref([]);
const imgPlaceholder = "src/default-avatar-img.jpeg";

// Action buttons state
const isLiked = ref(false); // Vous avez liké cet utilisateur
const isLikedByUser = ref(false); // Cet utilisateur vous a liké
const isMatched = ref(false); // Match mutuel (vous vous êtes likés mutuellement)
const isViewedByUser = ref(false); // Cet utilisateur a vu votre profil
const isBlocked = ref(false);
const hasReported = ref(false); // A déjà reporté cet utilisateur pendant la session

// Action button handlers with WebSocket integration
const toggleLike = () => {
  if (!ws) {
    // console.warn("WebSocket not available");
    return;
  }

  if (isLiked.value) {
    // Unlike
    ws.send(
      JSON.stringify({
        type: "unlike",
        userId,
        message: { user: username, userUnliked: props.user.username },
      })
    );
    isLiked.value = false;
    isMatched.value = false;
    // console.log(`Unliked user: ${props.user.username}`);
  } else {
    // Like
    ws.send(
      JSON.stringify({
        type: "like",
        userId,
        message: { user: username, userLiked: props.user.username },
      })
    );
    isLiked.value = true;

    // Si l'autre utilisateur nous a déjà liké, c'est un match !
    if (isLikedByUser.value) {
      isMatched.value = true;
      // console.log(`🎉 MATCH avec ${props.user.username}!`);
    } else {
      // console.log(`Liked user: ${props.user.username}`);
    }
  }
};

const reportUser = () => {
  if (!ws) {
    // console.warn("WebSocket not available");
    return;
  }

  // Vérifier si déjà reporté pendant cette session
  if (hasReported.value) {
    alert(`You have already reported ${props.user.username} during this session.`);
    return;
  }

  // Envoyer le report via WebSocket
  ws.send(
    JSON.stringify({
      type: "report",
      userId,
      message: { user: username, userReported: props.user.username },
    })
  );

  // Marquer comme reporté pour cette session
  hasReported.value = true;

  // console.log(`Reported user as fake: ${props.user.username}`);
  alert(
    `You have reported ${props.user.username} as a fake account. Our team will review this report.`
  );
};

const blockUser = () => {
  if (!ws) {
    // console.warn("WebSocket not available");
    return;
  }

  const action = isBlocked.value ? "unblock" : "block";

  // Envoyer le block/unblock via WebSocket
  ws.send(
    JSON.stringify({
      type: "block",
      userId,
      message: { user: username, userBlocked: props.user.username, action: action },
    })
  );

  // Toggle l'état local
  isBlocked.value = !isBlocked.value;

  // console.log(`${isBlocked.value ? "Blocked" : "Unblocked"} user: ${props.user.username}`);
};

const onSwiper = (_swiper) => {
  // Swiper instance available if needed
};

const onSlideChange = () => {
  // Handle slide change if needed
};

const checkRelationshipStatus = async () => {
  try {
    // Récupérer les infos du user connecté depuis l'API
    const currentUsername = localStorage.getItem("userName");
    const response = await fetchData(`/profile/${currentUsername}`, {
      method: "GET",
    });

    if (response.response.status === 200) {
      const currentUserData = response.data.user;
      const viewedUserId = String(props.user.id);
      // console.log("Checking relationship status with user ID:", viewedUserId, props.user);
      // console.log("Current user data:", currentUserData);

      // Reset all states
      isMatched.value = false;
      isLiked.value = false;
      isLikedByUser.value = false;
      isViewedByUser.value = false;
      isBlocked.value = false;

      // Check if user is blocked
      if (
        currentUserData.blacklist &&
        Array.isArray(currentUserData.blacklist) &&
        currentUserData.blacklist.some((id) => String(id) === viewedUserId)
      ) {
        isBlocked.value = true;
        // console.log(`User ${props.user.username} is blocked`);
      }

      // Priority 1: Check if it's a match (matcha) - mutual like
      if (
        currentUserData.matcha &&
        Array.isArray(currentUserData.matcha) &&
        currentUserData.matcha.some((id) => String(id) === viewedUserId)
      ) {
        isMatched.value = true;
        isLiked.value = true;
        isLikedByUser.value = true;
      }
      // Priority 2: Check if we liked this user (user consulté est dans notre likedby)
      else if (
        currentUserData.likedby &&
        Array.isArray(currentUserData.likedby) &&
        currentUserData.likedby.some((id) => String(id) === viewedUserId)
      ) {
        isLikedByUser.value = true;
      } else if (
        props.user.likedby &&
        Array.isArray(props.user.likedby) &&
        props.user.likedby.some((id) => String(id) === String(currentUserData.id))
      ) {
        isLiked.value = true;
      }
      // Priority 3: Check if we viewed this user
      else if (
        currentUserData.viewedby &&
        Array.isArray(currentUserData.viewedby) &&
        currentUserData.viewedby.some((id) => String(id) === viewedUserId)
      ) {
        isViewedByUser.value = true;
      }

      // Separate check: if the viewed user liked us (to show "Likes You" or "Like Back" button)
      if (props.user.likedby && Array.isArray(props.user.likedby)) {
        const currentUserId = String(localStorage.getItem("userId"));
        if (props.user.likedby.some((id) => String(id) === currentUserId)) {
          isLikedByUser.value = true;
        }
      }
    }
  } catch (error) {
    // // console.error("Error checking relationship status:", error);
  }
};

onMounted(() => {
  if (props.user.username) {
    loadImages(props.user.username);
  }
  checkRelationshipStatus();
});
</script>

<template>
  <div class="card-container p-2 sm:p-4">
    <!-- Section principale avec photo et infos -->
    <div
      class="profile-header flex flex-col lg:flex-row lg:justify-around items-center gap-4 lg:gap-2"
    >
      <!-- Photo (Swiper) -->
      <div class="profile-photo-section w-full lg:w-auto flex justify-center">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :loop="photos.length >= 3"
          navigation
          :pagination="{ clickable: true }"
          :scrollbar="{ draggable: true }"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          class="profile-swiper rounded shadow-black shadow-sm"
        >
          <swiper-slide v-for="(photo, index) in photos" :key="index">
            <img
              :src="photo || imgPlaceholder"
              :alt="`Photo ${index + 1}`"
              class="w-full h-full object-cover rounded-lg"
            />
          </swiper-slide>
          ...
        </swiper>
      </div>

      <!-- Infos utilisateur -->
      <div class="profile-info-section text-center lg:text-left">
        <h2 class="mt-1 text-xl sm:text-2xl text-gray-900 font-semibold">
          {{ user.firstname }} {{ user.lastname }}
        </h2>
        <h3 class="mt-1 text-sm sm:text-base text-gray-700">{{ user.username }}</h3>
        <h3 class="mt-1 text-lg sm:text-2xl text-gray-900">{{ user.age }} yo</h3>
        <p v-if="userDistance" class="mt-1 text-sm text-gray-600">📍 {{ userDistance }}</p>

        <!-- Status Badges -->
        <div class="mt-2 flex flex-wrap gap-2 justify-center lg:justify-start">
          <span
            v-if="isMatched"
            class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-300 animate-pulse"
          >
            💕 Match
          </span>
          <span
            v-else-if="isLiked"
            class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300"
          >
            ❤️ Liked
          </span>
          <span
            v-else-if="isLikedByUser"
            class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300"
          >
            💜 Likes You
          </span>
          <span
            v-else-if="isViewedByUser"
            class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300"
          >
            👁️ Viewed You
          </span>
          <span
            v-if="isBlocked"
            class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300"
          >
            🚫 Blocked
          </span>
        </div>
      </div>

      <!-- Fame Rating et Statut -->
      <div
        class="profile-stats-section flex lg:flex-col items-center lg:items-center gap-4 lg:gap-2 lg:self-center"
      >
        <div class="text-center">
          <img
            v-if="user.gender == 'female'"
            class="inline-block size-8 sm:size-10 rounded-full ring-2 ring-white"
            src="src/office-woman.png"
            alt=""
          />
          <img
            v-else
            class="inline-block size-8 sm:size-10 rounded-full ring-2 ring-white"
            src="src/office-man.png"
            alt=""
          />
        </div>
        <div class="text-center">
          <p class="text-xs sm:text-sm font-medium">Famerating</p>
          <p class="text-sm sm:text-base font-bold">
            {{ user.fameRating || user.famerating || 0 }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="user.connected"
            class="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-400 border-2 border-white rounded-full"
          ></div>
          <div
            v-else
            class="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gray-400 border-2 border-white rounded-full"
          ></div>
          <div v-if="user.connected" class="text-xs sm:text-sm">Online</div>
          <div v-else class="text-xs sm:text-sm">
            {{ lastConnectionTime }}
          </div>
        </div>
      </div>
    </div>

    <div class="mx-2 mt-6 border-t border-gray-100">
      <dl class="divide-y divide-gray-100">
        <div class="px-4 pb-2 pt-1 sm:py-6 grid sm:grid-cols-3">
          <dt class="content-center mb-1 text-sm/6 font-medium text-gray-900">Interested by</dt>
          <!-- <dd class="mt-1 text-sm/6 text-gray-700 col-span-2 mt-0">{{ user.age }}</dd> -->
          <div>
            <img
              v-if="user.sexualpreferences == 'female' || user.sexualpreferences == 'both'"
              class="inline-block me-2 size-8 sm:size-10 rounded-full ring-2 ring-white"
              src="src/office-woman.png"
              alt=""
            />
            <img
              v-if="user.sexualpreferences == 'male' || user.sexualpreferences == 'both'"
              class="inline-block me-2 size-8 sm:size-10 rounded-full ring-2 ring-white"
              src="src/office-man.png"
              alt=""
            />
          </div>
        </div>
        <div class="px-4 pb-2 pt-1 sm:py-4 grid sm:grid-cols-3">
          <dt class="text-sm/6 font-medium text-gray-900">Biography</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
            {{ user.biography }}
          </dd>
        </div>
        <div class="px-4 pb-2 pt-1 sm:py-4 grid sm:grid-cols-3">
          <dt class="text-sm/6 font-medium text-gray-900">Interests</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
            {{ user.interests }}
          </dd>
        </div>
        <div class="place-items-center min-w-2 px-0 py-2 sm:py-4 sm:px-0">
          <div class="shadow-black shadow-sm w-full h-48">
            <!-- Afficher la carte seulement si la location est valide -->
            <l-map
              v-if="user.location && user.location.coordinates && user.location.coordinates.length === 2"
              class="rounded"
              ref="map "
              :zoom="zoom"
              :center="[user.location.coordinates[1], user.location.coordinates[0]]"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
              ></l-tile-layer>
              <l-marker :lat-lng="[user.location.coordinates[1], user.location.coordinates[0]]" />
            </l-map>
            <!-- Message si pas de localisation -->
            <div
              v-else
              class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
            >
              <p>📍 Localisation non disponible</p>
            </div>
          </div>
        </div>
      </dl>
    </div>

    <!-- Action Buttons -->
    <div class="border-t border-gray-100 px-4 py-4 sm:px-6">
      <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <!-- Like/Unlike Button -->
        <button
          @click="toggleLike"
          :class="
            isLiked
              ? 'bg-red-500 hover:bg-red-600'
              : isLikedByUser
              ? 'bg-purple-500 hover:bg-purple-600 animate-pulse'
              : 'bg-pink-500 hover:bg-pink-600'
          "
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto justify-center"
        >
          <span class="text-xl">{{ isLiked ? "💔" : isLikedByUser ? "💜" : "❤️" }}</span>
          <span>{{ isLiked ? "Unlike" : isLikedByUser ? "Like Back ➜ Match" : "Like" }}</span>
        </button>

        <!-- Report Button -->
        <button
          @click="reportUser"
          :disabled="hasReported"
          :class="
            hasReported
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg transform hover:scale-105'
          "
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md w-full sm:w-auto justify-center"
        >
          <span class="text-xl">{{ hasReported ? "✓" : "⚠️" }}</span>
          <span>{{ hasReported ? "Already Reported" : "Report as Fake" }}</span>
        </button>

        <!-- Block Button -->
        <button
          @click="blockUser"
          :class="isBlocked ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto justify-center"
        >
          <span class="text-xl">{{ isBlocked ? "🔓" : "🚫" }}</span>
          <span>{{ isBlocked ? "Unblock" : "Block" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-swiper {
  width: 100%;
  max-width: 200px;
  height: 200px;
  margin: 0.5rem;

  @media (min-width: 640px) {
    max-width: 250px;
    height: 250px;
  }

  @media (min-width: 1024px) {
    max-width: 200px;
    height: 200px;
  }
}

.profile-header {
  @media (max-width: 1023px) {
    padding: 1rem 0;
  }
}

.profile-info-section {
  @media (max-width: 1023px) {
    width: 100%;
    padding: 0 1rem;
  }
}

.profile-stats-section {
  @media (max-width: 1023px) {
    width: 100%;
    justify-content: center;
    padding: 1rem 0;
  }
}
</style>
