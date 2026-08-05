import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { Product } from "@/types/Product";

interface UseProductsOptions {
    vendorId?: number,
    searchQuery?: string,
}

export function useProducts(options: UseProductsOptions = {}) {
    return useQuery({
        queryKey: ["products", options?.vendorId, options?.searchQuery],
        queryFn: async () => {
            const { vendorId, searchQuery } = options ?? {};
            
            let url = "/products";
            if (vendorId) {
                url = `/products?vendor_id=${vendorId}`;
            } else if (searchQuery) {
                url = `/products?search_query=${searchQuery}`;
            }

            const { data } = await api.get<{ products: Product[] }>(url);
            return data.products;
        },
    });
}