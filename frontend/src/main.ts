import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router'
import { createPinia } from "pinia"
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import { i18n } from "./i18n"
const app = createApp(App)

const pinia = createPinia()

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1
        }
    }
})

app.use(pinia)
app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.use(i18n)
app.mount('#app')
