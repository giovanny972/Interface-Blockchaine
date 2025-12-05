'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/stores/authStore'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export function FaucetButton() {
  const { address, needsFunding, updateBalance } = useAuth()
  const [requesting, setRequesting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Ne pas afficher si le compte n'a pas besoin de financement
  if (!needsFunding || !address) return null

  const requestTokens = async () => {
    setRequesting(true)

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`🎉 ${data.amount} envoyés avec succès!`)
        setSuccess(true)

        // Rafraîchir le solde après 3 secondes
        setTimeout(() => {
          updateBalance()
        }, 3000)
      } else {
        toast.error(data.error || 'Erreur lors de la demande de tokens')
      }
    } catch (err: any) {
      console.error('Faucet error:', err)
      toast.error('Erreur de connexion au faucet')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <AnimatePresence>
      {!success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 backdrop-blur-sm">
            {/* Effet de brillance animé */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            <div className="relative p-6">
              <div className="flex items-start gap-4">
                {/* Icône */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="flex-shrink-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-yellow-100">
                      🆕 Nouveau compte détecté
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-200 rounded-full">
                      Gratuit
                    </span>
                  </div>

                  <p className="text-sm text-yellow-100/80 mb-4">
                    Obtenez des tokens CAPS gratuits pour commencer à utiliser Capsule Network et créer vos premières capsules temporelles.
                  </p>

                  {/* Informations */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-yellow-200/60">
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>5 CAPS gratuits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Instantané</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Une fois par compte</span>
                    </div>
                  </div>

                  {/* Bouton */}
                  <button
                    onClick={requestTokens}
                    disabled={requesting}
                    className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {requesting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Obtenir 5 CAPS gratuits</span>
                        </>
                      )}
                    </span>

                    {/* Effet hover */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </div>
              </div>

              {/* Note de sécurité */}
              <div className="mt-4 pt-4 border-t border-yellow-500/20">
                <p className="text-xs text-yellow-200/60 flex items-start gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Ces tokens sont destinés aux tests et à la découverte de la plateforme.
                    Utilisez-les pour créer vos premières capsules et explorer les fonctionnalités.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Message de succès */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-100 mb-1">
                  ✅ Tokens reçus avec succès!
                </h3>
                <p className="text-sm text-green-100/80">
                  Votre compte a été crédité de 5 CAPS. Vous pouvez maintenant créer vos premières capsules!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
