<template>
  <div class="col--infos--contacts">
    <div class="card--contacts--title">
      <h1>{{ $t("contactUs") }}</h1>
    </div>
    <div class="contact--container">
      <Contact :infos="chris_infos"></Contact>
      <Contact :infos="axel_infos"></Contact>
    </div>
  </div>
</template>

<script>
import Contact from "./ContactCmp.vue";
import { chris_infos, axel_infos } from "../../../data/data.js";
import { useI18n } from "vue-i18n";

export default {
  name: "CardContacts",
  components: {
    Contact,
  },
  data() {
    return {
      chris_infos,
      axel_infos,
    };
  },
  setup() {
    const { t } = useI18n();
    // Utilisation de la fonction de traduction
    const contactUs = t("contactUs");

    return { contactUs };
  },
};
</script>

<style lang="scss">
.col--infos--contacts {
  box-shadow: 0 0 6px var(--gray);
  padding: 10px 0 20px 0;
  width: 32%;
  margin: 10px 0 10px 0;
  height: auto;
  .card--contacts--title {
    color: var(--gray);
    text-align: center;
    text-transform: capitalize;
    h1 {
      margin: 0px;
      font-weight: 900;
    }
  }
  .contact--container {
    display: grid;
    align-items: center;
    margin-top: 10px;
    height: 90%;
    display: grid;
    align-items: center;
  }
  @media (min-width: 200px) and (max-width: 1115px) {
    width: 90vw;

    margin: 30px 0 30px 0;
  }
}
</style>