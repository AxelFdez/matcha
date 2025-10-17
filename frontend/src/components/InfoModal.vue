<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <i :class="['icon', iconClass]"></i>
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
        <ul v-if="requirements && requirements.length > 0" class="requirements-list">
          <li v-for="(req, index) in requirements" :key="index">
            <i class="fas fa-circle-check"></i> {{ req }}
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button @click="closeModal" class="btn-primary">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Bienvenue !'
    },
    message: {
      type: String,
      default: 'Pour utiliser la plateforme, vous devez compléter votre profil.'
    },
    requirements: {
      type: Array,
      default: () => []
    },
    buttonText: {
      type: String,
      default: 'Compris'
    },
    iconClass: {
      type: String,
      default: 'fas fa-info-circle info-icon'
    }
  },
  emits: ['close'],
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  padding: 30px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.icon {
  font-size: 64px;
  margin-bottom: 15px;
  display: block;
}

.success-icon {
  color: #28a745;
}

.info-icon {
  color: #17a2b8;
}

.warning-icon {
  color: #ffc107;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.modal-body {
  text-align: center;
  margin-bottom: 25px;
}

.modal-body p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
}

.requirements-list li {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #555;
}

.requirements-list li i {
  color: #28a745;
  margin-right: 10px;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .modal-container {
    padding: 20px;
  }

  .success-icon {
    font-size: 48px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-body p {
    font-size: 14px;
  }
}
</style>
