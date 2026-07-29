import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import type { User } from "@/types/User";

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get<{ users: User[] }>("/users")

            return data
        },
    })
}