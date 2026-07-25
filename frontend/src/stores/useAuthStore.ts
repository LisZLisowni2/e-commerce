import { defineStore } from "pinia";
import { ref, computed } from "vue"

interface User {
    id: number,
    email: string,
    email_verified_at?: string,
    password: string,
    scope: string,
    status: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    date_of_birth?: Date,
    created_at?: string,
    updated_at?: string,
    gender?: string,
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