'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import { useAuth } from '@/stores/authStore'
import { capsuleAPI } from '@/lib/api'
import { CapsuleType, TimeCapsule } from '@/types'
import StarryBackground from '@/components/StarryBackground'
import { CapsuleCard } from '@/components/capsules/CapsuleCard'
import { CustomSelect } from '@/components/ui/CustomSelect'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShieldCheckIcon,
  ClockIcon,
  KeyIcon,
  UserGroupIcon,
  HeartIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CapsulesPage() {
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<CapsuleType | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'UNLOCKED' | 'EXPIRED'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  // Récupérer les capsules de l'utilisateur
  const { data: capsulesResponse, isLoading, error, refetch } = useQuery(
    ['user-capsules', address],
    () => capsuleAPI.getUserCapsules(address!),
    {
      enabled: !!address,
      retry: 2,
      onError: (error) => {
        console.error('Erreur chargement capsules:', error)
        toast.error('Impossible de charger vos capsules')
      }
    }
  )

  // Extraire le tableau des capsules depuis la réponse paginée
  const capsules = capsulesResponse?.items || []

  // Filtrer les capsules
  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capsule.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'ALL' || capsule.type === selectedType
    const matchesStatus = selectedStatus === 'ALL' || capsule.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeLabel = (type: CapsuleType) => {
    const labels = {
      SAFE: 'Sécurisée',
      TIME_LOCK: 'Temporelle',
      CONDITIONAL: 'Conditionnelle', 
      MULTI_SIG: 'Multi-signatures',
      DEAD_MANS_SWITCH: 'Surveillance'
    }
    return labels[type]
  }

  // Options pour les selects personnalisés
  const typeOptions = [
    { value: 'ALL', label: 'Tous les types', icon: '📦' },
    { value: 'SAFE', label: 'Sécurisées', icon: '🛡️', color: '#22c55e' },
    { value: 'TIME_LOCK', label: 'Temporelles', icon: '⏰', color: '#3b82f6' },
    { value: 'CONDITIONAL', label: 'Conditionnelles', icon: '🔑', color: '#f59e0b' },
    { value: 'MULTI_SIG', label: 'Multi-signatures', icon: '👥', color: '#8b5cf6' },
    { value: 'DEAD_MANS_SWITCH', label: 'Surveillance', icon: '❤️', color: '#ef4444' }
  ]

  const statusOptions = [
    { value: 'ALL', label: 'Tous les statuts', icon: '📋' },
    { value: 'ACTIVE', label: 'Actives', icon: '✅', color: '#22c55e' },
    { value: 'UNLOCKED', label: 'Débloquées', icon: '🔓', color: '#3b82f6' },
    { value: 'EXPIRED', label: 'Expirées', icon: '⏰', color: '#ef4444' }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
            <p className="text-white">Vérification de l'authentification...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <StarryBackground />
      
      {/* Header */}
      <div className="relative z-20 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-dark-800/50 border border-dark-600 hover:border-primary-500 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Mes Capsules</h1>
                <p className="text-dark-300 mt-1">
                  {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''} 
                  {searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL' ? ' (filtrée)' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mode d'affichage */}
              <div className="flex items-center bg-dark-800/50 border border-dark-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton nouvelle capsule */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/capsules/create')}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nouvelle capsule</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-50 bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 overflow-visible">
              {/* Recherche */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
                <motion.input
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full pl-12 pr-4 py-3
                    bg-dark-800/50 border border-dark-600 rounded-xl
                    text-white placeholder-dark-400
                    hover:border-primary-500/50 hover:bg-dark-700/50
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                    transition-all duration-200
                  "
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-dark-600 transition-colors"
                  >
                    <XCircleIcon className="w-4 h-4 text-dark-400 hover:text-red-400" />
                  </motion.button>
                )}
              </div>

              {/* Filtre par type */}
              <CustomSelect
                options={typeOptions}
                value={selectedType}
                onChange={(value) => setSelectedType(value as CapsuleType | 'ALL')}
                placeholder="Type de capsule"
                icon={FunnelIcon}
                className="min-w-[200px]"
              />

              {/* Filtre par statut */}
              <CustomSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value as any)}
                placeholder="Statut"
                className="min-w-[180px]"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
                <p className="text-white">Chargement de vos capsules...</p>
              </motion.div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-red-400 mb-2">Erreur de chargement</h3>
                <p className="text-dark-300 mb-4">Impossible de récupérer vos capsules</p>
                <button
                  onClick={() => refetch()}
                  className="btn-primary"
                >
                  Réessayer
                </button>
              </div>
            </motion.div>
          ) : filteredCapsules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-dark-800/30 border border-dark-600 rounded-2xl p-12 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <PlusIcon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {capsules.length === 0 ? 'Aucune capsule trouvée' : 'Aucun résultat'}
                </h3>
                <p className="text-dark-300 mb-6">
                  {capsules.length === 0 
                    ? 'Créez votre première capsule temporelle sécurisée'
                    : 'Essayez de modifier vos critères de recherche'
                  }
                </p>
                {capsules.length === 0 && (
                  <button
                    onClick={() => router.push('/capsules/create')}
                    className="btn-primary"
                  >
                    Créer ma première capsule
                  </button>
                )}
                {capsules.length !== 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedType('ALL')
                      setSelectedStatus('ALL')
                    }}
                    className="btn-outline"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredCapsules.map((capsule, index) => (
                      <motion.div
                        key={capsule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CapsuleCard 
                          capsule={capsule}
                          onTransfer={(id) => {
                            toast.success('Fonction de transfert à implémenter')
                          }}
                          onDelete={(id) => {
                            toast.success('Fonction de suppression à implémenter')
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredCapsules.map((capsule, index) => (
                      <motion.div
                        key={capsule.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                <div className="w-6 h-6 text-primary-400">
                                  {capsule.type === 'SAFE' && '🛡️'}
                                  {capsule.type === 'TIME_LOCK' && '⏰'}
                                  {capsule.type === 'CONDITIONAL' && '🔑'}
                                  {capsule.type === 'MULTI_SIG' && '👥'}
                                  {capsule.type === 'DEAD_MANS_SWITCH' && '❤️'}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white truncate">
                                {capsule.title}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-primary-400">
                                  {getTypeLabel(capsule.type)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  capsule.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400' :
                                  capsule.status === 'UNLOCKED' ? 'bg-blue-900/30 text-blue-400' :
                                  'bg-red-900/30 text-red-400'
                                }`}>
                                  {capsule.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-dark-300">
                                Créée le {new Date(capsule.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <button
                              onClick={() => router.push(`/capsules/${capsule.id}`)}
                              className="btn-outline btn-sm"
                            >
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}