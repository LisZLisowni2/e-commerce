import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed } from "vue";

interface Data {
    email: string,
    password: string
}

export function useUser() {
    const authStore = useAuthStore()

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await api.get("/user")
            
            authStore.setUser(response.data)
            return response.data
        },
        retry: false,
        enabled: computed(() => authStore.isAuthenticated)
    })
}