<template>
  <section class="verify-email-page">
    <div class="verify-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Vérification de votre email en cours...</p>
      </div>

      <div v-else-if="isSuccess" class="success-state">
        <div class="icon success-icon">✓</div>
        <h2>Email vérifié avec succès !</h2>
        <p>Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter.</p>
        <router-link class="btn-primary" :to="{ name: 'LoginPage' }">
          Se connecter
        </router-link>
      </div>

      <div v-else class="error-state">
        <div class="icon error-icon">✗</div>
        <h2>Erreur de vérification</h2>
        <p>{{ errorMessage }}</p>
        <router-link class="btn-secondary" :to="{ name: 'HomePage' }">
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchData } from '@/config/api';

export default {
  name: 'VerifyEmailPage',

  setup() {
    const route = useRoute();
    const isLoading = ref(true);
    const isSuccess = ref(false);
    const errorMessage = ref('');

    const verifyEmail = async () => {
      const token = route.query.token;

      if (!token) {
        isLoading.value = false;
        isSuccess.value = false;
        errorMessage.value = 'Token de vérification manquant.';
        return;
      }

      try {
        const response = await fetchData('/verifyEmail', {
          method: 'POST',
          body: JSON.stringify({ token }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.response.status === 200) {
          isSuccess.value = true;
        } else {
          isSuccess.value = false;
          errorMessage.value = response.data.message || 'Une erreur est survenue lors de la vérification.';
        }
      } catch (error) {
        isSuccess.value = false;
        errorMessage.value = 'Erreur de connexion au serveur. Veuillez réessayer plus tard.';
        console.error('Erreur lors de la vérification de l\'email:', error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      verifyEmail();
    });

    return {
      isLoading,
      isSuccess,
      errorMessage
    };
  }
};
</script>

<style lang="scss" scoped>
.verify-email-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.verify-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-state,
.success-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
}

.success-icon {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.error-icon {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

h2 {
  color: white;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(to right, #ff24a7, #8890fe);
  color: white;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
}
</style>