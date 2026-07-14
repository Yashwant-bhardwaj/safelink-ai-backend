import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = '#3B82F6',
  index = 0,
}) {
  const isPositive = trendValue > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="card-hover gradient-border p-6 rounded-2xl"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            isPositive
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-600">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}
