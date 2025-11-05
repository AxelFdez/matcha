<script setup>
import { defineProps } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { ref, onMounted } from "vue";
import { fetchData } from "@/config/api";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import { Date } from "core-js";
import { computed } from "vue";

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

const loadImages = async (username) => {
  try {
    const imagePromises = props.user.photos.map(async (_, index) => {
      const response = await fetch(
        `${process.env.VUE_APP_API_URL.replace(/\/app$/, "")}/getPhotos/${username}?index=${index}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) return imgPlaceholder;

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    });

    photos.value = await Promise.all(imagePromises);
  } catch (err) {
    console.error("Erreur chargement images:", err);
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
const photos = ref([]);
const imgPlaceholder = "src/default-avatar-img.jpeg";

// Action buttons state
const isLiked = ref(false); // Vous avez liké cet utilisateur
const isLikedByUser = ref(false); // Cet utilisateur vous a liké
const isMatched = ref(false); // Match mutuel (vous vous êtes likés mutuellement)
const isViewedByUser = ref(false); // Cet utilisateur a vu votre profil
const isBlocked = ref(false);

// Action button handlers (UI only for now)
const toggleLike = () => {
  if (isLiked.value) {
    // Unlike
    isLiked.value = false;
    isMatched.value = false;
    console.log(`Unliked user: ${props.user.username}`);
  } else {
    // Like
    isLiked.value = true;

    // Si l'autre utilisateur nous a déjà liké, c'est un match !
    if (isLikedByUser.value) {
      isMatched.value = true;
      console.log(`🎉 MATCH avec ${props.user.username}!`);
    } else {
      console.log(`Liked user: ${props.user.username}`);
    }
  }
};

const reportUser = () => {
  console.log(`Report user as fake: ${props.user.username}`);
  // TODO: Implement report functionality
  alert(`Report ${props.user.username} as fake account (functionality to be implemented)`);
};

const blockUser = () => {
  isBlocked.value = !isBlocked.value;
  console.log(`${isBlocked.value ? "Blocked" : "Unblocked"} user: ${props.user.username}`);
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
      console.log("Checking relationship status with user ID:", viewedUserId);
      console.log("Current user data:", currentUserData);

      // Reset all states
      isMatched.value = false;
      isLiked.value = false;
      isLikedByUser.value = false;
      isViewedByUser.value = false;

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
    console.error("Error checking relationship status:", error);
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
  <div class="card-container p-4">
    <!-- <div class="flex justify-between items-center px-4 me-4 sm:px-0"> -->
    <div class="container flex justify-around items-center h-48">
      <div class="relative">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :loop="true"
          navigation
          :pagination="{ clickable: true }"
          :scrollbar="{ draggable: true }"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          class="rounded shadow-black shadow-sm w-48 m-2 !important"
        >
          <swiper-slide v-for="(photo, index) in photos" :key="index">
            <img
              :src="photo || imgPlaceholder"
              :alt="`Photo ${index + 1}`"
              class="w-full sm:h-48 object-cover rounded-lg"
            />
          </swiper-slide>
          ...
        </swiper>
      </div>
      <div class="">
        <h2 class="mt-1 max-w-2xl text-2xl text-gray-900">
          {{ user.firstname }}
        </h2>
        <h2 class="mt-1 max-w-2xl text-2xl text-gray-900">
          {{ user.lastname }}
        </h2>
        <h3 class="mt-1 max-w-2xl text-m text-gray-700">{{ user.username }}</h3>
        <h3 class="mt-1 max-w-2xl text-2xl text-gray-900">{{ user.age }} yo</h3>

        <!-- Status Badges -->
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-if="isMatched"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-300 animate-pulse"
          >
            💕 Match
          </span>
          <span
            v-else-if="isLiked"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300"
          >
            ❤️ Liked
          </span>
          <span
            v-else-if="isLikedByUser"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300"
          >
            💜 Likes You
          </span>
          <span
            v-else-if="isViewedByUser"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300"
          >
            👁️ Viewed You
          </span>
          <span
            v-if="isBlocked"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300"
          >
            🚫 Blocked
          </span>
        </div>
      </div>
      <div class="sm:self-start place-items-center">
        <img
          v-if="user.gender == 'female'"
          class="mt-6 inline-block size-10 rounded-full ring-2 ring-white"
          src="src/office-woman.png"
          alt=""
        />
        <img
          v-else
          class="mt-6 inline-block size-10 rounded-full ring-2 ring-white"
          src="src/office-man.png"
          alt=""
        />
        <p class="mt-4">Famerating</p>
        <p>{{ user.fameRating || user.famerating || 0 }}</p>
        <div
          v-if="user.connected"
          class="relative mt-4 bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"
        ></div>
        <div
          v-else
          class="relative mt-4 bottom-0 right-0 w-3.5 h-3.5 bg-grey-400 border-2 border-white rounded-full"
        ></div>
        <div v-if="user.connected">connected</div>
        <div v-else class="flex flex-col justify-center items-center">
          <p>{{ lastConnectionTime }}</p>
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
            <l-map
              class="rounded"
              ref="map "
              :zoom="zoom"
              :center="[user.location.coordinates[0], user.location.coordinates[1]]"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
              ></l-tile-layer>
              <l-marker :lat-lng="[user.location.coordinates[0], user.location.coordinates[1]]" />
            </l-map>
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
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto justify-center"
        >
          <span class="text-xl">⚠️</span>
          <span>Report as Fake</span>
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

<style scoped lang="scss"></style>
