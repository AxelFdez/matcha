<template>
  <div class="overflow-hidden">

<div class="card-container rounded-xl shadow-lg max-w-2xl p-4 mt-48 mx-auto">
      <carousel :user="user"></carousel>
      <div class="p-4 flex flex-col content-center item-center">
        <p class="text-sm text-gray-900 dark:text-white">{{ user.username }}</p>
        <p class="text-3xl text-gray-900 dark:text-white">{{ user.firstname }} {{ user.lastname }}</p>
      </div>
  <div class="flex justify-around items-center">
    <button type="button" class="text-6xl p-5 ps-12 hover:scale-105 hover:no-underline transition-transform cursor-pointer duration-300">👍</button>
    <button type="button" class="text-6xl p-5 pe-12 hover:scale-105 hover:no-underline transition-transform cursor-pointer duration-300">👎</button>
  </div>
   <div class="flex justify-end items-center">
  <button type="button" class="flex items-center hover:scale-105 transition-transform cursor-pointer duration-300 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-3 py-2 text-xs me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
  Voir Profile
  <svg class="ml-2 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.0" d="M19 12H5m14 0-4 4m4-4-4-4"/>
  </svg>
</button>
   </div>
    </div>

  </div>
</template>

<script setup>
import { defineProps, onMounted } from 'vue';
import { ref } from 'vue';
import carousel from './carousel.vue';

    const props = defineProps({
      user: {
        type: Object,
        required: true,
        default: () => ({ photos: {} })
      }
    });
</script>

<style lang="scss">
// .profile--card {
//   display: grid;
//   justify-items: center;
//   //   margin: 0px 20px 20px 20px;
//   //   width: auto;
//   //   height: auto;
//   //   padding: 40px 35px 35px 35px;
//   //   border-radius: 15px;
//   //   box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
//   //   cursor: default;
//   //   user-select: none;
// }

.card-container {
  //transform: translate(-50%, -50%);
  //width: 500px;
  //height: 600px;
  //border-radius: 30px;
  //transition: .5s;
}

.card-container{
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
  //display: inline-block;
  //width: 100%;
  //height: 100%;
  //border-radius: 30px;
  //backface-visibility: hidden;
  //transform: perspective(1000px) rotateY(0deg);
  //transition: .5s;
  //box-shadow: 0 25px 15px rgb(0 0 0 / 50%)
}

// .card-container:active .profile--card {
//   transform: perspective(1000px) rotateY(180deg);
// }

.card-container .profile--infos {
  //position: absolute;
  //top: 0;
  //left: 0;
  //width: 100%;
  //height: 100%;
  //border-radius: 30px;
  //backface-visibility: hidden;
  //transform: perspective(1000px) rotateY(-180deg);
  //background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
  //
  //transition: .5s;
  //box-shadow: 0 25px 15px rgb(0 0 0 / 50%)
}

// .card-container:active .profile--infos {
//   transform: perspective(1000px) rotateY(0);
// }
</style>