<template>
  <div class="col--infos--team">
    <div class="card--team--title">
      <h1>matcha</h1>
      <h3>{{ $t("projectMadeBy") }}</h3>
    </div>
    <RowChris :person="chris_obj"></RowChris>
    <hr />
    <RowAxel :person="axel_obj"></RowAxel>
  </div>
</template>

<script>
import RowChris from "./RowChris.vue";
import RowAxel from "./RowAxel.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "CardTeam",
  components: {
    RowChris,
    RowAxel,
  },
  setup() {
    const chris_obj = {
      vueLogo: "src/vue-js-logo.png",
      firstName: "Christophe",
      lastName: "Massa",
      role: "Frontend - UI/UX Design",
      techUsed: "Vue.js",
      imgProfile: "src/img-chris.jpg",
    };
    const axel_obj = {
      nodeLogo: "src/node-js-logo.png",
      firstName: "Axel",
      lastName: "Fernandez",
      role: "Backend - UI/UX Design",
      techUsed: "Node.js",
      imgProfile: "src/img-axel.jpg",
    };
    const { t } = useI18n();
    // Utilisation de la fonction de traduction
    const projectMadeBy = t("projectMadeBy");
    return {
      chris_obj,
      axel_obj,
      projectMadeBy,
    };
  },
};
</script>

<style lang=scss>
.col--infos--team {
  box-shadow: 0 0 6px var(--gray);
  padding: 10px 0px 10px 0px;
  margin: 10px 0 10px 0;

  width: 32%;
  height: auto;
  .card--team--title {
    color: var(--gray);
    text-align: center;
    text-transform: capitalize;
    h1 {
      margin: 0px;
      font-weight: 900;
    }
    h3 {
      margin: 0px;
      font-weight: 800;
    }
  }

  @media (min-width: 200px) and (max-width: 1115px) {
    width: 90vw;
    border-right: none;
  }
  hr {
    height: 1px;
    border: none;
    margin-inline: 30px;
    background-color: var(--light-gray);
  }
}
</style>