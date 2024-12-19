<template>
  <div class="overflow-auto">
    <div class="card-container rounded-xl shadow-lg max-w-2xl p-4 mt-48 mx-auto">
      <carousel :user="user"></carousel>
      <div class="p-4 flex flex-col content-center item-center">
        <p class="text-sm text-gray-900 dark:text-white">{{ user.username }}</p>
        <p class="text-3xl text-gray-900 dark:text-white">{{ user.firstname }} {{ user.lastname }}</p>
      </div>
      <div class="flex justify-around items-center">
        <button type="button"
          class="text-6xl p-5 ps-12 hover:scale-105 hover:no-underline transition-transform cursor-pointer duration-300">👍</button>
        <button type="button"
          class="text-6xl p-5 pe-12 hover:scale-105 hover:no-underline transition-transform cursor-pointer duration-300">👎</button>
      </div>
      <div class="flex justify-end items-center">
        <button type="button" @click="toggleModal"
          class="flex items-center hover:scale-105 transition-transform cursor-pointer duration-300 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-3 py-2 text-xs me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
          Voir Profile
          <svg class="ml-2 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.0"
              d="M19 12H5m14 0-4 4m4-4-4-4" />
          </svg>
        </button>
      </div>
    </div>
     <!-- Modal -->
      <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10" @close="open = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-9/12 my-8 sm:w-full sm:max-w-lg">
              <profileInfos :user="user"></profileInfos>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
    </div>
  <!-- </div> -->
</template>

<script setup>
import { defineProps, onMounted } from 'vue';
import { ref } from 'vue';
import carousel from './carousel.vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import profileInfos from './ProfileInfos.vue';
const open = ref(true)

const toggleModal = () => {
  open.value = !open.value;
};

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ photos: {} })
  }
});
</script>

<style lang="scss">
.card-container {
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
}
</style>