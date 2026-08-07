import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useUsers, useUsersNotPaginate } from "@/composables/useUsers";
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

const mockUsers = [
    {
        id: 1,
        email: "alice@example.com",
        password: "password",
        scope: "user",
        status: "active",
    },
    {
        id: 2,
        email: "bob@example.com",
        password: "password",
        scope: "vendor",
        status: "inactive",
    },
];

const mockPagination: PaginationResult<(typeof mockUsers)[number]> = {
    data: mockUsers,
    current_page: 1,
    last_page: 1,
    first_page: 1,
    per_page: 20,
    total: 2,
    from: 1,
    to: 2,
};

describe("useUsers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with the page in the query key", () => {
        let opts: { queryKey?: unknown; queryFn?: unknown } = {};

        vi.mocked(useQuery).mockImplementation((o: any) => {
            opts = o;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        const page = ref(2);
        useUsers(page);

        expect(opts.queryKey).toEqual(["users", page]);
        expect(opts.queryFn).toBeTypeOf("function");
    });

    it("fetches paginated users from /users?paginated=true&page", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useUsers(3);

        vi.mocked(api.get).mockResolvedValue({ data: { users: mockPagination } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/users?paginated=true&page=3");
        expect(result).toEqual({ users: mockPagination });
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

        useUsers(page);

        page.value = 5;
        vi.mocked(api.get).mockResolvedValue({ data: { users: mockPagination } });

        await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/users?paginated=true&page=5");
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

        useUsers(1);

        vi.mocked(api.get).mockRejectedValue(new Error("Unauthorized"));

        await expect(queryFn!()).rejects.toThrow("Unauthorized");
    });
});

describe("useUsersNotPaginate", () => {
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

        useUsersNotPaginate();

        expect(opts.queryKey).toEqual(["users -1"]);
        expect(opts.queryFn).toBeTypeOf("function");
    });

    it("fetches users from /users?paginated=false", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
                error: null,
            } as any;
        });

        useUsersNotPaginate();

        vi.mocked(api.get).mockResolvedValue({ data: { users: mockUsers } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/users?paginated=false");
        expect(result).toEqual({ users: mockUsers });
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

        useUsersNotPaginate();

        vi.mocked(api.get).mockRejectedValue(new Error("Unauthorized"));

        await expect(queryFn!()).rejects.toThrow("Unauthorized");
    });
});
