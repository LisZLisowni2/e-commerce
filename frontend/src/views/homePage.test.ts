import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import homePage from "@/views/homePage.vue";
import { useProducts } from "@/composables/useProducts";

vi.mock("@/composables/useProducts", () => ({
    useProducts: vi.fn(),
}));

vi.mock("@/composables/useCountryCode", () => ({
    useCountryCode: vi.fn(),
}));

const mockProducts = [
    {
        id: 1,
        name: "RTX 5070",
        description: "Graphics card",
        price: 3299.99,
        imageURL: "/rtx.jpg",
        last30DaysPrice: 3299.99,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
    },
    {
        id: 2,
        name: "MacBook Pro",
        description: "Laptop",
        price: 12999.99,
        imageURL: "/macbook.jpg",
        last30DaysPrice: undefined,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
    },
];

const mountHomePage = () =>
    mount(homePage, {
        global: {
            stubs: {
                Swiper: {
                    template: "<div><slot /></div>",
                },
                SwiperSlide: {
                    template: "<div><slot /></div>",
                },
            },
        },
    });

describe("homePage.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the Latest section heading", () => {
        vi.mocked(useProducts).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        const wrapper = mountHomePage();
        expect(wrapper.find("h1").text()).toBe("Latest");
    });

    it("renders products when data is available", () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockProducts,
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountHomePage();
        expect(wrapper.findAll("h2").length).toBe(2);
        expect(wrapper.text()).toContain("RTX 5070");
        expect(wrapper.text()).toContain("MacBook Pro");
    });

    it("passes correct props to ItemCard", () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockProducts,
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountHomePage();
        const cards = wrapper.findAllComponents({ name: "ItemCard" });
        expect(cards.length).toBe(2);

        expect(cards[0].props("title")).toBe("RTX 5070");
        expect(cards[0].props("price")).toBe(3299.99);
        expect(cards[0].props("imageUrl")).toBe("/rtx.jpg");

        expect(cards[1].props("title")).toBe("MacBook Pro");
        expect(cards[1].props("price")).toBe(12999.99);
        expect(cards[1].props("imageUrl")).toBe("/macbook.jpg");
    });

    it("shows no products when data is empty", () => {
        vi.mocked(useProducts).mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountHomePage();
        const cards = wrapper.findAllComponents({ name: "ItemCard" });
        expect(cards.length).toBe(0);
    });

    it("still renders Latest heading when loading", () => {
        vi.mocked(useProducts).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        const wrapper = mountHomePage();
        expect(wrapper.find("h1").text()).toBe("Latest");
    });
});
