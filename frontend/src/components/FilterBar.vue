<template>
  <div class="filter-bar">
    <div class="filter-container">
      <!-- Age Range -->
      <div class="filter-group">
        <RangeSlider
          range
          :min="18"
          :max="99"
          :step="1"
          v-model:min-value="filters.ageGap.min"
          v-model:max-value="filters.ageGap.max"
          label="Âge"
          suffix=" ans"
          @change="applyFilters"
        />
      </div>

      <!-- Fame Rating Range -->
      <div class="filter-group">
        <RangeSlider
          range
          :min="0"
          :max="1000"
          :step="10"
          v-model:min-value="filters.fameRatingGap.min"
          v-model:max-value="filters.fameRatingGap.max"
          label="Popularité"
          @change="applyFilters"
        />
      </div>

      <!-- Distance Range -->
      <div class="filter-group">
        <label class="filter-label">Distance</label>
        <select v-model="filters.distanceRange" @change="applyFilters" class="filter-select">
          <option value="">Toutes distances</option>
          <option value="0-5">0-5 km</option>
          <option value="5-50">5-50 km</option>
          <option value="50-500">50-500 km</option>
          <option value="500+">+500 km</option>
        </select>
      </div>

      <!-- Sort By -->
      <div class="filter-group">
        <label class="filter-label">Trier par</label>
        <select v-model="filters.sortBy" @change="applyFilters" class="filter-select">
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
        <multiselect
          v-model="filters.tags"
          :options="availableTags"
          :multiple="true"
          :taggable="true"
          :close-on-select="false"
          @tag="addTag"
          @select="applyFilters"
          @remove="applyFilters"
          placeholder="Chercher tags..."
          tag-placeholder="Appuyez sur Entrée pour ajouter"
          select-label=""
          deselect-label=""
          selected-label=""
        >
        </multiselect>
      </div>

      <!-- Reset Icon -->
      <div class="filter-group reset-group">
        <label class="filter-label">&nbsp;</label>
        <button @click="resetFilters" class="btn-reset-icon" title="Réinitialiser les filtres">
          <i class="fas fa-redo-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted, computed } from "vue";
import Multiselect from "vue-multiselect";
import RangeSlider from "./RangeSlider.vue";
import { fetchData } from "../config/api";
import { useStore } from "vuex";

export default {
  name: "FilterBar",
  components: {
    Multiselect,
    RangeSlider,
  },
  emits: ["apply-filters", "reset-filters"],

  setup(props, { emit }) {
    const store = useStore();

    const currentUserGender = computed(() => store.getters.getGender);
    const currentUserSexPref = computed(() => store.getters.getSexPref);

    const availableTags = ref([]);

    const filters = reactive({
      ageGap: {
        min: 18,
        max: 99,
      },
      fameRatingGap: {
        min: 0,
        max: 1000,
      },
      distanceRange: "",
      tags: [],
      sortBy: "",
    });

    const addTag = (newTag) => {
      const tag = newTag.trim();
      if (tag && !filters.tags.includes(tag)) {
        filters.tags.push(tag);
        applyFilters();
      }
    };

    const applyFilters = () => {
      const appliedFilters = {};

      // Age gap
      if (filters.ageGap.min !== 18 || filters.ageGap.max !== 99) {
        appliedFilters.ageGap = {
          min: Number(filters.ageGap.min),
          max: Number(filters.ageGap.max),
        };
      }

      // Fame rating
      if (filters.fameRatingGap.min !== 0 || filters.fameRatingGap.max !== 1000) {
        appliedFilters.fameRatingGap = {
          min: Number(filters.fameRatingGap.min),
          max: Number(filters.fameRatingGap.max),
        };
      }

      // Distance range
      if (filters.distanceRange) {
        appliedFilters.distanceRange = filters.distanceRange;
      }

      // Tags
      if (filters.tags.length > 0) {
        appliedFilters.tags = filters.tags;
      }

      // Sort
      if (filters.sortBy) {
        appliedFilters.sortBy = filters.sortBy;
      }

      appliedFilters.sexPref = currentUserSexPref.value;
      appliedFilters.gender = currentUserGender.value;

      emit("apply-filters", appliedFilters);
    };

    const resetFilters = () => {
      filters.ageGap.min = 18;
      filters.ageGap.max = 99;
      filters.fameRatingGap.min = 0;
      filters.fameRatingGap.max = 1000;
      filters.distanceRange = "";
      filters.tags = [];
      filters.sortBy = "";

      emit("reset-filters");
    };

    const loadAvailableTags = async () => {
      try {
        const response = await fetchData("/getAllTags", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response && response.data && response.data.tags) {
          availableTags.value = response.data.tags;
        }
      } catch (error) {
        // // console.error('Error loading tags:', error);
      }
    };

    onMounted(() => {
      loadAvailableTags();
    });

    return {
      filters,
      availableTags,
      addTag,
      applyFilters,
      resetFilters,
      currentUserGender,
      currentUserSexPref,
    };
  },
};
</script>

