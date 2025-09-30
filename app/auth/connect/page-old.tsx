'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/authStore'
import { WalletManager } from '@/lib/wallet-dynamic'
import { 
  CubeIcon, 
  WalletIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ConnectWalletPage() {
  const { connect, isConnecting, error, isAuthenticated, walletManager } = useAuth()
  const [availableWallets, setAvailableWallets] = useState<any[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Rediriger si déjà connecté
    if (isAuthenticated) {
      console.log('Utilisateur déjà connecté, redirection vers dashboard')
      window.location.href = '/dashboard'
      return
    }

    // Charger les wallets disponibles
    const loadWallets = async () => {
      if (walletManager) {
        try {
          const wallets = await walletManager.getAvailableWallets()
          setAvailableWallets(wallets)
        } catch (error) {
          console.error('Erreur lors du chargement des wallets:', error)
        }
      }
    }
    
    loadWallets()
  }, [isAuthenticated, walletManager])

  const handleConnect = async (walletType: 'keplr' | 'cosmostation' | 'leap') => {
    setSelectedWallet(walletType)
    
    try {
      console.log('Tentative de connexion avec:', walletType)
      await connect(walletType)
      console.log('Connexion réussie avec:', walletType)
      toast.success(`Connecté avec ${walletType} !`)
      
      // Attendre un peu pour que l'état se mette à jour
      console.log('Attente de la mise à jour de l\'état...')
      setTimeout(() => {
        console.log('Redirection vers dashboard...')
        router.push('/dashboard')
      }, 100)
      
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      toast.error(err.message || 'Erreur de connexion')
      setSelectedWallet(null)
    }
  }

  const getWalletLogo = (walletName: string) => {
    const logos = {
      'Keplr': '🦄',
      'Cosmostation': '🚀',
      'Leap': '🦘'
    }
    return logos[walletName as keyof typeof logos] || '💎'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Éléments de fond décoratifs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary-500/10 rounded-full animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-success-500/10 rounded-full animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CubeIcon className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-gradient">Capsule Network</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-3">Connecter votre Wallet</h1>
          <p className="text-dark-300">
            Choisissez votre wallet préféré pour accéder à vos capsules temporelles
          </p>
        </motion.div>

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-danger-500/10 border border-danger-500/20 rounded-lg flex items-center space-x-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <p className="text-danger-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Liste des wallets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {availableWallets.map((wallet, index) => (
            <motion.button
              key={wallet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              onClick={() => handleConnect(wallet.name as any)}
              disabled={!wallet.isInstalled || isConnecting}
              className={`w-full p-6 rounded-xl border transition-all duration-300 text-left group ${
                wallet.isInstalled
                  ? 'bg-glass border-dark-600 hover:border-primary-500 hover:bg-dark-700 cursor-pointer'
                  : 'bg-dark-800 border-dark-700 opacity-50 cursor-not-allowed'
              } ${
                selectedWallet === wallet.name && isConnecting
                  ? 'border-primary-500 bg-primary-500/10'
                  : ''
              }`}
              whileHover={wallet.isInstalled ? { scale: 1.02 } : {}}
              whileTap={wallet.isInstalled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">
                    {getWalletLogo(wallet.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-gradient transition-all">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
                      {wallet.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {wallet.isInstalled ? (
                    <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
                  )}
                  
                  {selectedWallet === wallet.name.toLowerCase() && isConnecting && (
                    <div className="spinner border-primary-500" />
                  )}
                </div>
              </div>
              
              {!wallet.isInstalled && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                  <p className="text-xs text-warning-400">
                    Extension non installée. Cliquez pour installer.
                  </p>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Section d'aide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card text-center"
        >
          <WalletIcon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <h3 className="font-semibold text-white mb-2">Première fois ?</h3>
          <p className="text-sm text-dark-300 mb-4">
            Nous recommandons Keplr Wallet pour une expérience optimale avec l'écosystème Cosmos.
          </p>
          <Link 
            href="/help/wallets" 
            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            Guide d'installation →
          </Link>
        </motion.div>

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 p-4 bg-success-500/5 border border-success-500/20 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheckIcon className="w-4 h-4 text-success-500" />
            <span className="text-sm font-medium text-success-400">Connexion Sécurisée</span>
          </div>
          <p className="text-xs text-dark-400 leading-relaxed">
            Vos clés privées restent toujours dans votre wallet. 
            Capsule Network ne stocke jamais vos informations sensibles.
          </p>
        </motion.div>

        {/* Retour à l'accueil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link 
            href="/" 
            className="text-dark-400 hover:text-white text-sm transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  )
}