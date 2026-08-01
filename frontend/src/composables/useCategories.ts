import { type Category, type CategoryFlat } from "@/types/Category";
import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get<{ categories: Category[] }>("/categories");

            return data
        }
    })
}

export function useCategoriesFlat() {
    return useQuery({
        queryKey: ["categories-flat"],
        queryFn: async () => {
            const { data } = await api.get<{ categories: CategoryFlat[] }>("/categories?flat=true");

            return data
        }
    })
}