<template>
    <div></div>
  </template>

  <script>
  export default {
    name: 'GeoLocation',
    emits: ['location-updated', 'location-error'],
    data() {
      return {
        coordinates: null,
        error: null,
      };
    },
    methods: {
      getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              this.error = null;
              // Émettre l'événement avec les coordonnées
              this.$emit('location-updated', this.coordinates);
            },
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  this.error = "L'utilisateur a refusé la demande de géolocalisation.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  this.error = "Les informations de localisation ne sont pas disponibles.";
                  break;
                case error.TIMEOUT:
                  this.error = "La demande de géolocalisation a expiré.";
                  break;
                default:
                  this.error = "Une erreur inconnue s'est produite.";
                  break;
              }
              // Émettre l'événement avec l'erreur
              this.$emit('location-error', this.error);
            }
          );
        } else {
          this.error = "La géolocalisation n'est pas supportée par ce navigateur.";
          this.$emit('location-error', this.error);
        }
      },
    },
    mounted() {
      this.getLocation();
    },
  };
  </script>

  <style scoped>
  </style>
