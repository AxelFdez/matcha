<template>
    <div class="reset--password--form--container fade-In">
        <ResetPassword></ResetPassword>
    </div>
</template>

<script>
import ResetPassword from '@/components/forms/ResetPassword.vue';
export default {
    name: "ResetPasswordPage",
    components: {
        ResetPassword,
    }
};
</script>

<style lang="scss">
.reset--password--form--container {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>