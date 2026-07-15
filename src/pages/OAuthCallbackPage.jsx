import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * OAuthCallbackPage
 * 
 * The backend OAuth handler redirects here with either:
 *   /auth/callback?token=<jwt>      (success)
 *   /login?error=<reason>           (failure — handled in LoginPage)
 * 
 * This page reads the token, stores it, restores the user session,
 * then redirects to the dashboard.
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      toast.error('Authentication failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    // Store token and restore session
    loginWithToken(token)
      .then(() => {
        toast.success('Signed in successfully! 🎉')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        toast.error('Failed to restore session. Please sign in again.')
        navigate('/login', { replace: true })
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1220' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <LoadingSpinner size="lg" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Completing Sign-In</h2>
        <p className="text-gray-400 text-sm">Verifying your credentials...</p>
      </motion.div>
    </div>
  )
}
