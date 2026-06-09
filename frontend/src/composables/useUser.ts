import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed } from "vue";

export function useUser() {
    const authStore = useAuthStore()

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data } = await api.get("/user")
            
            authStore.setUser(data)
            return data
        },
        retry: false,
        enabled: computed(() => authStore.isAuthenticated)
    })
}