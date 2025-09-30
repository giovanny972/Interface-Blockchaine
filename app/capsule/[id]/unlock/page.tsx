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
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CapsuleUnlockPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [unlockStage, setUnlockStage] = useState<'init' | 'gathering' | 'decrypting' | 'success' | 'error'>('init')
  const [keyShards, setKeyShards] = useState<Array<{id: string, node: string, gathered: boolean}>>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const capsuleId = params.id as string

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

  // Initialiser les fragments de clés
  useEffect(() => {
    if (capsule) {
      const mockShards = [
        { id: '1', node: 'Validator Node Alpha-7', gathered: false },
        { id: '2', node: 'Validator Node Beta-3', gathered: false },
        { id: '3', node: 'Validator Node Gamma-9', gathered: false },
        { id: '4', node: 'Validator Node Delta-1', gathered: false },
        { id: '5', node: 'Validator Node Epsilon-5', gathered: false },
      ]
      setKeyShards(mockShards)
    }
  }, [capsule])

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  // Fonction pour démarrer le processus de déverrouillage
  const startUnlocking = async () => {
    setUnlockStage('gathering')
    setProgress(0)
    setError(null)

    try {
      // Phase 1: Rassemblement des fragments de clés
      for (let i = 0; i < keyShards.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
        
        setKeyShards(prev => prev.map((shard, index) => 
          index === i ? { ...shard, gathered: true } : shard
        ))
        
        setProgress(((i + 1) / keyShards.length) * 60) // 60% pour le gathering
      }

      // Phase 2: Décryptage
      setUnlockStage('decrypting')
      
      for (let i = 60; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setProgress(i)
      }

      // Phase 3: Succès
      setUnlockStage('success')
      toast.success('Capsule déverrouillée avec succès!')
      
      // Redirection vers la page de contenu après 3 secondes
      setTimeout(() => {
        router.push(`/capsule/${capsuleId}`)
      }, 3000)

    } catch (err) {
      setUnlockStage('error')
      setError('Erreur lors du déverrouillage de la capsule')
      toast.error('Échec du déverrouillage')
    }
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
            <p className="text-white text-lg">Chargement de la capsule...</p>
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden">
        <StarryBackground starCount={600} enableShootingStars={true} />
        
        {/* Cosmic Background Effects */}
        <div className="fixed inset-0 z-5">
          <div className="absolute inset-0 bg-gradient-radial from-primary-900/20 via-transparent to-transparent animate-pulse-slow" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full animate-float" />
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-radial from-purple-500/10 to-transparent rounded-full animate-float-delayed" />
        </div>

        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-glass border-b border-dark-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => router.push(`/capsule/${capsuleId}`)}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Retour
                </button>
                
                <div className="flex items-center gap-3">
                  <CubeIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Déverrouillage Quantique</span>
                </div>

                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-dark-300">En cours...</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Capsule Info Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gradient-cosmic mb-4">
                {capsule.title}
              </h1>
              <p className="text-xl text-dark-300 max-w-2xl mx-auto">
                Rassemblement des fragments de clés quantiques distribués sur le réseau Cosmos
              </p>
            </motion.div>

            {/* Central Unlock Interface */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Left Panel - Key Shards Status */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 mr-3 text-cyan-400" />
                  Fragments de Clés Distribués
                </h3>
                
                {keyShards.map((shard, index) => (
                  <motion.div
                    key={shard.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all duration-500 ${
                      shard.gathered 
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50 shadow-green-500/20' 
                        : unlockStage === 'gathering'
                          ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/50 animate-pulse'
                          : 'bg-dark-800/50 border-dark-600'
                    } shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          shard.gathered ? 'bg-green-400 animate-ping' : 'bg-dark-500'
                        }`} />
                        <div>
                          <p className="font-medium text-white">{shard.node}</p>
                          <p className="text-sm text-dark-400">Fragment #{shard.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {shard.gathered ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center text-green-400"
                          >
                            <CheckCircleIcon className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium">Acquis</span>
                          </motion.div>
                        ) : unlockStage === 'gathering' ? (
                          <div className="flex items-center text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
                            <span className="text-sm">Recherche...</span>
                          </div>
                        ) : (
                          <span className="text-sm text-dark-500">En attente</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Center Panel - Main Unlock Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="flex-1 max-w-md mx-auto"
              >
                <div className="relative">
                  {/* Central Orb */}
                  <div className="relative w-80 h-80 mx-auto mb-8">
                    <motion.div
                      animate={{ 
                        rotate: unlockStage === 'gathering' || unlockStage === 'decrypting' ? 360 : 0 
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: unlockStage === 'gathering' || unlockStage === 'decrypting' ? Infinity : 0,
                        ease: "linear" 
                      }}
                      className="absolute inset-0"
                    >
                      <div className={`w-full h-full rounded-full border-4 transition-all duration-1000 ${
                        unlockStage === 'success' 
                          ? 'border-green-400 shadow-2xl shadow-green-400/50' 
                          : unlockStage === 'error'
                            ? 'border-red-400 shadow-2xl shadow-red-400/50'
                            : unlockStage === 'gathering' || unlockStage === 'decrypting'
                              ? 'border-cyan-400 shadow-2xl shadow-cyan-400/50'
                              : 'border-primary-500 shadow-xl shadow-primary-500/30'
                      }`} />
                    </motion.div>

                    {/* Inner Content */}
                    <div className="absolute inset-8 rounded-full bg-gradient-radial from-dark-800/80 to-dark-900/90 backdrop-blur-sm flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {unlockStage === 'init' && (
                          <motion.div
                            key="init"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-center"
                          >
                            <KeyIcon className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                            <p className="text-white font-semibold">Prêt à déverrouiller</p>
                          </motion.div>
                        )}

                        {unlockStage === 'gathering' && (
                          <motion.div
                            key="gathering"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-center"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <GlobeAltIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                            </motion.div>
                            <p className="text-cyan-400 font-semibold">Rassemblement</p>
                            <p className="text-sm text-dark-300">des fragments</p>
                          </motion.div>
                        )}

                        {unlockStage === 'decrypting' && (
                          <motion.div
                            key="decrypting"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-center"
                          >
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <CpuChipIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            </motion.div>
                            <p className="text-purple-400 font-semibold">Décryptage</p>
                            <p className="text-sm text-dark-300">quantique</p>
                          </motion.div>
                        )}

                        {unlockStage === 'success' && (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.3, 1] }}
                              transition={{ duration: 0.8 }}
                            >
                              <SparklesIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            </motion.div>
                            <p className="text-green-400 font-semibold">Déverrouillé!</p>
                            <p className="text-sm text-dark-300">Accès autorisé</p>
                          </motion.div>
                        )}

                        {unlockStage === 'error' && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-center"
                          >
                            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 font-semibold">Échec</p>
                            <p className="text-sm text-dark-300">Réessayez</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress Ring */}
                    {(unlockStage === 'gathering' || unlockStage === 'decrypting') && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="140"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-dark-700"
                        />
                        <motion.circle
                          cx="50%"
                          cy="50%"
                          r="140"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="text-cyan-400"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: progress / 100 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            strokeDasharray: "2π × 140",
                            filter: "drop-shadow(0 0 6px currentColor)"
                          }}
                        />
                      </svg>
                    )}
                  </div>

                  {/* Progress Text */}
                  <div className="text-center mb-8">
                    <motion.div
                      key={progress}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      {Math.round(progress)}%
                    </motion.div>
                    <div className="text-dark-400">
                      {unlockStage === 'gathering' && 'Collecte des fragments de clés...'}
                      {unlockStage === 'decrypting' && 'Reconstruction de la clé maître...'}
                      {unlockStage === 'success' && 'Capsule déverrouillée avec succès!'}
                      {unlockStage === 'error' && error}
                      {unlockStage === 'init' && 'Prêt pour le déverrouillage'}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <AnimatePresence>
                      {unlockStage === 'init' && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startUnlocking}
                          className="btn-primary btn-lg group relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <BoltIcon className="w-6 h-6 mr-3" />
                          Initier le Déverrouillage Quantique
                        </motion.button>
                      )}

                      {unlockStage === 'success' && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => router.push(`/capsule/${capsuleId}`)}
                          className="btn-success btn-lg"
                        >
                          <SparklesIcon className="w-6 h-6 mr-3" />
                          Accéder au Contenu
                        </motion.button>
                      )}

                      {unlockStage === 'error' && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setUnlockStage('init')
                            setProgress(0)
                            setError(null)
                            setKeyShards(prev => prev.map(shard => ({ ...shard, gathered: false })))
                          }}
                          className="btn-outline btn-lg"
                        >
                          <BoltIcon className="w-6 h-6 mr-3" />
                          Réessayer
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel - Network Stats */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 space-y-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <CpuChipIcon className="w-6 h-6 mr-3 text-purple-400" />
                  État du Réseau Cosmos
                </h3>

                {/* Network Status Cards */}
                {[
                  { label: 'Validators Actifs', value: '175', status: 'success', icon: ShieldCheckIcon },
                  { label: 'Hauteur de Bloc', value: '8,234,567', status: 'info', icon: CubeIcon },
                  { label: 'TPS Moyen', value: '1,247', status: 'warning', icon: BoltIcon },
                  { label: 'Fragments Disponibles', value: '5/5', status: 'success', icon: KeyIcon },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      stat.status === 'success' 
                        ? 'bg-green-900/20 border-green-500/50' 
                        : stat.status === 'warning'
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : 'bg-blue-900/20 border-blue-500/50'
                    } hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <stat.icon className={`w-6 h-6 ${
                          stat.status === 'success' ? 'text-green-400' :
                          stat.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <p className="text-dark-300 text-sm">{stat.label}</p>
                          <p className="font-bold text-white text-lg">{stat.value}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        stat.status === 'success' ? 'bg-green-400 animate-pulse' :
                        stat.status === 'warning' ? 'bg-yellow-400 animate-pulse' : 'bg-blue-400 animate-pulse'
                      }`} />
                    </div>
                  </motion.div>
                ))}

                {/* Quantum Security Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 text-center"
                >
                  <ShieldCheckIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-bold text-white mb-2">Sécurité Quantique</h4>
                  <p className="text-sm text-dark-300">
                    Chiffrement AES-256-GCM avec distribution Shamir Secret Sharing
                  </p>
                  <div className="mt-3 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <span className="text-xs text-green-400 font-medium">SÉCURISÉ</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}