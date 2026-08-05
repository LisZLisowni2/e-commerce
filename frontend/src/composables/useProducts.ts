import { useQuery } from "@tanstack/vue-query";
import { type MaybeRefOrGetter, computed, toValue } from "vue";
import api from "@/api";
import type { Product } from "@/types/Product";

interface UseProductsOptions {
    vendorId?: MaybeRefOrGetter<number | undefined>,
    searchQuery?: MaybeRefOrGetter<string | undefined>,
}

export function useProducts(options: UseProductsOptions = {}) {
    const queryKey = computed(() => [
        "products",
        toValue(options?.vendorId),
        toValue(options?.searchQuery),
    ]);

    return useQuery({
        queryKey,
        queryFn: async () => {
            const vendorId = toValue(options?.vendorId);
            const searchQuery = toValue(options?.searchQuery);

            const params = new URLSearchParams();
            if (vendorId) {
                params.set("vendor_id", String(vendorId));
            } else if (searchQuery) {
                params.set("search_query", searchQuery);
            }

            const queryString = params.toString();
            const url = queryString ? `/products?${queryString}` : "/products";

            const { data } = await api.get<{ products: Product[] }>(url);
            return data.products;
        },
    });
}
