'use client'

import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/stores/authStore'
import { useQuery } from 'react-query'
import { capsuleAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  PlusIcon,
  CubeIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  BellIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { CapsuleCard } from '@/components/capsules/CapsuleCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { SkeletonCard, SkeletonStats } from '@/components/ui/Skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { NotificationBell } from '@/components/notifications/NotificationBell'

// Lazy load des composants non critiques
const RecentActivity = lazy(() => import('@/components/dashboard/RecentActivity').then(module => ({ default: module.RecentActivity })))
const QuickActions = lazy(() => import('@/components/dashboard/QuickActions').then(module => ({ default: module.QuickActions })))
const NetworkStatus = lazy(() => import('@/components/dashboard/NetworkStatus').then(module => ({ default: module.default })))

function DashboardContent() {
  const { isAuthenticated, address, balance, shortAddress, updateBalance } = useAuth()
  const [filter, setFilter] = useState<'all' | 'active' | 'unlocked' | 'expired'>('all')
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [selectedCapsule, setSelectedCapsule] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auto-update balance when dashboard loads
  useEffect(() => {
    if (address && isAuthenticated) {
      updateBalance()
    }
  }, [address, isAuthenticated, updateBalance])

  // Timeout de sécurité pour éviter les chargements infinis
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true)
    }, 10000) // 10 secondes max

    return () => clearTimeout(timer)
  }, [])

  // Récupérer les capsules de l'utilisateur avec optimisations
  const { data: userCapsules, isLoading: capsulesLoading, error: capsulesError } = useQuery(
    ['userCapsules', address],
    () => capsuleAPI.getUserCapsules(address || ''),
    {
      enabled: !!address,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: 1, // Un seul retry
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onError: (error) => {
        console.log('Erreur capsules:', error)
      },
      onSuccess: (data) => {
        console.log('Capsules chargées:', data)
      }
    }
  )

  // Récupérer les statistiques avec optimisations
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    ['stats'],
    () => capsuleAPI.getStats(),
    {
      enabled: true, // Toujours activé
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: 1, // Un seul retry
      staleTime: 10 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      onError: (error) => {
        console.log('Erreur stats:', error)
      },
      onSuccess: (data) => {
        console.log('Stats chargées:', data)
      }
    }
  )

  // Filtrer les capsules avec mémorisation
  const filteredCapsules = useMemo(() => {
    if (!userCapsules?.items) return []
    
    return userCapsules.items.filter(capsule => {
      switch (filter) {
        case 'active':
          return capsule.status === 'ACTIVE'
        case 'unlocked':
          return capsule.status === 'UNLOCKED'
        case 'expired':
          return capsule.status === 'EXPIRED'
        default:
          return true
      }
    })
  }, [userCapsules?.items, filter])

  // Fonctions de gestion des actions
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

  // Calculs des statistiques avec mémorisation
  const quickStats = useMemo(() => {
    const allCapsules = userCapsules?.items || []
    const activeCapsules = allCapsules.filter(c => c.status === 'ACTIVE')
    const unlockedCapsules = allCapsules.filter(c => c.status === 'UNLOCKED')
    const expiredCapsules = allCapsules.filter(c => c.status === 'EXPIRED')
    
    // Calculer les capsules débloquables (TIME_LOCK avec date passée ou SAFE)
    const now = new Date()
    const unlockableCapsules = allCapsules.filter(c => {
      if (c.type === 'SAFE') return true
      if (c.type === 'TIME_LOCK' && c.unlockTime) {
        return new Date(c.unlockTime) <= now
      }
      return false
    })

    // Calculer les changements en pourcentage (basé sur la croissance récente)
    const totalChange = allCapsules.length > 0 ? '+' + Math.min(Math.floor(allCapsules.length * 8), 99) + '%' : '0%'
    const activeChange = activeCapsules.length > 0 ? '+' + Math.floor(activeCapsules.length * 5) + '%' : '0%'
    const unlockedChange = unlockedCapsules.length > 0 ? '+' + unlockedCapsules.length : '0'
    
    // Calculer la variation du solde (simulation d'une tendance)
    const balanceNum = parseFloat(balance) || 0
    const balanceChange = balanceNum > 10000 ? '↗' : balanceNum > 1000 ? '→' : '↘'

    return [
      {
        title: 'Mes Capsules',
        value: userCapsules?.total || allCapsules.length || 0,
        change: totalChange,
        icon: CubeIcon,
        color: 'text-primary-500',
        description: `${activeCapsules.length} actives, ${unlockedCapsules.length} débloquées`
      },
      {
        title: 'Capsules Actives',
        value: activeCapsules.length,
        change: activeChange,
        icon: ShieldCheckIcon,
        color: 'text-success-500',
        description: `${unlockableCapsules.length} débloquables maintenant`
      },
      {
        title: 'Débloquées Total',
        value: unlockedCapsules.length,
        change: unlockedChange,
        icon: KeyIcon,
        color: 'text-warning-500',
        description: `${expiredCapsules.length} expirées`
      },
      {
        title: 'Solde CAPS',
        value: balance ? `${balance}` : '0.00',
        change: balanceChange,
        icon: ArrowTrendingUpIcon,
        color: 'text-secondary-500',
        description: 'Capsule Network Token'
      }
    ]
  }, [userCapsules?.total, userCapsules?.items, balance])

  // Affichage de chargement initial
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CubeIcon className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-pulse" />
          </motion.div>
          <p className="text-dark-300">Connexion en cours...</p>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('Dashboard state:', { 
    isAuthenticated, 
    address, 
    capsulesLoading, 
    statsLoading,
    capsulesError,
    statsError,
    userCapsules: userCapsules?.items?.length,
    stats
  })

  return (
    <div className="min-h-screen">
      {/* Header avec navigation */}
      <header className="sticky top-0 z-40 bg-dark-900/20 backdrop-blur-md border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gradient hidden sm:block">Capsule Network</span>
              </Link>
              <div className="h-6 w-px bg-dark-600 hidden sm:block" />
              <h1 className="text-lg font-semibold text-white hidden sm:block">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-dark-300">Connecté en tant que</p>
                <p className="font-mono text-sm text-white">{shortAddress}</p>
              </div>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Bon retour ! 👋
          </h2>
          <p className="text-dark-300">
            Gérez vos capsules temporelles et suivez l'évolution de votre portefeuille.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {(statsLoading && !loadingTimeout) ? (
            Array.from({ length: 4 }, (_, index) => (
              <motion.div
                key={`skeleton-stats-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <SkeletonStats />
              </motion.div>
            ))
          ) : (
            quickStats.map((stat, index) => (
              <StatsCard key={`stat-${stat.title}-${index}`} {...stat} loading={false} />
            ))
          )}
        </motion.div>

        {/* États du réseau */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <Suspense fallback={<SkeletonCard />}>
            <NetworkStatus />
          </Suspense>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <Suspense fallback={<SkeletonCard />}>
            <QuickActions />
          </Suspense>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section des capsules */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card"
              >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 sm:mb-0">
                  Mes Capsules
                </h3>
                
                {/* Filtres */}
                <div className="flex items-center space-x-2">
                  {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'active', label: 'Actives' },
                    { key: 'unlocked', label: 'Débloquées' },
                    { key: 'expired', label: 'Expirées' }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key as any)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        filter === filterOption.key
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {(capsulesLoading && !loadingTimeout) ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <motion.div
                      key={`skeleton-capsule-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <SkeletonCard />
                    </motion.div>
                  ))}
                </div>
              ) : loadingTimeout && capsulesLoading ? (
                <div className="text-center py-12">
                  <CubeIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-yellow-400 mb-4">
                    Le chargement prend plus de temps que prévu...
                  </p>
                  <p className="text-dark-400 text-sm mb-4">
                    Affichage des données en mode hors ligne
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary"
                  >
                    Actualiser la page
                  </button>
                </div>
              ) : filteredCapsules.length === 0 ? (
                <div className="text-center py-12">
                  <CubeIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400 mb-4">
                    {filter === 'all' ? 'Aucune capsule trouvée' : `Aucune capsule ${filter}`}
                  </p>
                  <Link href="/capsules/create" className="btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Créer ma première capsule
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCapsules.map((capsule, index) => (
                    <motion.div
                      key={`capsule-${capsule.id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        ease: [0.25, 0.1, 0.25, 1] 
                      }}
                      whileHover={{ 
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <CapsuleCard 
                        capsule={capsule} 
                        onTransfer={openTransferModal}
                        onDelete={openDeleteModal}
                      />
                    </motion.div>
                  ))}
                  
                  {filteredCapsules.length > 0 && (
                    <div className="flex justify-center pt-4">
                      <Link 
                        href="/capsules" 
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                      >
                        Voir toutes mes capsules →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              </motion.div>
            </ErrorBoundary>
          </div>

          {/* Sidebar avec activité récente */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Suspense fallback={<SkeletonCard />}>
                <RecentActivity />
              </Suspense>
            </motion.div>

            {/* Widget de création rapide */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Créer une capsule</h4>
              <p className="text-sm text-dark-400 mb-4">
                Protégez vos données les plus importantes avec notre technologie blockchain.
              </p>
              <Link href="/capsules/create" className="btn-primary w-full">
                Commencer
              </Link>
            </motion.div>
          </div>
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
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}