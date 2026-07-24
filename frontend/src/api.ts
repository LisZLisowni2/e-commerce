import axios from "axios"

const API_URI: string = import.meta.env.VITE_API_URI || "http://localhost:8080/api"

const getToken = () => localStorage.getItem("token")
const isLocalhost = window.location.hostname === "localhost"

const api = axios.create({
    baseURL: API_URI,
    withCredentials: isLocalhost,
})

api.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    config.headers.Accept = "application/json"
    config.headers["Content-Type"] = "application/json"
    return config;
})

export default api