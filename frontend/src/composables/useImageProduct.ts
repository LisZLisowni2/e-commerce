import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

export function useImageProduct(path: string) {
    return useQuery({
        queryKey: [`image-${path}`],
        queryFn: async () => {
            const { data } = await api.get("/image/" + path, {
                responseType: 'blob',
            })

            return URL.createObjectURL(data)
        },
        retry: false,
    })
}