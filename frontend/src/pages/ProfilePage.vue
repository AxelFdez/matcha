a<template>
  <div v-if="this.$store.getters.getIsConnected" class="profile--page fade-In">
    <div class="profile--main--container">
      <div v-if="alert" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>
      <div class="profile--container">
        <ProfileInfos></ProfileInfos>
        <ProfilePictures></ProfilePictures>
      </div>
    </div>
  </div>
  <div v-else class="profile--page fade-In">
    <h1>Vous devez être connecté pour accéder à cette page</h1>
  </div>

</template>

<script>
import ProfileInfos from '@/components/profile/ProfileInfos.vue'
import ProfilePictures from '@/components/profile/ProfilePictures.vue'
export default {
  name: "MainPage",
  components: {
    ProfileInfos,
    ProfilePictures,
  },
  computed: {
    alert() {
      console.log('alert', this.$store.getters.getAlertMessage);
      return this.$store.getters.getAlertMessage;
    }
  },

};
</script>

<style lang="scss">

.alert.warning {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #f5c6cb;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
}

.alert.success {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #c3e6cb;
  background-color: #d4edda;
  color: #155724;
  border-radius: 5px;
}

.profile--page {

  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  // margin: 0 0px 0 0px;

  .profile--main--container {
    // border: solid 1px white;
    display: block;
    align-content: center;
    width: 100%;
    margin: 50px 20px 0 20px;
    border-radius: 10px;

    max-width: 1300px;
    height: 80%;
    // margin-bottom: 10px;
    overflow-y: auto;


    @media (max-width: 700px) {

      margin-top: 90px;
    }

    .profile--container {
      // border: solid 1px white;
      border-radius: 10px;
      background-color: #ffffff8e;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      padding: 0px 20px 20px 20px;
      display: flex;
      align-items: center;
      height: fit-content;


      @media (max-width: 812px) {
        display: grid;
        align-content: space-around;
        padding: 0px;


      }
    }
  }
}
</style>