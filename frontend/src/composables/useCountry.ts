import { ref, onMounted } from "vue"
import api from "@/api"

export default function useCountry() {
    const countryCode = ref<string>("")
    const isLoading = ref<boolean>(true)

    onMounted(async () => {
        try {
            const res = await api.get("/geo")
            const data = await res.data
            countryCode.value = data.country
        } catch {
            countryCode.value = navigator.language.split('-')[1] || 'US'
        } finally {
            isLoading.value = false
        }
    })

    return { countryCode }
} 