import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api";

export const useCountryStore = defineStore('country-store', () => {
    const isLoading = ref(true);
    const countryCode = ref("");

    async function fetchCountryCode() {
        try {
            const res = await api.get(`/geo`)
            countryCode.value = res.data.country
        } catch {
            countryCode.value = navigator.language.split('-')[1] || 'US'
        } finally {
            isLoading.value = false
        }
    }

    return { countryCode, isLoading, fetchCountryCode }
})