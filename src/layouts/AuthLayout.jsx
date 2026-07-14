import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import BackgroundEffects from '@/components/common/BackgroundEffects'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex relative z-10">
      <BackgroundEffects />
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #0f1f3d 0%, #0B1220 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Animated grid */}
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', filter: 'blur(60px)' }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">SafeLink</span>
              <span className="text-xl font-bold" style={{ color: '#3B82F6' }}> AI</span>
            </div>
          </div>
        </motion.div>

        {/* Middle content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            AI-Powered<br />
            <span className="gradient-text">URL Security</span><br />
            Intelligence
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Instantly analyze any URL for malware, phishing, and security vulnerabilities with our advanced AI engine.
          </p>

          {/* Feature list */}
          {[
            '🛡️ Real-time threat detection',
            '🔍 Deep website intelligence',
            '📊 Security score analytics',
            '⚡ Sub-second scan results',
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="text-sm text-gray-300">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 grid grid-cols-3 gap-4"
        >
          {[
            { label: 'URLs Scanned', value: '50M+' },
            { label: 'Threats Blocked', value: '2.1M' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text-blue">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">SafeLink <span style={{ color: '#3B82F6' }}>AI</span></span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
