'use client'

import { motion } from 'framer-motion'
import { CubeIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    success: 'border-success-500',
    warning: 'border-warning-500',
    danger: 'border-danger-500'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-r-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

interface PulsingDotsProps {
  count?: number
  color?: string
  size?: number
  className?: string
}

export function PulsingDots({ 
  count = 3, 
  color = '#0ea5e9',
  size = 8,
  className = '' 
}: PulsingDotsProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`pulsing-dot-${i}`}
          className="rounded-full"
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color 
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
}

export function Skeleton({ 
  className = '', 
  lines = 1, 
  avatar = false 
}: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className="w-12 h-12 bg-dark-700 rounded-full" />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={`skeleton-card-line-${i}`}
              className={`bg-dark-700 rounded ${
                i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
              } h-4`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CapsuleLoadingProps {
  message?: string
  progress?: number
}

export function CapsuleLoading({ 
  message = 'Chargement...', 
  progress 
}: CapsuleLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="relative mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
          <CubeIcon className="w-8 h-8 text-white" />
        </div>
        <motion.div
          className="absolute inset-0 border-2 border-primary-500 rounded-xl opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <p className="text-white font-medium mb-2">{message}</p>
      
      {progress !== undefined && (
        <div className="w-48 h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      
      <PulsingDots className="mt-4" />
    </div>
  )
}

interface BlockchainLoadingProps {
  step: 'connecting' | 'signing' | 'broadcasting' | 'confirming' | 'complete'
  txHash?: string
}

export function BlockchainLoading({ step, txHash }: BlockchainLoadingProps) {
  const steps = [
    { key: 'connecting', icon: ShieldCheckIcon, label: 'Connexion au wallet' },
    { key: 'signing', icon: KeyIcon, label: 'Signature de la transaction' },
    { key: 'broadcasting', icon: CubeIcon, label: 'Diffusion sur le réseau' },
    { key: 'confirming', icon: ShieldCheckIcon, label: 'Confirmation en cours' },
    { key: 'complete', icon: ShieldCheckIcon, label: 'Transaction confirmée' }
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4 mb-6">
        {steps.map((stepItem, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <motion.div
              key={stepItem.key}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary-500/20 border border-primary-500/30' 
                  : isCompleted
                  ? 'bg-success-500/20 border border-success-500/30'
                  : 'bg-dark-800 border border-dark-700'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-2 rounded-full ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : isCompleted
                  ? 'bg-success-500 text-white'
                  : 'bg-dark-700 text-dark-400'
              }`}>
                <stepItem.icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${
                  isActive 
                    ? 'text-primary-400' 
                    : isCompleted
                    ? 'text-success-400'
                    : 'text-dark-400'
                }`}>
                  {stepItem.label}
                </p>
              </div>
              
              {isActive && (
                <LoadingSpinner size="sm" />
              )}
              
              {isCompleted && (
                <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      
      {txHash && (
        <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
          <p className="text-sm text-dark-400 mb-2">Hash de la transaction:</p>
          <p className="font-mono text-xs text-primary-400 break-all">
            {txHash}
          </p>
        </div>
      )}
    </div>
  )
}

interface DataStreamProps {
  className?: string
}

export function DataStream({ className = '' }: DataStreamProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`data-stream-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"
          style={{
            width: `${Math.random() * 100 + 50}%`,
            left: `${Math.random() * 100}%`,
            top: `${i * 10}%`
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export function LoadingCard({ 
  title = 'Chargement', 
  description,
  children 
}: LoadingCardProps) {
  return (
    <motion.div
      className="card text-center relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DataStream className="absolute inset-0 opacity-20" />
      
      <div className="relative z-10">
        <CapsuleLoading />
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-dark-300 text-sm mb-4">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </motion.div>
  )
}