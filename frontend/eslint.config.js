import vue from "eslint-plugin-vue";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  // add `eslint-plugin-vue` flat config simply
  // if you would like use more another configuration,
  // see the section: https://eslint.vuejs.org/user-guide/#bundle-configurations-eslint-config-js
  // ...vue.configs["flat/recommended"],
  ...tailwind.configs["flat/recommended"],
];