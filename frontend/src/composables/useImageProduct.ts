import { useQuery } from "@tanstack/vue-query";
import api from "@/api";
import { computed, unref, type ComputedRef } from "vue";

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

export function useImageProductByComputed(path: ComputedRef) {
    return useQuery({
        queryKey: [`image-${path}`],
        queryFn: async () => {
            const { data } = await api.get("/image/" + unref(path), {
                responseType: 'blob',
            })

            return URL.createObjectURL(data)
        },
        retry: false,
        enabled: computed(() => !!unref(path))
    })
}
