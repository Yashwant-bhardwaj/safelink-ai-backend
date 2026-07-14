import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', met: password?.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password || '') },
    { label: 'Number', met: /[0-9]/.test(password || '') },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password || '') },
  ]
  const strength = checks.filter(c => c.met).length
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
        <span className="text-xs ml-2" style={{ color: colors[strength] }}>{labels[strength]}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <CheckCircle size={10} style={{ color: check.met ? '#22C55E' : '#374151' }} />
            <span className="text-xs" style={{ color: check.met ? '#9CA3AF' : '#4B5563' }}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register: authRegister, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await authRegister(data.name, data.email, data.password)
      setSuccess(true)
      setTimeout(() => {
        toast.success('Account created! Welcome to SafeLink AI 🚀')
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Create Account – SafeLink AI</title>
        <meta name="description" content="Create your free SafeLink AI account and start scanning URLs for security threats." />
      </Helmet>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E' }}
            >
              <CheckCircle size={40} className="text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-gray-400 text-sm">Redirecting you to the dashboard...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400 text-sm">Start with 500 free scans per month. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Full name"
                type="text"
                placeholder="Alex Johnson"
                icon={User}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
                {errors.password && <p className="text-xs text-red-400">⚠ {errors.password.message}</p>}
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-500" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className={`input-dark pl-10 pr-12 ${errors.confirmPassword ? 'border-red-500/70' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400">⚠ {errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 rounded accent-blue-500 mt-0.5"
                    {...register('terms')}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <p className="text-xs text-red-400 pl-7">⚠ {errors.terms.message}</p>}
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                className="mt-2"
              >
                {isLoading ? 'Creating account...' : 'Create Free Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
