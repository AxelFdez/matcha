<template>
    <div class="create--account--container fade-In">
      <RegisterForm></RegisterForm>
    </div>
</template>

<script>
import RegisterForm from '../components/forms/RegisterForm.vue';
export default {
  name: "RegisterPage",
  components: {
    RegisterForm,
  }
};
</script>

<style lang="scss">
.create--account--container {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>