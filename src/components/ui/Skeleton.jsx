import { cn } from '@/lib/cn'

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl shimmer', className)}
      style={{ background: 'rgba(255,255,255,0.05)', ...props.style }}
      {...props}
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3 mb-2', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/[0.04]">
      <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}
