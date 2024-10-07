<template>
    <div>
        <div class="loading--start fade-In">
            <!-- <div class="overlay"></div> -->
            <!-- Ajoutez une superposition semi-transparente -->
        </div>
        <div class="centered-content">
            <img src="../../public/src/feu-white.png" alt="Your Image" class="animated-image" />
        </div>
    </div>
</template>

<script>
export default {
    name: "LoadingStartApp",
    mounted() {
        // Ajoutez la classe 'prevent-scroll' au body lorsque votre composant est monté
        document.body.classList.add('prevent-scroll');
       
    },
    beforeUnmount() {
        // Supprimez la classe 'prevent-scroll' du body lorsque votre composant est détruit
        document.body.classList.remove('prevent-scroll');
    },

};
</script>

<style lang=scss>
body.prevent-scroll {
    overflow: hidden;
}

.loading--start {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1300;
    
    cursor: default;
   
    background-image: linear-gradient(to right, #ff24a7cf, #8890fed0);

  
}

.centered-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1800;

    img {
        width: 60px;
        height: 60px;
        animation: scaleAnimation 0.5s infinite alternate;


        @keyframes scaleAnimation {
            0% {
                transform: scale(1);
            }

            100% {
                transform: scale(1.2);
                /* Ajustez le facteur d'échelle selon vos besoins */
            }
        }
    }
}

</style>