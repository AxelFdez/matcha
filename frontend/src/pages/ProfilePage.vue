<template>
  <div v-if="this.$store.getters.getIsConnected" class="profile--page fade-In">
    <InfoModal
      :show="showInfoModal"
      title="Complétez votre profil"
      message="Pour accéder à la plateforme et découvrir d'autres utilisateurs, vous devez d'abord compléter votre profil avec les informations suivantes :"
      :requirements="profileRequirements"
      buttonText="Compris, je complète mon profil"
      iconClass="fas fa-info-circle info-icon"
      @close="handleModalClose"
    />
    <div class="profile--main--container">
      <div v-if="alert" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>
      <div class="profile--container">
        <ProfileInfos></ProfileInfos>
      </div>
    </div>
  </div>
  <div v-else class="profile--page fade-In">
    <h1>Vous devez être connecté pour accéder à cette page</h1>
  </div>

</template>

<script>
import ProfileInfos from '@/components/profile/ProfileInfos.vue'
import InfoModal from '@/components/InfoModal.vue'

export default {
  name: "ProfilePage",
  components: {
    ProfileInfos,
    InfoModal,
  },
  data() {
    return {
      showInfoModal: false,
      profileRequirements: [
        'Âge renseigné',
        'Genre défini',
        'Au moins un centre d\'intérêt',
        'Au moins une photo de profil'
      ]
    };
  },
  computed: {
    alert() {
      console.log('alert', this.$store.getters.getAlertMessage);
      return this.$store.getters.getAlertMessage;
    }
  },
  mounted() {
    // Vérifier si le paramètre setup=true est présent dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const setupComplete = urlParams.get('setup');

    if (setupComplete === 'true') {
      this.showInfoModal = true;
      // Nettoyer l'URL en enlevant le paramètre
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  },
  methods: {
    handleModalClose() {
      this.showInfoModal = false;
      // L'utilisateur reste sur la ProfilePage pour compléter son profil
    }
  }
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
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding-top: 80px;
  // margin: 0 0px 0 0px;

  .profile--main--container {
    // border: solid 1px white;
    display: block;
    align-content: center;
    width: 100%;
    margin: 20px 20px 20px 20px;
    border-radius: 10px;

    max-width: 1300px;
    height: fit-content;
    // margin-bottom: 10px;
    overflow-y: visible;


    @media (max-width: 700px) {

      margin-top: 20px;
    }

    .profile--container {
      // border: solid 1px white;
      border-radius: 10px;
      background-color: #ffffff8e;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      height: fit-content;
      width: 100%;

      @media (max-width: 812px) {
        padding: 10px;
      }
    }
  }
}
</style>