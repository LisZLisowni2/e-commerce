import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import productDetails from "@/views/productDetails.vue";
import { useProduct } from "@/composables/useProducts";
import { useImageProductByComputed } from "@/composables/useImageProduct";
import { useRoute } from "vue-router";

vi.mock("@/composables/useProducts", () => ({
    useProduct: vi.fn(),
}));

vi.mock("@/composables/useImageProduct", () => ({
    useImageProductByComputed: vi.fn(),
}));

vi.mock("vue-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vue-router")>();
    return {
        ...actual,
        useRoute: vi.fn(),
    };
});

const mockProduct = {
    id: 42,
    name: "RTX 5070",
    description: "High-end graphics card",
    price: 3299.99,
    imageURL: "/rtx.jpg",
    last30DaysPrice: 3299.99,
    category_id: 1,
    vendor_id: 2,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
};

const mountProductDetails = () =>
    mount(productDetails, {
        global: {
            stubs: {
                Card: { template: "<div><slot /></div>" },
                CardContent: { template: "<div><slot /></div>" },
                Button: { template: "<button><slot /></button>" },
            },
        },
    });

describe("productDetails.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useRoute).mockReturnValue({ params: { id: "42" } } as any);

        vi.mocked(useProduct).mockReturnValue({
            data: mockProduct,
            isLoading: false,
            error: null,
            isError: false,
        } as any);

        vi.mocked(useImageProductByComputed).mockReturnValue({
            data: "blob:image-url",
            isLoading: false,
        } as any);
    });

    it("calls useProduct with the product id from the route", async () => {
        mountProductDetails();

        expect(useProduct).toHaveBeenCalledWith(42);
    });

    it("shows a loading message while the product is loading", async () => {
        vi.mocked(useProduct).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            isError: false,
        } as any);

        const wrapper = mountProductDetails();
        expect(wrapper.text()).toContain("Loading product...");
    });

    it("shows an error message when loading fails", async () => {
        vi.mocked(useProduct).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Not Found"),
            isError: true,
        } as any);

        const wrapper = mountProductDetails();
        expect(wrapper.text()).toContain("Error: Not Found");
    });

    it("renders the product details when data is available", async () => {
        const wrapper = mountProductDetails();
        expect(wrapper.text()).toContain("RTX 5070");
        expect(wrapper.text()).toContain("3299.99$");
        expect(wrapper.text()).toContain("High-end graphics card");
        expect(wrapper.text()).toContain("Category ID: 1");
        expect(wrapper.text()).toContain("Vendor ID: 2");
    });

    it("displays the product image with the resolved blob URL", async () => {
        const wrapper = mountProductDetails();
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("blob:image-url");
    });

    it("shows an image loading message before the image resolves", async () => {
        vi.mocked(useImageProductByComputed).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        const wrapper = mountProductDetails();
        expect(wrapper.text()).toContain("Image loading...");
    });
});
