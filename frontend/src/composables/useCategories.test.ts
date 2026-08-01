import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCategories, useCategoriesFlat } from "./useCategories";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { Category, CategoryFlat } from "@/types/Category";

vi.mock("@tanstack/vue-query", () => ({
    useQuery: vi.fn(),
}));

vi.mock("@/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockCategories: Category[] = [
    {
        id: 1,
        name: "Laptops",
        slug: "laptops",
        children_recursive: [
            {
                id: 2,
                name: "Gaming",
                slug: "laptops-gaming",
                parent_id: 1,
                children_recursive: [],
            },
        ],
    },
];

const mockFlatCategories: CategoryFlat[] = [
    { id: 1, name: "Laptops", slug: "laptops" },
    { id: 2, name: "Gaming", slug: "laptops-gaming", parent_id: 1 },
];

describe("useCategories", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with the categories query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useCategories();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["categories"],
            }),
        );
    });

    it("fetches categories from /categories endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: false,
                error: null,
            } as any;
        });

        useCategories();

        vi.mocked(api.get).mockResolvedValue({ data: { categories: mockCategories } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/categories");
        expect(result).toEqual({ categories: mockCategories });
    });

    it("returns the categories from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockCategories,
                isLoading: false,
                error: null,
            } as any;
        });

        useCategories();

        vi.mocked(api.get).mockResolvedValue({ data: { categories: mockCategories } });

        const result = await queryFn!();

        expect(result.categories).toHaveLength(1);
        expect(result.categories[0].name).toBe("Laptops");
        expect(result.categories[0].children_recursive[0].name).toBe("Gaming");
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

        useCategories();

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});

describe("useCategoriesFlat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with the categories-flat query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useCategoriesFlat();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["categories-flat"],
            }),
        );
    });

    it("fetches categories from the flat endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: false,
                error: null,
            } as any;
        });

        useCategoriesFlat();

        vi.mocked(api.get).mockResolvedValue({ data: { categories: mockFlatCategories } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/categories?flat=true");
        expect(result).toEqual({ categories: mockFlatCategories });
    });

    it("returns the flat categories from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockFlatCategories,
                isLoading: false,
                error: null,
            } as any;
        });

        useCategoriesFlat();

        vi.mocked(api.get).mockResolvedValue({ data: { categories: mockFlatCategories } });

        const result = await queryFn!();

        expect(result.categories).toHaveLength(2);
        expect(result.categories[0].name).toBe("Laptops");
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

        useCategoriesFlat();

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});
