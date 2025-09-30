'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'capsule_opened' | 'capsule_sent' | 'capsule_received' | 'capsule_unlocked' | 'capsule_expired' | 'system' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  capsuleId?: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
  icon?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isVisible: boolean
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  toggleVisibility: () => void
  hideNotifications: () => void
  
  // Utility functions
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (type: Notification['type']) => Notification[]
  getRecentNotifications: (limit?: number) => Notification[]
}

const getNotificationIcon = (type: Notification['type']): string => {
  const icons = {
    capsule_opened: '📖',
    capsule_sent: '📤', 
    capsule_received: '📥',
    capsule_unlocked: '🔓',
    capsule_expired: '⏰',
    system: '⚙️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type] || '📋'
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isVisible: false,

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false,
          icon: notificationData.icon || getNotificationIcon(notificationData.type)
        }

        set((state) => {
          const updatedNotifications = [newNotification, ...state.notifications]
          // Garder seulement les 100 dernières notifications
          const limitedNotifications = updatedNotifications.slice(0, 100)
          
          return {
            notifications: limitedNotifications,
            unreadCount: limitedNotifications.filter(n => !n.read).length
          }
        })

        // Auto-mark low priority notifications as read after 10 seconds
        if (notificationData.priority === 'low') {
          setTimeout(() => {
            get().markAsRead(newNotification.id)
          }, 10000)
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
          
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read).length
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({ 
            ...notification, 
            read: true 
          })),
          unreadCount: 0
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(n => n.id !== id)
          
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read).length
          }
        })
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
          isVisible: false
        })
      },

      toggleVisibility: () => {
        set((state) => ({ isVisible: !state.isVisible }))
      },

      hideNotifications: () => {
        set({ isVisible: false })
      },

      // Utility functions
      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read)
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type)
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
      }
    }),
    {
      name: 'capsule-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)

// Fonctions utilitaires pour créer des notifications spécifiques
export const NotificationHelpers = {
  capsuleOpened: (capsuleTitle: string, capsuleId: string) => ({
    type: 'capsule_opened' as const,
    title: 'Capsule ouverte',
    message: `La capsule "${capsuleTitle}" a été ouverte avec succès`,
    priority: 'high' as const,
    capsuleId,
    actionUrl: `/capsules/${capsuleId}`
  }),

  capsuleSent: (capsuleTitle: string, recipientAddress: string, capsuleId: string) => ({
    type: 'capsule_sent' as const,
    title: 'Capsule envoyée',
    message: `La capsule "${capsuleTitle}" a été envoyée à ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-6)}`,
    priority: 'medium' as const,
    capsuleId,
    actionUrl: `/capsules/${capsuleId}`
  }),

  capsuleReceived: (capsuleTitle: string, senderAddress: string, capsuleId: string) => ({
    type: 'capsule_received' as const,
    title: 'Nouvelle capsule reçue',
    message: `Vous avez reçu la capsule "${capsuleTitle}" de ${senderAddress.slice(0, 8)}...${senderAddress.slice(-6)}`,
    priority: 'high' as const,
    capsuleId,
    actionUrl: `/capsules/${capsuleId}`
  }),

  capsuleUnlocked: (capsuleTitle: string, capsuleId: string) => ({
    type: 'capsule_unlocked' as const,
    title: 'Capsule débloquée',
    message: `La capsule "${capsuleTitle}" est maintenant disponible pour ouverture`,
    priority: 'high' as const,
    capsuleId,
    actionUrl: `/capsules/${capsuleId}`
  }),

  capsuleExpired: (capsuleTitle: string, capsuleId: string) => ({
    type: 'capsule_expired' as const,
    title: 'Capsule expirée',
    message: `La capsule "${capsuleTitle}" a atteint sa date d'expiration`,
    priority: 'medium' as const,
    capsuleId,
    actionUrl: `/capsules/${capsuleId}`
  }),

  systemMessage: (title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') => ({
    type: 'system' as const,
    title,
    message,
    priority
  }),

  success: (title: string, message: string) => ({
    type: 'success' as const,
    title,
    message,
    priority: 'low' as const
  }),

  warning: (title: string, message: string) => ({
    type: 'warning' as const,
    title,
    message,
    priority: 'medium' as const
  }),

  error: (title: string, message: string) => ({
    type: 'error' as const,
    title,
    message,
    priority: 'high' as const
  })
}