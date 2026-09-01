import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, toValue } from "vue";
import { useProducts, useProduct, useProductsNotPagination } from "@/composables/useProducts";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { PaginationResult } from "@/types/PaginationResult";

vi.mock("@tanstack/vue-query", () => ({
    useQuery: vi.fn(),
    keepPreviousData: vi.fn(),
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

const mockPagination: PaginationResult<(typeof mockProducts)[number]> = {
    data: mockProducts,
    current_page: 1,
    last_page: 1,
    first_page: 1,
    per_page: 20,
    total: 2,
    from: 1,
    to: 2,
};

describe("useProducts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with correct query key and query function", () => {
        let opts: { queryKey?: unknown; queryFn?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ page: 1 });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, undefined, undefined, 1]);
        expect(opts.queryFn).toBeTypeOf("function");
    });

    it("uses a vendor-specific query key when vendorId is provided", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ vendorId: 7, page: 1 });

        expect(toValue(opts.queryKey)).toEqual(["products", 7, undefined, undefined, 1]);
    });

    it("uses a search-specific query key when searchQuery is provided", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery: "rtx", page: 1 });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, "rtx", undefined, 1]);
    });

    it("uses a category-specific query key when category is provided", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ category: "gpus", page: 1 });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, undefined, "gpus", 1]);
    });

    it("reacts to changes in the reactive searchQuery and page", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        const searchQuery = ref("");
        const page = ref(1);
        useProducts({ searchQuery, page });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, "", undefined, 1]);

        searchQuery.value = "rtx";
        page.value = 2;
        expect(toValue(opts.queryKey)).toEqual(["products", undefined, "rtx", undefined, 2]);
    });

    it("fetches paginated products from /products?paginated=true&page", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ page: 2 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockPagination } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?paginated=true&page=2");
        expect(result).toEqual(mockPagination);
    });

    it("reacts to page changes when fetching", async () => {
        let queryFn: () => Promise<any>;
        const page = ref(1);

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ page });

        page.value = 3;
        vi.mocked(api.get).mockResolvedValue({ data: { products: mockPagination } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?paginated=true&page=3");
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

        useProducts({ vendorId: 7, page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?vendor_id=7&paginated=true&page=1");
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

        useProducts({ searchQuery: "rtx", page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx&paginated=true&page=1");
    });

    it("fetches products filtered by category from /products?category", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ category: "gpus", page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?category=gpus&paginated=true&page=1");
    });

    it("does not send category when searchQuery is provided", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery: "rtx", category: "gpus", page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx&paginated=true&page=1");
    });

    it("fetches the latest search query when searchQuery changes reactively", async () => {
        let queryFn: () => Promise<any>;
        const searchQuery = ref("");

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery, page: 1 });

        searchQuery.value = "rtx";
        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx&paginated=true&page=1");
    });

    it("URL-encodes the search query", async () => {
        let queryFn: () => Promise<any>;
        const searchQuery = ref("");

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery, page: 1 });

        searchQuery.value = "rtx 5070 & more";
        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith(
            "/products?search_query=rtx+5070+%26+more&paginated=true&page=1",
        );
    });

    it("sends both vendor_id and search_query when both are provided", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ vendorId: 7, searchQuery: "rtx", page: 2 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?vendor_id=7&search_query=rtx&paginated=true&page=2");
    });

    it("reacts to page changes when filtering by search query", async () => {
        let queryFn: () => Promise<any>;
        const page = ref(1);

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProducts({ searchQuery: "rtx", page });

        page.value = 4;
        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx&paginated=true&page=4");
    });

    it("returns the products array from a vendor response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockProducts,
                isLoading: false,
                error: null,
            } as any;
        });

        useProducts({ vendorId: 7, page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        const result = await queryFn!();

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("RTX 5070");
        expect(result[1].name).toBe("MacBook Pro");
    });

    it("returns the pagination result from a paginated response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockPagination,
                isLoading: false,
                error: null,
            } as any;
        });

        useProducts({ page: 1 });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockPagination } });

        const result = await queryFn!();

        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
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

        useProducts({ page: 1 });

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});

describe("useProductsNotPagination", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with a non-pagination query key", () => {
        let opts: { queryKey?: unknown; queryFn?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProductsNotPagination();

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, undefined, undefined, " -1"]);
        expect(opts.queryFn).toBeTypeOf("function");
    });

    it("uses a vendor-specific query key when vendorId is provided", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProductsNotPagination({ vendorId: 7 });

        expect(toValue(opts.queryKey)).toEqual(["products", 7, undefined, undefined, " -1"]);
    });

    it("reacts to changes in the reactive searchQuery", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        const searchQuery = ref("");
        useProductsNotPagination({ searchQuery });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, "", undefined, " -1"]);

        searchQuery.value = "rtx";
        expect(toValue(opts.queryKey)).toEqual(["products", undefined, "rtx", undefined, " -1"]);
    });

    it("reacts to changes in the reactive category", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        const category = ref("");
        useProductsNotPagination({ category });

        expect(toValue(opts.queryKey)).toEqual(["products", undefined, undefined, "", " -1"]);

        category.value = "gpus";
        expect(toValue(opts.queryKey)).toEqual(["products", undefined, undefined, "gpus", " -1"]);
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

        useProductsNotPagination();

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products");
        expect(result).toEqual(mockProducts);
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

        useProductsNotPagination({ vendorId: 7 });

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

        useProductsNotPagination({ searchQuery: "rtx" });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?search_query=rtx");
    });

    it("fetches products filtered by category from /products?category", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProductsNotPagination({ category: "gpus" });

        vi.mocked(api.get).mockResolvedValue({ data: { products: mockProducts } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products?category=gpus");
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

        useProductsNotPagination();

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

        useProductsNotPagination();

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});

describe("useProduct", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with the correct query key", () => {
        let opts: { queryKey?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProduct(42);

        expect(opts.queryKey).toEqual(["product", 42]);
    });

    it("fetches a single product from /product/id", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useProduct(42);

        vi.mocked(api.get).mockResolvedValue({ data: mockProducts[0] });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/products/42");
        expect(result).toEqual(mockProducts[0]);
    });

    it("returns the product from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockProducts[1],
                isLoading: false,
                error: null,
            } as any;
        });

        useProduct(1);

        vi.mocked(api.get).mockResolvedValue({ data: mockProducts[1] });

        const result = await queryFn!();

        expect(result.name).toBe("MacBook Pro");
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

        useProduct(42);

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});
