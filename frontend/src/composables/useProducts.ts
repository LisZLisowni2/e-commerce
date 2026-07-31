import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { Product } from "@/types/Product";

export function useProducts(vendorId?: number) {
    return useQuery({
        queryKey: vendorId ? ["products", "vendor", vendorId] : ["products"],
        queryFn: async () => {
            const { data } = await api.get<{ products: Product[] }>(
                vendorId ? `/products?vendor_id=${vendorId}` : "/products",
            );
            return data.products;
        },
    });
}
