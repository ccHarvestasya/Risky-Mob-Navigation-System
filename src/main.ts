import {createApp} from 'vue'
import {createI18n} from "vue-i18n";
import {messages} from './i18n/message';
import './style.css'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});

createApp(App).use(i18n).mount('#app')
