<template>
    <div class="profile--info--container">
        <form class="form-container" @submit.prevent="submitForm">
            <h3>{{ $store.getters.getUserName }}</h3>
            <div class="form-row">
                <div class="form-col">
                    <label for="firstName">Prénom</label>
                    <input v-model="formData.firstname" id="firstname" type="text" name="firstname"
                        :placeholder="$store.getters.getFirstName" :maxlength="15" />
                </div>
                <div class="form-col">
                    <label for="lastName">Nom</label>
                    <input v-model="formData.lastname" id="lastname" type="text" name="lastname"
                        :placeholder="$store.getters.getLastName" :maxlength="15" />
                </div>
            </div>

            <div class="form-row">
                <div class="form-col email">
                    <label for="email">Email</label>
                    <input :placeholder="$store.getters.getEmail" disabled id="email" type="email" name="email" />
                </div>
                <div class="form-col age">
                    <label class="input--needed" for="age">Age<span v-if="!formData.age && !$store.getters.getAge">&#9733;</span></label>
                    <select v-model="formData.age" id="age" name="age" :class="{ placeholder: !formData.age }">
                        <option value="" disabled selected>{{ agePlaceholder }}</option>
                        <option v-for="age in ageOptions" :key="age" :value="age">
                            {{ age }}
                        </option>
                    </select>
                </div>
            </div>

            <label class="input--needed">Tagging<span v-if="formData.interests.length === 0">&#9733;</span></label>
            <multiselect v-model="formData.interests" tag-placeholder="Add this as new tag"
                placeholder="Search or add a tag" :options="options" :multiple="true" :taggable="true" @tag="addNewTag">
            </multiselect>
            <div class="text--area--bio">
                <label >Bio<span v-if="actualLengthBio">{{ actualLengthBio }}/{{ maxLengthBio }}</span></label>
                <textarea v-model="formData.biography" name="bio" id="bio" rows="3" :maxlength="maxLengthBio"
                    :placeholder="$store.getters.getBio"></textarea>
            </div>
            <div class="btn--row pt-2">
                <div class="btn--col">
                    <h4 class="input--needed">Genre<span v-if="!formData.gender && $store.getters.getGender === 'None'">&#9733;</span></h4>
                    <button id="male" type="button" @click="setGender('male')" :class="{
                        'btn--pushed':
                            formData.gender === 'male' ||
                            $store.getters.getGender === 'male',
                    }">
                        Homme
                    </button>
                    <button id="female" type="button" @click="setGender('female')" :class="{
                        'btn--pushed':
                            formData.gender === 'female' ||
                            $store.getters.getGender === 'female',
                    }">
                        Femme
                    </button>
                </div>
                <div class="btn--col">
                    <h4>Intéressé(e) par</h4>
                    <button type="button" @click="setSexualPref('male', 0)" :class="{
                        'btn--pushed':
                            formData.sexualpreferences[0] === 'male' ||
                            $store.getters.getSexPref === 'male',
                    }">
                        Homme
                    </button>
                    <button type="button" @click="setSexualPref('female', 1)" :class="{
                        'btn--pushed':
                            formData.sexualpreferences[1] === 'female' ||
                            $store.getters.getSexPref === 'female',
                    }">
                        Femme
                    </button>
                </div>
            </div>
            <div class="valid--btn">
                <button type="submit" :class="{ 'disabled--btn': !isFormValid }" :disabled="!isFormValid">
                    Apply
                </button>
            </div>
        </form>
        <div class="text--btn">
            <button @click="passwordResetMessage()" class="router--btn">
                <TextButton :btnName="$t('resetPasswordBtn')"></TextButton>
            </button>
            <p>-</p>
            <RouterLink class="router--btn" :to="{ name: 'ChangeEmailPage', params: {} }">
                <TextButton :btnName="$t('changeEmailBtn')"></TextButton>
            </RouterLink>
        </div>
        <div v-if="passwordResetAction" class="password--reset--msg">
            <p> check your mailbox </p>
        </div>
    </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { ref, watch } from "vue";
import { useStore } from "vuex";
import TextButton from "@/components/TextButton.vue";
import { fetchData } from "@/config/api";

