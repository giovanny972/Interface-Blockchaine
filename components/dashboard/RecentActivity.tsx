'use client'

import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { capsuleAPI } from '@/lib/api'
import { useAuth } from '@/stores/authStore'
import {
  ClockIcon,
  KeyIcon,
  PaperAirplaneIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ActivityItem {
  id: string
  type: 'created' | 'unlocked' | 'transferred' | 'viewed' | 'expired' | 'synced'
  capsuleId: string
  capsuleTitle: string
  timestamp: Date
  description: string
  user?: string
}

export function RecentActivity() {
  const { address } = useAuth()

  // Récupérer l'activité récente depuis l'API
  const { data: activities, isLoading, error } = useQuery(
    ['recentActivity', address],
    () => address ? capsuleAPI.getRecentActivity(address) : [],
    {
      enabled: !!address,
      refetchInterval: 60000, // Actualiser toutes les minutes
      retry: 1,
      staleTime: 30000, // Considérer comme frais pendant 30s
      onError: (error) => {
        console.warn('Erreur lors de la récupération de l\'activité récente:', error)
      }
    }
  )

  // Convertir les timestamps en objets Date si nécessaire
  const formattedActivities: ActivityItem[] = (activities || []).map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp)
  }))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return PlusIcon
      case 'unlocked':
        return KeyIcon
      case 'transferred':
        return PaperAirplaneIcon
      case 'viewed':
        return EyeIcon
      case 'expired':
        return ExclamationTriangleIcon
      case 'synced':
        return ClockIcon
      default:
        return ClockIcon
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-success-500 bg-success-500/10'
      case 'unlocked':
        return 'text-primary-500 bg-primary-500/10'
      case 'transferred':
        return 'text-secondary-500 bg-secondary-500/10'
      case 'viewed':
        return 'text-warning-500 bg-warning-500/10'
      case 'expired':
        return 'text-danger-500 bg-danger-500/10'
      case 'synced':
        return 'text-cyan-500 bg-cyan-500/10'
      default:
        return 'text-dark-400 bg-dark-700'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Activité Récente</h3>
          <div className="w-16 h-4 bg-dark-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`activity-skeleton-${index}`} className="flex items-start space-x-3 p-3 rounded-lg bg-dark-800/50">
              <div className="w-8 h-8 bg-dark-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-dark-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Activité Récente</h3>
        <div className="flex items-center gap-2">
          {!error && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
          <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            Tout voir
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {formattedActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const colorClasses = getActivityColor(activity.type)
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors group cursor-pointer"
            >
              <div className={`p-2 rounded-full ${colorClasses} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate group-hover:text-gradient transition-all">
                    {activity.capsuleTitle}
                  </p>
                  <span className="text-xs text-dark-500 flex-shrink-0 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors">
                  {activity.description}
                </p>
                {activity.user && activity.user !== address && (
                  <p className="text-xs text-cyan-400 mt-1">
                    Par {activity.user === 'système' ? 'système' : activity.user.slice(0, 10) + '...'}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
        
        {formattedActivities.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <ClockIcon className="w-8 h-8 text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">
              {error ? 'Erreur lors du chargement' : 'Aucune activité récente'}
            </p>
            {error && (
              <button 
                onClick={() => window.location.reload()}
                className="text-primary-400 hover:text-primary-300 text-xs mt-2"
              >
                Réessayer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}