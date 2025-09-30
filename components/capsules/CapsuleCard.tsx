'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TimeCapsule, CapsuleType } from '@/types'
import {
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  HeartIcon,
  EyeIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCapsuleActions } from '@/hooks/useCapsuleActions'
import { CapsuleActionModal } from '@/components/modals/CapsuleActionModal'

interface CapsuleCardProps {
  capsule: TimeCapsule
  onTransfer?: (capsuleId: string) => void
  onDelete?: (capsuleId: string) => void
  showOwner?: boolean
  variant?: 'default' | 'public'
}

export function CapsuleCard({ capsule, onTransfer, onDelete, showOwner = false, variant = 'default' }: CapsuleCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    actionType: 'transfer' | 'unlock' | 'confirm' | null
    title?: string
    description?: string
  }>({
    isOpen: false,
    actionType: null
  })

  const { state, actions } = useCapsuleActions()

  // Handle card click to navigate to details - memoized
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    router.push(`/capsules/${capsule.id}`)
  }, [capsule.id, router])

  // Handlers pour les actions
  const handleViewCapsule = async () => {
    await actions.viewCapsule(capsule)
  }

  const handleUnlockCapsule = async () => {
    if (capsule.isUnlockable) {
      setModalState({
        isOpen: true,
        actionType: 'unlock',
        title: 'Déverrouiller la Capsule',
        description: 'Êtes-vous sûr de vouloir déverrouiller cette capsule maintenant ?'
      })
    } else {
      toast.error('Cette capsule ne peut pas encore être déverrouillée')
    }
  }

  const handleTransferCapsule = async () => {
    setModalState({
      isOpen: true,
      actionType: 'transfer',
      title: 'Transférer la Capsule'
    })
  }

  const handleModalConfirm = async (data?: any) => {
    if (modalState.actionType === 'transfer') {
      await actions.transferCapsule(capsule, data)
    } else if (modalState.actionType === 'unlock') {
      await actions.unlockCapsule(capsule)
    }
    setModalState({ isOpen: false, actionType: null })
  }

  const handleModalClose = () => {
    setModalState({ isOpen: false, actionType: null })
  }

  const formatFileSize = useCallback((bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }, [])

  const getTypeIcon = (type: CapsuleType) => {
    switch (type) {
      case CapsuleType.SAFE:
        return ShieldCheckIcon
      case CapsuleType.TIME_LOCK:
        return ClockIcon
      case CapsuleType.CONDITIONAL:
        return KeyIcon
      case CapsuleType.MULTI_SIG:
        return UserGroupIcon
      case CapsuleType.DEAD_MANS_SWITCH:
        return HeartIcon
      default:
        return DocumentIcon
    }
  }

  const getTypeColor = (type: CapsuleType) => {
    switch (type) {
      case CapsuleType.SAFE:
        return 'text-success-500'
      case CapsuleType.TIME_LOCK:
        return 'text-primary-500'
      case CapsuleType.CONDITIONAL:
        return 'text-warning-500'
      case CapsuleType.MULTI_SIG:
        return 'text-secondary-500'
      case CapsuleType.DEAD_MANS_SWITCH:
        return 'text-danger-500'
      default:
        return 'text-dark-400'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        label: 'Active', 
        color: 'bg-gradient-to-r from-success-500/20 to-success-400/20 text-success-400 border-success-500/40',
        icon: '🟢',
        pulse: true
      },
      UNLOCKED: { 
        label: 'Débloquée', 
        color: 'bg-gradient-to-r from-primary-500/20 to-primary-400/20 text-primary-400 border-primary-500/40',
        icon: '🔓',
        pulse: false
      },
      EXPIRED: { 
        label: 'Expirée', 
        color: 'bg-gradient-to-r from-danger-500/20 to-danger-400/20 text-danger-400 border-danger-500/40',
        icon: '⏰',
        pulse: false
      },
      TRANSFERRED: { 
        label: 'Transférée', 
        color: 'bg-gradient-to-r from-warning-500/20 to-warning-400/20 text-warning-400 border-warning-500/40',
        icon: '↗️',
        pulse: false
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE
    return (
      <motion.span 
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${config.color}`}
        animate={config.pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.1 }}
      >
        <span className="text-xs">{config.icon}</span>
        <span>{config.label}</span>
      </motion.span>
    )
  }

  const getTimeRemaining = () => {
    if (!capsule.unlockTime || capsule.status !== 'ACTIVE') return null
    
    const now = new Date()
    const unlockTime = new Date(capsule.unlockTime)
    const diff = unlockTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'Peut être débloquée'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}j ${hours}h restantes`
    if (hours > 0) return `${hours}h restantes`
    return 'Moins d\'1h restante'
  }

  // Memoize expensive calculations
  const TypeIcon = useMemo(() => getTypeIcon(capsule.type), [capsule.type])
  const typeColor = useMemo(() => getTypeColor(capsule.type), [capsule.type])
  const timeRemaining = useMemo(() => getTimeRemaining(), [capsule.unlockTime, capsule.status])
  
  // Memoize grid items to prevent re-renders
  const gridItems = useMemo(() => [
    { label: 'Taille', value: formatFileSize(capsule.dataSize), icon: '📊' },
    { label: 'Stockage', value: capsule.storageType === 'ipfs' ? 'IPFS' : 'Blockchain', icon: '🗄️' },
    { label: 'Créée le', value: new Date(capsule.createdAt).toLocaleDateString('fr-FR'), icon: '📅' },
    { label: 'Seuil', value: `${capsule.threshold}/${capsule.totalShares} parts`, icon: '🔐' }
  ], [capsule.dataSize, capsule.storageType, capsule.createdAt, capsule.threshold, capsule.totalShares, formatFileSize])

  return (
    <motion.div
      className="relative w-full h-auto min-h-[320px] overflow-hidden bg-gradient-to-br from-dark-800/90 via-dark-700/80 to-dark-800/90 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-6 shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 flex flex-col cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handleCardClick}
    >
      
      {/* Bordure animée */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <motion.div 
              className={`relative p-2 rounded-lg bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600/50 ${typeColor} shadow-lg shrink-0`}
              whileHover={{ scale: 1.15, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <TypeIcon className="w-6 h-6" />
              <div className={`absolute inset-0 rounded-lg ${typeColor.replace('text-', 'bg-').replace('-500', '-500/20')} blur-lg opacity-50`} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-lg mb-1 tracking-tight line-clamp-1">{capsule.title}</h4>
              {showOwner && (
                <p className="text-sm text-primary-400 mb-1 line-clamp-1">
                  Par {capsule.owner.slice(0, 12)}...{capsule.owner.slice(-4)}
                </p>
              )}
              <p className="text-sm text-dark-400 font-medium capitalize tracking-wide line-clamp-1">
                {capsule.type.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {getStatusBadge(capsule.status)}
            </motion.div>
            
            {/* Actions Menu */}
            {(onTransfer || onDelete) && (
              <div className="relative group/menu">
                <motion.button 
                  className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </motion.button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-12 w-44 bg-dark-800 border border-dark-600 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-[100]">
                  <div className="py-2">
                    {onTransfer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTransfer(capsule.id)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors flex items-center space-x-2"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Transférer</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(capsule.id)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors flex items-center space-x-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {capsule.description && (
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-dark-700/50 to-transparent rounded-lg" />
            <p className="relative text-dark-200 text-sm leading-relaxed p-3 bg-dark-800/50 rounded-lg border border-dark-600/30 backdrop-blur-sm line-clamp-2">
              {capsule.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {gridItems.map((item, index) => (
            <motion.div
              key={item.label}
              className="group relative p-2 bg-gradient-to-br from-dark-700/40 to-dark-800/40 rounded-lg border border-dark-600/30 hover:border-primary-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              layoutId={`grid-item-${item.label}`}
            >
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs text-dark-400 font-medium uppercase tracking-wider line-clamp-1">{item.label}</span>
              </div>
              <p className="text-white font-semibold text-sm line-clamp-1">
                {item.value}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {timeRemaining && (
          <motion.div 
            className="relative mb-3 p-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-lg border border-primary-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-primary-500/20 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-primary-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-primary-300 font-medium uppercase tracking-wider line-clamp-1">Temps restant</p>
                <p className="text-primary-100 font-bold text-sm line-clamp-1">
                  {timeRemaining}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent rounded-lg" />
          </motion.div>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-dark-600/50">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Bouton Voir */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleViewCapsule()
              }}
              disabled={state.isViewing}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 text-dark-400 hover:text-primary-400 hover:bg-dark-700/50 disabled:opacity-50"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <EyeIcon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">
                {state.isViewing ? 'Chargement...' : 'Voir'}
              </span>
            </motion.button>

            {/* Bouton Ouvrir (si déverrouillable) */}
            {capsule.status === 'ACTIVE' && capsule.isUnlockable && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnlockCapsule()
                }}
                disabled={state.isUnlocking}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 text-success-500 hover:text-success-400 hover:bg-dark-700/50 disabled:opacity-50"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <KeyIcon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {state.isUnlocking ? 'Ouverture...' : 'Ouvrir'}
                </span>
              </motion.button>
            )}

            {/* Bouton Transférer */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleTransferCapsule()
              }}
              disabled={state.isTransferring || capsule.status === 'TRANSFERRED'}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 text-dark-400 hover:text-secondary-400 hover:bg-dark-700/50 disabled:opacity-50"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: capsule.isUnlockable ? 0.3 : 0.15 }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">
                {state.isTransferring ? 'Transfert...' : 'Transférer'}
              </span>
            </motion.button>
          </div>

          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <div className="flex items-center space-x-1 text-primary-400 font-medium group pointer-events-none">
              <span className="text-sm whitespace-nowrap">Détails</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm">→</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Indicateur de statut animé */}
        {capsule.status === 'ACTIVE' && capsule.isUnlockable && (
          <motion.div
            className="absolute top-3 right-3 w-2 h-2 bg-success-500 rounded-full shadow-xl"
            animate={{ 
              scale: [1, 1.5, 1],
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.7)',
                '0 0 0 8px rgba(34, 197, 94, 0)',
                '0 0 0 0 rgba(34, 197, 94, 0)'
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Modal pour les actions */}
      <CapsuleActionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        capsule={capsule}
        actionType={modalState.actionType}
        onConfirm={handleModalConfirm}
        isLoading={state.isTransferring || state.isUnlocking}
        title={modalState.title}
        description={modalState.description}
      />
    </motion.div>
  )
}