import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCountryCode } from "./useCountryCode";
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

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useCountryCode", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with correct query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        useCountryCode();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["countryCode"],
            }),
        );
    });

    it("fetches IP from ifconfig.me then gets country from /geo endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
            } as any;
        });

        useCountryCode();

        mockFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("  1.2.3.4\n"),
        });
        vi.mocked(api.get).mockResolvedValue({ data: { country: "PL" } });

        const result = await queryFn!();

        expect(mockFetch).toHaveBeenCalledWith("https://ifconfig.me/ip");
        expect(api.get).toHaveBeenCalledWith("/geo/1.2.3.4");
        expect(result).toBe("PL");
    });

    it("throws when fetch response is not ok", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
            } as any;
        });

        useCountryCode();

        mockFetch.mockResolvedValue({
            ok: false,
            text: () => Promise.resolve(""),
        });

        await expect(queryFn!()).rejects.toThrow("Failed to fetch IP");
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

        useCountryCode();

        mockFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("1.2.3.4"),
        });
        vi.mocked(api.get).mockRejectedValue(new Error("Geo API Error"));

        await expect(queryFn!()).rejects.toThrow("Geo API Error");
    });

    it("uses navigator.language as placeholder data", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        const original = navigator.language;
        Object.defineProperty(navigator, "language", { value: "pl-PL", configurable: true });

        useCountryCode();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                placeholderData: expect.any(Function),
            }),
        );

        const placeholderFn = vi.mocked(useQuery).mock.calls[0][0] as any;
        expect(placeholderFn.placeholderData()).toBe("PL");

        Object.defineProperty(navigator, "language", { value: original, configurable: true });
    });
});
