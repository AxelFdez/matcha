<template>
  <div class="profile--pictures--main--container">
    <div class="profile--pictures--container">
      <!-- Première image -->
      <div class="row--pictures">
        <div class="picture">
          <span
            v-if="isPhotoSet(0)"
            @click="setProfilePicture(0)"
            :class="['star-icon', { 'active': profilePicture === 0 }]"
            :title="profilePicture === 0 ? 'Photo de profil actuelle' : 'Définir comme photo de profil'">
            &#9733;
          </span>
          <img :src="images[0]" alt="" />
          <span @click="triggerFileInput(0)" class="add-icon">
            <i class="fi fi-br-add"></i>
          </span>
          <!-- Input file caché -->
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            :ref="'fileInput' + 0"
            @change="onFileChange($event, 0)"
            style="display: none"
          />
        </div>
      </div>
      <!-- Deuxième rangée d'images -->
      <div class="row--pictures">
        <div
          class="picture"
          v-for="(image, index) in images.slice(1, 3)"
          :key="index + 1"
        >
          <span
            v-if="isPhotoSet(index + 1)"
            @click="setProfilePicture(index + 1)"
            :class="['star-icon', { 'active': profilePicture === index + 1 }]"
            :title="profilePicture === index + 1 ? 'Photo de profil actuelle' : 'Définir comme photo de profil'">
            &#9733;
          </span>
          <span
            v-if="isPhotoSet(index + 1)"
            @click="deletePhoto(index + 1)"
            class="delete-icon"
            title="Supprimer cette photo">
            <i class="fi fi-br-trash"></i>
          </span>
          <img :src="image" alt="" />
          <span
            v-if="canAddPhoto(index + 1)"
            @click="triggerFileInput(index + 1)"
            class="add-icon"
          >
            <i class="fi fi-br-add"></i>
          </span>
          <span
            v-else
            class="add-icon disabled"
            title="Ajoutez d'abord la photo précédente"
          >
            <i class="fi fi-br-lock"></i>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            :ref="'fileInput' + (index + 1)"
            @change="onFileChange($event, index + 1)"
            style="display: none"
          />
        </div>
      </div>
      <!-- Troisième rangée d'images -->
      <div class="row--pictures">
        <div
          class="picture"
          v-for="(image, index) in images.slice(3, 5)"
          :key="index + 3"
        >
          <span
            v-if="isPhotoSet(index + 3)"
            @click="setProfilePicture(index + 3)"
            :class="['star-icon', { 'active': profilePicture === index + 3 }]"
            :title="profilePicture === index + 3 ? 'Photo de profil actuelle' : 'Définir comme photo de profil'">
            &#9733;
          </span>
          <span
            v-if="isPhotoSet(index + 3)"
            @click="deletePhoto(index + 3)"
            class="delete-icon"
            title="Supprimer cette photo">
            <i class="fi fi-br-trash"></i>
          </span>
          <img :src="image" alt="" />
          <span
            v-if="canAddPhoto(index + 3)"
            @click="triggerFileInput(index + 3)"
            class="add-icon"
          >
            <i class="fi fi-br-add"></i>
          </span>
          <span
            v-else
            class="add-icon disabled"
            title="Ajoutez d'abord la photo précédente"
          >
            <i class="fi fi-br-lock"></i>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            :ref="'fileInput' + (index + 3)"
            @change="onFileChange($event, index + 3)"
            style="display: none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.getPhotos();
  },

  data() {
    return {
      images: [
        require("../../../public/src/default-avatar-img.jpeg"),
        require("../../../public/src/default-avatar-img.jpeg"),
        require("../../../public/src/default-avatar-img.jpeg"),
        require("../../../public/src/default-avatar-img.jpeg"),
        require("../../../public/src/default-avatar-img.jpeg"),
      ],
      defaultImage: require("../../../public/src/default-avatar-img.jpeg"),
    };
  },
  computed: {
    profilePicture() {
      return this.$store.getters.getProfilePicture;
    },
    storePhotos() {
      return this.$store.getters.getPhotos;
    },
  },
  watch: {
    storePhotos: {
      handler() {
        // Recharger les photos quand le store change
        this.getPhotos();
      },
      deep: true,
    },
  },
  methods: {
    isPhotoSet(index) {
      // Vérifie si la photo à cet index est différente de l'image par défaut
      const imageUrl = this.images[index];
      return imageUrl && imageUrl !== this.defaultImage;
    },

    canAddPhoto(index) {
      // On peut toujours ajouter la première photo (index 0)
      if (index === 0) return true;

      // Pour les autres photos, on vérifie que toutes les photos précédentes sont définies
      for (let i = 0; i < index; i++) {
        if (!this.isPhotoSet(i)) {
          return false;
        }
      }
      return true;
    },

    getPhotos() {
      for (let i = 0; i < 5; i++) {
        this.getPhoto(i);
      }
    },

    getPhoto(index) {
      fetch(
        process.env.VUE_APP_API_URL +
          "/getPhotos/" +
          localStorage.getItem("userName") +
          "?index=" +
          index,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de la photo");
          } else if (response.status === 204) {
            throw new Error("Aucune photo trouvée");
          }
          return response.blob(); // Traiter la réponse comme un Blob
        })
        .then((blob) => {
          // Créer une URL à partir du Blob
          const imageUrl = URL.createObjectURL(blob);
          // Mettre à jour l'image dans le tableau
          if (imageUrl) {
            // console.log('imageUrl', imageUrl);
            this.images[index] = imageUrl; // Ou l'index approprié
          }
        })
        .catch((error) => {
          // console.log("Erreur lors de la récupération des photos :", error);
          // alert('Une erreur est survenue lors de la récupération des photos.');
        });
    },

    triggerFileInput(index) {
      if (index === 0) {
        this.$refs["fileInput" + index].click();
      } else {
        this.$refs["fileInput" + index][0].click();
      }
    },

    onFileChange(event, index) {
      const file = event.target.files[0];
      if (file && file.type.includes("image/")) {
        // Afficher l'image localement
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images[index] = e.target.result;
        };
        reader.readAsDataURL(file);

        // Préparer les données pour l'envoi
        const formData = new FormData();
        formData.append("photos", file);
        formData.append("imageIndex", index);

        // Envoyer l'image au serveur
        fetch(process.env.VUE_APP_API_URL + "/updateUser", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data);
            if (data.alert.type === "success") {
              if (data.imageIndex) this.getPhoto(data.imageIndex);
              // Rafraîchir les infos utilisateur depuis le store
              this.$store.dispatch("getUserInfos", localStorage.getItem("userName"));
            } else {
              alert(
                "Erreur lors du téléchargement de l'image, reessayer plus tard"
              );
            }
          })
          .catch((error) => {
            console.error("Erreur lors du téléchargement de l'image :", error);
            alert("Une erreur est survenue lors du téléchargement de l'image.");
          });
      } else {
        alert("Veuillez sélectionner un fichier image.");
      }
    },

    setProfilePicture(index) {
      // Envoyer la requête pour mettre à jour la photo de profil
      fetch(process.env.VUE_APP_API_URL + "/updateUser", {
        method: "POST",
        body: JSON.stringify({ profilePicture: index }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          if (data.alert.type === "success") {
            // Rafraîchir les infos utilisateur depuis le store
            this.$store.dispatch("getUserInfos", localStorage.getItem("userName"));
            this.$store.commit("setAlertMessage", {
              type: "success",
              message: "Photo de profil mise à jour",
            });
            // Effacer le message après 3 secondes
            setTimeout(() => {
              this.$store.commit("clearAlertMessage");
            }, 3000);
          } else {
            this.$store.commit("setAlertMessage", {
              type: "warning",
              message: data.alert.message || "Erreur lors de la mise à jour",
            });
            setTimeout(() => {
              this.$store.commit("clearAlertMessage");
            }, 3000);
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la mise à jour de la photo de profil :",
            error
          );
          this.$store.commit("setAlertMessage", {
            type: "warning",
            message: "Erreur de connexion au serveur",
          });
          setTimeout(() => {
            this.$store.commit("clearAlertMessage");
          }, 3000);
        });
    },

    deletePhoto(index) {
      // Demander confirmation avant suppression
      if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) {
        return;
      }

      // Envoyer la requête pour supprimer la photo
      fetch(process.env.VUE_APP_API_URL + "/deletePhoto", {
        method: "POST",
        body: JSON.stringify({ imageIndex: index }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          if (data.alert.type === "success") {
            // Remettre l'image par défaut localement
            this.images[index] = this.defaultImage;

            // Rafraîchir les infos utilisateur depuis le store
            this.$store.dispatch("getUserInfos", localStorage.getItem("userName"));

            this.$store.commit("setAlertMessage", {
              type: "success",
              message: "Photo supprimée avec succès",
            });
            setTimeout(() => {
              this.$store.commit("clearAlertMessage");
            }, 3000);
          } else {
            this.$store.commit("setAlertMessage", {
              type: "warning",
              message: data.alert.message || "Erreur lors de la suppression",
            });
            setTimeout(() => {
              this.$store.commit("clearAlertMessage");
            }, 3000);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de la photo :", error);
          this.$store.commit("setAlertMessage", {
            type: "warning",
            message: "Erreur de connexion au serveur",
          });
          setTimeout(() => {
            this.$store.commit("clearAlertMessage");
          }, 3000);
        });
    },
  },
};
</script>

