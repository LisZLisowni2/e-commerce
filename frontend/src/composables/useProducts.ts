import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { Product } from "@/types/Product";

export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data } = await api.get<{ products: Product[] }>(
                "/products",
            );
            return data.products;
        },
    });
}
