import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUser } from "./useUser";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import { useAuthStore } from "@/stores/useAuthStore";

vi.mock("@tanstack/vue-query", () => ({
    useQuery: vi.fn(),
}));

vi.mock("@/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock("@/stores/useAuthStore", () => ({
    useAuthStore: vi.fn(),
}));

const mockUser = {
    id: 1,
    email: "test@example.com",
    email_verified_at: "2026-01-01",
    password: "hashed",
    scope: "user",
    status: "active",
    first_name: "John",
    last_name: "Doe",
    phone: "123456789",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
};

const mockSetUser = vi.fn();
const mockAuthStore = {
    isAuthenticated: true,
    setUser: mockSetUser,
};

describe("useUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    });

    it("calls useQuery with correct query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        useUser();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["user"],
            }),
        );
    });

    it("sets retry to false", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        useUser();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                retry: false,
            }),
        );
    });

    it("fetches user from /user endpoint and calls authStore.setUser", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: false,
                error: null,
            } as any;
        });

        useUser();

        vi.mocked(api.get).mockResolvedValue({ data: mockUser });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/user");
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(result).toEqual(mockUser);
    });

    it("returns the user data from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockUser,
                isLoading: false,
                error: null,
            } as any;
        });

        useUser();

        vi.mocked(api.get).mockResolvedValue({ data: mockUser });

        const result = await queryFn!();

        expect(result.email).toBe("test@example.com");
        expect(result.scope).toBe("user");
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

        useUser();

        vi.mocked(api.get).mockRejectedValue(new Error("Unauthorized"));

        await expect(queryFn!()).rejects.toThrow("Unauthorized");
    });
});
