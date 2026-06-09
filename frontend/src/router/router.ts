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
        },
        {
            path: '/admin/dashboard',
            name: 'adminDashboard',
            component: () => import("@/views/dashboard/adminDashboard.vue")
        },
        {
            path: '/vendor/dashboard',
            name: 'vendorDashboard',
            component: () => import("@/views/dashboard/vendorDashboard.vue")
        },
        {
            path: '/support/dashboard',
            name: 'supportDashboard',
            component: () => import("@/views/dashboard/supportDashboard.vue")
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import("@/views/dashboard/profile.vue")
        }
    ]
})

export default router