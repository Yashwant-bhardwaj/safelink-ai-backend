import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'alex@safelink.ai', password: 'password123' },
  })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Invalid credentials. Please try again.')
    }
  }

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider)
    toast(`Connecting to ${provider === 'github' ? 'GitHub' : 'Google'} OAuth...`, { icon: '🔑' })
    await new Promise(r => setTimeout(r, 1200))
    
    const mockSocialUser = {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      name: provider === 'github' ? 'Alex GitHub' : 'Alex Google',
      email: provider === 'github' ? 'alex.git@github.com' : 'alex.gmail@google.com',
      role: 'Pro',
      plan: 'Professional',
      apiKey: 'sk_live_safelink_social_oauth_key',
      scansUsed: 12,
      scansLimit: 5000,
      joinedAt: new Date().toISOString().split('T')[0],
    }
    
    localStorage.setItem('safelink-user', JSON.stringify(mockSocialUser))
    localStorage.setItem('safelink-token', 'mock_jwt_token_from_oauth')
    
    toast.success(`Logged in with ${provider === 'github' ? 'GitHub' : 'Google'} successfully!`)
    setSocialLoading(null)
    window.location.href = '/dashboard'
  }

  return (
    <>
      <Helmet>
        <title>Sign In – SafeLink AI</title>
        <meta name="description" content="Sign in to your SafeLink AI account to access the URL scanner dashboard." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your SafeLink AI account</p>
        </div>

        {/* Social login placeholders */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Github size={16} className={socialLoading === 'github' ? 'animate-spin' : ''} />
            {socialLoading === 'github' ? 'Connecting...' : 'GitHub'}
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Chrome size={16} className={socialLoading === 'google' ? 'animate-spin' : ''} />
            {socialLoading === 'google' ? 'Connecting...' : 'Google'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs text-gray-500">or continue with email</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`input-dark pl-10 pr-12 ${errors.password ? 'border-red-500/70' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">⚠ {errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="remember-me"
              type="checkbox"
              className="w-4 h-4 rounded accent-blue-500"
              {...register('rememberMe')}
            />
            <label htmlFor="remember-me" className="text-sm text-gray-400">Remember me for 30 days</label>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl text-xs text-gray-500 text-center"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          Demo: use any email / any password to sign in
        </div>
      </motion.div>
    </>
  )
}
