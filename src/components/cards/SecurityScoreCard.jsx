import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getScoreColor, getScoreLabel } from '@/utils/helpers'

export default function SecurityScoreCard({ score = 0, checks = {}, className }) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (score / 100) * circumference

  const checkItems = [
    { key: 'ssl', label: 'SSL/HTTPS' },
    { key: 'malware', label: 'Malware Free' },
    { key: 'phishing', label: 'Phishing Safe' },
    { key: 'xssProtection', label: 'XSS Protection' },
    { key: 'hsts', label: 'HSTS Enabled' },
    { key: 'clickjacking', label: 'Clickjacking Safe' },
  ]

  return (
    <div className={`p-6 rounded-2xl ${className}`}
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-gray-400 mb-6">Security Score</h3>

      {/* Circular score */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="64" cy="64" r="54" fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white"
            >
              {score}
            </motion.span>
            <span className="text-xs font-medium" style={{ color }}>{label}</span>
          </div>
        </div>

        {/* Check items */}
        <div className="flex-1 space-y-2">
          {checkItems.map(({ key, label: checkLabel }) => {
            const passed = checks[key]
            return (
              <div key={key} className="flex items-center gap-2">
                {passed === true ? (
                  <CheckCircle size={14} style={{ color: '#22C55E' }} />
                ) : passed === false ? (
                  <XCircle size={14} style={{ color: '#EF4444' }} />
                ) : (
                  <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
                )}
                <span className="text-xs text-gray-400">{checkLabel}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
