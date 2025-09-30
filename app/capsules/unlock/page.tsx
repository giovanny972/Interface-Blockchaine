'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuth } from '@/stores/authStore'
import { capsuleAPI } from '@/lib/api'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  CubeIcon,
  KeyIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CapsuleUnlockSelectionPage() {
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [selectedCapsule, setSelectedCapsule] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Récupérer la liste des capsules de l'utilisateur
  const { data: capsules, isLoading } = useQuery(
    ['user-capsules', address],
    () => capsuleAPI.getUserCapsules(address),
    {
      enabled: !!address,
      retry: 1,
      onError: (error) => {
        console.error('Erreur chargement capsules:', error)
      }
    }
  )

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  const handleUnlockCapsule = (capsuleId: string) => {
    router.push(`/capsule/${capsuleId}/unlock`)
  }

  const handleTransferCapsule = async () => {
    if (!selectedCapsule || !transferAddress.trim()) {
      toast.error('Veuillez saisir une adresse de destination valide')
      return
    }

    setIsTransferring(true)
    try {
      await capsuleAPI.transferCapsule(selectedCapsule, transferAddress.trim())
      toast.success('Capsule transférée avec succès!')
      setShowTransferModal(false)
      setTransferAddress('')
      setSelectedCapsule(null)
      // Recharger la liste des capsules
      window.location.reload()
    } catch (error) {
      console.error('Erreur transfert capsule:', error)
      toast.error('Erreur lors du transfert de la capsule')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleDeleteCapsule = async () => {
    if (!selectedCapsule) return

    setIsDeleting(true)
    try {
      await capsuleAPI.deleteCapsule(selectedCapsule)
      toast.success('Capsule supprimée avec succès!')
      setShowDeleteModal(false)
      setSelectedCapsule(null)
      // Recharger la liste des capsules
      window.location.reload()
    } catch (error) {
      console.error('Erreur suppression capsule:', error)
      toast.error('Erreur lors de la suppression de la capsule')
    } finally {
      setIsDeleting(false)
    }
  }

  const openTransferModal = (capsuleId: string) => {
    setSelectedCapsule(capsuleId)
    setShowTransferModal(true)
  }

  const openDeleteModal = (capsuleId: string) => {
    setSelectedCapsule(capsuleId)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CubeIcon className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-lg">Chargement de vos capsules...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative">
        <StarryBackground starCount={400} enableShootingStars={true} />
        
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-glass border-b border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5 rotate-180" />
                  Dashboard
                </button>
                
                <div className="flex items-center gap-3">
                  <KeyIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Déverrouillage de Capsules</span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-dark-300">Sécurisé</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4">
                Sélectionnez une Capsule à Déverrouiller
              </h1>
              <p className="text-xl text-dark-300 max-w-2xl mx-auto">
                Choisissez la capsule que vous souhaitez déverrouiller avec la technologie quantique
              </p>
            </motion.div>

            {/* Capsules Grid */}
            {capsules && capsules.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {capsules.map((capsule, index) => (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 group relative"
                  >
                    {/* Capsule Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                          <CubeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {capsule.title}
                          </h3>
                          <p className="text-sm text-dark-400">
                            ID: {capsule.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {capsule.isLocked ? (
                          <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <KeyIcon className="w-5 h-5 text-green-400" />
                        )}
                        
                        {/* Actions Menu */}
                        <div className="relative group/menu">
                          <button className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-8 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
                            <div className="py-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openTransferModal(capsule.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors flex items-center space-x-2"
                              >
                                <UserPlusIcon className="w-4 h-4" />
                                <span>Transférer</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openDeleteModal(capsule.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors flex items-center space-x-2"
                              >
                                <TrashIcon className="w-4 h-4" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capsule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          capsule.isLocked 
                            ? 'bg-yellow-900/30 text-yellow-400' 
                            : 'bg-green-900/30 text-green-400'
                        }`}>
                          {capsule.isLocked ? 'Verrouillée' : 'Déverrouillée'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-400">Créée le:</span>
                        <span className="text-white">
                          {new Date(capsule.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-400">Sécurité:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs">Quantique</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {capsule.description && (
                      <p className="text-dark-300 text-sm mb-6 line-clamp-2">
                        {capsule.description}
                      </p>
                    )}

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUnlockCapsule(capsule.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        capsule.isLocked
                          ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:from-primary-400 hover:to-purple-500'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                      }`}
                      disabled={!capsule.isLocked}
                    >
                      <KeyIcon className="w-4 h-4" />
                      <span>
                        {capsule.isLocked ? 'Déverrouiller' : 'Déjà déverrouillée'}
                      </span>
                      {capsule.isLocked && <ArrowRightIcon className="w-4 h-4" />}
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <CubeIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aucune capsule trouvée
                </h3>
                <p className="text-dark-400 mb-6">
                  Vous n'avez pas encore créé de capsules à déverrouiller.
                </p>
                <button
                  onClick={() => router.push('/capsules/create')}
                  className="btn-primary"
                >
                  <CubeIcon className="w-5 h-5 mr-2" />
                  Créer une Capsule
                </button>
              </motion.div>
            )}
          </div>

          {/* Transfer Modal */}
          {showTransferModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <UserPlusIcon className="w-6 h-6 mr-3 text-blue-400" />
                    Transférer la Capsule
                  </h3>
                  <button
                    onClick={() => {
                      setShowTransferModal(false)
                      setTransferAddress('')
                      setSelectedCapsule(null)
                    }}
                    className="text-dark-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Adresse de destination
                    </label>
                    <input
                      type="text"
                      value={transferAddress}
                      onChange={(e) => setTransferAddress(e.target.value)}
                      placeholder="cosmos1..."
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none transition-colors"
                    />
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

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowTransferModal(false)
                        setTransferAddress('')
                        setSelectedCapsule(null)
                      }}
                      className="flex-1 py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleTransferCapsule}
                      disabled={isTransferring || !transferAddress.trim()}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isTransferring ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Transfert...
                        </>
                      ) : (
                        'Confirmer le Transfert'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <TrashIcon className="w-6 h-6 mr-3 text-red-400" />
                    Supprimer la Capsule
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedCapsule(null)
                    }}
                    className="text-dark-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-300">
                        <p className="font-medium mb-1">Action irréversible</p>
                        <p>Cette action supprimera définitivement la capsule et tout son contenu. Cette opération ne peut pas être annulée.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false)
                        setSelectedCapsule(null)
                      }}
                      className="flex-1 py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDeleteCapsule}
                      disabled={isDeleting}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Suppression...
                        </>
                      ) : (
                        'Confirmer la Suppression'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}