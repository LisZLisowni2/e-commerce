import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import addresses from "@/views/dashboard/profileSubpages/addresses.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Address } from "@/types/Address";
import { useAddresses } from "@/composables/useAddresses";
import { useMutation } from "@tanstack/vue-query";

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
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("@/composables/useAddresses", () => ({
    useAddresses: vi.fn(),
}));

const mockAddresses: Address[] = [
    {
        id: 1,
        address_type: "shipping",
        address_line_1: "123 Main St",
        address_line_2: "Apt 1",
        city: "New York",
        country: "USA",
        postal_code: "10001",
        state_province: "NY",
    },
    {
        id: 2,
        address_type: "billing",
        address_line_1: "456 Oak Ave",
        address_line_2: "",
        city: "Los Angeles",
        country: "USA",
        postal_code: "90001",
        state_province: "CA",
    },
];

const mountAddresses = (user: any = null, addressesData: any = undefined, isLoading = false, isError = false, error: any = null) => {
    vi.mocked(useAddresses).mockReturnValue({
        data: addressesData,
        isLoading,
        isError,
        error,
    } as any);

    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true });

    if (user) {
        const authStore = useAuthStore(pinia);
        authStore.user = user;
    }

    return mount(addresses, {
        global: {
            plugins: [pinia],
        },
    });
};

describe("addresses.vue", () => {
    const mockUser = {
        id: 1,
        email: "test@example.com",
        scope: "user",
        status: "active",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading state", () => {
        const wrapper = mountAddresses(mockUser, undefined, true);
        expect(wrapper.text()).toContain("Loading...");
    });

    it("shows error state", () => {
        const error = new Error("Failed to fetch");
        const wrapper = mountAddresses(mockUser, undefined, false, true, error);
        expect(wrapper.text()).toContain("Error: Failed to fetch");
    });

    it("renders addresses when data is available", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        expect(wrapper.text()).toContain("123 Main St");
        expect(wrapper.text()).toContain("456 Oak Ave");
    });

    it("renders address details correctly", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        expect(wrapper.text()).toContain("shipping");
        expect(wrapper.text()).toContain("New York");
        expect(wrapper.text()).toContain("USA");
    });

    it("renders the Add a new address button", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        const buttons = wrapper.findAll("button");
        expect(buttons.some((b) => b.text() === "Add a new address")).toBe(true);
    });

    it("renders Edit button for each address", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        const buttons = wrapper.findAll("button");
        const editButtons = buttons.filter((b) => b.text() === "Edit");
        expect(editButtons.length).toBe(2);
    });

    it("renders Delete button for each address", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        const buttons = wrapper.findAll("button");
        const deleteButtons = buttons.filter((b) => b.text() === "Delete");
        expect(deleteButtons.length).toBe(2);
    });

    it("renders address line 2 when present", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        expect(wrapper.text()).toContain("Apt 1");
    });

    it("renders postal code and state province", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        expect(wrapper.text()).toContain("10001");
        expect(wrapper.text()).toContain("NY");
    });

    it("renders empty addresses list", () => {
        const wrapper = mountAddresses(mockUser, { addresses: [] });
        expect(wrapper.text()).not.toContain("123 Main St");
    });

    it("shows no loading or error when data is present", () => {
        const wrapper = mountAddresses(mockUser, { addresses: mockAddresses });
        expect(wrapper.text()).not.toContain("Loading...");
    });

    it("does not show addresses when loading", () => {
        const wrapper = mountAddresses(mockUser, undefined, true);
        expect(wrapper.text()).not.toContain("123 Main St");
    });
});
