import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import personal from "@/views/dashboard/profileSubpages/personal.vue";
import { useAuthStore } from "@/stores/useAuthStore";

const mockMutate = vi.fn();

vi.mock("@tanstack/vue-query", () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
        mutate: mockMutate,
    })),
}));

vi.mock("@/api", () => ({
    default: {
        put: vi.fn(),
    },
}));

const mountPersonal = (user: any = null) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true });

    if (user) {
        const authStore = useAuthStore(pinia);
        authStore.user = user;
    }

    return mount(personal, {
        shallow: true,
        global: {
            plugins: [pinia],
            stubs: {
                ProfileCard: {
                    template: "<div class='profile-card'><slot /></div>",
                },
            },
        },
    });
};

describe("personal.vue", () => {
    const mockUser = {
        id: 1,
        email: "test@example.com",
        scope: "user",
        status: "active",
        first_name: "John",
        last_name: "Doe",
        phone: "+1234567890",
        gender: "man",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the form with firstname field", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.text()).toContain("Firstname:");
    });

    it("renders the form with lastname field", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.text()).toContain("Lastname:");
    });

    it("renders the form with phone field", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.text()).toContain("Phone:");
    });

    it("renders the form with date of birth field", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.text()).toContain("Date Of Birth:");
    });

    it("renders the form with gender field", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.text()).toContain("Gender:");
    });

    it("renders the Change data submit button", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.find("button-stub").exists()).toBe(true);
    });

    it("has a form element", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.find("form").exists()).toBe(true);
    });

    it("exposes the global message ref", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.vm.globalMessage).toBeUndefined();
    });

    it("exposes form errors ref", () => {
        const wrapper = mountPersonal(mockUser);
        expect(wrapper.vm.errors).toBeDefined();
    });

    it("has a form submit handler", () => {
        const wrapper = mountPersonal(mockUser);
        const form = wrapper.find("form");
        expect(form.exists()).toBe(true);
    });
});
