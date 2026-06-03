import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import("@/views/homePage.vue")
        },
        {

            path: '/register',
            name: 'register',
            component: () => import("@/views/registerPage.vue")
        }
    ]
})

export default router