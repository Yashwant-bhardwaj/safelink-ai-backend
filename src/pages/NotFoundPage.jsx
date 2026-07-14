import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Home, Shield, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 – Page Not Found – SafeLink AI</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0B1220' }}>
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', filter: 'blur(80px)' }} />

        <div className="relative z-10 text-center max-w-lg">
          {/* 404 illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mb-8"
          >
            {/* Large shield with 404 */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-48 h-48 rounded-full float"
                style={{
                  background: 'radial-gradient(circle, rgba(59,130,246,0.15), rgba(6,182,212,0.05))',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Shield size={56} style={{ color: '#3B82F6' }} />
                <div className="text-6xl font-black text-white mt-1 leading-none">404</div>
              </div>
            </div>

            {/* Decorative elements */}
            {[
              { x: -80, y: -40, delay: 0.2, size: 24 },
              { x: 80, y: -60, delay: 0.4, size: 20 },
              { x: 60, y: 60, delay: 0.3, size: 28 },
              { x: -60, y: 40, delay: 0.5, size: 16 },
            ].map(({ x, y, delay, size }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x, y }}
                animate={{ opacity: 0.3, x, y }}
                transition={{ delay, duration: 0.5 }}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <AlertTriangle size={size} style={{ color: '#3B82F6' }} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist or has been moved.
              Let's get you back to safety.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
              >
                <Home size={16} />
                Go Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>

            {/* Quick links */}
            <div className="mt-12 pt-8 border-t border-white/[0.06]">
              <p className="text-xs text-gray-600 mb-4">Or navigate to:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Dashboard', to: '/dashboard' },
                  { label: 'URL Scanner', to: '/scanner' },
                  { label: 'History', to: '/history' },
                  { label: 'Settings', to: '/settings' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
