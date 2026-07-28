import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import account from "@/views/dashboard/profileSubpages/account.vue";
import { useAuthStore } from "@/stores/useAuthStore";

vi.mock("@tanstack/vue-query", () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
    })),
}));

vi.mock("@/api", () => ({
    default: {
        put: vi.fn(),
    },
}));

const mountAccount = (user: any = null) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true });

    if (user) {
        const authStore = useAuthStore(pinia);
        authStore.user = user;
    }

    return mount(account, {
        global: {
            plugins: [pinia],
        },
    });
};

describe("account.vue", () => {
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

    it("displays the user email", () => {
        const wrapper = mountAccount(mockUser);
        expect(wrapper.text()).toContain("Email: test@example.com");
    });

    it("displays the user scope in ProfileCard", () => {
        const wrapper = mountAccount(mockUser);
        expect(wrapper.text()).toContain("Scope:");
        expect(wrapper.text()).toContain("user");
    });

    it("renders the Change Email button", () => {
        const wrapper = mountAccount(mockUser);
        const buttons = wrapper.findAll("button");
        expect(buttons.some((b) => b.text() === "Change Email")).toBe(true);
    });

    it("renders the Change Password button", () => {
        const wrapper = mountAccount(mockUser);
        const buttons = wrapper.findAll("button");
        expect(buttons.some((b) => b.text() === "Change password")).toBe(true);
    });

    it("does not render user email when user is null", () => {
        const wrapper = mountAccount(null);
        expect(wrapper.text()).not.toContain("test@example.com");
    });

    it("displays a different user email correctly", () => {
        const user = { ...mockUser, email: "other@example.com" };
        const wrapper = mountAccount(user);
        expect(wrapper.text()).toContain("Email: other@example.com");
    });

    it("displays admin scope correctly", () => {
        const user = { ...mockUser, scope: "admin" };
        const wrapper = mountAccount(user);
        expect(wrapper.text()).toContain("admin");
    });
});
