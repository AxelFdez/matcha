<template>
      <div class="login--form--container fade-In">
        <LoginForm></LoginForm>
      </div>
  </template>

  <script>
  import LoginForm from '../components/forms/LoginForm.vue';
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';

  export default {
    name: "LoginPage",
    components: {
      LoginForm,
    },
    setup() {
      const router = useRouter();
      const store = useStore();
      const isConnected = computed(() => store.state.is_connected);

      onMounted(() => {
        // Vérifier si l'utilisateur est déjà connecté
        const accessToken = localStorage.getItem('accessToken');
        if (isConnected.value || accessToken) {
          // console.log('User already logged in, redirecting to HomePage...');
          router.push({ name: 'HomePage' });
        }
      });

      return {};
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
