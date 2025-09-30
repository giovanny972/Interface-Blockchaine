'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from 'react-query'
import { capsuleAPI } from '@/lib/api'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import { CapsuleCard } from '@/components/capsules/CapsuleCard'
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'TIME_LOCK' | 'SAFE' | 'CONDITIONAL' | 'MULTI_SIG' | 'DEAD_MANS_SWITCH'
type StatusFilter = 'all' | 'ACTIVE' | 'UNLOCKED' | 'EXPIRED'

export default function ExplorerPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Récupérer les capsules publiques
  const { data, isLoading, error, refetch } = useQuery(
    ['publicCapsules', currentPage, typeFilter, statusFilter, searchQuery],
    () => capsuleAPI.getPublicCapsules(currentPage, 16),
    {
      keepPreviousData: true,
      retry: 1,
      refetchOnWindowFocus: true, // Actualiser quand la fenêtre reprend le focus
      refetchInterval: 30000, // Actualiser toutes les 30 secondes
      onError: (error) => {
        console.error('Erreur chargement capsules publiques:', error)
        toast.error('Impossible de charger les capsules publiques')
      }
    }
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SAFE': return ShieldCheckIcon
      case 'TIME_LOCK': return ClockIcon
      case 'CONDITIONAL': return DocumentIcon
      case 'MULTI_SIG': return UserGroupIcon
      case 'DEAD_MANS_SWITCH': return HeartIcon
      default: return DocumentIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SAFE': return 'text-green-400 bg-green-900/20'
      case 'TIME_LOCK': return 'text-blue-400 bg-blue-900/20'
      case 'CONDITIONAL': return 'text-purple-400 bg-purple-900/20'
      case 'MULTI_SIG': return 'text-orange-400 bg-orange-900/20'
      case 'DEAD_MANS_SWITCH': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const filteredCapsules = data?.items?.filter(capsule => {
    const matchesSearch = !searchQuery || 
      capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || capsule.type === typeFilter
    const matchesStatus = statusFilter === 'all' || capsule.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  }) || []

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
            <GlobeAltIcon className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-lg">Chargement de l'explorateur...</p>
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
                  <ArrowLeftIcon className="w-5 h-5" />
                  Dashboard
                </button>
                
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Explorateur de Capsules</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <ServerIcon className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-green-400">{filteredCapsules.length} capsules</span>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Chargement...' : 'Actualiser'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Explorez les Capsules Publiques
              </h1>
              <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                Découvrez des capsules temporelles partagées par la communauté. 
                Explorez l'art, la science, l'histoire et bien plus encore.
              </p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 space-y-4"
            >
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Rechercher des capsules publiques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-dark-800/50 border border-dark-600 rounded-2xl text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Type Filter */}
                <div className="flex items-center gap-2 bg-dark-800/50 rounded-xl p-2">
                  <FunnelIcon className="w-4 h-4 text-dark-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                    className="bg-transparent text-white text-sm focus:outline-none"
                  >
                    <option value="all">Tous les types</option>
                    <option value="TIME_LOCK">Verrouillage temporel</option>
                    <option value="SAFE">Coffre-fort</option>
                    <option value="CONDITIONAL">Conditionnel</option>
                    <option value="MULTI_SIG">Multi-signatures</option>
                    <option value="DEAD_MANS_SWITCH">Homme mort</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 bg-dark-800/50 rounded-xl p-2">
                  <EyeIcon className="w-4 h-4 text-dark-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="bg-transparent text-white text-sm focus:outline-none"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="ACTIVE">Actives</option>
                    <option value="UNLOCKED">Déverrouillées</option>
                    <option value="EXPIRED">Expirées</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Capsules Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {filteredCapsules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-8">
                  {filteredCapsules.map((capsule, index) => (
                    <motion.div
                      key={capsule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className="w-full"
                    >
                      <CapsuleCard 
                        capsule={capsule}
                        showOwner={true}
                        variant="public"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <GlobeAltIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aucune capsule trouvée
                  </h3>
                  <p className="text-dark-400">
                    {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                      ? 'Essayez de modifier vos filtres de recherche.'
                      : 'Il n\'y a pas encore de capsules publiques disponibles.'}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Pagination */}
            {data && data.total > 16 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center items-center gap-4 mt-12"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!data.hasPrev}
                  className="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                
                <span className="text-dark-400">
                  Page {currentPage} sur {Math.ceil(data.total / 12)}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!data.hasNext}
                  className="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}