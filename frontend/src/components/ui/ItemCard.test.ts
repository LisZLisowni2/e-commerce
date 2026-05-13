import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { describe, it, expect, vi } from "vitest";
import ItemCard from "@/components/ui/ItemCard.vue";

const mockProps = {
    title: "RTX 5070",
    price: 3299.99,
    lowestPrice30Days: 3299.99,
    imageUrl: "/rtx.jpg",
};

const mountCard = (storeOverrides = {}) =>
    mount(ItemCard, {
        props: mockProps,
        global: {
            plugins: [
                createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        "country-store": {
                            countryCode: "PL",
                            isLoading: false,
                            ...storeOverrides,
                        },
                    },
                }),
            ],
        },
    });

describe("ItemCard.vue", () => {
    it("renders title and price", () => {
        const wrapper = mountCard();
        expect(wrapper.find("h2").text()).toContain("RTX 5070");
        expect(wrapper.find("p.text-2xl").text()).toContain("3299.99");
    });

    it("shows lowest price when PL and not loading", () => {
        const wrapper = mountCard();
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            true,
        );
        expect(wrapper.find('[data-testid="lowest-price"]').text()).toContain(
            "3299.99",
        );
    });

    it("shows loading state", () => {
        const wrapper = mountCard({ isLoading: true });
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
        expect(wrapper.html()).toContain("Loading...");
    });

    it("hides lowest price for non-PL country", () => {
        const wrapper = mountCard({ countryCode: "DE", isLoading: false });
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
    });

    it("hides lowest price when lowestPrice30Days is missing", () => {
        const wrapper = mount(ItemCard, {
            props: { ...mockProps, lowestPrice30Days: undefined },
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            country: { countryCode: "PL", isLoading: false },
                        },
                    }),
                ],
            },
        });
        expect(wrapper.find('[data-testid="lowest-price"]').exists()).toBe(
            false,
        );
    });
});
