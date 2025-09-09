<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="justify-items-center overflow-auto">
    <div
      class="card-container mt-14 max-w-2xl justify-items-center rounded-xl p-4 shadow-lg"
    >
      <!-- <carousel :user="user"></carousel> -->
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :loop="true"
        navigation
        :pagination="{ clickable: true }"
        :scrollbar="{ draggable: true }"
        class="m-2 h-1/4 w-2/3 rounded shadow-sm shadow-black"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide v-for="(photo, index) in photos" :key="index">
          <img
            :src="imgPlaceholder"
            :alt="`Photo ${index + 1}`"
            class="w-full rounded-lg object-cover"
          />
        </swiper-slide>
        ...
      </swiper>
      <div class="m-4 justify-items-center">
        <h2 class="text-sm text-gray-900 dark:text-white">
          {{ user.username }}
        </h2>
        <h3 class="text-3xl text-gray-900 dark:text-white">
          {{ user.firstname }} {{ user.lastname }}
        </h3>
      </div>
      <div class="container flex items-center justify-around">
        <button
          @click="like"
          type="button"
          class="ms-18 cursor-pointer p-5 text-6xl transition-transform duration-300 hover:scale-105 hover:bg-transparent hover:no-underline"
        >
          👍
        </button>
        <button
          @click="ignore"
          type="button"
          class="me-18 cursor-pointer p-5 text-6xl transition-transform duration-300 hover:scale-105 hover:bg-transparent hover:no-underline"
        >
          👎
        </button>
      </div>
      <div class="container flex items-center justify-end">
        <button
          type="button"
          @click="toggleModal"
          class="mb-2 me-2 flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 transition-transform duration-300 hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
          Voir Profile
          <svg
            class="ml-2 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.0"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </button>
      </div>
    </div>
    <!-- Modal -->
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
                <profileInfos :user="user"></profileInfos>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- </div> -->
  </div>
</template>

<script setup>
import { defineProps, onMounted } from "vue";
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import profileInfos from "./ProfileInfos.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { fetchData } from "@/config/api";
import { useStore } from "vuex";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
const open = ref(false);

const toggleModal = () => {
  open.value = !open.value;
};

const store = useStore();

const modules = [Navigation, Pagination, Scrollbar, A11y];

const loadImages = async (username) => {
  const imagePromises = props.user.photos.map((_, index) =>
    fetch(
      `${process.env.VUE_APP_API_URL}/getPhotos/${username}?index=${index}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      }
    )
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : imgPlaceholder))
      .catch(() => imgPlaceholder)
  );
  photos.value = await Promise.all(imagePromises);
  // console.log("photos", photos);
};

const photos = ref([]);
const imgPlaceholder = "src/default-avatar-img.jpeg";

const ws = store.getters.getWebSocket;
const username = store.getters.getUserName;
const userId = localStorage.getItem("userId");
const like = () => {
  ws.send(
    JSON.stringify({
      type: "like",
      userId: userId,
      message: { user: username, userLiked: props.user.username },
    })
  );
};

const ignore = () => {
  ws.send(
    JSON.stringify({
      type: "ignore",
      userId: userId,
      message: { user: username, userIgnored: props.user.username },
    })
  );
};

const onSwiper = (swiper) => {
  // console.log("Swiper instance:", swiper);
};

const onSlideChange = () => {
  // console.log("Slide changed");
};

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ photos: {} }),
  },
});
onMounted(() => {
  if (props.user.username) {
    loadImages(props.user.username);
  }
});
</script>

<style lang="scss">
.card-container {
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
}
</style>
