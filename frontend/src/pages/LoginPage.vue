<template>
      <div class="login--form--container fade-In">
        <LoginForm></LoginForm>
      </div>
  </template>

  <script>
  import LoginForm from '../components/forms/LoginForm.vue';
  export default {
    name: "LoginPage",
    components: {
      LoginForm,
    }
  };
  </script>

  <style lang="scss">
  .login--form--container {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>