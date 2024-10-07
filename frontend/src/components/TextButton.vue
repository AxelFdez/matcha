<template>
    <div class="textButton">
        <!-- <span> -->
        <p>{{ btnName }}</p>
        <!-- </span> -->
    </div>
</template>

<script>
export default {
    name: "textButton",

    props: {
        btnName: {
            type: String,
            required: true
        }
    },


}
</script>

<style lang="scss">
.textButton {

    margin-top: 15px;
    margin: 0;

    p {

        margin: 0;
        text-align: center;
        color: var(--dark-gray);
        font-style: italic;
        font-size: 0.8rem;
        transition: all 0.1s;
        cursor: pointer;

        &:hover {
            text-decoration-line: underline;
            font-style: normal;
            color: white;
            font-weight: 500;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.442);
            // transform: scale(1.03);
        }
    }

}
</style>