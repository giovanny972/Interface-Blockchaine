'use client'

import { motion } from 'framer-motion'
import { HeroIcon } from '@/types/heroicon'

interface StatsCardProps {
  title: string
  value: string | number
  change: string
  icon: HeroIcon
  color: string
  loading?: boolean
  description?: string
}

export function StatsCard({ title, value, change, icon: Icon, color, loading, description }: StatsCardProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-dark-700 rounded w-20"></div>
            <div className="h-8 bg-dark-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-dark-700 rounded-full"></div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-dark-700 rounded w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="card card-hover group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400 group-hover:text-dark-300 transition-colors">
            {title}
          </p>
          <p className="text-2xl font-bold text-white group-hover:text-gradient transition-all">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-dark-800 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-4 space-y-1">
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            change.startsWith('+') ? 'text-success-500' : 
            change.startsWith('-') ? 'text-danger-500' : 
            'text-dark-400'
          }`}>
            {change}
          </span>
          <span className="text-sm text-dark-500 ml-1">ce mois</span>
        </div>
        {description && (
          <p className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
}