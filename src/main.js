// import "./assets/base.css";
import "./assets/index.css";

import { createApp } from "vue";
import App from "./App.vue";
import Test from "./Test.vue";

import mitt from 'mitt';
const emitter = mitt();

const app = createApp(App);

app.config.globalProperties.emitter = emitter;

// app.component("Test", Test);

app.mount("#app");