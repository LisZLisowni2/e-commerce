import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get("/users")

            return data
        },
    })
}