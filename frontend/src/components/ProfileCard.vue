<template>
  <div class="card-container">
    <div class="profile--card">

      <carousel :user="user"></carousel>
      <div class="p-4 flex flex-col content-center item-center">
        <h2>{{ user.username }}</h2>
        <p>{{ user.firstname }} {{ user.lastname }}</p>
      </div>
    </div>
    <div class="profile--infos">
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

<style scoped lang="scss">
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 600px;
  border-radius: 30px;
  transition: .5s;
  cursor: pointer;
}

.card-container .profile--card {
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);
  display: inline-block;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  backface-visibility: hidden;
  transform: perspective(1000px) rotateY(0deg);
  transition: .5s;
  box-shadow: 0 25px 15px rgb(0 0 0 / 50%)
}

// .card-container:active .profile--card {
//   transform: perspective(1000px) rotateY(180deg);
// }

.card-container .profile--infos {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  backface-visibility: hidden;
  transform: perspective(1000px) rotateY(-180deg);
  background-image: linear-gradient(to right, #ff24a7d3, #8890fee5);

  transition: .5s;
  box-shadow: 0 25px 15px rgb(0 0 0 / 50%)
}

// .card-container:active .profile--infos {
//   transform: perspective(1000px) rotateY(0);
// }
</style>