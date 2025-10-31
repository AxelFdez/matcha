<template>
  <div class="profile-gps-container">
    <h4>
      <i class="fa-solid fa-location-dot"></i>
      Ajustement de la localisation GPS
    </h4>

    <div v-if="isLoading || isSaving || isResetting" class="loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p v-if="isLoading">Chargement de la carte...</p>
      <p v-else-if="isSaving">Enregistrement en cours...</p>
      <p v-else-if="isResetting">Réinitialisation en cours...</p>
    </div>

    <div v-else class="gps-content">
      <!-- Mode Status Badge -->
      <div class="mode-status" :class="{ manual: isManualMode }">
        <div class="status-badge">
          <i :class="isManualMode ? 'fa-solid fa-hand-pointer' : 'fa-solid fa-satellite-dish'"></i>
          <div>
            <strong>Mode: {{ isManualMode ? "Manuel" : "Automatique" }}</strong>
            <p v-if="isManualMode">
              Vous avez défini votre position manuellement. La localisation automatique est
              désactivée.
            </p>
            <p v-else>Votre position est mise à jour automatiquement.</p>
          </div>
        </div>
        <button
          v-if="isManualMode"
          @click="resetToAutomaticMode"
          :disabled="isResetting"
          class="btn-auto-mode"
        >
          <i class="fa-solid fa-rotate" v-if="!isResetting"></i>
          <i class="fa-solid fa-spinner fa-spin" v-else></i>
          {{ isResetting ? "Réinitialisation..." : "Repasser en mode automatique" }}
        </button>
      </div>
      <div class="map-container">
      <div class="map-wrapper">
        <l-map
          ref="map"
          v-model:zoom="zoom"
          :center="[currentLatitude, currentLongitude]"
          :use-global-leaflet="false"
          style="height: 500px; border-radius: 12px"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
          <l-marker
            :lat-lng="[markerLatitude, markerLongitude]"
            :draggable="true"
            @update:lat-lng="onMarkerDrag"
          >
            <l-icon :icon-size="[32, 32]" :icon-anchor="[16, 32]">
              <div class="custom-marker">
                <i class="fa-solid fa-location-dot"></i>
              </div>
            </l-icon>
          </l-marker>
        </l-map>
      </div>
      </div>

      <div v-if="hasChanges" class="new-location">
        <div class="location-info new">
          <i class="fa-solid fa-map-marked-alt"></i>
          <div>
            <strong>Nouvelle position:</strong>
            <p>{{ newCity || "Récupération..." }}, {{ newCountry || "..." }}</p>
            <span class="coordinates">
              Lat: {{ markerLatitude.toFixed(6) }}, Long: {{ markerLongitude.toFixed(6) }}
            </span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="hasChanges" @click="resetPosition" class="btn-reset">
          <i class="fa-solid fa-undo"></i>
          Réinitialiser
        </button>
        <button @click="saveNewLocation" :disabled="!hasChanges || isSaving" class="btn-save">
          <i class="fa-solid fa-check" v-if="!isSaving"></i>
          <i class="fa-solid fa-spinner fa-spin" v-else></i>
          {{ isSaving ? "Enregistrement..." : "Enregistrer la position" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchData } from "@/config/api";

export default {
  name: "ProfileGPS",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
  },
  setup() {
    const store = useStore();
    const isLoading = ref(true);
    const isSaving = ref(false);
    const isResetting = ref(false);
    const zoom = ref(13);

    // Position actuelle (originale)
    const currentLatitude = ref(48.8566);
    const currentLongitude = ref(2.3522);
    const currentCity = ref("Paris");
    const currentCountry = ref("France");

    // Position du marqueur (modifiable)
    const markerLatitude = ref(48.8566);
    const markerLongitude = ref(2.3522);
    const newCity = ref("");
    const newCountry = ref("");

    const hasChanges = computed(() => {
      return (
        Math.abs(markerLatitude.value - currentLatitude.value) > 0.0001 ||
        Math.abs(markerLongitude.value - currentLongitude.value) > 0.0001
      );
    });

    const isManualMode = computed(() => {
      const location = store.getters.getLocation;
      return location && location.manualMode === true;
    });

    onMounted(async () => {
      // Récupérer la localisation actuelle de l'utilisateur depuis le store
      const userLocation = store.getters.getLocation;

      if (userLocation && userLocation.coordinates) {
        currentLatitude.value = userLocation.coordinates[0] || 48.8566;
        currentLongitude.value = userLocation.coordinates[1] || 2.3522;
        currentCity.value = userLocation.city || "Inconnue";
        currentCountry.value = userLocation.country || "Inconnu";

        markerLatitude.value = currentLatitude.value;
        markerLongitude.value = currentLongitude.value;
      }

      isLoading.value = false;
    });

    const onMarkerDrag = async (event) => {
      markerLatitude.value = event.lat;
      markerLongitude.value = event.lng;

      // Récupérer le nom de la ville via reverse geocoding (Nominatim)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${event.lat}&lon=${event.lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();

        if (data.address) {
          newCity.value =
            data.address.city || data.address.town || data.address.village || "Inconnue";
          newCountry.value = data.address.country || "Inconnu";
        }
      } catch (error) {
        console.error("Error fetching location name:", error);
        newCity.value = "Inconnue";
        newCountry.value = "Inconnu";
      }
    };

    const resetPosition = () => {
      markerLatitude.value = currentLatitude.value;
      markerLongitude.value = currentLongitude.value;
      newCity.value = "";
      newCountry.value = "";
    };

    const saveNewLocation = async () => {
      // Sauvegarder les valeurs à envoyer
      const savedLat = markerLatitude.value;
      const savedLng = markerLongitude.value;
      const savedCity = newCity.value;
      const savedCountry = newCountry.value;

      // Cacher Leaflet AVANT l'appel API pour éviter les erreurs
      isSaving.value = true;
      await nextTick(); // Attendre que Leaflet soit démonté

      try {
        const response = await fetchData("/update-gps-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: savedLat,
            longitude: savedLng,
            city: savedCity,
            country: savedCountry,
          }),
        });

        if (response.response.status === 200) {
          // Mettre à jour toutes les données pendant que Leaflet est caché
          currentLatitude.value = savedLat;
          currentLongitude.value = savedLng;
          currentCity.value = savedCity;
          currentCountry.value = savedCountry;
          newCity.value = "";
          newCountry.value = "";

          // Mettre à jour le store
          store.commit("setLocation", {
            coordinates: [savedLat, savedLng],
            city: savedCity,
            country: savedCountry,
            latitude: savedLat,
            longitude: savedLng,
            manualMode: true,
          });

          // Attendre que toutes les mises à jour soient propagées
          await nextTick();

          // Afficher le message de succès
          const alertMsg = {
            type: "success",
            message: "Localisation mise à jour avec succès!"
          };
          store.commit("setAlertMessage", alertMsg);
          setTimeout(() => {
            store.commit("clearAlertMessage");
          }, 3000);

          // Réafficher Leaflet avec les nouvelles données
          isSaving.value = false;
        } else {
          isSaving.value = false;
          store.commit("setAlertMessage", {
            type: "warning",
            message: response.data.message || "Erreur lors de la mise à jour"
          });
          setTimeout(() => {
            store.commit("clearAlertMessage");
          }, 3000);
        }
      } catch (error) {
        console.error("Error saving location:", error);
        isSaving.value = false;
        store.commit("setAlertMessage", {
          type: "warning",
          message: "Erreur lors de la sauvegarde de la localisation"
        });
        setTimeout(() => {
          store.commit("clearAlertMessage");
        }, 3000);
      }
    };

    const resetToAutomaticMode = async () => {
      // Cacher Leaflet immédiatement
      isResetting.value = true;
      await nextTick(); // Attendre que Leaflet soit démonté

      try {
        // Demander la permission de géolocalisation au navigateur
        if (!navigator.geolocation) {
          store.commit("setAlertMessage", {
            type: "warning",
            message: "La géolocalisation n'est pas supportée par votre navigateur"
          });
          setTimeout(() => {
            store.commit("clearAlertMessage");
          }, 3000);
          isResetting.value = false;
          return;
        }

        // Obtenir la position actuelle du navigateur
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetchData("/reset-automatic-location", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  },
                }),
              });

              if (response.response.status === 200) {
                const locationData = response.data.location;

                // Mettre à jour toutes les données pendant que Leaflet est caché
                newCity.value = "";
                newCountry.value = "";
                currentLatitude.value = locationData.latitude;
                currentLongitude.value = locationData.longitude;
                currentCity.value = locationData.city;
                currentCountry.value = locationData.country;
                markerLatitude.value = locationData.latitude;
                markerLongitude.value = locationData.longitude;

                // Mettre à jour le store
                store.commit("setLocation", locationData);

                // Attendre que toutes les mises à jour soient propagées
                await nextTick();

                // Afficher le message de succès
                store.commit("setAlertMessage", {
                  type: "success",
                  message: "Mode automatique activé! Votre localisation sera mise à jour automatiquement."
                });
                setTimeout(() => {
                  store.commit("clearAlertMessage");
                }, 3000);

                // Réafficher Leaflet avec les nouvelles données
                isResetting.value = false;
              } else {
                isResetting.value = false;
                store.commit("setAlertMessage", {
                  type: "warning",
                  message: response.data.message || "Erreur lors de la réinitialisation"
                });
                setTimeout(() => {
                  store.commit("clearAlertMessage");
                }, 3000);
              }
            } catch (error) {
              console.error("Error resetting to automatic location:", error);
              isResetting.value = false;
              store.commit("setAlertMessage", {
                type: "warning",
                message: "Erreur lors de la réinitialisation de la localisation"
              });
              setTimeout(() => {
                store.commit("clearAlertMessage");
              }, 3000);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            store.commit("setAlertMessage", {
              type: "warning",
              message: "Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation."
            });
            setTimeout(() => {
              store.commit("clearAlertMessage");
            }, 3000);
            isResetting.value = false;
          }
        );
      } catch (error) {
        console.error("Error in resetToAutomaticMode:", error);
        store.commit("setAlertMessage", {
          type: "warning",
          message: "Erreur lors de la réinitialisation"
        });
        setTimeout(() => {
          store.commit("clearAlertMessage");
        }, 3000);
        isResetting.value = false;
      }
    };

    return {
      isLoading,
      isSaving,
      isResetting,
      isManualMode,
      zoom,
      currentLatitude,
      currentLongitude,
      currentCity,
      currentCountry,
      markerLatitude,
      markerLongitude,
      newCity,
      newCountry,
      hasChanges,
      onMarkerDrag,
      resetPosition,
      saveNewLocation,
      resetToAutomaticMode,
    };
  },
};
</script>

