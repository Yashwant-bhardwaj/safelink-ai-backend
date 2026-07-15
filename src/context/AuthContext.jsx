import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('safelink-token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.get('/auth/me')
        setUser(response.data.user)
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid — clear it silently
          clearSession()
        } else {
          console.error('Session restore failed:', err)
          clearSession()
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const clearSession = () => {
    setUser(null)
    localStorage.removeItem('safelink-user')
    localStorage.removeItem('safelink-token')
  }

  // ── Email / Password Login ───────────────────────────────
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user: loggedUser, token } = response.data
      setUser(loggedUser)
      localStorage.setItem('safelink-user', JSON.stringify(loggedUser))
      localStorage.setItem('safelink-token', token)
      return loggedUser
    } catch (err) {
      if (!err.response) {
        throw new Error('Cannot reach server. Make sure the backend is running on port 5000.')
      }
      throw new Error(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }


  // ── OAuth Token Login (used by OAuthCallbackPage) ────────
  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('safelink-token', token)
    try {
      const response = await apiClient.get('/auth/me')
      const loggedUser = response.data.user
      setUser(loggedUser)
      localStorage.setItem('safelink-user', JSON.stringify(loggedUser))
      return loggedUser
    } catch (err) {
      clearSession()
      throw new Error('Failed to verify OAuth token')
    }
  }, [])

  // ── Register ─────────────────────────────────────────────
  const register = async (name, email, password) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/register', { name, email, password })
      const { user: newUser, token } = response.data
      setUser(newUser)
      localStorage.setItem('safelink-user', JSON.stringify(newUser))
      localStorage.setItem('safelink-token', token)
      return newUser
    } catch (err) {
      if (!err.response) {
        throw new Error('Cannot reach server. Make sure the backend is running:\n  cd server && node server.js')
      }
      throw new Error(err.response?.data?.error || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }


  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
  }, [])

  // ── Update Profile ───────────────────────────────────────
  const updateUser = async (updates) => {
    try {
      const response = await apiClient.put('/auth/profile', updates)
      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem('safelink-user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update profile')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginWithToken,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
