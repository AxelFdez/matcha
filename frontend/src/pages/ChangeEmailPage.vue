<template>
    <div class="change--email--form--container fade-In">
        <ChangeEmail></ChangeEmail>
    </div>
</template>

<script>
import ChangeEmail from '@/components/profile/ChangeEmail.vue';
export default {
    name: "ChangeEmailPage",
    components: {
        ChangeEmail,
    }
};
</script>

<style lang="scss">
.change--email--form--container {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>