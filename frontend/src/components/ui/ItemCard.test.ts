import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemCard from "@/components/ui/ItemCard.vue";
import { useCountryCode } from "@/composables/useCountryCode";

// Mock the composable module
vi.mock("@/composables/useCountryCode", () => ({
    useCountryCode: vi.fn(),
}));

const mockProps = {
    title: "RTX 5070",
    price: 3299.99,
    lowestPrice30Days: 3299.99,
    imageUrl: "/rtx.jpg",
};

// Helper function to mount the card
const mountCard = (propsOverrides = {}) =>
    mount(ItemCard, {
        props: { ...mockProps, ...propsOverrides },
    });

describe("ItemCard.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders title and price", () => {
        // Mock a default successful state
        vi.mocked(useCountryCode).mockReturnValue({
            data: "PL",
            isLoading: false,
        } as any);

        const wrapper = mountCard();
        expect(wrapper.find("h2").text()).toContain("RTX 5070");
        expect(wrapper.find("p.text-2xl").text()).toContain("3299.99");
    });

    it("shows lowest price when PL and not loading", () => {
        vi.mocked(useCountryCode).mockReturnValue({
            data: "PL",
            isLoading: false,
        } as any);

        const wrapper = mountCard();
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            true,
        );
        expect(wrapper.find('[data-testid="lowest-price"]').text()).toContain(
            "3299.99",
        );
    });

    it("shows loading state", () => {
        // Simulate the loading state from TanStack Query
        vi.mocked(useCountryCode).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        const wrapper = mountCard();
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
        expect(wrapper.html()).toContain("Loading...");
    });

    it("hides lowest price for non-PL country", () => {
        // Simulate a different country returned from the cache/API
        vi.mocked(useCountryCode).mockReturnValue({
            data: "DE",
            isLoading: false,
        } as any);

        const wrapper = mountCard();
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
    });

    it("hides lowest price when lowestPrice30Days is missing", () => {
        vi.mocked(useCountryCode).mockReturnValue({
            data: "PL",
            isLoading: false,
        } as any);

        const wrapper = mountCard({ lowestPrice30Days: undefined });

        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
    });
});
