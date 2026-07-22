import { describe, it, expect, vi, beforeEach } from "vitest";
import { useImageProduct } from "@/composables/useImageProduct";
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

describe("useImageProduct", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls useQuery with correct query key", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        useImageProduct("/images/rtx.jpg");

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["image-/images/rtx.jpg"],
            }),
        );
    });

    it("fetches image blob from correct endpoint", async () => {
        let queryFn: () => Promise<any>;

        vi.mocked(useQuery).mockImplementation((opts: any) => {
            queryFn = opts.queryFn;
            return {
                data: undefined,
                isLoading: true,
            } as any;
        });

        useImageProduct("rtx.jpg");

        const blob = new Blob(["fake-image"], { type: "image/jpeg" });
        vi.mocked(api.get).mockResolvedValue({ data: blob });

        const result = await queryFn!();

        expect(api.get).toHaveBeenCalledWith("/image/rtx.jpg", {
            responseType: "blob",
        });
        expect(result).toMatch(/^blob:/);
    });

    it("sets retry to false", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        useImageProduct("test.png");

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                retry: false,
            }),
        );
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

        useImageProduct("missing.jpg");

        vi.mocked(api.get).mockRejectedValue(new Error("Not Found"));

        await expect(queryFn!()).rejects.toThrow("Not Found");
    });
});
