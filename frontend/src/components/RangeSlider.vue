<template>
  <div class="w-full">
    <!-- Label et valeurs -->
    <div v-if="label || showValues" class="mb-2 flex items-center justify-between">
      <label v-if="label" class="text-sm font-medium text-white">
        {{ label }}
      </label>
      <div v-if="showValues" class="text-sm font-semibold text-white">
        <span v-if="range">{{ formatValue(localMin) }} - {{ formatValue(localMax) }}</span>
        <span v-else>{{ formatValue(localValue) }}</span>
      </div>
    </div>

    <!-- Container du slider -->
    <div class="relative pt-4">
      <!-- Track (barre de fond) -->
      <div class="relative h-2 rounded-full bg-gray-200">
        <!-- Range actif (partie colorée) -->
        <div
          v-if="range"
          class="absolute h-full rounded-full slider-active"
          :style="{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            width: `${((localMax - localMin) / (max - min)) * 100}%`
          }"
        ></div>
        <div
          v-else
          class="absolute h-full rounded-full slider-active"
          :style="{ width: `${((localValue - min) / (max - min)) * 100}%` }"
        ></div>
      </div>

      <!-- Mode Range (deux curseurs) -->
      <template v-if="range">
        <!-- Curseur Min -->
        <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          v-model.number="localMin"
          @input="handleMinInput"
          @change="handleMinChange"
          class="range-slider absolute top-0 w-full"
          :disabled="disabled"
        />
        <!-- Curseur Max -->
        <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          v-model.number="localMax"
          @input="handleMaxInput"
          @change="handleMaxChange"
          class="range-slider absolute top-0 w-full"
          :disabled="disabled"
        />
      </template>

      <!-- Mode Simple (un curseur) -->
      <template v-else>
        <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          v-model.number="localValue"
          @input="handleValueInput"
          @change="handleValueChange"
          class="range-slider absolute top-0 w-full"
          :disabled="disabled"
        />
      </template>
    </div>

    <!-- Labels min/max optionnels -->
    <div v-if="showMinMax" class="mt-2 flex justify-between text-xs text-gray-500">
      <span>{{ formatValue(min) }}</span>
      <span>{{ formatValue(max) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RangeSlider',
  props: {
    // Mode range (deux curseurs) ou simple (un curseur)
    range: {
      type: Boolean,
      default: false
    },
    // Valeur pour mode simple
    modelValue: {
      type: Number,
      default: 0
    },
    // Valeur min pour mode range
    minValue: {
      type: Number,
      default: 0
    },
    // Valeur max pour mode range
    maxValue: {
      type: Number,
      default: 100
    },
    // Limite minimale
    min: {
      type: Number,
      default: 0
    },
    // Limite maximale
    max: {
      type: Number,
      default: 100
    },
    // Pas d'incrémentation
    step: {
      type: Number,
      default: 1
    },
    // Label du slider
    label: {
      type: String,
      default: ''
    },
    // Afficher les valeurs actuelles
    showValues: {
      type: Boolean,
      default: true
    },
    // Afficher min/max
    showMinMax: {
      type: Boolean,
      default: false
    },
    // Format d'affichage (ex: '€', '%', 'km')
    suffix: {
      type: String,
      default: ''
    },
    prefix: {
      type: String,
      default: ''
    },
    // Désactiver le slider
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:minValue', 'update:maxValue', 'change'],
  data() {
    return {
      localValue: this.modelValue,
      localMin: this.minValue,
      localMax: this.maxValue
    }
  },
  watch: {
    modelValue(newVal) {
      this.localValue = newVal
    },
    minValue(newVal) {
      this.localMin = newVal
    },
    maxValue(newVal) {
      this.localMax = newVal
    }
  },
  methods: {
    handleValueInput() {
      // Mise à jour du v-model uniquement (pendant le drag)
      this.$emit('update:modelValue', this.localValue)
    },
    handleValueChange() {
      // Émission de l'événement change (au relâchement)
      this.$emit('update:modelValue', this.localValue)
      this.$emit('change', this.localValue)
    },
    handleMinInput() {
      // Empêcher le curseur min de dépasser le curseur max
      if (this.localMin >= this.localMax) {
        this.localMin = this.localMax - this.step
      }
      // Mise à jour du v-model uniquement (pendant le drag)
      this.$emit('update:minValue', this.localMin)
    },
    handleMinChange() {
      // Empêcher le curseur min de dépasser le curseur max
      if (this.localMin >= this.localMax) {
        this.localMin = this.localMax - this.step
      }
      // Émission de l'événement change (au relâchement)
      this.$emit('update:minValue', this.localMin)
      this.$emit('change', { min: this.localMin, max: this.localMax })
    },
    handleMaxInput() {
      // Empêcher le curseur max d'être inférieur au curseur min
      if (this.localMax <= this.localMin) {
        this.localMax = this.localMin + this.step
      }
      // Mise à jour du v-model uniquement (pendant le drag)
      this.$emit('update:maxValue', this.localMax)
    },
    handleMaxChange() {
      // Empêcher le curseur max d'être inférieur au curseur min
      if (this.localMax <= this.localMin) {
        this.localMax = this.localMin + this.step
      }
      // Émission de l'événement change (au relâchement)
      this.$emit('update:maxValue', this.localMax)
      this.$emit('change', { min: this.localMin, max: this.localMax })
    },
    formatValue(value) {
      return `${this.prefix}${value}${this.suffix}`
    }
  }
}
</script>

<style scoped>
/* Barre active avec dégradé */
.slider-active {
  background: linear-gradient(to right, #ff24a7, #8890fe);
}

/* Styles pour les curseurs */
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
  height: 2.5rem;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: all;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border: 2px solid #ff24a7;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.range-slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.range-slider::-moz-range-thumb {
  pointer-events: all;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border: 2px solid #ff24a7;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.range-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  opacity: 0.5;
}

.range-slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