export default {
    name: "ProfileInfos",
    components: {
        Multiselect,
        TextButton,
    },
    setup() {
        const maxLengthBio = 150;
        const actualLengthBio = ref(0);
        const store = useStore();
        let passwordResetAction = ref(false);

        async function passwordResetMessage() {
            passwordResetAction.value = true;
            await fetchData("/resetPasswordSendEmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: store.getters.getEmail }),
            });
            setTimeout(() => {
                passwordResetAction.value = false;
            }, 5000);
        }

        const formData = ref({
            firstname: "",
            lastname: "",
            biography: "",
            gender: "",
            sexualpreferences: ["", ""],
            age: "",
            interests: [],
        });

        const sexualpreferences = store.getters.getSexPref;
        if (sexualpreferences.includes("female")) {
            formData.value.sexualpreferences[1] = sexualpreferences;
        }
        else if (sexualpreferences.includes("male")) {
            formData.value.sexualpreferences[0] = sexualpreferences;
        } else if (sexualpreferences === "both") {
            formData.value.sexualpreferences[0] = "male";
            formData.value.sexualpreferences[1] = "female";
        }

        const agePlaceholder = store.getters.getAge;
        const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18);

        watch(
            formData,
            (newValue) => {
                if (newValue.biography) {
                    actualLengthBio.value = newValue.biography.length;
                } else {
                    actualLengthBio.value = 0;
                }
                if (newValue.gender) {
                    store.commit("setGender", "");
                }

                // if (newValue.age) {
                //     const ageSelect = document.getElementById('age');
                //     ageSelect.classList.remove('initial-age-color');
                // }
            },
            { deep: true }
        );

        function submitForm(event) {
            event.preventDefault();
            console.log("submit form function");

            console.log("formData = ", formData.value);
            store.dispatch("updateUserInfosForm", formData.value);
        }

        return {
            formData,
            submitForm,
            maxLengthBio,
            actualLengthBio,
            agePlaceholder,
            ageOptions,
            passwordResetMessage,
            passwordResetAction,
        };
    },
    async mounted() {
        // Load available tags from API
        await this.loadAvailableTags();
        // add existing interests
        this.addTags();
    },
    data() {
        // retrieve tags from db
        const options = [];
        return {
            options,
        };
    },
    methods: {
        async loadAvailableTags() {
            try {
                const response = await fetchData('/getAllTags', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response && response.data && response.data.tags) {
                    this.options = response.data.tags;
                }
            } catch (error) {
                console.error('Error loading tags:', error);
            }
        },
        addNewTag(newTag) {
            const tag = newTag.startsWith("#") ? newTag : `#${newTag}`;
            if (!this.options.includes(tag)) {
                this.options.push(tag);
            }
            this.formData.interests.push(tag);
        },
        addTags() {
            const tags = this.$store.getters.getInterests;
            if (tags) {

                tags.forEach((element) => {
                    this.formData.interests.push(element);
                });
            }
        },

        setGender(value) {
            this.formData.gender = value;
        },
        setSexualPref(value, index) {
            const store = this.$store;
            if (store.getters.getSexPref === value) {
                this.formData.sexualpreferences[index] = store.getters.getSexPref;
                store.commit("setSexPref", "");
            }
            // console.log("setSexualPref function ", value, index);
            // console.log("store.getters.getSexPref = ", store.getters.getSexPref);
            if (store.getters.getSexPref === value) {
                store.commit("setSexPref", "");
            }
            // console.log("store.getters.getSexPref = ", store.getters.getSexPref);
            // console.log("form before ", this.formData.sexualPreferences[index]);
            if (!this.formData.sexualpreferences[index]) {
                this.formData.sexualpreferences[index] = value;
            } else {
                console.log("I passed here")
                this.formData.sexualpreferences[index] = "";
            }
            // console.log("form ", this.formData.sexualPreferences[index]);
        },
    },
    computed: {
        isFormValid() {
            // if (
            //     // this.$store.getters.getAge === this.formData.age &&
            //     // this.$store.getters.getGender === this.formData.gender &&
            //     // this.formData.interests === this.$store.getters.getInterests &&
            //     // this.formData.sexualPreferences[0] === this.$store.getters.getSexPref &&
            //     // this.formData.sexualPreferences[1] === this.$store.getters.getSexPref &&
            //     this.formData.firstName === this.$store.getters.getFirstName &&
            //     this.formData.lastName === this.$store.getters.getLastName &&
            //     this.formData.biography === this.$store.getters.getBio
            // ) {
            //     return false;
            // }

            if ( (!this.$store.getters.getAge && !this.formData.age) ||
                (!this.$store.getters.getGender && !this.formData.gender) ||
                this.formData.interests.length === 0 ) {
                return false;
            }
            if (
                this.formData.age ||
                this.formData.firstname ||
                this.formData.lastname ||
                this.formData.biography ||
                this.formData.interests.length !== this.$store.getters.getInterests.length ||
                this.formData.sexualpreferences[0] ||
                this.formData.sexualpreferences[1] ||

                // (!this.formData.sexualPreferences[0] && !this.formData.sexualPreferences[1]) ||
                this.formData.gender ||
                (!this.formData.sexualpreferences[0] && !this.formData.sexualpreferences[1])
            ) {
                return true;
            }
            return false;
        },

    },
};
</script>

