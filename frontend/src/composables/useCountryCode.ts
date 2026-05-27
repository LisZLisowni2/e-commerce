import { useQuery } from "@tanstack/vue-query";
import api from "@/api";

interface GeoResponse {
    country: string;
}

export function useCountryCode() {
    return useQuery({
        queryKey: ["countryCode"],
        queryFn: async (): Promise<string> => {
            const externalAPIres = await fetch("https://ifconfig.me/ip");
            if (!externalAPIres.ok) throw new Error("Failed to fetch IP");
            const ip = (await externalAPIres.text()).trim();
            
            const res = await api.get<GeoResponse>(`/geo/${ip}`);
            return res.data.country;
        },
        placeholderData: () => {
            return navigator.language.split("-")[1] || "US";
        },
    });
}
