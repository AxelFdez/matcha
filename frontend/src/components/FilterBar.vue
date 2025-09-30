<template>
  <div class="filter-bar">
    <div class="filter-container">
      <!-- Age Range -->
      <div class="filter-group">
        <label class="filter-label">Âge</label>
        <div class="range-inputs">
          <input
            type="number"
            v-model.number="filters.ageGap.min"
            placeholder="Min"
            class="filter-input range-input"
            min="18"
            max="99"
          />
          <span class="range-separator">-</span>
          <input
            type="number"
            v-model.number="filters.ageGap.max"
            placeholder="Max"
            class="filter-input range-input"
            min="18"
            max="99"
          />
        </div>
      </div>

      <!-- Fame Rating Range -->
      <div class="filter-group">
        <label class="filter-label">Popularité</label>
        <div class="range-inputs">
          <input
            type="number"
            v-model.number="filters.fameRatingGap.min"
            placeholder="Min"
            class="filter-input range-input"
            min="0"
            max="1000"
          />
          <span class="range-separator">-</span>
          <input
            type="number"
            v-model.number="filters.fameRatingGap.max"
            placeholder="Max"
            class="filter-input range-input"
            min="0"
            max="1000"
          />
        </div>
      </div>

      <!-- Sort By -->
      <div class="filter-group">
        <label class="filter-label">Trier par</label>
        <select v-model="filters.sortBy" class="filter-select">
          <option value="">Par défaut</option>
          <option value="ageIncreasing">Âge croissant</option>
          <option value="ageDecreasing">Âge décroissant</option>
          <option value="fameRatingIncreasing">Popularité croissante</option>
          <option value="fameRatingDecreasing">Popularité décroissante</option>
          <option value="locationIncreasing">Distance croissante</option>
          <option value="locationDecreasing">Distance décroissante</option>
          <option value="tagsIncreasing">Moins de tags</option>
          <option value="tagsDecreasing">Plus de tags</option>
        </select>
      </div>

      <!-- Tags Filter -->
      <div class="filter-group tags-group">
        <label class="filter-label">Centres d'intérêt</label>
        <input
          type="text"
          v-model="tagInput"
          @keydown.enter.prevent="addTag"
          placeholder="Ajouter un tag..."
          class="filter-input"
        />
        <div v-if="filters.tags.length > 0" class="tags-container">
          <span
            v-for="(tag, index) in filters.tags"
            :key="index"
            class="tag-chip"
          >
            {{ tag }}
            <button @click="removeTag(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="filter-actions">
        <button @click="applyFilters" class="btn-apply">
          Appliquer
        </button>
        <button @click="resetFilters" class="btn-reset">
          Réinitialiser
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'FilterBar',
  emits: ['apply-filters', 'reset-filters'],

  setup(props, { emit }) {
    const tagInput = ref('');

    const filters = reactive({
      ageGap: {
        min: null,
        max: null
      },
      fameRatingGap: {
        min: null,
        max: null
      },
      tags: [],
      sortBy: ''
    });

    const addTag = () => {
      const tag = tagInput.value.trim();
      if (tag && !filters.tags.includes(tag)) {
        filters.tags.push(tag);
        tagInput.value = '';
      }
    };

    const removeTag = (index) => {
      filters.tags.splice(index, 1);
    };

    const applyFilters = () => {
      const appliedFilters = {};

      // Age gap
      if (filters.ageGap.min || filters.ageGap.max) {
        appliedFilters.ageGap = {};
        if (filters.ageGap.min) appliedFilters.ageGap.min = filters.ageGap.min;
        if (filters.ageGap.max) appliedFilters.ageGap.max = filters.ageGap.max;
      }

      // Fame rating gap
      if (filters.fameRatingGap.min || filters.fameRatingGap.max) {
        appliedFilters.fameRatingGap = {};
        if (filters.fameRatingGap.min) appliedFilters.fameRatingGap.min = filters.fameRatingGap.min;
        if (filters.fameRatingGap.max) appliedFilters.fameRatingGap.max = filters.fameRatingGap.max;
      }

      // Tags
      if (filters.tags.length > 0) {
        appliedFilters.tags = filters.tags;
      }

      // Sort
      if (filters.sortBy) {
        appliedFilters.sortBy = filters.sortBy;
      }

      emit('apply-filters', appliedFilters);
    };

    const resetFilters = () => {
      filters.ageGap.min = null;
      filters.ageGap.max = null;
      filters.fameRatingGap.min = null;
      filters.fameRatingGap.max = null;
      filters.tags = [];
      filters.sortBy = '';
      tagInput.value = '';

      emit('reset-filters');
    };

    return {
      filters,
      tagInput,
      addTag,
      removeTag,
      applyFilters,
      resetFilters
    };
  }
};
</script>

<style scoped>
.filter-bar {
  width: 100%;
  margin-bottom: 2rem;
}

.filter-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-group {
  grid-column: span 2;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-input,
.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  outline: none;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.filter-input:focus,
.filter-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 36, 167, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 36, 167, 0.1);
}

.filter-select {
  cursor: pointer;
}

.filter-select option {
  background: #222;
  color: white;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-input {
  flex: 1;
  min-width: 0;
}

.range-separator {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(255, 36, 167, 0.2), rgba(136, 144, 254, 0.2));
  border: 1px solid rgba(255, 36, 167, 0.3);
  border-radius: 1rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: white;
}

.tag-remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.tag-remove:hover {
  color: #ff24a7;
}

.filter-actions {
  grid-column: span 2;
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-apply,
.btn-reset {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 0.625rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-apply {
  background: linear-gradient(to right, #ff24a7, #8890fe);
  color: white;
}

.btn-apply:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 36, 167, 0.3);
}

.btn-reset {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-container {
    grid-template-columns: 1fr;
  }

  .tags-group,
  .filter-actions {
    grid-column: span 1;
  }

  .filter-actions {
    flex-direction: column;
  }
}
</style>