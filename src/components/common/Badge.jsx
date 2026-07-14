import { cn } from '@/lib/cn'

const VARIANTS = {
  safe: 'badge-safe',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  default: 'bg-white/10 text-gray-300 border border-white/10',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
}

export default function Badge({ children, variant = 'default', size = 'sm', className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        VARIANTS[variant],
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: variant === 'safe' ? '#22C55E'
              : variant === 'danger' ? '#EF4444'
              : variant === 'warning' ? '#F59E0B'
              : variant === 'info' ? '#3B82F6'
              : '#9CA3AF',
          }}
        />
      )}
      {children}
    </span>
  )
}
