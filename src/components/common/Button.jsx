import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const VARIANTS = {
  primary: 'text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'text-white font-medium hover:bg-white/10 active:scale-[0.98]',
  danger: 'text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.98]',
  outline: 'text-gray-300 hover:text-white hover:bg-white/5 active:scale-[0.98]',
}

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-base rounded-2xl',
}

const STYLES = {
  primary: { background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' },
  secondary: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' },
  danger: { background: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  ghost: {},
  outline: { border: '1px solid rgba(255,255,255,0.12)' },
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className,
    style,
    onClick,
    type = 'button',
    fullWidth = false,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer select-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      style={{ ...STYLES[variant], ...style }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          {children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />}
        </>
      )}
    </motion.button>
  )
})

export default Button
