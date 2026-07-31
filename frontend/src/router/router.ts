import {
    createRouter,
    createWebHistory,
    type RouteRecordRaw,
    type NavigationGuardWithThis,
} from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/api";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "home",
        component: () => import("@/views/homePage.vue"),
        meta: { layout: "default" },
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@/views/registerPage.vue"),
    },
    {
        path: "/admin/dashboard",
        name: "adminDashboard",
        component: () => import("@/views/dashboard/adminDashboard.vue"),
        meta: { requiresAuth: true, requiredRoles: ["admin", "superadmin"], layout: "dashboard" },
        children: [
            {
                path: "",
                component: () => import("@/views/dashboard/adminDashboard.vue")
            },
            {
                path: "users",
                component: () => import("@/views/dashboard/adminSubpages/users.vue")
            },
            {
                path: "products",
                component: () => import("@/views/dashboard/adminSubpages/products.vue")
            },
            {
                path: "notifications",
                component: () => import("@/views/dashboard/adminDashboard.vue")
            },
        ]
    },
    {
        path: "/vendor/dashboard",
        name: "vendorDashboard",
        component: () => import("@/views/dashboard/vendorDashboard.vue"),
        meta: { requiresAuth: true, requiredRoles: ["vendor", "superadmin"], layout: "vendor-dashboard" },
        children: [
            {
                path: "",
                component: () => import("@/views/dashboard/vendorDashboard.vue")
            },
            {
                path: "products",
                component: () => import("@/views/dashboard/vendorSubpages/products.vue")
            },
            {
                path: "notifications",
                component: () => import("@/views/dashboard/vendorDashboard.vue")
            },
        ]
    },
    {
        path: "/support/dashboard",
        name: "supportDashboard",
        component: () => import("@/views/dashboard/supportDashboard.vue"),
        meta: { requiresAuth: true, requiredRoles: ["support", "superadmin"] },
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("@/views/dashboard/profile.vue"),
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                component: () =>
                    import("@/views/dashboard/profileSubpages/account.vue"),
            },
            {
                path: "personal",
                component: () =>
                    import("@/views/dashboard/profileSubpages/personal.vue"),
            },
            {
                path: "addresses",
                component: () =>
                    import("@/views/dashboard/profileSubpages/addresses.vue"),
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/",
    },
];

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
    admin: "/admin/dashboard",
    vendor: "/vendor/dashboard",
    support: "/support/dashboard",
    superadmin: "/admin/dashboard",
    user: "/",
};

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
    if (!to.meta.requiresAuth) {
        return true;
    }

    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return { name: "home" };
    }

    if (!authStore.user) {
        try {
            const { data } = await api.get("/user");
            authStore.setUser(data);
        } catch {
            authStore.logout();
            return { name: "home" };
        }
    }

    if (to.meta.requiredRoles) {
        const userRole = authStore.user?.scope;
        if (
            userRole &&
            !(to.meta.requiredRoles as string[]).includes(userRole)
        ) {
            return ROLE_DASHBOARD_MAP[userRole] ?? "/";
        }
    }

    return true;
};

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(authGuard);

export default router;
