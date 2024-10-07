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

const VueApp = createApp(App);

VueApp.use(store);
VueApp.use(i18n);
VueApp.use(router);
VueApp.mount('#app');
