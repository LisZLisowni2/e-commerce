import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import search from "@/views/search.vue";
import { useProducts } from "@/composables/useProducts";
import { useCountryCode } from "@/composables/useCountryCode";
import { useImageProduct } from "@/composables/useImageProduct";
import { useRoute } from "vue-router";

vi.mock("@/composables/useProducts", () => ({
    useProducts: vi.fn(),
}));

vi.mock("@/composables/useCountryCode", () => ({
    useCountryCode: vi.fn(),
}));

vi.mock("@/composables/useImageProduct", () => ({
    useImageProduct: vi.fn(),
}));

vi.mock("vue-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vue-router")>();
    return {
        ...actual,
        useRoute: vi.fn(),
    };
});

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

const mockPagination = {
    data: mockProducts,
    current_page: 1,
    last_page: 1,
    first_page: 1,
    per_page: 20,
    total: 2,
    from: 1,
    to: 2,
};

const mountSearch = () =>
    mount(search, {
        global: {
            stubs: {
                RouterLink: RouterLinkStub,
            },
        },
    });

describe("search.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useCountryCode).mockReturnValue({
            data: "US",
            isLoading: false,
        } as any);

        vi.mocked(useImageProduct).mockReturnValue({
            data: "blob:image-url",
            isLoading: false,
        } as any);

        vi.mocked(useRoute).mockReturnValue({ params: { query: "rtx" } } as any);
    });

    it("fetches products by search query when a query is present", async () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockPagination,
            isLoading: false,
            error: null,
        } as any);

        mountSearch();

        expect(useProducts).toHaveBeenCalledWith({
            searchQuery: expect.any(Object),
            page: 1,
        });
    });

    it("fetches products by category when only a category is present", async () => {
        vi.mocked(useRoute).mockReturnValue({ params: { category: "graphics-cards" } } as any);

        vi.mocked(useProducts).mockReturnValue({
            data: mockPagination,
            isLoading: false,
            error: null,
        } as any);

        mountSearch();

        expect(useProducts).toHaveBeenCalledWith({
            category: expect.any(Object),
            page: 1,
        });
    });

    it("renders the products returned by the search", async () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockPagination,
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountSearch();
        const cards = wrapper.findAllComponents({ name: "ItemCard" });
        expect(cards.length).toBe(2);
        expect(wrapper.text()).toContain("RTX 5070");
        expect(wrapper.text()).toContain("MacBook Pro");
    });

    it("passes correct props to ItemCard", async () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockPagination,
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountSearch();
        const cards = wrapper.findAllComponents({ name: "ItemCard" });

        expect(cards[0].props("title")).toBe("RTX 5070");
        expect(cards[0].props("price")).toBe(3299.99);
        expect(cards[0].props("imageUrl")).toBe("/rtx.jpg");

        expect(cards[1].props("title")).toBe("MacBook Pro");
        expect(cards[1].props("price")).toBe(12999.99);
        expect(cards[1].props("imageUrl")).toBe("/macbook.jpg");
    });

    it("links each product card to its details page", async () => {
        vi.mocked(useProducts).mockReturnValue({
            data: mockPagination,
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountSearch();
        const links = wrapper.findAllComponents(RouterLinkStub);
        expect(links[0].props("to")).toBe("/product/1");
        expect(links[1].props("to")).toBe("/product/2");
    });

    it("renders no product cards when there are no results", async () => {
        vi.mocked(useProducts).mockReturnValue({
            data: { ...mockPagination, data: [] },
            isLoading: false,
            error: null,
        } as any);

        const wrapper = mountSearch();
        expect(wrapper.findAllComponents({ name: "ItemCard" }).length).toBe(0);
    });
});
