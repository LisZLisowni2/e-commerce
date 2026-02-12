import { defineStore } from "pinia"
import { useColorMode } from "@vueuse/core"

export const useThemeStore = defineStore('theme-store', () => {
    const mode = useColorMode({
        selector: 'html',
        attribute: 'class',
        valueDark: 'dark',
        valueLight: 'light'
    })

    return { mode } 
})