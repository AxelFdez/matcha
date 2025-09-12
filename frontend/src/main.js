import { createApp } from 'vue'
import App from './App.vue'
import { store } from './store/index.js'
import { router } from './router/routes.js'
import { i18n } from './i18n/i18n_config.js'

/* import font awesome icon component */
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'
import "@flaticon/flaticon-uicons/css/all/all.css";

// import '@vue-multiselect/dist/vue-multiselect.min.css';
import 'vue-multiselect/dist/vue-multiselect.css'
import './index.css'

// Debug: Afficher les variables d'environnement dans la console
console.log('=== Variables d\'environnement Vue.js ===');
console.log('VUE_APP_API_URL:', process.env.VUE_APP_API_URL);
console.log('VUE_APP_WS_URL:', process.env.VUE_APP_WS_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Toutes les variables VUE_APP_:', Object.keys(process.env).filter(key => key.startsWith('VUE_APP_')));

const VueApp = createApp(App);

VueApp.use(store);
VueApp.use(i18n);
VueApp.use(router);
VueApp.mount('#app');
