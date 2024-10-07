<template>
  <div class="about--project">
    <p v-html="replace_newLine_to_br_tags($t('aboutProjectFooter'))"></p>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { replace_newLine_to_br_tags } from "@/libft/libft.js";

export default {
  name: "AboutProject",

  setup() {
    const { t } = useI18n();
    const aboutProjectFooter = t("aboutProjectFooter");

    return {
      aboutProjectFooter,
      replace_newLine_to_br_tags,
    };
  },
};
</script>

<style lang=scss>
.about--project {
  width: 60%;
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--gray);
  padding: 0 15px 0 15px;

  margin-left: 10px;
  @media (min-width: 200px) and (max-width: 1115px) {
    margin: auto;
  }
}
</style>