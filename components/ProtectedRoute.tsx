'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ children, redirectTo = '/auth/connect' }: ProtectedRouteProps) {
  const { isAuthenticated, isConnecting, address, walletType } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Attente plus longue pour stabiliser le store et éviter les redirections prématurées
    const timer = setTimeout(() => {
      setIsChecking(false)
      
      // Rediriger uniquement si vraiment aucune session persistée
      if (!isAuthenticated && !isConnecting && !address && !walletType) {
        console.log('Aucune session trouvée, redirection vers:', redirectTo)
        router.push(redirectTo)
      } else if (address && walletType && !isAuthenticated && !isConnecting) {
        console.log('Session persistée trouvée, tentative de reconnexion automatique en cours...')
        // Ne pas rediriger, laisser le store tenter la reconnexion
      }
    }, 1500) // Augmenté à 1.5s pour laisser le temps à la reconnexion automatique

    return () => clearTimeout(timer)
  }, [isAuthenticated, isConnecting, address, walletType, router, redirectTo])

  // Afficher un loader pendant la vérification
  if (isChecking || isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si pas authentifié mais avec session persistée, afficher un loader
  if (!isAuthenticated && (address || walletType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Restauration de session en cours...</p>
        </div>
      </div>
    )
  }

  // Si vraiment pas authentifié et pas de session, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>
}