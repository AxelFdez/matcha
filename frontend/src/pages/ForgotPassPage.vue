<template>
    <div class="forgot--password--form--container fade-In">
        <ForgotPassForm></ForgotPassForm>
    </div>
</template>

<script>
import ForgotPassForm from '../components/forms/ForgotPassForm.vue';
export default {
    name: "ForgotPassPage",
    components: {
        ForgotPassForm,
    }
};
</script>

<style lang="scss">
.forgot--password--form--container {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>