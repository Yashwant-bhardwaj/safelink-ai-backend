import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  // First attempt to grab JWT session token
  const token = localStorage.getItem('safelink-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // Fallback to apiKey if user object is queried directly
    try {
      const user = JSON.parse(localStorage.getItem('safelink-user') || '{}')
      if (user?.apiKey) {
        config.headers.Authorization = `Bearer ${user.apiKey}`
      }
    } catch (e) {
      // Ignored
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('safelink-user')
      localStorage.removeItem('safelink-token')
    }
    return Promise.reject(error)
  }
)

export default apiClient