<style lang="scss">
.profile--pictures--main--container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  .profile--pictures--container {
    width: 80%;
    padding: 20px 0 20px 0;
    margin: 0 20px 0 20px;
    display: grid;
    align-items: center;
    justify-items: center;

    @media (max-width: 812px) {
      margin: 20px 0px 0 0px;
      border-top: solid 2px rgba(93, 93, 93, 0.594);
    }

    .row--pictures {
      width: fit-content;
      height: auto;
      display: flex;
      align-items: center;
      justify-content: space-evenly;

      .picture {
        position: relative;

        img {
          border: solid 1px white;
          margin: 15px;
          opacity: 0.7;
          width: 130px;
          border-radius: 10px;
          border: solid 2px #a602e7b7;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.513);

          @media (max-width: 414px) {
            width: 100px;
          }
        }

        .star-icon {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          margin-left: 5px;
          font-weight: 400;
          font-style: italic;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

          &:hover {
            color: #ffd700;
            transform: scale(1.2);
          }

          &.active {
            color: #ffd700;
            font-size: 1.8rem;
            animation: pulse 2s infinite;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .delete-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          font-size: 1.3rem;
          color: rgba(255, 70, 70, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

          &:hover {
            color: #ff0000;
            transform: scale(1.2);
          }
        }

        .add-icon {
          i {
            display: grid;
            align-items: center;
          }

          position: absolute;
          right: 20px;
          bottom: 25px;
          color: rgb(65, 254, 65);
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.2);
          }

          &.disabled {
            color: #999;
            cursor: not-allowed;
            opacity: 0.5;

            &:hover {
              transform: none;
            }
          }
        }
      }
    }
  }
}
</style>
