'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRouter } from 'next/navigation'
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function NotificationBell() {
  const router = useRouter()
  const bellRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  
  const {
    notifications,
    unreadCount,
    isVisible,
    toggleVisibility,
    hideNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getRecentNotifications
  } = useNotificationStore()

  const recentNotifications = getRecentNotifications(15)

  // Fermer les notifications en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        hideNotifications()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, hideNotifications])

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    hideNotifications()
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-500/30'
      case 'medium': return 'text-yellow-400 border-yellow-500/30'
      case 'low': return 'text-green-400 border-green-500/30'
      default: return 'text-blue-400 border-blue-500/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'capsule_opened': return 'bg-blue-500/20 text-blue-400'
      case 'capsule_sent': return 'bg-purple-500/20 text-purple-400'
      case 'capsule_received': return 'bg-green-500/20 text-green-400'
      case 'capsule_unlocked': return 'bg-yellow-500/20 text-yellow-400'
      case 'capsule_expired': return 'bg-red-500/20 text-red-400'
      case 'success': return 'bg-green-500/20 text-green-400'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400'
      case 'error': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div ref={bellRef} className="relative">
      {/* Cloche de notification */}
      <motion.button
        onClick={toggleVisibility}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative p-2 rounded-lg hover:bg-dark-700/50 transition-all duration-200 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={unreadCount > 0 ? { 
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
          } : {}}
        >
          <BellIcon className={`w-6 h-6 transition-colors ${
            unreadCount > 0 
              ? 'text-primary-400 group-hover:text-primary-300' 
              : 'text-dark-400 group-hover:text-white'
          }`} />
        </motion.div>
        
        {/* Badge de compteur */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50
                       bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 whitespace-nowrap
                       shadow-lg"
            >
              <span className="text-sm text-white">
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
              </span>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                            w-2 h-2 bg-dark-800 border-l border-t border-dark-600 
                            rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel des notifications */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-96 z-50
                     bg-dark-800/95 backdrop-blur-xl border border-dark-600 
                     rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center space-x-2">
                <BellIcon className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                    {unreadCount} nouvelles
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg hover:bg-dark-700/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Tout marquer comme lu"
                  >
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  </motion.button>
                )}
                
                {notifications.length > 0 && (
                  <motion.button
                    onClick={clearAllNotifications}
                    className="p-1.5 rounded-lg hover:bg-dark-700/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Effacer toutes"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={hideNotifications}
                  className="p-1.5 rounded-lg hover:bg-dark-700/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XMarkIcon className="w-4 h-4 text-dark-400" />
                </motion.button>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {recentNotifications.length > 0 ? (
                <div className="divide-y divide-dark-700">
                  {recentNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 hover:bg-dark-700/30 transition-all duration-200 cursor-pointer
                        ${!notification.read ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                          ${getTypeColor(notification.type)}
                        `}>
                          <span className="text-sm">{notification.icon}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium text-sm ${
                              !notification.read ? 'text-white' : 'text-dark-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="p-1 rounded hover:bg-dark-600/50 opacity-0 group-hover:opacity-100 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <XMarkIcon className="w-3 h-3 text-dark-400" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-dark-500">
                              {formatDistanceToNow(new Date(notification.timestamp), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </span>
                            
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              getPriorityColor(notification.priority)
                            } bg-opacity-20`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">Aucune notification</h4>
                  <p className="text-dark-400 text-sm">
                    Vous serez notifié ici des activités de vos capsules
                  </p>
                </div>
              )}
            </div>

            {/* Footer si beaucoup de notifications */}
            {notifications.length > 15 && (
              <div className="p-3 border-t border-dark-700 bg-dark-900/50">
                <button
                  onClick={() => {
                    router.push('/notifications')
                    hideNotifications()
                  }}
                  className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Voir toutes les notifications ({notifications.length})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}