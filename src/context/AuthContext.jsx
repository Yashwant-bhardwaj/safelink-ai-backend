import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '@/lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
        if (err.response?.status !== 401) {
          console.error('Session restore failed:', err)
        }
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user: loggedUser, token } = response.data
      setUser(loggedUser)
      localStorage.setItem('safelink-user', JSON.stringify(loggedUser))
      localStorage.setItem('safelink-token', token)
      setIsLoading(false)
      return loggedUser
    } catch (err) {
      setIsLoading(false)
      throw new Error(err.response?.data?.error || 'Login failed')
    }
  }

  const register = async (name, email, password) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/register', { name, email, password })
      const { user: newUser, token } = response.data
      setUser(newUser)
      localStorage.setItem('safelink-user', JSON.stringify(newUser))
      localStorage.setItem('safelink-token', token)
      setIsLoading(false)
      return newUser
    } catch (err) {
      setIsLoading(false)
      throw new Error(err.response?.data?.error || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('safelink-user')
    localStorage.removeItem('safelink-token')
  }

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
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
