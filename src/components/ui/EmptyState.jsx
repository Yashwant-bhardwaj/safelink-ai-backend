import { motion } from 'framer-motion'
import { SearchX, FolderOpen, Wifi, AlertCircle } from 'lucide-react'
import Button from '@/components/common/Button'

const TYPES = {
  'no-results': {
    icon: SearchX,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
    color: '#6B7280',
  },
  'no-history': {
    icon: FolderOpen,
    title: 'No scan history',
    description: 'Start scanning URLs to see your history here.',
    color: '#3B82F6',
  },
  'error': {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An error occurred. Please try again.',
    color: '#EF4444',
  },
  'no-data': {
    icon: FolderOpen,
    title: 'No data available',
    description: 'Nothing to display here yet.',
    color: '#6B7280',
  },
}

export default function EmptyState({
  type = 'no-data',
  title,
  description,
  action,
  actionLabel,
}) {
  const config = TYPES[type] || TYPES['no-data']
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
      >
        <Icon size={28} style={{ color: config.color }} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title || config.title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description || config.description}</p>
      {action && actionLabel && (
        <Button onClick={action} variant="secondary" size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
