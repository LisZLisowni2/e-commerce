import { useQuery } from "@tanstack/vue-query";
import { type Address } from "@/types/Address";
import api from "@/api";

export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const { data } = await api.get<{ addresses: Address[] }>("/addresses");

            return data;
        }
    })
}