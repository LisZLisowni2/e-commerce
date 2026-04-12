import { ref, onMounted } from "vue"

export default function useCountry() {
    const countryCode = ref<string>("")

    onMounted(async () => {
        try {
            const res = await fetch("http://localhost:8000/api/geo")
            const data = await res.json()
            countryCode.value = data.country
        } catch {
            countryCode.value = navigator.language.split('-')[1] || 'US'
        }
    })

    return { countryCode }
} 