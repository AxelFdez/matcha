<template>
    <div>
        <div class="fade-blur-bg">
            <div class="overlay"></div>
            <!-- Ajoutez une superposition semi-transparente -->
        </div>
        <div class="centered-content">
            <img src="../../public/src/feu.png" alt="Your Image" class="animated-image" />
        </div>
    </div>
</template>

<script>
export default {
    name: "LoadingCmp",
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

.fade-blur-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1300;
    animation: fadeBlur 0.3s ease-in-out forwards;
    cursor: default;

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
    }
}

@keyframes fadeBlur {
    0% {
        filter: blur(0px);
        backdrop-filter: blur(0px);
    }

    100% {
        filter: blur(4px);
        backdrop-filter: blur(4px);
    }
}

.centered-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1800;
    animation: fade-in-img 3s;
    // opacity: 0;

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

@keyframes fade-in-img {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>