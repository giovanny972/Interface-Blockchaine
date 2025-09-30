'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { capsuleAPI } from '@/lib/api'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useCapsuleActions } from '@/hooks/useCapsuleActions'
import { useCountdown } from '@/hooks/useCountdown'
import {
  CubeIcon,
  KeyIcon,
  ArrowLeftIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ChartBarIcon,
  ServerIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HashtagIcon,
  GlobeAltIcon,
  CpuChipIcon,
  WifiIcon,
  SparklesIcon,
  LinkIcon,
  ClipboardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function PublicCapsulePage() {
  const params = useParams()
  const router = useRouter()
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const capsuleId = params.id as string
  
  // Hook for capsule actions (unlock, download)
  const { state: actionsState, actions } = useCapsuleActions()

  // Récupérer les données de la capsule publique
  const { data: capsule, isLoading } = useQuery(
    ['publicCapsule', capsuleId],
    () => capsuleAPI.getPublicCapsule(capsuleId),
    {
      enabled: !!capsuleId,
      retry: 1,
      onError: (error) => {
        console.error('Erreur chargement capsule publique:', error)
        toast.error('Impossible de charger la capsule publique')
      }
    }
  )

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

  // Utiliser le hook countdown pour un affichage en temps réel
  const countdown = useCountdown(
    capsule?.unlockTime && capsule?.status === 'ACTIVE' ? capsule.unlockTime : null,
    {
      onExpire: () => {
        console.log('Capsule publique peut maintenant être débloquée!')
        toast.success('🎉 Cette capsule publique peut maintenant être débloquée!', {
          duration: 8000,
          position: 'top-center'
        })
        // Rafraîchir les données de la capsule
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      },
      includeSeconds: true
    }
  )

  const handleCopyLink = () => {
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl)
    setCopiedLink(true)
    toast.success('Lien copié dans le presse-papiers!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleShareOnPlatform = (platform: string) => {
    const currentUrl = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(`Capsule Temporelle: ${capsule?.title}`)
    const description = encodeURIComponent(capsule?.description || 'Découvrez cette capsule temporelle partagée')
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${currentUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${currentUrl}&text=${title}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${currentUrl}`
        break
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${currentUrl}&title=${title}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
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
            <p className="text-white text-lg">Chargement de la capsule publique...</p>
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
              Cette capsule publique n'existe pas ou n'est plus accessible.
            </p>
            <button
              onClick={() => router.push('/explorer')}
              className="btn-primary"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour à l'explorateur
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
                  onClick={() => router.push('/explorer')}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Explorateur
                </button>
                
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Capsule Publique</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
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
                        Partagée par {capsule.owner?.slice(0, 12)}...
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

              {countdown && !countdown.isExpired && (
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

              {countdown?.isExpired && capsule.status === 'ACTIVE' && (
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
                        <p className="text-sm text-green-300 font-medium">Capsule publique déverrouillable</p>
                        <p className="text-xl font-bold text-white">
                          Cette capsule peut maintenant être déverrouillée par quiconque !
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

            {/* Content and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Taille', value: formatFileSize(capsule.dataSize), icon: '📊', color: 'blue' },
                    { label: 'Type', value: capsule.type.replace('_', ' '), icon: '🏷️', color: 'green' },
                    { label: 'Stockage', value: capsule.storageType === 'ipfs' ? 'IPFS' : 'Blockchain', icon: '🗄️', color: 'yellow' },
                    { label: 'Réseau', value: 'Public', icon: '🌐', color: 'purple' }
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
                          Le contenu de cette capsule publique est maintenant accessible et peut être téléchargé.
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => actions.downloadData(capsule)}
                          disabled={actionsState.isDownloading}
                          className="btn-primary flex-1 disabled:opacity-50"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
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
                    
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="w-full btn-outline"
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Partager cette capsule
                    </button>
                  </div>
                </motion.div>

                {/* Informations techniques */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CpuChipIcon className="w-5 h-5 mr-2 text-cyan-400" />
                    Informations
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Hash IPFS', value: capsule.ipfsHash || 'N/A', icon: HashtagIcon },
                      { label: 'Blockchain', value: 'Cosmos Hub', icon: GlobeAltIcon },
                      { label: 'Visibilité', value: 'Publique', icon: GlobeAltIcon },
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
              </div>
            </div>
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <ShareIcon className="w-6 h-6 mr-3 text-primary-400" />
                    Partager la Capsule
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-dark-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Lien direct */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Lien direct
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={window.location.href}
                        readOnly
                        className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          copiedLink 
                            ? 'bg-green-600 text-white' 
                            : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                        }`}
                      >
                        <ClipboardIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Plateformes de partage */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">
                      Partager sur les réseaux sociaux
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Twitter', key: 'twitter', color: 'bg-blue-500', icon: '🐦' },
                        { name: 'Facebook', key: 'facebook', color: 'bg-blue-600', icon: '📘' },
                        { name: 'LinkedIn', key: 'linkedin', color: 'bg-blue-700', icon: '💼' },
                        { name: 'Telegram', key: 'telegram', color: 'bg-cyan-500', icon: '✈️' },
                        { name: 'WhatsApp', key: 'whatsapp', color: 'bg-green-500', icon: '💬' },
                        { name: 'Reddit', key: 'reddit', color: 'bg-orange-500', icon: '📱' }
                      ].map((platform) => (
                        <button
                          key={platform.key}
                          onClick={() => handleShareOnPlatform(platform.key)}
                          className={`p-3 ${platform.color} text-white rounded-lg hover:opacity-80 transition-opacity flex flex-col items-center space-y-1`}
                        >
                          <span className="text-lg">{platform.icon}</span>
                          <span className="text-xs">{platform.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="w-full py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Fermer
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