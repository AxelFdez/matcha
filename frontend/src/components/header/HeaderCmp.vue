<template>
  <div class="container" :style="{ opacity: headerOpacity }" :class="{ 'hidden-element': headerOpacity === 0 }">

    <div class="header">
      <TitleCmp></TitleCmp>

      <div class="buttons--container">
        <div class="buttons">
          <LangSelectBtn></LangSelectBtn>

          <ProfileBtn v-if="$store.getters.getIsConnected"></ProfileBtn>
          <ConnectBtn v-if="!$store.getters.getIsConnected"></ConnectBtn>
          <DisconnectBtn v-if="$store.getters.getIsConnected"></DisconnectBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TitleCmp from "./TitleCmp.vue";
import LangSelectBtn from "./LangSelectBtn.vue";
import ConnectBtn from "./ConnectBtn.vue";
import DisconnectBtn from "./DisconnectBtn.vue";
import ProfileBtn from "./ProfileBtn.vue";
// import { useStore } from "vuex";

// import { mapGetters } from "vuex";

export default {
  name: "HeaderCmp",
  components: {
    TitleCmp,
    LangSelectBtn,
    ConnectBtn,
    ProfileBtn,
    DisconnectBtn,
  },
  data() {
    // const store = useStore();
    return {
      headerOpacity: 1,
      //   connectionState: store.getters.getConnectionState,
    };
  },
  //   setup() {

  //   },
  //   computed: {
  //     ...mapGetters(["getConnectionState"]),
  //   },

  mounted() {
    window.addEventListener("scroll", this.handleScroll); // Ajoute un écouteur d'événements pour le défilement de la page lors de l'initialisation du composant
  },
  methods: {
    handleScroll() {
      // Obtenez la position verticale de défilement de la fenêtre
      const scrollPosition = window.scrollY;

      // Calculer l'opacité en fonction de la position de défilement
      // Par exemple, vous pouvez réduire progressivement l'opacité à mesure que vous faites défiler vers le haut
      this.headerOpacity = 1 - scrollPosition / 500; // 500 est la valeur de défilement à partir de laquelle vous voulez que le header soit complètement transparent

      // Assurez-vous que l'opacité est toujours comprise entre 0 et 1
      this.headerOpacity = Math.min(Math.max(this.headerOpacity, 0), 1);
    },
  },
};
</script>

<style lang=scss>
.container {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100px;

  background-image: linear-gradient(to bottom,
      rgb(0, 0, 0) 5%,
      rgba(0, 0, 0, 0));

  .header {
    position: fixed;

    width: 100%;
    max-width: 1600px;
    height: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    align-items: top;
    justify-content: space-between;

    z-index: 1100;
    /* Ajoutez le dégradé noir transparent */
    // background-image: linear-gradient(
    //   to bottom,
    //   rgb(0, 0, 0) 5%,
    //   rgba(0, 0, 0, 0)
    //   );

    .buttons--container {
      display: flex;
      align-items: top;
      margin-top: 15px;

      .buttons {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-right: 10px;
        height: fit-content;
        width: auto;
      }

      @media (max-width: 700px) {
        align-items: top;

        .buttons {
          margin-right: 10px;
          margin-top: 0px;
          display: grid;
          align-items: center;
        }
      }
    }
  }
}
</style>