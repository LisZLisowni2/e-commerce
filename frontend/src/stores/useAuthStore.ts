import { defineStore } from "pinia";
import { ref, computed } from "vue"

interface User {
    id: number,
    username: string,
    email: string,
    password: string,
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem("token") || null)
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    function setToken(newToken: string) {
        token.value = newToken
        if (newToken) {
            localStorage.setItem('token', newToken)
        } else {
            localStorage.removeItem('token')
        }
    }

    function setUser(newUser: User) {
        user.value = newUser
    }

    function logout() {
        setToken(null)
        setUser(null)
    }

    return { token, user, isAuthenticated, setToken, setUser, logout }
})