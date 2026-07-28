import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAddresses } from "./useAddresses";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { Address } from "@/types/Address";

vi.mock("@tanstack/vue-query", () => ({
    useQuery: vi.fn(),
}));

vi.mock("@/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockAddresses: Address[] = [
    {
        id: 1,
        address_type: "shipping",
        address_line_1: "test",
        address_line_2: "",
        city: "Test",
        country: "Poland",
        postal_code: "00-000",
        state_province: "Test",
    },
    {
        id: 2,
        address_type: "billing",
        address_line_1: "test 2",
        address_line_2: "test 2",
        city: "Test 2",
        country: "USA",
        postal_code: "00-000",
        state_province: "Test",
    },
];

describe("useAddresses", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with correct query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        useAddresses();

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["addresses"],
            }),
        );
    });

    it("fetches addresses from /addresses endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockAddresses,
                isLoading: false,
                error: null,
            } as any;
        });

        useAddresses();

        vi.mocked(api.get).mockResolvedValue({ data: { addresses: mockAddresses } });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/addresses");
        expect(result).toEqual({ addresses: mockAddresses });
    });

    it("returns the addresses array from the response", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: mockAddresses,
                isLoading: false,
                error: null,
            } as any;
        });

        useAddresses();

        vi.mocked(api.get).mockResolvedValue({ data: { addresses: mockAddresses } });

        const result = await queryFn!();

        expect(result.addresses).toHaveLength(2);
        expect(result.addresses[0].address_type).toBe("shipping");
        expect(result.addresses[1].address_type).toBe("billing");
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

        useAddresses();

        vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));

        await expect(queryFn!()).rejects.toThrow("Network Error");
    });
});