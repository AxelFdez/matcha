<template>
  <div class="language-selector">
    <span>
      <p @click="changeLanguage('en')">En</p>
    </span>
    <p>&nbsp;|&nbsp;</p>
    <span>
      <p @click="changeLanguage('fr')">Fr</p>
    </span>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "LangSelectBtn",

  setup() {
    const { locale } = useI18n();

    const changeLanguage = (localeValue) => {
      // Met à jour la langue de l'application
      locale.value = localeValue;
    };

    return {
      changeLanguage,
    };
  },
};
</script>

<style lang="scss">
.language-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0px 10px 0px;
  height: 35px;
  width: auto;

  span {
    // color: white;

    p {
      cursor: pointer;
      color: white;
      font-size: 1.3rem;
      font-weight: 600;
      transition: ease-in-out 0.2s;

      &:hover {
        color: var(--pink);

        // transform: scale(1.1);
        text-shadow: 0 0 18px var(--pink);
      }
    }
  }

  p {
    cursor: default;
    user-select: none;
    color: white;
    font-size: 1.6rem;
    font-weight: 600;
  }
}

@media (min-width: 200px) and (max-width: 700px) {
  .language-selector {
    margin: 0px 10px -10px 10px;

    span {
      p {
        font-size: 1.1rem;
      }
    }

    p {
      font-size: 1.1rem;
    }
  }
}
</style>