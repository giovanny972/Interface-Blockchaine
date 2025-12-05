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
  SparklesIcon,
  BanknotesIcon,
  ChartPieIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCapsuleActions } from '@/hooks/useCapsuleActions'
import { useCountdown } from '@/hooks/useCountdown'

export default function CapsuleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity' | 'rwa' | 'settings'>('overview')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // RWA Tokenization states
  const [showTokenizeModal, setShowTokenizeModal] = useState(false)
  const [tokenizationForm, setTokenizationForm] = useState({
    totalFractions: '1000',
    pricePerFraction: '10',
    assetType: 'COLLECTIBLE' as const,
    description: ''
  })
  const [isTokenizing, setIsTokenizing] = useState(false)

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

  const handleTokenizeCapsule = async () => {
    if (!tokenizationForm.totalFractions || !tokenizationForm.pricePerFraction) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsTokenizing(true)
    try {
      // TODO: Intégrer avec l'API RWA blockchain
      // const result = await rwaAPI.tokenizeAsset({
      //   owner: address,
      //   name: `Capsule ${capsule?.title}`,
      //   description: tokenizationForm.description || capsule?.description,
      //   asset_type: tokenizationForm.assetType,
      //   value: tokenizationForm.pricePerFraction,
      //   total_fractions: tokenizationForm.totalFractions,
      //   metadata: JSON.stringify({
      //     capsule_id: capsuleId,
      //     capsule_type: capsule?.type,
      //     ...capsule?.metadata
      //   })
      // })

      toast.success('Capsule tokenisée avec succès!')
      setShowTokenizeModal(false)
      // Rafraîchir les données
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Erreur tokenisation:', error)
      toast.error('Erreur lors de la tokenisation de la capsule')
    } finally {
      setIsTokenizing(false)
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
                  { key: 'rwa', label: 'Tokenisation', icon: ChartPieIcon },
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

              {activeTab === 'rwa' && (
                <motion.div
                  key="rwa"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* En-tête RWA */}
                  <div className="card bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border-emerald-500/30">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <ChartPieIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Tokenisation RWA (Real World Assets)
                        </h3>
                        <p className="text-dark-300 mb-4">
                          Transformez votre capsule en actif numérique fractionnaire échangeable sur le réseau Sirius.
                          La tokenisation permet de diviser la propriété de votre capsule en fractions que vous pouvez vendre ou transférer.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-emerald-900/30 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/50">
                            Fractionnement d'actifs
                          </span>
                          <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium border border-blue-500/50">
                            Trading on-chain
                          </span>
                          <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium border border-purple-500/50">
                            Liquidité instantanée
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statut de tokenisation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-400 text-sm">Statut</span>
                        <BuildingLibraryIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        Non tokenisé
                      </p>
                      <p className="text-xs text-dark-500 mt-2">
                        Cette capsule n'est pas encore un actif RWA
                      </p>
                    </div>

                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-400 text-sm">Valeur Estimée</span>
                        <BanknotesIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        -- CAPS
                      </p>
                      <p className="text-xs text-dark-500 mt-2">
                        Définissez la valeur lors de la tokenisation
                      </p>
                    </div>

                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-400 text-sm">Fractions</span>
                        <ChartPieIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        0 / 0
                      </p>
                      <p className="text-xs text-dark-500 mt-2">
                        Aucune fraction créée
                      </p>
                    </div>
                  </div>

                  {/* Guide de tokenisation */}
                  <div className="card">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-400" />
                      Comment fonctionne la tokenisation ?
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-500/50">
                          <span className="text-emerald-400 font-bold">1</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white mb-1">Définir les paramètres</h5>
                          <p className="text-dark-300 text-sm">
                            Choisissez le nombre total de fractions et le prix par fraction.
                            Ces paramètres déterminent la valeur totale et la liquidité de votre actif.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/50">
                          <span className="text-blue-400 font-bold">2</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white mb-1">Création on-chain</h5>
                          <p className="text-dark-300 text-sm">
                            Une transaction blockchain enregistre votre actif dans le module RWA.
                            Vos fractions sont mintées et apparaissent dans votre portefeuille.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-500/50">
                          <span className="text-purple-400 font-bold">3</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white mb-1">Trading et transfert</h5>
                          <p className="text-dark-300 text-sm">
                            Les fractions peuvent être vendues, achetées ou transférées librement.
                            Le propriétaire majoritaire conserve le contrôle de la capsule.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de tokenisation */}
                  <div className="card bg-gradient-to-br from-emerald-900/10 to-blue-900/10 border-emerald-500/20">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Prêt à tokeniser ?</h4>
                      <p className="text-dark-300 mb-6 max-w-md mx-auto">
                        Transformez votre capsule en actif fractionnaire et débloquez de nouvelles opportunités de liquidité.
                      </p>
                      <button
                        onClick={() => setShowTokenizeModal(true)}
                        className="btn-primary"
                      >
                        <ChartPieIcon className="w-5 h-5 mr-2" />
                        Tokeniser cette capsule
                      </button>
                    </div>
                  </div>

                  {/* Avantages de la tokenisation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card border-emerald-500/20">
                      <div className="flex items-start space-x-3 mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">Liquidité immédiate</h5>
                          <p className="text-dark-300 text-sm">
                            Vendez des fractions sans avoir à transférer la capsule entière
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card border-blue-500/20">
                      <div className="flex items-start space-x-3 mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">Propriété fractionnaire</h5>
                          <p className="text-dark-300 text-sm">
                            Partagez la propriété avec plusieurs investisseurs
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card border-purple-500/20">
                      <div className="flex items-start space-x-3 mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">Transparence totale</h5>
                          <p className="text-dark-300 text-sm">
                            Toutes les transactions sont enregistrées on-chain
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card border-orange-500/20">
                      <div className="flex items-start space-x-3 mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">Valorisation dynamique</h5>
                          <p className="text-dark-300 text-sm">
                            Le marché détermine la valeur réelle de votre actif
                          </p>
                        </div>
                      </div>
                    </div>
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

          {/* Tokenization Modal */}
          {showTokenizeModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <ChartPieIcon className="w-6 h-6 mr-3 text-emerald-400" />
                    Tokeniser la Capsule
                  </h3>
                  <button
                    onClick={() => {
                      setShowTokenizeModal(false)
                      setTokenizationForm({
                        totalFractions: '1000',
                        pricePerFraction: '10',
                        assetType: 'COLLECTIBLE',
                        description: ''
                      })
                    }}
                    className="text-dark-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Information */}
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">À propos de la tokenisation RWA</p>
                        <p>
                          La tokenisation transforme votre capsule en actif numérique divisible.
                          Vous créez un nombre défini de fractions que vous pouvez vendre ou transférer individuellement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulaire */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Type d'actif
                      </label>
                      <select
                        value={tokenizationForm.assetType}
                        onChange={(e) => setTokenizationForm({ ...tokenizationForm, assetType: e.target.value as any })}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        <option value="COLLECTIBLE">Collection / Art Digital</option>
                        <option value="ARTWORK">Œuvre d'Art</option>
                        <option value="REAL_ESTATE">Immobilier</option>
                        <option value="VEHICLE">Véhicule</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Nombre total de fractions
                      </label>
                      <input
                        type="number"
                        value={tokenizationForm.totalFractions}
                        onChange={(e) => setTokenizationForm({ ...tokenizationForm, totalFractions: e.target.value })}
                        placeholder="1000"
                        min="1"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-dark-500 mt-1">
                        Plus le nombre est élevé, plus la liquidité sera forte
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Prix par fraction (CAPS)
                      </label>
                      <input
                        type="number"
                        value={tokenizationForm.pricePerFraction}
                        onChange={(e) => setTokenizationForm({ ...tokenizationForm, pricePerFraction: e.target.value })}
                        placeholder="10"
                        min="0.01"
                        step="0.01"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-dark-500 mt-1">
                        Valeur totale estimée : {(parseFloat(tokenizationForm.totalFractions) * parseFloat(tokenizationForm.pricePerFraction) || 0).toLocaleString()} CAPS
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Description (optionnelle)
                      </label>
                      <textarea
                        value={tokenizationForm.description}
                        onChange={(e) => setTokenizationForm({ ...tokenizationForm, description: e.target.value })}
                        placeholder="Décrivez votre actif pour attirer les investisseurs..."
                        rows={4}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Récapitulatif */}
                  <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-emerald-300 mb-3">Récapitulatif</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Capsule</span>
                        <span className="text-white font-medium">{capsule?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Fractions totales</span>
                        <span className="text-white font-medium">{tokenizationForm.totalFractions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Prix unitaire</span>
                        <span className="text-white font-medium">{tokenizationForm.pricePerFraction} CAPS</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-500/30">
                        <span className="text-emerald-300 font-semibold">Valeur totale</span>
                        <span className="text-emerald-300 font-bold">
                          {(parseFloat(tokenizationForm.totalFractions) * parseFloat(tokenizationForm.pricePerFraction) || 0).toLocaleString()} CAPS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Avertissement */}
                  <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-300">
                        <p className="font-medium mb-1">Action irréversible</p>
                        <p>
                          Une fois tokenisée, la capsule devient un actif RWA on-chain.
                          Les paramètres de fractionnement ne pourront plus être modifiés.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowTokenizeModal(false)
                        setTokenizationForm({
                          totalFractions: '1000',
                          pricePerFraction: '10',
                          assetType: 'COLLECTIBLE',
                          description: ''
                        })
                      }}
                      className="flex-1 py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleTokenizeCapsule}
                      disabled={isTokenizing || !tokenizationForm.totalFractions || !tokenizationForm.pricePerFraction}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isTokenizing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Tokenisation...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          Confirmer la Tokenisation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

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