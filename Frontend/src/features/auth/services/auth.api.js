import axios from "axios"

// VITE_API_URL is set to http://localhost:3000 in .env for local development.
// In production (Render), VITE_API_URL is not injected, so the fallback
// "https://gen-ai-halz.onrender.com" is used (the production backend URL).
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://gen-ai-halz.onrender.com",
    withCredentials: true   // Required: sends HttpOnly cookies with every request
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        console.error("[register] Error:", err?.response?.data || err.message)
        throw err
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        console.error("[login] Error:", err?.response?.data || err.message)
        throw err
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.error("[logout] Error:", err?.response?.data || err.message)
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        console.error("[getMe] Error:", err?.response?.data || err.message)
        // Don't re-throw: 401 on getMe means unauthenticated (normal state before login)
    }
}