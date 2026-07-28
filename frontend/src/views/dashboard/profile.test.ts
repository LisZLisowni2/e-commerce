import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "@/stores/useAuthStore";
import profile from "@/views/dashboard/profile.vue";

const mountProfile = (user: any = null) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true });

    if (user) {
        const authStore = useAuthStore(pinia);
        authStore.user = user;
    }

    return mount(profile, {
        global: {
            plugins: [pinia],
            stubs: {
                RouterView: {
                    template: "<div data-testid='router-view' />",
                },
            },
        },
    });
};

describe("profile.vue", () => {
    const mockUser = {
        id: 1,
        email: "test@example.com",
        scope: "user",
        status: "active",
        first_name: "John",
        last_name: "Doe",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows 'Account not found' when user is null", () => {
        const wrapper = mountProfile(null);
        expect(wrapper.text()).toContain("Account not found");
    });

    it("does not show 'Account not found' when user exists", () => {
        const wrapper = mountProfile(mockUser);
        expect(wrapper.text()).not.toContain("Account not found");
    });

    it("renders sidebar with navigation options", () => {
        const wrapper = mountProfile(mockUser);
        expect(wrapper.text()).toContain("Account details");
        expect(wrapper.text()).toContain("Personal data");
        expect(wrapper.text()).toContain("Addresses");
    });

    it("renders sidebar with correct route links", () => {
        const wrapper = mountProfile(mockUser);
        const links = wrapper.findAll("a");
        expect(links.length).toBe(3);
        expect(links[0].text()).toBe("Account details");
        expect(links[1].text()).toBe("Personal data");
        expect(links[2].text()).toBe("Addresses");
    });

    it("renders aside element for sidebar", () => {
        const wrapper = mountProfile(mockUser);
        expect(wrapper.find("aside").exists()).toBe(true);
    });

    it("renders RouterView for child routes", () => {
        const wrapper = mountProfile(mockUser);
        expect(wrapper.find("[data-testid='router-view']").exists()).toBe(true);
    });

    it("renders exactly 3 navigation items", () => {
        const wrapper = mountProfile(mockUser);
        const links = wrapper.findAll("li");
        expect(links.length).toBe(3);
    });
});
