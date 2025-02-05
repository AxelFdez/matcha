import { createStore } from "vuex";
import { fetchData } from "../config/api";
// import { get, set } from "core-js/core/dict";

export const store = createStore({
  state: {
    // User Informations
    user_name: "",
    first_name: "",
    last_name: "",
    verified: false,
    email: "",
    age: '',
    gender: '',
    sex_pref: '',
    bio: '',
    interests: [''],
    photos: [],
    alertMessage: '',

    // Website initialize
    is_ready: false,
    isLoading: false,
    isLoadingStartApp: false,
    is_connected: false,
    ws: null,
    is_login_form_sent: false,
    is_register_form_sent: false,
    is_forgot_form_sent: false,
    is_form_sent: false,
    server_message: "",
  },

  getters: {
    // User Informations
    getUserName(state) { return state.user_name; },
    getFirstName(state) { return state.first_name; },
    getLastName(state) { return state.last_name; },
    getVerified(state) { return state.verified; },
    getEmail(state) { return state.email; },
    getAge(state) { return state.age; },
    getGender(state) { return state.gender; },
    getSexPref(state) { return state.sex_pref; },
    getBio(state) { return state.bio; },
    getInterests(state) { return state.interests; },
    getPhotos(state) { return state.photos; },

    // Website initialize
    getIsReady(state) { return state.is_ready; },
    getIsLoading(state) { return state.isLoading; },
    getIsLoadingStartApp(state) { return state.isLoadingStartApp; },
    getIsConnected(state) { return state.is_connected; },
    getWebSocket(state) { return state.ws; },
    getIsLoginFormSent(state) { return state.is_login_form_sent; },
    getIsRegisterFormSent(state) { return state.is_register_form_sent; },
    getIsForgotFormSent(state) { return state.is_forgot_form_sent; },

    getIsFormSent(state) { return state.is_form_sent; },

    getServerMessage(state) { return state.server_message; },

    getAlertMessage: (state) => state.alertMessage,
  },

  mutations: {
    // User Informations
    setUserName(state, value) { state.user_name = value; },
    setFirstName(state, value) { state.first_name = value; },
    setLastName(state, value) { state.last_name = value; },
    setEmail(state, value) { state.email = value; },
    setVerified(state, value) { state.verified = value; },
    setAge(state, value) { state.age = value; },
    setGender(state, value) { state.gender = value; },
    setSexPref(state, value) { state.sex_pref = value; },
    setBio(state, value) { state.bio = value; },
    setInterests(state, value) { state.interests = value; },
    setPhotos(state, value) { state.photos = value; },

    // Website initialize
    setIsReady(state, value) { state.is_ready = value; },
    setIsLoading(state, value) { state.isLoading = value; },
    setIsLoadingStartApp(state, value) { state.isLoadingStartApp = value; },
    setIsConnected(state, value) { state.is_connected = value; },
    setWebSocket(state, ws) { state.ws = ws; },
    setIsLoginFormSent(state, value) { state.is_login_form_sent = value; },
    setIsRegisterFormSent(state, value) { state.is_register_form_sent = value; },

    setIsForgotFormSent(state, value) { state.is_forgot_form_sent = value; },

    setIsFormSent(state, value) { state.is_form_sent = value; },

    setServerMessage(state, value) { state.server_message = value; },

    setAlertMessage(state, message) {
      state.alertMessage = message;
    },
    clearAlertMessage(state) {
      state.alertMessage = '';
    },
  },

  actions: {
    // closeWebSocket({state}) {
    //   state.ws.close();
    // },


    initWebSocket({ commit, state }) {
      const userId = localStorage.getItem("userId");
      console.log ( "userId on websocket = ", userId);
      commit(
        "setWebSocket",
        new WebSocket(
          process.env.VUE_APP_API_URL + "?id=" + userId
        )
      );

      state.ws.onopen = function () {
        console.log("Connection is open ...");
        let message = JSON.stringify({
          type: "test",
          userId: userId,
          message: "Hello Server!",
        });
        store.commit("setWebSocket", state.ws);
        state.ws.send(message);
      };
      state.ws.onmessage = function (messageEvent) {
        const data = JSON.parse(messageEvent.data);
        console.log("Server says: " + data.type);

        if (data.type === "pingLocation") {
          // Obtenir la géolocalisation de l'utilisateur
          navigator.geolocation.getCurrentPosition(
            function (position) {
              let location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              let message = JSON.stringify({
                type: "newLocation",
                userId: localStorage.getItem("userId"),
                location: location,
              });
              state.ws.send(message);
              console.log("Envoyé newLocation :", message);
            },
            function (error) {
              console.error("Erreur lors de la récupération de la position :", error);
            }
          );
        }
      };
      state.ws.onclose = function () {
        console.log("Connection is closed.");
      };
    },

    async submitRegisterForm({commit}, formData) {
      // store.commit('setIsLoading', true);
      console.log(formData);
      try {
        // Envoyer les données du formulaire au backend Node.js
        const response = await fetchData("/register-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = await response.json();
        switch (response.status) {
          case 201:
            commit('setServerMessage', 'registerSuccess');
            break;
          case 409:
            if (responseData.message === 'Username already exists') {
              commit('setServerMessage', 'userExist');
            }
            if (responseData.message === 'Email already exists') {
              commit('setServerMessage', 'emailExist');
            }
            break;true
          case 503:
            commit('setServerMessage', 'serverError');
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        commit('setIsRegisterFormSent', true);
        commit('setIsLoading', false);
      }
    },


    async submitLoginForm({ commit, dispatch }, formData) {
      // commit('setIsLoading', true);
      console.log("submitLoginForm");

      try {
        const response = await fetchData("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = await response.json();
        console.log(responseData);
        switch (response.status) {
          case 201:
            localStorage.setItem("accessToken", responseData.accessToken);
            // localStorage.setItem("refreshToken", responseData.refreshToken);
            localStorage.setItem("userId", responseData.user.id);
            localStorage.setItem("userName", responseData.user.username);
            localStorage.setItem("is_ready", responseData.user.ready);
            console.log("is_ready = ", responseData.user.ready);
            commit("setUserName", localStorage.getItem("userName"));
            if (responseData.user.verified === false) {
              commit("setServerMessage", "emailNotVerif");
              break;
            }
            dispatch("getUserInfos", localStorage.getItem("userName"));

            commit("setServerMessage", "success");
            break;
          case 401:
            if (responseData.message === "Wrong Password") {
              commit("setServerMessage", "wrongPassword");
            }
            // if (responseData.message === "Email not verified") {
            //   commit("setServerMessage", "emailNotVerif");
            // }
            break;
          case 404:
            commit("setServerMessage", "loginFail");
            break;
          case 500:
            commit("setServerMessage", "serverError");
            break;
        }
        // Gérer la réponse du backend si nécessaire
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        commit("setIsLoginFormSent", true);
        commit("setIsLoading", false);
      }
    },

    async getUserInfos({commit, dispatch}, username ) {

      console.log("getUserInfos");
      dispatch("initWebSocket");

      try {
        const response = await fetchData("/profile/" + username, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },


        });
        const responseData = await response.json();
        // console.log('response = ', responseData);
        switch (response.status) {
          case 200:
            commit("setUserName", responseData.user.username);
            commit("setFirstName", responseData.user.firstname);
            commit("setLastName", responseData.user.lastname);
            commit("setEmail", responseData.user.email);
            commit("setVerified", responseData.user.verified);
            commit("setIsReady", responseData.user.ready);
            console.log("is_ready = ", responseData.user.ready);
            commit("setAge", responseData.user.age);
            commit("setGender", responseData.user.gender);
            commit("setSexPref", responseData.user.sexualPreferences);
            commit("setBio", responseData.user.biography);
            commit("setInterests", responseData.user.interests);
            commit("setPhotos", responseData.user.photos);
            break;
          case 404:
            console.log('User not found');
            break;
          case 503:
            console.log('Server Error');
            break;
        }
        // Gérer la réponse du backend si nécessaire
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },


    async forgotPasswordForm({ commit }, formData) {
      // commit('setIsLoading', true);
      console.log("forgotPasswordForm");

      try {
        const response = await fetchData("/resetPasswordSendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData),
        });
        const responseData = await response.json();
        console.log(responseData);
        switch (response.status) {
          case 200:
            commit("setServerMessage", "emailSent");
            break;
          case 404:
            commit("setServerMessage", "emailNotMatch");
            break;
          case 503:
            commit("setServerMessage", "serverError");
            break;
        }
        // Gérer la réponse du backend si nécessaire
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        commit("setIsForgotFormSent", true);
        commit("setIsLoading", false);
      }
    },

  async changeEmailForm({ commit }, formData) {

    console.log("changeEmailForm");
    // console.log(formData);
    try {
      const response = await fetchData("/resetEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      console.log("responseData",responseData);
      switch (response.status) {
        case 200:
          commit("setServerMessage", responseData.alert);
          setTimeout(() => {
            store.commit("setIsConnected", false);
            localStorage.clear();
            // store.getters.getWebSocket.close();
            // router.push({ name: "LoginPage" });
          }, 5000);
          break;
        case 503:
          commit("setServerMessage", responseData.alert);
          break;
        default :
          commit("setServerMessage", responseData.alert);
          break;
        }
        // Gérer la réponse du backend si nécessaire
      } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      commit("setIsFormSent", true);
      commit("setIsLoading", false);
    }
  },

  async updateUserInfosForm({ commit }, formData ) {

    console.log("updateUserInfosForm");
    // console.log(formData);
    try {
      const response = await fetchData("/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      console.log(responseData);

      switch (response.status) {
        case 200:
          console.log("profil Updated");
          commit('setAlertMessage', responseData.alert);
          break;
        case 503:
          commit('setAlertMessage', responseData.alert || 'Erreur du serveur.');
          console.log("server error");


          break;
        }
        // Gérer la réponse du backend si nécessaire
      } catch (error) {
      console.error("Error submitting form:", error);
      commit('setAlertMessage', 'Une erreur est survenue lors de la soumission du formulaire.');
    } finally {
      // commit("setIsFormSent", true);
      commit("setIsLoading", false);
      setTimeout(() => {
        commit("clearAlertMessage");
      }, 5000);
    }
  },

},

  modules: {},
});
