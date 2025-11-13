<template>
    <div class="change--email--container">
        <div v-if="!$store.getters.getIsFormSent">
            <h3>{{ $t('changeEmailTitle') }}</h3>
            <form action="" class="change--email--form" @submit.prevent="submitForm">
                <input name="email" v-model="inputs.email" :class="{
                    'text-red': !validateEmail(inputs.email),
                    'text-green': validateEmail(inputs.email),
                }" type="text" placeholder="new e-mail" />
                <button :class="{ 'disabled--btn': !inputs.emailValid }" :disabled="!isFormValid">
                    {{ $t("send") }}
                </button>
            </form>
        </div>
        <div v-if="$store.getters.getServerMessage.type === 'success'" class="success-message">
            <h3 v-html="replace_newLine_to_br_tags($t('changeEmailSuccess'))"></h3>
            <div class="email-verification-notice">
                <i class="fa-solid fa-envelope"></i>
                <p><strong>Vérifiez votre boîte mail !</strong></p>
                <p class="small-text">Un email de vérification a été envoyé à votre nouvelle adresse.</p>
                <p class="small-text">Vous serez déconnecté dans <span class="countdown">{{ countdown }}</span> secondes...</p>
            </div>
        </div>

        <div v-if="$store.getters.getServerMessage.type === 'warning'">
            <h3>{{ $store.getters.getServerMessage.message }}</h3>
        </div>

        <div v-if="$store.getters.getServerMessage.type === 'warning' || $store.getters.getServerMessage === ''" class="return--btn">
            <span @click="goToPreviousPage"><i class="fa-solid fa-circle-arrow-left"></i></span>
        </div>
    </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import { validateEmail } from "../../libft/libft.js";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { replace_newLine_to_br_tags } from '@/libft/libft.js';

export default {
    name: "ChangeEmail",

    methods: {
    goToPreviousPage() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ name: "LoginPage" });
      }
      this.$store.commit("setServerMessage", '');
    },
    },

    setup() {
        const store = useStore();
        const router = useRouter();
        const countdown = ref(5);
        let countdownInterval = null;

        store.commit("setIsFormSent", false);


        let inputs = ref({
            email: "",
            emailValid: false,
        });

        // Watcher pour détecter le succès et démarrer le compte à rebours
        const serverMessage = computed(() => store.getters.getServerMessage);

        watch(
            serverMessage,
            (newMessage) => {
                if (newMessage.type === 'success') {
                    // Démarrer le compte à rebours
                    countdown.value = 5;
                    countdownInterval = setInterval(() => {
                        countdown.value--;
                        if (countdown.value <= 0) {
                            clearInterval(countdownInterval);
                            // Déconnecter l'utilisateur et rediriger
                            store.commit("setIsConnected", false);
                            localStorage.clear();
                            const ws = store.getters.getWebSocket;
                            if (ws) {
                                ws.close();
                            }
                            router.push({ name: "LoginPage" });
                        }
                    }, 1000);
                }
            }
        );

        watch(
            inputs,
            (newValue) => {
                if (newValue.email.length != 0) {
                    if (!validateEmail(newValue.email)) {
                        inputs.value.emailValid = false;
                    } else {
                        inputs.value.emailValid = true;
                    }
                }
            },
            { deep: true }
        );

        function submitForm(event) {
            // console.log("submitFormChangeEmail");
            event.preventDefault();

            // Confirmation avant de réinitialiser l'email
            const newEmail = event.target.email.value;
            const confirmMessage = `Êtes-vous sûr de vouloir changer votre email pour "${newEmail}" ?\n\nVous devrez vérifier votre nouveau email et vous serez déconnecté.`;

            if (!window.confirm(confirmMessage)) {
                return; // L'utilisateur a annulé
            }

            // Récupérer les données du formulaire
            const formData = {
                username : store.getters.getUserName,
                email: newEmail,
            };
            setTimeout(() => {
                store.commit("setIsLoading", true);
                // store.commit("setIsFormSent", true);
                // store.commit("setIsLoading", false);
                // store.commit("setServerMessage", 'serverError');
                store.dispatch("changeEmailForm", formData);
            }, 1000);
        }

        return {
            validateEmail,
            inputs,
            submitForm,
            replace_newLine_to_br_tags,
            countdown,
        };

    },
    computed: {
        isFormValid() {
            const { emailValid } = this.inputs;
            return emailValid;
        },
    },
}
</script>

<style lang="scss">
.change--email--container {
    position: relative;
    display: grid;
    justify-items: center;
    margin: 0px 20px 20px 20px;
    width: 370px;
    height: auto;
    padding: 40px;
    border-radius: 15px;
    background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
    box-shadow: 0 0 28px rgba(0, 0, 0, 0.498);
    cursor: default;
    user-select: none;

    h3 {
        margin: -13px 0 15px 0;
        color: white;
        text-align: center;
        font-weight: 900;
        font-size: 1.5rem;
        // text-transform: capitalize;
        text-shadow: 0 0 18px rgba(255, 255, 255, 0.438);
    }

    p {
        // border: solid 1px red;
        margin: 0px 0 10px 0;
        color: white;
        font-size: 0.8rem;
        font-weight: 500;
        text-align: center;
    }

    .change--email--form {
        display: grid;
        justify-items: center;
        // width: 80%;

        input {
            padding: 6px;
            margin: 10px;
            width: 100%;
            border: none;
            outline: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            background-color: var(--purple-placeholder-bg);
            color: var(--purple);
        }

        input::placeholder {
            color: white;
            font-weight: 400;
        }

        button {
            margin-top: 25px;
            height: 45px;
            width: 180px;
            border-radius: 10px;
            border: none;
            color: white;
            font-weight: 600;
            font-size: 1.2rem;
            transition: all 0.4s;
            cursor: pointer;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.381);

            background-image: linear-gradient(to right, #ff24a7af, #8890feb2);

            &:hover {
                background-image: linear-gradient(to right, #ff24a78a, #8890fe90);
                color: var(--purple);
                transform: scale(1.1);
            }
        }

        .disabled--btn {
            opacity: 0.6;
            cursor: default;

            &:hover {
                background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
                color: white;
                transform: none;
            }
        }
    }

    .return--btn {
        // text-decoration: none;

        position: absolute;
        left: 15px;
        bottom: 15px;

        span {
            cursor: pointer;
            //   user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: white;
            transition: all ease-in-out 0.3s;

            &:hover {
                color: var(--light-pink);
            }
        }
    }

    .success-message {
        .email-verification-notice {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);

            i {
                font-size: 3rem;
                color: white;
                animation: pulse 2s infinite;
            }

            p {
                margin: 0;
                color: white;
                text-align: center;
                font-size: 1rem;

                strong {
                    font-size: 1.1rem;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
            }

            .small-text {
                font-size: 0.9rem;
                opacity: 0.95;
            }

            .countdown {
                display: inline-block;
                min-width: 1.5rem;
                font-weight: 900;
                font-size: 1.3rem;
                color: #ffd700;
                text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
                animation: countdownPulse 1s infinite;
            }
        }
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

@keyframes countdownPulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }
}
</style>
