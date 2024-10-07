<template>
  <div class="main--page--container">
    <section class="main--page--research">

    </section>
    <section class="main--page--profile">
      <div class="profile--container">
        <ProfileCard v-if="tenUsers && tenUsers.length > 0" :user="tenUsers[0]" />
          <p v-else>Chargement des utilisateurs...</p>
      </div>
    </section>
    </div>
</template>

<script>
import ProfileCard from '@/components/ProfileCard.vue';
import { fetchData } from '../config/api';
import { ref } from "vue";
import { onMounted } from "vue";

export default {
    name: "MainPage",
    components: {
        ProfileCard
    },
    // data () {

    // },


    setup() {
  onMounted(() => {
    console.log("mounted");
    getTenUsers();
  });

  const tenUsers = ref([]);

  const getTenUsers = async () => {
      const response = await fetchData("/browseUsers", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log("data", data);
      if (data) {
        tenUsers.value = data.users;
      }
      }
    if (tenUsers.value.length === 0) {
      getTenUsers();
    }
    return { tenUsers };
  }
};
</script>

<style lang="scss">
.main--page--container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  h1 {
    font-size: 5rem;
    font-weight: 900;
    color: white;
  }
}

button {
  position: relative;
  margin-top: 100px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #ff24a7d3;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: #8890fee5;
  }
}
</style>