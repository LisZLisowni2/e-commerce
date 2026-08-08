import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { User } from "@/types/User";
import type { PaginationResult } from "@/types/PaginationResult";
import { unref, type Ref } from "vue";

export function useUsers(page: Ref<number> | number, query: Ref<string> | string = "") {
    return useQuery({
        queryKey: ['users', page, query],
        queryFn: async () => {
            const currentPage = unref(page)
            const searchQuery = unref(query)

            const { data } = await api.get<{ users: PaginationResult<User> }>(`/users?paginated=true&page=${currentPage}&search_query=${searchQuery}`)

            return data
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}

export function useUsersNotPaginate(query: Ref<string> | string = "") {
    return useQuery({
        queryKey: ['users -1', query],
        queryFn: async () => {
            const searchQuery = unref(query)
            const { data } = await api.get<{ users: User[] }>(`/users?paginated=false&search_query=${searchQuery}`)

            return data
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}