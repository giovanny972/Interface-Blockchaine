'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuth } from '@/stores/authStore'
import { capsuleAPI } from '@/lib/api'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  CubeIcon,
  KeyIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
  EyeIcon,
  CogIcon,
  ChartBarIcon,
  BoltIcon,
  ServerIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  HashtagIcon,
  GlobeAltIcon,
  CloudIcon,
  CpuChipIcon,
  WifiIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCapsuleActions } from '@/hooks/useCapsuleActions'
import { useCountdown } from '@/hooks/useCountdown'

export default function CapsuleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity' | 'settings'>('overview')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const capsuleId = params.id as string
  
  // Hook for capsule actions (unlock, download, etc.)
  const { state: actionsState, actions } = useCapsuleActions()

  // Récupérer les données de la capsule
  const { data: capsule, isLoading } = useQuery(
    ['capsule', capsuleId],
    () => capsuleAPI.getCapsule(capsuleId),
    {
      enabled: !!capsuleId,
      retry: 1,
      onError: (error) => {
        console.error('Erreur chargement capsule:', error)
        toast.error('Impossible de charger la capsule')
      }
    }
  )

  // Récupérer l'activité de la capsule
  const { data: activity } = useQuery(
    ['capsule-activity', capsuleId],
    () => capsuleAPI.getCapsuleActivity(capsuleId),
    {
      enabled: !!capsuleId,
      retry: 1
    }
  )

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  const handleTransferCapsule = async () => {
    if (!transferAddress.trim()) {
      toast.error('Veuillez saisir une adresse de destination valide')
      return
    }

    setIsTransferring(true)
    try {
      await capsuleAPI.transferCapsule(capsuleId, transferAddress.trim())
      toast.success('Capsule transférée avec succès!')
      setShowTransferModal(false)
      setTransferAddress('')
      router.push('/dashboard')
    } catch (error) {
      console.error('Erreur transfert capsule:', error)
      toast.error('Erreur lors du transfert de la capsule')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleDeleteCapsule = async () => {
    setIsDeleting(true)
    try {
      await capsuleAPI.deleteCapsule(capsuleId)
      toast.success('Capsule supprimée avec succès!')
      setShowDeleteModal(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Erreur suppression capsule:', error)
      toast.error('Erreur lors de la suppression de la capsule')
    } finally {
      setIsDeleting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SAFE': return ShieldCheckIcon
      case 'TIME_LOCK': return ClockIcon
      case 'CONDITIONAL': return KeyIcon
      case 'MULTI_SIG': return UserGroupIcon
      case 'DEAD_MANS_SWITCH': return HeartIcon
      default: return DocumentIcon
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'SAFE':
        return {
          title: 'Capsule Sécurisée',
          description: 'Accès immédiat avec chiffrement AES-256-GCM. Idéale pour le stockage sécurisé de documents personnels.',
          features: ['Accès instantané', 'Chiffrement fort', 'Contrôle total']
        }
      case 'TIME_LOCK':
        return {
          title: 'Capsule Temporelle',
          description: 'Déverrouillage automatique à une date précise. Parfaite pour les messages futurs et héritages numériques.',
          features: ['Déverrouillage programmé', 'Horodatage blockchain', 'Impossible à modifier']
        }
      case 'CONDITIONAL':
        return {
          title: 'Capsule Conditionnelle', 
          description: 'Déverrouillage basé sur des conditions externes comme oracles ou événements on-chain.',
          features: ['Conditions personnalisables', 'Oracles externes', 'Déclenchement automatique']
        }
      case 'MULTI_SIG':
        return {
          title: 'Capsule Multi-Signatures',
          description: 'Déverrouillage nécessitant plusieurs signatures. Idéale pour la gouvernance et la validation collective.',
          features: ['Seuil configurable', 'Validation multiple', 'Gouvernance décentralisée']
        }
      case 'DEAD_MANS_SWITCH':
        return {
          title: 'Capsule de Surveillance',
          description: 'Déverrouillage automatique en cas d\'inactivité prolongée. Système de sécurité et testament numérique.',
          features: ['Surveillance d\'activité', 'Déclenchement automatique', 'Mécanisme d\'urgence']
        }
      default:
        return {
          title: 'Capsule',
          description: 'Type de capsule non reconnu',
          features: []
        }
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      ACTIVE: { 
        label: 'Active', 
        color: 'bg-green-900/30 text-green-400 border-green-500/50',
        icon: '🟢'
      },
      UNLOCKED: { 
        label: 'Débloquée', 
        color: 'bg-blue-900/30 text-blue-400 border-blue-500/50',
        icon: '🔓'
      },
      EXPIRED: { 
        label: 'Expirée', 
        color: 'bg-red-900/30 text-red-400 border-red-500/50',
        icon: '⏰'
      },
      TRANSFERRED: { 
        label: 'Transférée', 
        color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
        icon: '↗️'
      }
    }
    
    const config = configs[status as keyof typeof configs] || configs.ACTIVE
    return (
      <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    )
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  // Utiliser le hook countdown pour un affichage en temps réel - uniquement pour les capsules temporelles avec unlockTime
  const isTimeBased = capsule?.type === 'TIME_LOCK' || capsule?.type === 'DEAD_MANS_SWITCH'
  const hasUnlockTime = capsule?.unlockTime && new Date(capsule.unlockTime) > new Date()
  const shouldShowCountdown = isTimeBased && hasUnlockTime && capsule?.status === 'ACTIVE'
  
  const countdown = useCountdown(
    shouldShowCountdown ? (capsule.unlockTime || null) : null,
    {
      onExpire: () => {
        console.log('Capsule peut maintenant être débloquée!')
        toast.success('🎉 Cette capsule peut maintenant être débloquée!', {
          duration: 8000,
          position: 'top-center'
        })
        // Rafraîchir les données de la capsule
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      },
      includeSeconds: true,
      createdAt: capsule?.createdAt ? new Date(capsule.createdAt) : new Date()
    }
  )

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
            <p className="text-white text-lg">Chargement des détails...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Capsule introuvable</h1>
            <p className="text-dark-400 mb-6">
              Cette capsule n'existe pas ou vous n'avez pas l'autorisation de la voir.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour au dashboard
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  const TypeIcon = getTypeIcon(capsule.type)

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative">
        <StarryBackground starCount={300} enableShootingStars={true} />
        
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
                  <TypeIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Détails de la Capsule</span>
                </div>

                <div className="relative group">
                  <button className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute right-0 top-12 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => setShowTransferModal(true)}
                        className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors flex items-center space-x-2"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Transférer</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
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
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Capsule Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <TypeIcon className="w-10 h-10 text-white" />
                    </div>
                    {capsule.status === 'ACTIVE' && capsule.isUnlockable && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{capsule.title}</h1>
                    <p className="text-lg text-dark-300 mb-4">{capsule.description}</p>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(capsule.status)}
                      <span className="text-sm text-dark-400">
                        ID: {capsule.id?.slice(0, 12) || 'N/A'}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-dark-400">Créée le</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(capsule.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {shouldShowCountdown && countdown && !countdown.isExpired && (
                <motion.div 
                  className="p-6 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-2xl border border-primary-500/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <ClockIcon className="w-8 h-8 text-primary-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm text-primary-300 font-medium">Temps restant avant déverrouillage</p>
                        <p className="text-2xl font-bold text-white font-mono">
                          {countdown.timeString}
                        </p>
                        <p className="text-xs text-primary-400 mt-1">
                          Progression: {countdown.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    {capsule.isUnlockable && (
                      <button
                        onClick={() => actions.unlockCapsule(capsule)}
                        disabled={actionsState.isUnlocking}
                        className="btn-primary disabled:opacity-50 animate-pulse"
                      >
                        <KeyIcon className="w-5 h-5 mr-2" />
                        {actionsState.isUnlocking ? 'Déverrouillage...' : 'Déverrouiller'}
                      </button>
                    )}
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${countdown.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {isTimeBased && capsule.unlockTime && new Date(capsule.unlockTime) <= new Date() && capsule.status === 'ACTIVE' && (
                <motion.div 
                  className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                        <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-green-300 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-sm text-green-300 font-medium">Capsule déverrouillable</p>
                        <p className="text-xl font-bold text-white">
                          Cette capsule peut maintenant être déverrouillée !
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => actions.unlockCapsule(capsule)}
                      disabled={actionsState.isUnlocking}
                      className="btn-primary bg-green-600 hover:bg-green-500 disabled:opacity-50 animate-pulse shadow-lg shadow-green-500/30"
                    >
                      <KeyIcon className="w-5 h-5 mr-2" />
                      {actionsState.isUnlocking ? 'Déverrouillage...' : 'Déverrouiller maintenant'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex space-x-1 bg-dark-800/50 rounded-2xl p-2">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: EyeIcon },
                  { key: 'security', label: 'Sécurité', icon: ShieldCheckIcon },
                  { key: 'activity', label: 'Activité', icon: ChartBarIcon },
                  { key: 'settings', label: 'Paramètres', icon: CogIcon }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Informations principales */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Taille', value: formatFileSize(capsule.dataSize), icon: '📊', color: 'blue' },
                        { label: 'Type', value: capsule.type.replace('_', ' '), icon: '🏷️', color: 'green' },
                        { label: 'Seuil', value: `${capsule.threshold}/${capsule.totalShares}`, icon: '🔐', color: 'purple' },
                        { label: 'Stockage', value: capsule.storageType === 'ipfs' ? 'IPFS' : 'Blockchain', icon: '🗄️', color: 'yellow' }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-dark-800/50 rounded-xl border border-dark-600/50 hover:border-primary-500/30 transition-all"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{stat.icon}</span>
                            <span className="text-xs text-dark-400 font-medium uppercase">{stat.label}</span>
                          </div>
                          <p className="text-white font-semibold">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Informations spécifiques au type */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="card"
                    >
                      <div className="flex items-center mb-4">
                        <TypeIcon className="w-6 h-6 mr-3 text-primary-500" />
                        <h3 className="text-xl font-semibold text-white">
                          {getTypeDescription(capsule.type).title}
                        </h3>
                      </div>
                      
                      <p className="text-dark-300 mb-4 leading-relaxed">
                        {getTypeDescription(capsule.type).description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {getTypeDescription(capsule.type).features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Contenu de la capsule */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="card"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <DocumentIcon className="w-6 h-6 mr-3 text-primary-500" />
                        Contenu de la Capsule
                      </h3>
                      
                      {capsule.status === 'UNLOCKED' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-3">
                              <CheckCircleIcon className="w-6 h-6 text-green-400" />
                              <span className="font-medium text-green-400">Capsule déverrouillée</span>
                            </div>
                            <p className="text-green-300 text-sm">
                              Le contenu de cette capsule est maintenant accessible et peut être téléchargé.
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => actions.downloadData(capsule)}
                              disabled={actionsState.isDownloading}
                              className="btn-primary flex-1 disabled:opacity-50"
                            >
                              <DownloadIcon className="w-5 h-5 mr-2" />
                              {actionsState.isDownloading ? 'Téléchargement...' : 'Télécharger le contenu'}
                            </button>
                            <button 
                              onClick={() => actions.viewCapsule(capsule)}
                              disabled={actionsState.isViewing}
                              className="btn-outline disabled:opacity-50"
                            >
                              <EyeIcon className="w-5 h-5 mr-2" />
                              {actionsState.isViewing ? 'Chargement...' : 'Prévisualiser'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-dark-700/50 rounded-lg text-center">
                          <LockClosedIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                          <p className="text-dark-400 mb-2">Contenu verrouillé</p>
                          <p className="text-sm text-dark-500">
                            Le contenu sera accessible après déverrouillage
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Conditions de déverrouillage */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="card"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <KeyIcon className="w-6 h-6 mr-3 text-yellow-500" />
                        Conditions de Déverrouillage
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Conditions temporelles - TIME_LOCK et DEAD_MANS_SWITCH */}
                        {isTimeBased && capsule.unlockTime && (
                          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="w-5 h-5 text-blue-400" />
                              <span className="text-white">Date de déverrouillage</span>
                            </div>
                            <span className="text-blue-400 font-mono">
                              {new Date(capsule.unlockTime).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        )}
                        
                        {/* Conditions de signature - MULTI_SIG */}
                        {capsule.type === 'MULTI_SIG' && (
                          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <HashtagIcon className="w-5 h-5 text-purple-400" />
                              <span className="text-white">Seuil de signatures</span>
                            </div>
                            <span className="text-purple-400 font-mono">
                              {capsule.threshold} sur {capsule.totalShares}
                            </span>
                          </div>
                        )}
                        
                        {/* Conditions spéciales - CONDITIONAL */}
                        {capsule.type === 'CONDITIONAL' && (
                          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <BoltIcon className="w-5 h-5 text-yellow-400" />
                              <span className="text-white">Condition externe</span>
                            </div>
                            <span className="text-yellow-400 font-mono">
                              En attente
                            </span>
                          </div>
                        )}
                        
                        {/* Accès immédiat - SAFE */}
                        {capsule.type === 'SAFE' && (
                          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-white">Accès</span>
                            </div>
                            <span className="text-green-400 font-mono">
                              Immédiat
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Informations techniques */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="card"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CpuChipIcon className="w-5 h-5 mr-2 text-cyan-400" />
                        Informations Techniques
                      </h3>
                      
                      <div className="space-y-3">
                        {[
                          { label: 'Hash IPFS', value: capsule.ipfsHash || 'N/A', icon: HashtagIcon },
                          { label: 'Blockchain', value: 'Cosmos Hub', icon: GlobeAltIcon },
                          { label: 'Chiffrement', value: 'AES-256-GCM', icon: ShieldCheckIcon },
                          { label: 'Réseau', value: capsule.network || 'MainNet', icon: WifiIcon }
                        ].map((info, index) => (
                          <div key={info.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <info.icon className="w-4 h-4 text-dark-400" />
                              <span className="text-dark-400">{info.label}</span>
                            </div>
                            <span className="text-white font-mono text-xs">
                              {info.value.length > 20 ? `${info.value.slice(0, 8)}...${info.value.slice(-4)}` : info.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Actions rapides */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="card"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                      
                      <div className="space-y-3">
                        {capsule.isUnlockable && (
                          <button
                            onClick={() => actions.unlockCapsule(capsule)}
                            disabled={actionsState.isUnlocking}
                            className="w-full btn-primary disabled:opacity-50"
                          >
                            <KeyIcon className="w-4 h-4 mr-2" />
                            {actionsState.isUnlocking ? 'Déverrouillage...' : 'Déverrouiller'}
                          </button>
                        )}
                        
                        <button className="w-full btn-outline">
                          <ShareIcon className="w-4 h-4 mr-2" />
                          Partager
                        </button>
                        
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="w-full btn-outline"
                        >
                          <UserPlusIcon className="w-4 h-4 mr-2" />
                          Transférer
                        </button>
                      </div>
                    </motion.div>

                    {/* État du réseau */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="card"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <ServerIcon className="w-5 h-5 mr-2 text-green-400" />
                        État du Réseau
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-dark-400">Santé</span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            <span className="text-sm text-green-400">Opérationnel</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-dark-400">Validators</span>
                          <span className="text-sm font-mono text-white">175 actifs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-dark-400">Hauteur bloc</span>
                          <span className="text-sm font-mono text-white">8,234,567</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Chiffrement */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <ShieldCheckIcon className="w-6 h-6 mr-3 text-green-500" />
                      Chiffrement & Sécurité
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="font-medium text-green-400">Chiffrement AES-256-GCM</span>
                        </div>
                        <p className="text-green-300 text-sm">
                          Vos données sont protégées par un chiffrement de niveau militaire.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-blue-400">Distribution Shamir Secret Sharing</span>
                        </div>
                        <p className="text-blue-300 text-sm">
                          La clé de déchiffrement est divisée en {capsule.totalShares} fragments, {capsule.threshold} requis.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircleIcon className="w-5 h-5 text-purple-400" />
                          <span className="font-medium text-purple-400">Stockage décentralisé</span>
                        </div>
                        <p className="text-purple-300 text-sm">
                          Données distribuées sur le réseau IPFS pour une résilience maximale.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fragments de clés */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <KeyIcon className="w-6 h-6 mr-3 text-yellow-500" />
                      Fragments de Clés
                    </h3>
                    
                    <div className="space-y-3">
                      {Array.from({ length: capsule.totalShares }, (_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-white">Fragment #{i + 1}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Sécurisé</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <strong>{capsule.threshold}</strong> fragments sur <strong>{capsule.totalShares}</strong> sont requis pour déverrouiller cette capsule.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="card"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-3 text-primary-500" />
                    Historique d'Activité
                  </h3>
                  
                  <div className="space-y-4">
                    {activity && activity.length > 0 ? (
                      activity.map((event: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-4 p-4 bg-dark-700/50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{event.action}</p>
                            <p className="text-sm text-dark-400">{event.description}</p>
                            <p className="text-xs text-dark-500 mt-1">
                              {new Date(event.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <InformationCircleIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                        <p className="text-dark-400">Aucune activité enregistrée</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <CogIcon className="w-6 h-6 mr-3 text-gray-500" />
                      Paramètres de la Capsule
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium text-yellow-400">Actions Critiques</span>
                        </div>
                        <p className="text-yellow-300 text-sm mb-4">
                          Ces actions sont irréversibles. Procédez avec prudence.
                        </p>
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowTransferModal(true)}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                          >
                            <UserPlusIcon className="w-5 h-5" />
                            <span>Transférer la propriété</span>
                          </button>
                          
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center space-x-2"
                          >
                            <TrashIcon className="w-5 h-5" />
                            <span>Supprimer définitivement</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    onClick={() => setShowDeleteModal(false)}
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
                        <p>Cette action supprimera définitivement la capsule "{capsule.title}" et tout son contenu. Cette opération ne peut pas être annulée.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
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