<style lang="scss" scoped>
.profile-gps-container {
  width: 100%;
  padding: 1.5rem;

  h4 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: #a602e7;
    }
  }
}

.loading {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;

  i {
    font-size: 3rem;
    color: #a602e7;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
  }
}

.gps-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mode-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border: 2px solid #3b82f6;
  gap: 1rem;

  &.manual {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
    border-color: #f59e0b;

    .status-badge i {
      color: #f59e0b;
    }
  }

  .status-badge {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex: 1;

    > i {
      font-size: 1.5rem;
      color: #3b82f6;
      margin-top: 0.25rem;
    }

    > div {
      strong {
        display: block;
        color: #1f2937;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: #4b5563;
        margin: 0;
        font-size: 0.95rem;
      }
    }
  }

  .btn-auto-mode {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    i {
      font-size: 1rem;
    }
  }
}

.current-location,
.new-location {
  .location-info {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &.new {
      background: linear-gradient(135deg, rgba(166, 2, 231, 0.05) 0%, rgba(231, 2, 160, 0.05) 100%);
      border-color: #a602e7;
    }

    > i {
      font-size: 1.5rem;
      color: #a602e7;
      margin-top: 0.25rem;
    }

    > div {
      flex: 1;

      strong {
        display: block;
        color: #1f2937;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: #4b5563;
        font-size: 1.1rem;
        margin: 0 0 0.5rem 0;
      }

      .coordinates {
        color: #6b7280;
        font-size: 0.875rem;
        font-family: monospace;
      }
    }
  }
}

.map-wrapper {
  border-radius: 12px;
  width: 80%;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .custom-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;

    i {
      font-size: 32px;
      color: #e702a0;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    i {
      font-size: 1rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-reset {
    background: #f3f4f6;
    color: #4b5563;

    &:hover:not(:disabled) {
      background: #e5e7eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .btn-save {
    background: linear-gradient(135deg, #a602e7 0%, #e702a0 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(166, 2, 231, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

.map-container{
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .profile-gps-container {
    padding: 1rem;

    h4 {
      font-size: 1.25rem;
    }
  }

  .map-wrapper {
    width: 100%;
  }

  .mode-status {
    flex-direction: column;
    align-items: flex-start;

    .btn-auto-mode {
      width: 100%;
      justify-content: center;
    }
  }

  .map-wrapper {
    height: 400px;
  }

  .action-buttons {
    flex-direction: column;

    button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