<style scoped>
.filter-bar {
  width: 100%;
  margin-top: 3rem;
  position: relative;
  z-index: 100;
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
  position: relative;
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
  color: white;
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

.reset-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.btn-reset-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.625rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
}

.btn-reset-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 36, 167, 0.5);
  color: #ff24a7;
}

/* Vue Multiselect Custom Styles */
.tags-group :deep(.multiselect) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  min-height: 38px;
}

.tags-group :deep(.multiselect__tags) {
  background: transparent;
  border: none;
  padding: 0.375rem 2.5rem 0 0.5rem;
  min-height: 38px;
}

.tags-group :deep(.multiselect__input) {
  background: transparent;
  border: none;
  color: white;
  padding: 0 0 0 0.375rem;
  margin-bottom: 0;
}

.tags-group :deep(.multiselect__input)::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.tags-group :deep(.multiselect__placeholder) {
  color: rgba(255, 255, 255, 0.4);
  padding-left: 0.375rem;
  margin-bottom: 0;
}

.tags-group :deep(.multiselect__tag) {
  background: linear-gradient(135deg, rgba(255, 36, 167, 0.3), rgba(136, 144, 254, 0.3));
  border: 1px solid rgba(255, 36, 167, 0.4);
  color: white;
  padding: 0.25rem 1.625rem 0.25rem 0.625rem;
  margin-bottom: 0.25rem;
  margin-right: 0.5rem;
}

.tags-group :deep(.multiselect__tag-icon) {
  background: transparent;
  line-height: 20px;
}

.tags-group :deep(.multiselect__tag-icon:hover) {
  background: rgba(255, 36, 167, 0.3);
}

.tags-group :deep(.multiselect__tag-icon:after) {
  color: rgba(255, 255, 255, 0.8);
}

.tags-group :deep(.multiselect__tag-icon:hover:after) {
  color: #ff24a7;
}

.tags-group :deep(.multiselect__select) {
  height: 38px;
  padding: 0;
  width: 40px;
  background: transparent;
}

.tags-group :deep(.multiselect__select:before) {
  border-color: rgba(255, 255, 255, 0.6) transparent transparent;
  top: 60%;
}

.tags-group :deep(.multiselect__content-wrapper) {
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  backdrop-filter: blur(10px);
  z-index: 9999;
  position: absolute;
}

.tags-group :deep(.multiselect__content) {
  background: transparent;
}

.tags-group :deep(.multiselect__option) {
  color: white;
  padding: 0.75rem;
  min-height: auto;
}

.tags-group :deep(.multiselect__option--highlight) {
  background: linear-gradient(to right, rgba(255, 36, 167, 0.2), rgba(136, 144, 254, 0.2));
  color: white;
}

.tags-group :deep(.multiselect__option--selected) {
  background: rgba(255, 36, 167, 0.3);
  color: white;
  font-weight: 500;
}

.tags-group :deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: rgba(255, 36, 167, 0.4);
  color: white;
}

.tags-group :deep(.multiselect--active) {
  border-color: rgba(255, 36, 167, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 36, 167, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-container {
    grid-template-columns: 1fr;
  }

  .tags-group {
    grid-column: span 1;
  }
}
</style>
