import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/useAuthStore";
import { authGuard } from "@/router/router";
import api from "@/api";

const routes = [
    { path: "/", name: "home", component: { template: "<div>Home</div>" } },
    { path: "/register", name: "register", component: { template: "<div>Register</div>" } },
    {
        path: "/admin/dashboard",
        name: "adminDashboard",
        component: { template: "<div>Admin</div>" },
        meta: { requiresAuth: true, requiredRoles: ["admin", "superadmin"] },
    },
    {
        path: "/vendor/dashboard",
        name: "vendorDashboard",
        component: { template: "<div>Vendor</div>" },
        meta: { requiresAuth: true, requiredRoles: ["vendor", "superadmin"] },
    },
    {
        path: "/support/dashboard",
        name: "supportDashboard",
        component: { template: "<div>Support</div>" },
        meta: { requiresAuth: true, requiredRoles: ["support", "superadmin"] },
    },
    {
        path: "/profile",
        name: "profile",
        component: { template: "<div>Profile</div>" },
        meta: { requiresAuth: true },
    },
];

describe("authGuard", () => {
    let router: ReturnType<typeof createRouter>;
    let authStore: ReturnType<typeof useAuthStore>;

    beforeEach(async () => {
        setActivePinia(createPinia());
        router = createRouter({ history: createMemoryHistory(), routes });
        router.beforeEach(authGuard);
        await router.push("/");
        await router.isReady();
        authStore = useAuthStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("allows access to public routes without auth", async () => {
        await router.push("/");
        expect(router.currentRoute.value.name).toBe("home");
    });

    it("allows access to register page without auth", async () => {
        await router.push("/register");
        expect(router.currentRoute.value.name).toBe("register");
    });

    it("redirects unauthenticated user to home when accessing protected route", async () => {
        await router.push("/admin/dashboard");
        expect(router.currentRoute.value.name).toBe("home");
    });

    it("redirects unauthenticated user to home for profile", async () => {
        await router.push("/profile");
        expect(router.currentRoute.value.name).toBe("home");
    });

    it("fetches user data when token exists but user is not loaded", async () => {
        authStore.setToken("test-token");

        vi.mocked(api.get).mockResolvedValue({
            data: { id: 1, name: "Admin", email: "a@b.com", scope: "admin" },
        });

        await router.push("/admin/dashboard");

        expect(api.get).toHaveBeenCalledWith("/user");
        expect(authStore.user).toEqual(
            expect.objectContaining({ scope: "admin" }),
        );
        expect(router.currentRoute.value.name).toBe("adminDashboard");
    });

    it("redirects to home if user fetch fails", async () => {
        authStore.setToken("invalid-token");
        vi.mocked(api.get).mockRejectedValue(new Error("Unauthorized"));

        await router.push("/admin/dashboard");

        expect(router.currentRoute.value.name).toBe("home");
        expect(authStore.isAuthenticated).toBe(false);
    });

    it("allows admin to access admin dashboard", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "A", email: "a@b.com", password: "", scope: "admin" });

        await router.push("/admin/dashboard");
        expect(router.currentRoute.value.name).toBe("adminDashboard");
    });

    it("allows superadmin to access admin dashboard", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "S", email: "s@b.com", password: "", scope: "superadmin" });

        await router.push("/admin/dashboard");
        expect(router.currentRoute.value.name).toBe("adminDashboard");
    });

    it("redirects vendor away from admin dashboard", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "V", email: "v@b.com", password: "", scope: "vendor" });

        await router.push("/admin/dashboard");
        expect(router.currentRoute.value.name).toBe("vendorDashboard");
    });

    it("redirects regular user away from admin dashboard to home", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "U", email: "u@b.com", password: "", scope: "user" });

        await router.push("/admin/dashboard");
        expect(router.currentRoute.value.name).toBe("home");
    });

    it("allows vendor to access vendor dashboard", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "V", email: "v@b.com", password: "", scope: "vendor" });

        await router.push("/vendor/dashboard");
        expect(router.currentRoute.value.name).toBe("vendorDashboard");
    });

    it("allows superadmin to access support dashboard", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "S", email: "s@b.com", password: "", scope: "superadmin" });

        await router.push("/support/dashboard");
        expect(router.currentRoute.value.name).toBe("supportDashboard");
    });

    it("allows any authenticated user to access profile", async () => {
        authStore.setToken("test-token");
        authStore.setUser({ id: 1, name: "U", email: "u@b.com", password: "", scope: "user" });

        await router.push("/profile");
        expect(router.currentRoute.value.name).toBe("profile");
    });
});
