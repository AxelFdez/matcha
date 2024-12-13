<script setup>
import { PaperClipIcon } from '@heroicons/vue/20/solid'
import { defineProps } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { ref, onMounted } from 'vue';
import { fetchData } from '@/config/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';


const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ ProfilePicture: {} })
  }
});


const modules = [Navigation, Pagination, Scrollbar, A11y]

// const onSwiper = (swiper) => {
//   console.log(swiper);
// };
// const onSlideChange = () => {
//   console.log('slide change');
// };

const loadImages = async (username) => {
  const imagePromises = props.user.photos.map((_, index) =>
      fetchData(`/getPhotos/${username}?index=${index}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
          .then((response) => response.ok ? response.blob() : null)
          .then((blob) => blob ? URL.createObjectURL(blob) : imgPlaceholder)
          .catch(() => imgPlaceholder)
  );
  photos.value = await Promise.all(imagePromises);
};

const photos = ref([]);
const imgPlaceholder = 'src/default-avatar-img.jpeg';

onMounted(() => {

if (props.user.username) {
  loadImages(props.user.username);
}
});

</script>

<template>
  <div class="card-container p-4">
    <!-- <div class="flex justify-between items-center px-4 me-4 sm:px-0"> -->
      <div class="flex justify-around items-center">
        <swiper
    :modules="modules"
    :slides-per-view="1"
    :space-between="50"
    :loop="true"
    navigation
    :pagination="{ clickable: true }"
    :scrollbar="{ draggable: true }"
    @swiper="onSwiper"
    @slideChange="onSlideChange"

  >
  <swiper-slide v-for="(photo, index) in photos" :key="index">
        <img
          :src=imgPlaceholder
          :alt="`Photo ${index + 1}`"
          class="w-full h-48 object-contain rounded-lg"
        />
      </swiper-slide>
    ...
  </swiper>
  <div class = "flex flex-col">
    <h2 class="mt-1 ms-8 max-w-2xl text-sm/4 text-gray-900">{{ user.firstname }}</h2>
    <h2 class="mt-1 ms-8 max-w-2xl text-sm/4 text-gray-900">{{ user.lastname }}</h2>
    <h3 class="mt-1 ms-8 max-w-2xl text-sm/4 text-gray-700">{{ user.username }}</h3>
  </div>
<div>
<img v-if="user.gender == 'female'" class="inline-block size-10 rounded-full ring-2 ring-white"
     src="src/office-woman.png"
    alt="" >
<img v-else class="inline-block size-10 rounded-full ring-2 ring-white" src="src/office-man.png"
    alt="" >
    <p>SCORE: 0</p>
</div>
</div>

    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y divide-gray-100">
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">Email address</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">margotfoster@example.com</dd>
        </div>
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">Salary expectation</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">$120,000</dd>
        </div>
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">About</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">Fugiat ipsum ipsum deserunt culpa aute sint do
            nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit
            nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit
            deserunt qui eu.</dd>
        </div>
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">Attachments</dt>
          <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
              <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                <div class="flex w-0 flex-1 items-center">
                  <PaperClipIcon class="size-5 shrink-0 text-gray-400" aria-hidden="true" />
                  <div class="ml-4 flex min-w-0 flex-1 gap-2">
                    <span class="truncate font-medium">resume_back_end_developer.pdf</span>
                    <span class="shrink-0 text-gray-400">2.4mb</span>
                  </div>
                </div>
                <div class="ml-4 shrink-0">
                  <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                </div>
              </li>
              <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                <div class="flex w-0 flex-1 items-center">
                  <PaperClipIcon class="size-5 shrink-0 text-gray-400" aria-hidden="true" />
                  <div class="ml-4 flex min-w-0 flex-1 gap-2">
                    <span class="truncate font-medium">coverletter_back_end_developer.pdf</span>
                    <span class="shrink-0 text-gray-400">4.5mb</span>
                  </div>
                </div>
                <div class="ml-4 shrink-0">
                  <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                </div>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-container {
  background: rgb(83, 83, 83);
}

</style>