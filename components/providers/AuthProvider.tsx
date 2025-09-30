'use client'

import { useEffect } from 'react'
import { useAuth } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkConnection, initializeWalletManager } = useAuth()

  useEffect(() => {
    // Initialiser le wallet manager au démarrage
    initializeWalletManager()
    
    // Vérifier la connexion existante une seule fois
    const timeoutId = setTimeout(() => {
      checkConnection()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [initializeWalletManager]) // Retirer checkConnection des dépendances

  return <>{children}</>
}