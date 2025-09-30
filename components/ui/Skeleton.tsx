import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 animate-pulse"
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded'
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
      default:
        return 'rounded-lg'
    }
  }

  const style = {
    width: width,
    height: height
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <motion.div
            key={`skeleton-line-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${baseClasses} ${getVariantClasses()} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" lines={2} />
          <div className="flex items-center space-x-4">
            <Skeleton width={80} height={32} />
            <Skeleton width={60} height={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={120} />
          <Skeleton width={80} height={32} />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>
    </div>
  )
}