<template>
  <div class="profile--pictures--main--container">
    <div class="profile--pictures--container">
      <!-- Première image -->
      <div class="row--pictures">
        <div class="picture">
          <span v-if="hasFirstPhoto" class="star-icon">&#9733;</span>
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
    hasFirstPhoto() {
      const firstImageUrl = this.images[0];
      const isDefaultImage = firstImageUrl === this.defaultImage;

      return isDefaultImage;
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
          console.log("Erreur lors de la récupération des photos :", error);
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
            console.log(data);
            if (data.alert.type === "success") {
              if (data.imageIndex) this.getPhoto(data.imageIndex);
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
          font-size: 0.7rem;
          color: red;
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
