<template>
  <div class="profile-stats-container">

    <!-- Fame Rating -->
    <div class="fame-rating-section">
      <div class="fame-icon">
        <i class="fa-solid fa-star"></i>
      </div>
      <div class="fame-info">
        <h4>Fame Rating</h4>
        <p class="fame-value">{{ fameRating }}</p>
        <span class="fame-label">Score de popularité</span>
      </div>
    </div>

    <!-- Section visiteurs -->
    <ProfileVisitors />

    <!-- Section likes -->
    <ProfileLikes />
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import ProfileVisitors from "./ProfileVisitors.vue";
import ProfileLikes from "./ProfileLikes.vue";

export default {
  name: "ProfileStats",
  components: {
    ProfileVisitors,
    ProfileLikes,
  },
  setup() {
    const store = useStore();
    const fameRating = computed(() => store.getters.getFameRating || 0);

    return {
      fameRating,
    };
  },
};
</script>

<style lang="scss" scoped>
.profile-stats-container {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h3 {
    color: #a602e7b7;
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
}

.fame-rating-section {
  background: linear-gradient(135deg, rgba(166, 2, 231, 0.05) 0%, rgba(231, 2, 160, 0.05) 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  max-width: 500px;
  margin: 0 auto;

  &:hover {
    border-color: #a602e7;
    box-shadow: 0 8px 16px rgba(166, 2, 231, 0.2);
    transform: translateY(-2px);
  }
}

.fame-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.fame-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;

  h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .fame-value {
    font-size: 3rem;
    font-weight: 700;
    color: #f59e0b;
    margin: 0;
    line-height: 1;
  }

  .fame-label {
    font-size: 0.875rem;
    color: #6b7280;
  }
}

.coming-soon {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(166, 2, 231, 0.1) 0%, rgba(231, 2, 160, 0.1) 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  i {
    font-size: 3rem;
    color: #a602e7;
    animation: pulse 2s ease-in-out infinite;
  }

  p {
    font-size: 1.25rem;
    color: #6b7280;
    font-weight: 500;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .profile-stats-container {
    padding: 1rem;

    h3 {
      font-size: 2rem;
    }
  }
}
</style>
