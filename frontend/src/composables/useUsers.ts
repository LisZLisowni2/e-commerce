import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { User } from "@/types/User";
import type { PaginationResult } from "@/types/PaginationResult";
import { unref, type Ref } from "vue";

export function useUsers(page: Ref<number> | number) {
    return useQuery({
        queryKey: ['users', page],
        queryFn: async () => {
            const currentPage = unref(page)
            const { data } = await api.get<{ users: PaginationResult<User> }>(`/users?page=${currentPage}`)

            return data
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}