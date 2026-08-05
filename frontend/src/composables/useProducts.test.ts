import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProducts } from "@/composables/useProducts";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

vi.mock("@tanstack/vue-query", () => ({
    useQuery: vi.fn(),
}));

vi.mock("@/api", () => ({
    default: {
        get: vi.fn(),
    },
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

describe("useProducts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with correct query key and query function", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useProducts({});

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["products", undefined, undefined],
            }),
        );
    });

    it("uses a vendor-specific query key when vendorId is provided", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useProducts({ vendorId: 7 });

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["products", 7, undefined],
            }),
        );
    });

    it("uses a search-specific query key when searchQuery is provided", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useProducts({ searchQuery: "rtx" });

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["products", undefined, "rtx"],
            }),
        );
    });

    it("fetches products filtered by vendor from /products?vendor_id", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ vendorId: 7 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?vendor_id=7");
    });

    it("fetches products matching the search query from /products?search_query", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery: "rtx" });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx");
    });

    it("fetches products from /products endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockProducts,
                isLoading: false,
                error: null,
            } as any;
        });

        useProducts({});

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products");
        expect(result).toEqual(mockProducts);
    });

    it("returns the products array from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockProducts,
                isLoading: false,
                error: null,
            } as any;
        });

        useProducts({});

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        const result = await queryFn!();

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("RTX 5070");
        expect(result[1].name).toBe("MacBook Pro");
    });

    it("propagates API errors", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: false,
                error: null,
            } as any;
        });

        useProducts({});

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});
