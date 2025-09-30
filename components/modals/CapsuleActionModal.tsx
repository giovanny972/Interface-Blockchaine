'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimeCapsule } from '@/types'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

export interface CapsuleActionModalProps {
  isOpen: boolean
  onClose: () => void
  capsule: TimeCapsule | null
  actionType: 'transfer' | 'unlock' | 'confirm' | null
  onConfirm: (data?: any) => Promise<void>
  isLoading?: boolean
  title?: string
  description?: string
}

export function CapsuleActionModal({
  isOpen,
  onClose,
  capsule,
  actionType,
  onConfirm,
  isLoading = false,
  title,
  description
}: CapsuleActionModalProps) {
  const [transferAddress, setTransferAddress] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleTransferAddressChange = (value: string) => {
    setTransferAddress(value)
    // Validation basique de l'adresse Cosmos
    const isValid = value.startsWith('cosmos') && value.length >= 39
    setIsFormValid(isValid)
  }

  const handleSubmit = async () => {
    if (actionType === 'transfer' && isFormValid) {
      await onConfirm(transferAddress)
    } else {
      await onConfirm()
    }
  }

  const handleClose = () => {
    setTransferAddress('')
    setIsFormValid(false)
    onClose()
  }

  if (!isOpen || !capsule) return null

  const getModalConfig = () => {
    switch (actionType) {
      case 'transfer':
        return {
          title: title || 'Transférer la Capsule',
          icon: PaperAirplaneIcon,
          iconColor: 'text-blue-400',
          confirmText: 'Confirmer le Transfert',
          confirmColor: 'bg-blue-600 hover:bg-blue-500',
        }
      case 'unlock':
        return {
          title: title || 'Déverrouiller la Capsule',
          icon: KeyIcon,
          iconColor: 'text-success-500',
          confirmText: 'Déverrouiller',
          confirmColor: 'bg-success-600 hover:bg-success-500',
        }
      case 'confirm':
        return {
          title: title || 'Confirmer l\'action',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-warning-500',
          confirmText: 'Confirmer',
          confirmColor: 'bg-danger-600 hover:bg-danger-500',
        }
      default:
        return {
          title: 'Action sur la Capsule',
          icon: CheckCircleIcon,
          iconColor: 'text-primary-500',
          confirmText: 'Confirmer',
          confirmColor: 'bg-primary-600 hover:bg-primary-500',
        }
    }
  }

  const config = getModalConfig()
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 99999 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative my-8"
            style={{ zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-dark-700 ${config.iconColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {config.title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-dark-400 hover:text-white transition-colors p-1 hover:bg-dark-700 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Capsule Info */}
            <div className="bg-dark-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {capsule.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">
                    {capsule.title}
                  </h4>
                  <p className="text-dark-400 text-xs">
                    {capsule.description || 'Aucune description'}
                  </p>
                  <p className="text-dark-500 text-xs mt-1">
                    ID: {capsule.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Based on Action Type */}
            <div className="space-y-4 mb-6">
              {actionType === 'transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Adresse de destination
                    </label>
                    <input
                      type="text"
                      value={transferAddress}
                      onChange={(e) => handleTransferAddressChange(e.target.value)}
                      placeholder="cosmos1..."
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {transferAddress && !isFormValid && (
                      <p className="text-danger-400 text-xs mt-1">
                        Adresse Cosmos invalide (doit commencer par 'cosmos' et faire au moins 39 caractères)
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">Attention</p>
                        <p>Cette action transférera définitivement la propriété de la capsule à l'adresse spécifiée. Vous ne pourrez plus y accéder.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {actionType === 'unlock' && (
                <>
                  <div className="bg-success-900/20 border border-success-500/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <KeyIcon className="w-5 h-5 text-success-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-success-300">
                        <p className="font-medium mb-1">Déverrouillage</p>
                        <p>Les données de cette capsule seront déchiffrées et mises à disposition pour téléchargement. Cette action est irréversible.</p>
                      </div>
                    </div>
                  </div>

                  {capsule.unlockTime && (
                    <div className="text-sm text-dark-400">
                      <p>Temps de déverrouillage prévu : {new Date(capsule.unlockTime).toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                </>
              )}

              {description && (
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <p className="text-sm text-dark-300">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || (actionType === 'transfer' && !isFormValid)}
                className={`flex-1 py-3 px-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${config.confirmColor}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Traitement...
                  </>
                ) : (
                  config.confirmText
                )}
              </button>
            </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}