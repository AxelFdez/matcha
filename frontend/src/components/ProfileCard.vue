<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="justify-items-center overflow-auto">
    <div class="card-container mt-8 max-w-2xl justify-items-center rounded-xl p-4 shadow-lg">
      <!-- 🖼️ Swiper des photos -->
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :loop="photos.length >= 3"
        navigation
        :pagination="{ clickable: true }"
        :scrollbar="{ draggable: true }"
        class="m-2 h-1/4 w-2/3 rounded shadow-sm shadow-black"
        @swiper="onSwiper"
      >
        <swiper-slide v-for="(photo, index) in photos" :key="index">
          <img :src="photo" :alt="`Photo ${index + 1}`" class="w-full rounded-lg object-cover" />
        </swiper-slide>
      </swiper>

      <!-- Nom -->
      <div class="m-4 justify-items-center">
        <h2 class="text-sm text-gray-900 dark:text-white">
          {{ user.username }}
        </h2>
        <h3 class="text-3xl text-gray-900 dark:text-white">
          {{ user.firstname }} {{ user.lastname }}
        </h3>
      </div>

      <!-- Like / Ignore -->
      <div class="container flex items-center justify-around">
        <button
          @click="like"
          type="button"
          class="ms-18 cursor-pointer p-5 text-6xl transition-transform duration-300 hover:scale-105"
        >
          👍
        </button>
        <button
          @click="ignore"
          type="button"
          class="me-18 cursor-pointer p-5 text-6xl transition-transform duration-300 hover:scale-105"
        >
          👎
        </button>
      </div>

      <!-- Voir Profil -->
      <div class="container flex items-center justify-end">
        <button
          @click="toggleModal"
          type="button"
          class="mb-2 me-2 flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 transition-transform duration-300 hover:scale-105"
        >
          Voir Profil
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
                <profileInfos :user="user" />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { useStore } from "vuex";
import profileInfos from "./ProfileInfos.vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const store = useStore();
const modules = [Navigation, Pagination, Scrollbar, A11y];
const photos = ref([]);
const open = ref(false);

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

/* ✅ Charge les photos du user */
const parsePhotos = () => {
  const rawPhotos = props.user?.photos;

  if (!rawPhotos) {
    photos.value = ["src/default-avatar-img.jpeg"];
    return;
  }

  let list = [];

  // 📦 Si c’est déjà un tableau
  if (Array.isArray(rawPhotos)) {
    list = rawPhotos.filter((p) => typeof p === "string" && p.trim() !== "");
  }

  // 🧹 Nettoyage final
  list = list.map((p) => {
    let cleaned = p.replace("/app/", "/"); // retire "app/"
    cleaned = cleaned.startsWith("/") ? cleaned : `/${cleaned}`; // s'assure qu'il y a un slash
    return `${process.env.VUE_APP_API_URL}${cleaned}`;
  });

  photos.value = list.length ? list : ["src/default-avatar-img.jpeg"];
};

/* WebSocket events */
const username = store.getters.getUserName;
const userId = localStorage.getItem("userId");
const ws = store.getters.getWebSocket;

const like = () => {
  ws.send(
    JSON.stringify({
      type: "like",
      userId,
      message: { user: username, userLiked: props.user.username },
    })
  );
};

const ignore = () => {
  ws.send(
    JSON.stringify({
      type: "ignore",
      userId,
      message: { user: username, userIgnored: props.user.username },
    })
  );
};

const toggleModal = () => {
  open.value = !open.value;
  const realUsername = store.getters.getUserName;
  const viewedUsername = props.user.username;
  if (!ws || !realUsername || !viewedUsername) {
    console.warn("WebSocket or usernames not available");
    return;
  }
  console.log("Sending viewed event:", { user: realUsername, userViewed: viewedUsername });
  ws.send(
    JSON.stringify({
      type: "viewed",
      userId: userId,
      message: { user: realUsername, userViewed: viewedUsername },
    })
  );
};

const onSwiper = (swiper) => {};

onMounted(parsePhotos);
</script>

<style lang="scss">
.card-container {
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
}
</style>
