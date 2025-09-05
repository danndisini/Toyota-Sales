import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

const app = createApp(App)

// 👉 aktifkan Toast plugin di Vue
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
})
app.mount('#app')
