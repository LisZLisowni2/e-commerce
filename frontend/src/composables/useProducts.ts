import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { type MaybeRefOrGetter, type Ref, computed, toValue, unref } from "vue";
import api from "@/api";
import type { Product } from "@/types/Product";
import type { PaginationResult } from "@/types/PaginationResult";

interface UseProductsOptions {
    vendorId?: MaybeRefOrGetter<number | undefined>,
    searchQuery?: MaybeRefOrGetter<string | undefined>,
    page: Ref<number> | number,
}

export function useProducts(options: UseProductsOptions) {
    const queryKey = computed(() => [
        "products",
        toValue(options?.vendorId),
        toValue(options?.searchQuery),
        toValue(options.page)
    ]);

    return useQuery({
        queryKey,
        queryFn: async () => {
            const vendorId = toValue(options?.vendorId);
            const searchQuery = toValue(options?.searchQuery);
            const page = unref(options.page)

            const params = new URLSearchParams();
            if (vendorId) {
                params.set("vendor_id", String(vendorId));
            } else if (searchQuery) {
                params.set("search_query", searchQuery);
            } 

            params.set("paginated", String(true))
            params.set("page", String(page))

            const queryString = params.toString();
            const url = queryString ? `/products?${queryString}` : "/products";

            const { data } = await api.get<{ products: PaginationResult<Product> }>(url);
            return data.products;
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export function useProductsNotPagination(options: Omit<UseProductsOptions, 'page'> = {}) {
    const queryKey = computed(() => [
        "products",
        toValue(options?.vendorId),
        toValue(options?.searchQuery),
        " -1"
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
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}
