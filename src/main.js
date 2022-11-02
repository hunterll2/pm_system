import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import mitt from "mitt";

import { loadFonts } from "./plugins/webfontloader";
loadFonts();

const emitter = mitt();

const app = createApp(App).use(router).use(vuetify);
app.config.globalProperties.$bus = emitter;
app.mount("#app");