<style lang="scss">
.profile--info--container {
    width: 100%;
    // border: solid 1px red;

    h3 {
        color: #a602e7b7;
        text-align: center;
        font-size: 3rem;
        font-weight: 900;
        margin: 0;
        text-transform: capitalize;
    }

    .form-container {
        // border: solid 1px red;
        width: 80%;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px 10px 20px 20px;
        // border-radius: 10px;

        @media (max-width: 372px) {
            margin: 0;
        }

        label {
            display: block;
            margin: 5px 0 2px 3px;
            font-weight: bold;
            font-size: 0.8rem;
            color: var(--dark-gray);


        }
        .input--needed {

            span {
                margin-left: 5px;
                font-weight: 400;
                font-style: italic;
                font-size: 0.7rem;
                color: red;
            }
        }

        input,
        select {
            width: 88%;
            padding: 10px;
            // margin-bottom: 10px;
            border: none;
            color: #a602e7b7;
            font-weight: 600;
            border-radius: 5px;
            font-size: 16px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.278);
        }

        select#age {
            padding: 0;
        }

        .text--area--bio {
            // border: solid 1px blue;
            width: 98%;
            height: 85px;

            // display: grid;
            // justify-content: center;
            textarea {
                resize: none;
                width: 96%;
                padding: 8px;
                border: none;
                color: #a602e7b7;
                font-weight: 400;
                border-radius: 5px;
                font-size: 0.8rem;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.278);
            }

            label {
                span {
                    margin-left: 5px;
                    font-weight: 400;
                    font-style: italic;
                    font-size: 0.7rem;
                    color: green;
                }
            }
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: var(--pink);
            outline: none;
            box-shadow: 0 0 5px var(--pink);
        }

        .form-row {
            // border: solid 1px blue;
            // padding: 5px;
            display: flex;
            justify-content: center;
            gap: 10px;

            .form-col {
                // border: solid 1px white;

                flex: 1;
                display: flex;
                flex-direction: column;

                select#age {
                    width: 95%;
                    height: 38px;
                    text-align: center;
                    font-size: 14px;
                }
            }

            .form-col.email {
                flex: 0 0 77%;
                /* 0 means no growth, 0 means no shrink, 80% sets the basis */
            }

            .form-col.age {
                flex: 0 0 20%;
                /* 0 means no growth, 0 means no shrink, 20% sets the basis */
            }
        }
    }

    .btn--row {
        // border: solid 1px white;
        display: flex;
        justify-content: space-between;
        margin: 10px;

        .btn--col {
            // border: solid 1px red;
            width: fit-content;
            // display: flex;
            // justify-content: center;

            h4 {
                margin: 6px 0 0px 0;
                color: var(--dark-gray);
                // margin-left: 3px;
                text-align: center;
                font-size: 1rem;
                font-weight: 900;

                @media (max-width: 400px) {
                    font-size: 0.8rem;
                }
            }

            button {
                padding: 10px 20px;
                margin: 5px;
                border: none;
                border-radius: 10px;
                background-color: #6a2cf970;
                color: rgb(206, 206, 206);
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                transition: all 0.3s;
            }

            // button:hover {
            //     background-color: #a602e7;
            //     color: white;
            // }

            p {
                margin: 5px 0 0 3px;
                font-size: 0.7rem;
                color: #555;
            }
        }

        @media ((min-width: 200px) and (max-width: 600px)) or ((min-width: 812px) and (max-width: 1200px)) {
            .btn--col {
                display: grid;
                justify-items: center;
            }

            justify-content: space-evenly;
        }
    }

    .multiselect {
        width: 98%;
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.278);
    }

    .valid--btn {
        display: flex;
        justify-content: center;

        button {
            // border-top: solid 2px red;

            padding: 8px 60px;
            margin-top: 10px;
            border: none;
            border-radius: 10px;
            background-color: #a602e7b7;
            color: white;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;

            &:hover {
                // background-image: linear-gradient(to right, #ff24a7af, #8890feb2);
                background-color: #a602e7;
                box-shadow: 0 0 8px #a602e78c;

                // transform: scale(1.05);
            }
        }

        .disabled--btn {
            opacity: 0.6;
            cursor: default;

            &:hover {
                background-color: #a602e7b7;
                background-image: none;
                box-shadow: none;
            }
        }
    }

    .btn--pushed {
        background-color: #a602e7 !important;
        color: white !important;
    }

    .text--btn {
        display: flex;
        align-items: center;
        gap: 7px;
        width: fit-content;
        margin: auto;

        p {
            margin: 0;
        }

        .router--btn {
            height: fit-content;
            text-decoration: none;
        }
    }

    #firstName::placeholder,
    #lastName::placeholder {
        text-transform: capitalize;
    }

    // .initial-age-color {
    //     color: gray !important;
    // }
    .placeholder {
        color: gray !important;
    }
}
</style>