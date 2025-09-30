'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/authStore'
import { 
  CubeIcon, 
  WalletIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface WalletInfo {
  name: string
  logo: string
  description: string
  isInstalled: boolean
}

export default function WalletConnectorClient() {
  const { connect, isConnecting, error, isAuthenticated, walletManager } = useAuth()
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }

    const loadWallets = async () => {
      if (!walletManager) return

      try {
        const wallets = await walletManager.getAvailableWallets()
        setAvailableWallets(wallets)
      } catch (err) {
        console.error('Erreur lors du chargement des wallets:', err)
      }
    }
    
    loadWallets()
  }, [isAuthenticated, walletManager, router])

  const handleConnect = async (walletType: 'keplr' | 'cosmostation' | 'leap') => {
    setSelectedWallet(walletType)
    
    try {
      console.log('Tentative de connexion avec:', walletType)
      await connect(walletType)
      console.log('Connexion réussie avec:', walletType)
      toast.success(`Connecté avec ${walletType} !`)
      
      // Attendre un peu pour que l'état se mette à jour
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
    return logos[walletName as keyof typeof logos] || '💼'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <CubeIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Connexion Wallet
          </h1>
          <p className="text-slate-400">
            Connectez votre wallet pour accéder à Capsule Network
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Wallet List */}
        <div className="space-y-3 mb-8">
          {availableWallets.map((wallet, index) => (
            <motion.button
              key={wallet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              onClick={() => handleConnect(wallet.name.toLowerCase() as any)}
              disabled={!wallet.isInstalled || isConnecting}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                wallet.isInstalled
                  ? 'border-slate-700 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-700/50'
                  : 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed'
              } ${
                selectedWallet === wallet.name.toLowerCase()
                  ? 'border-blue-500 bg-blue-500/10'
                  : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {getWalletLogo(wallet.name)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">
                      {wallet.name}
                    </h3>
                    {wallet.isInstalled ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {wallet.isInstalled ? wallet.description : 'Non installé'}
                  </p>
                </div>

                {selectedWallet === wallet.name.toLowerCase() && isConnecting && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">
                Connexion sécurisée
              </h4>
              <p className="text-sm text-slate-400">
                Vos clés privées restent en sécurité dans votre wallet. 
                Capsule Network ne peut pas y accéder.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}