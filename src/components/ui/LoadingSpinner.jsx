import { cn } from '@/lib/cn'

export default function LoadingSpinner({ size = 'md', className, color = '#3B82F6' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  }

  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-transparent', sizes[size], className)}
      style={{
        borderTopColor: color,
        borderRightColor: `${color}40`,
      }}
      role="status"
      aria-label="Loading"
    />
  )
}
