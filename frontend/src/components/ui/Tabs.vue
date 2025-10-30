<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-button', { active: activeTab === index }]"
        @click="selectTab(index)"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tabs-content">
      <slot :name="`tab-${activeTab}`"></slot>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "Tabs",
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    defaultTab: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const activeTab = ref(props.defaultTab);

    const selectTab = (index) => {
      activeTab.value = index;
      emit("tab-changed", index);
    };

    return {
      activeTab,
      selectTab,
    };
  },
};
</script>

<style lang="scss" scoped>
.tabs-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tabs-header {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
  justify-content: center;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: #a602e7;
    background: rgba(166, 2, 231, 0.05);
    border-radius: 8px 8px 0 0;
  }

  &.active {
    color: #a602e7;
    border-bottom-color: #a602e7;
    font-weight: 600;

    &::after {
      content: "";
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #a602e7 0%, #e702a0 100%);
      border-radius: 2px 2px 0 0;
    }
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: translateY(1px);
  }
}

.tabs-content {
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
