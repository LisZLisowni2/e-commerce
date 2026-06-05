import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

interface Data {
    email: string,
    password: string
}

export function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await api.get("/user", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            })
            
            return response.data
        }
    })
}