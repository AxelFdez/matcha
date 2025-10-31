import { createStore } from "vuex";
import { fetchData } from "../config/api";

export const store = createStore({
  state: {
    // User Informations
    user_name: "",
    first_name: "",
    last_name: "",
    verified: false,
    ready: false,
    email: "",
    age: "",
    gender: "",
    sex_pref: "",
    bio: "",
    interests: [""],
    photos: [],
    profilePicture: 0,
    fameRating: 0,
    alertMessage: null,
    profileVisitors: [],
    profileLikes: [],
    location: {
      coordinates: [48.8566, 2.3522],
      city: "Paris",
      country: "France",
      latitude: 48.8566,
      longitude: 2.3522,
      manualMode: false
    },

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
    getUserName(state) {
      return state.user_name;
    },
    getFirstName(state) {
      return state.first_name;
    },
    getLastName(state) {
      return state.last_name;
    },
    getVerified(state) {
      return state.verified;
    },
    getReady(state) {
      return state.ready;
    },
    getEmail(state) {
      return state.email;
    },
    getAge(state) {
      return state.age;
    },
    getGender(state) {
      return state.gender;
    },
    getSexPref(state) {
      return state.sex_pref;
    },
    getBio(state) {
      return state.bio;
    },
    getInterests(state) {
      return state.interests;
    },
    getPhotos(state) {
      return state.photos;
    },
    getProfilePicture(state) {
      return state.profilePicture;
    },
    getFameRating(state) {
      return state.fameRating;
    },

    // Website initialize
    getIsReady(state) {
      return state.is_ready;
    },
    getIsLoading(state) {
      return state.isLoading;
    },
    getIsLoadingStartApp(state) {
      return state.isLoadingStartApp;
    },
    getIsConnected(state) {
      return state.is_connected;
    },
    getWebSocket(state) {
      return state.ws;
    },
    getIsLoginFormSent(state) {
      return state.is_login_form_sent;
    },
    getIsRegisterFormSent(state) {
      return state.is_register_form_sent;
    },
    getIsForgotFormSent(state) {
      return state.is_forgot_form_sent;
    },

    getIsFormSent(state) {
      return state.is_form_sent;
    },

    getServerMessage(state) {
      return state.server_message;
    },

    getAlertMessage: (state) => state.alertMessage,

    getProfileVisitors(state) {
      return state.profileVisitors;
    },

    getProfileLikes(state) {
      return state.profileLikes;
    },
    getProfileUnlikes(state) {
      return state.profileUnlikes;
    },

    getLocation(state) {
      return state.location;
    },
  },

  mutations: {
    // User Informations
    setUserName(state, value) {
      state.user_name = value;
    },
    setFirstName(state, value) {
      state.first_name = value;
    },
    setLastName(state, value) {
      state.last_name = value;
    },
    setEmail(state, value) {
      state.email = value;
    },
    setVerified(state, value) {
      state.verified = value;
    },
    setReady(state, value) {
      state.ready = value;
    },
    setAge(state, value) {
      state.age = value;
    },
    setGender(state, value) {
      state.gender = value;
    },
    setSexPref(state, value) {
      state.sex_pref = value;
    },
    setBio(state, value) {
      state.bio = value;
    },
    setInterests(state, value) {
      state.interests = value;
    },
    setPhotos(state, value) {
      state.photos = value;
    },
    setProfilePicture(state, value) {
      state.profilePicture = value;
    },
    setFameRating(state, value) {
      state.fameRating = value;
    },

    // Website initialize
    setIsReady(state, value) {
      state.is_ready = value;
    },
    setIsLoading(state, value) {
      state.isLoading = value;
    },
    setIsLoadingStartApp(state, value) {
      state.isLoadingStartApp = value;
    },
    setIsConnected(state, value) {
      state.is_connected = value;
    },
    setWebSocket(state, ws) {
      state.ws = ws;
    },
    setIsLoginFormSent(state, value) {
      state.is_login_form_sent = value;
    },
    setIsRegisterFormSent(state, value) {
      state.is_register_form_sent = value;
    },

    setIsForgotFormSent(state, value) {
      state.is_forgot_form_sent = value;
    },

    setIsFormSent(state, value) {
      state.is_form_sent = value;
    },

    setServerMessage(state, value) {
      state.server_message = value;
    },

    setAlertMessage(state, message) {
      state.alertMessage = message;
    },
    clearAlertMessage(state) {
      state.alertMessage = null;
    },
    setProfileVisitors(state, visitors) {
      state.profileVisitors = visitors;
    },
    setProfileLikes(state, likes) {
      state.profileLikes = likes;
    },
    setLocation(state, location) {
      state.location = location;
    },
  },

  actions: {
    // closeWebSocket({state}) {
    //   state.ws.close();
    // },

    initWebSocket({ commit, state }) {
      const userId = localStorage.getItem("userId");
      commit(
        "setWebSocket",
        new WebSocket(process.env.VUE_APP_WS_URL + "?id=" + userId)
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

        if (data.type === "notification" && data.message && data.message.title === "viewed") {
          // Incrémenter le fameRating quand quelqu'un voit le profil
          const currentFameRating = state.fameRating || 0;
          store.commit("setFameRating", currentFameRating + 2);
          console.log("👁️ Profil vu ! Fame Rating:", currentFameRating + 2);
        } else if (data.type === "pingLocation") {
          // Vérifier si l'utilisateur a défini sa position manuellement
          const isManualMode = state.location && state.location.manualMode === true;

          if (isManualMode) {
            console.log("🔒 Skipping location update (manualMode: true)");
            return; // Ne pas envoyer la localisation
          }

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
              console.log("📍 Envoyé newLocation :", message);
            },
            function (error) {
              console.error(
                "Erreur lors de la récupération de la position :",
                error
              );
            }
          );
        }
      };
      state.ws.onclose = function () {
        console.log("Connection is closed.");
      };
    },

    async submitRegisterForm({ commit }, formData) {
      try {
        const response = await fetchData("/register-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = response.data;
        switch (response.response.status) {
          case 201:
            commit("setServerMessage", "registerSuccess");
            break;
          case 409:
            if (responseData.message === "Username already exists") {
              commit("setServerMessage", "userExist");
            }
            if (responseData.message === "Email already exists") {
              commit("setServerMessage", "emailExist");
            }
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            commit("setServerMessage", "serverError");
            break;
          default:
            if (response.response.status >= 500) {
              commit("setServerMessage", "serverError");
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        commit("setServerMessage", "serverError");
      } finally {
        commit("setIsRegisterFormSent", true);
        commit("setIsLoading", false);
      }
    },

    async submitLoginForm({ commit, dispatch }, formData) {

      try {
        const response = await fetchData("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = response.data;
        switch (response.response.status) {
          case 201:
            localStorage.setItem("accessToken", responseData.accessToken);
            // localStorage.setItem("refreshToken", responseData.refreshToken);
            localStorage.setItem("userId", responseData.user.id);
            localStorage.setItem("userName", responseData.user.username);
            localStorage.setItem("is_ready", responseData.user.ready);
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
          case 502:
          case 503:
          case 504:
            commit("setServerMessage", "serverError");
            break;
          default:
            if (response.response.status >= 500) {
              commit("setServerMessage", "serverError");
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        commit("setServerMessage", "serverError");
      } finally {
        commit("setIsLoginFormSent", true);
        commit("setIsLoading", false);
      }
    },

    async getUserInfos({ commit, dispatch, state }, username) {
      console.log("getUserInfos");
      dispatch("initWebSocket");

      try {
        const response = await fetchData("/profile/" + username, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = response.data;
        switch (response.response.status) {
          case 200:
            commit("setUserName", responseData.user.username);
            commit("setFirstName", responseData.user.firstname);
            commit("setLastName", responseData.user.lastname);
            commit("setEmail", responseData.user.email);
            commit("setVerified", responseData.user.verified);
            commit("setReady", responseData.user.ready);
            commit("setAge", responseData.user.age);
            commit("setGender", responseData.user.gender);
            commit("setSexPref", responseData.user.sexualpreferences);
            commit("setBio", responseData.user.biography);
            commit("setInterests", responseData.user.interests);
            commit("setPhotos", responseData.user.photos);
            if (responseData.user.location) {
              const locationData = typeof responseData.user.location === 'string'
                ? JSON.parse(responseData.user.location)
                : responseData.user.location;
              commit("setLocation", locationData);
            }
            commit("setProfilePicture", responseData.user.profilepicture || 0);
            commit("setFameRating", responseData.user.famerating || 0);
            break;
          case 404:
            console.log("User not found");
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            console.log("Server Error");
            break;
          default:
            if (response.response.status >= 500) {
              console.log("Server Error");
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
      // finally {
      //   console.groupCollapsed("User Infos fetched");
      //   console.log("Username:", state.user_name);
      //   console.log("First Name:", state.first_name);
      //   console.log("Last Name:", state.last_name);
      //   console.log("Email:", state.email);
      //   console.log("Verified:", state.verified);
      //   console.log("Ready:", state.ready);
      //   console.log("Age:", state.age);
      //   console.log("Gender:", state.gender);
      //   console.log("Sexual Preferences:", state.sex_pref);
      //   console.log("Bio:", state.bio);
      //   console.log("Interests:", state.interests);
      //   console.log("Photos:", state.photos);
      //   console.groupEnd();
        // commit("setIsLoading", false);
      // }
    },

    async forgotPasswordForm({ commit }, formData) {
      // commit('setIsLoading', true);
      console.log("forgotPasswordForm");

      try {
        const response = await fetchData("/resetPasswordSendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = response.data;
        switch (response.response.status) {
          case 200:
            commit("setServerMessage", "emailSent");
            break;
          case 404:
            commit("setServerMessage", "emailNotMatch");
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            commit("setServerMessage", "serverError");
            break;
          default:
            if (response.response.status >= 500) {
              commit("setServerMessage", "serverError");
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        commit("setServerMessage", "serverError");
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
        const responseData = response.data;
        // console.log("responseData",responseData);
        switch (response.response.status) {
          case 200:
            commit("setServerMessage", responseData.alert);
            setTimeout(() => {
              store.commit("setIsConnected", false);
              localStorage.clear();
              // store.getters.getWebSocket.close();
              // router.push({ name: "LoginPage" });
            }, 5000);
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            commit("setServerMessage", responseData.alert || "serverError");
            break;
          default:
            if (response.response.status >= 500) {
              commit("setServerMessage", "serverError");
            } else {
              commit("setServerMessage", responseData.alert);
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        commit("setServerMessage", "serverError");
      } finally {
        commit("setIsFormSent", true);
        commit("setIsLoading", false);
      }
    },

    async updateUserInfosForm({ commit }, formData) {
      console.log("updateUserInfosForm", JSON.stringify(formData));
      try {
        const response = await fetchData("/updateUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = response.data;

        switch (response.response.status) {
          case 200:
            console.log("profil Updated");
            // Si responseData.alert est déjà un objet, l'utiliser tel quel
            if (responseData.alert && typeof responseData.alert === 'object') {
              commit("setAlertMessage", responseData.alert);
            } else {
              commit("setAlertMessage", {
                type: "success",
                message: responseData.alert || "Profil mis à jour avec succès!"
              });
            }
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            if (responseData.alert && typeof responseData.alert === 'object') {
              commit("setAlertMessage", responseData.alert);
            } else {
              commit("setAlertMessage", {
                type: "warning",
                message: responseData.alert || "Erreur du serveur."
              });
            }
            console.log("server error");
            break;
          default:
            if (response.response.status >= 500) {
              commit("setAlertMessage", {
                type: "warning",
                message: "Erreur du serveur."
              });
            }
            break;
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        commit("setAlertMessage", {
          type: "warning",
          message: "Une erreur est survenue lors de la soumission du formulaire."
        });
      } finally {
        commit("setIsLoading", false);
        setTimeout(() => {
          commit("clearAlertMessage");
        }, 5000);
      }
    },

    async fetchProfileVisitors({ commit }) {
      try {
        const response = await fetchData("/profile/visitors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.response.status === 200) {
          commit("setProfileVisitors", response.data.visitors || []);
        } else {
          console.error("Error fetching profile visitors:", response.data.message);
          commit("setProfileVisitors", []);
        }
      } catch (error) {
        console.error("Error in fetchProfileVisitors:", error);
        commit("setProfileVisitors", []);
      }
    },

    async fetchProfileLikes({ commit }) {
      try {
        const response = await fetchData("/profile/likes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.response.status === 200) {
          commit("setProfileLikes", response.data.likes || []);
        } else {
          console.error("Error fetching profile likes:", response.data.message);
          commit("setProfileLikes", []);
        }
      } catch (error) {
        console.error("Error in fetchProfileLikes:", error);
        commit("setProfileLikes", []);
      }
    },
  },

  async fetchProfileUnlikes({ commit }) {
    try {
      const response = await fetchData("/profile/unlikes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.response.status === 200) {
        commit("setProfileUnlikes", response.data.unlikes || []);
      } else {
        console.error("Error fetching profile unlikes:", response.data.message);
        commit("setProfileUnlikes", []);
      }
    } catch (error) {
      console.error("Error in fetchProfileUnlikes:", error);
      commit("setProfileUnlikes", []);
    }
  },


  modules: {},
});
