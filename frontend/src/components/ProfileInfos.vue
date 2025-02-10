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
  const imagePromises = props.user.photos.map((_, index) =>
    // fetchData(`/getPhotos/${username}?index=${index}`, {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    //   },
    // })
    fetch(`${process.env.VUE_APP_API_URL}/getPhotos/${username}?index=${index}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
        },
      })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : imgPlaceholder))
      .catch(() => imgPlaceholder)
  );
  photos.value = await Promise.all(imagePromises);
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

onMounted(() => {
  if (props.user.username) {
    loadImages(props.user.username);
  }
});
</script>

<template>
  <div class="card-container p-4">
    <!-- <div class="flex justify-between items-center px-4 me-4 sm:px-0"> -->
    <div class="container flex justify-around items-center h-48">
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
            :src="imgPlaceholder"
            :alt="`Photo ${index + 1}`"
            class="w-full sm:h-48 object-contain rounded-lg"
          />
        </swiper-slide>
        ...
      </swiper>
      <div class="">
        <h2 class="mt-1 max-w-2xl text-2xl text-gray-900">
          {{ user.firstname }}
        </h2>
        <h2 class="mt-1 max-w-2xl text-2xl text-gray-900">
          {{ user.lastname }}
        </h2>
        <h3 class="mt-1 max-w-2xl text-m text-gray-700">{{ user.username }}</h3>
        <h3 class="mt-1 max-w-2xl text-2xl text-gray-900">{{ user.age }} yo</h3>
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
        <p>10</p>
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
          <dt class="content-center mb-1 text-sm/6 font-medium text-gray-900">
            Interested by
          </dt>
          <!-- <dd class="mt-1 text-sm/6 text-gray-700 col-span-2 mt-0">{{ user.age }}</dd> -->
          <div>
            <img
              v-if="
                user.sexualpreferences == 'female' ||
                user.sexualpreferences == 'both'
              "
              class="inline-block me-2 size-8 sm:size-10 rounded-full ring-2 ring-white"
              src="src/office-woman.png"
              alt=""
            />
            <img
              v-if="
                user.sexualpreferences == 'male' ||
                user.sexualpreferences == 'both'
              "
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
              :center="[
                user.location.coordinates[0],
                user.location.coordinates[1],
              ]"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
              ></l-tile-layer>
              <l-marker
                :lat-lng="[
                  user.location.coordinates[0],
                  user.location.coordinates[1],
                ]"
              />
            </l-map>
          </div>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
