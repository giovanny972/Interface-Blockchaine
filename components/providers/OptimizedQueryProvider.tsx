'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

// Configuration optimisée du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimisations pour la performance
      staleTime: 5 * 60 * 1000, // 5 minutes - données considérées comme fraîches
      cacheTime: 10 * 60 * 1000, // 10 minutes - garde en cache
      retry: false, // Pas de retry automatique pour éviter les latences
      refetchOnWindowFocus: false, // Éviter les requêtes inutiles
      refetchOnMount: false, // Éviter les requêtes au montage si les données sont fraîches
      refetchOnReconnect: false, // Éviter les requêtes lors de la reconnexion
      // Utiliser les données en cache si disponibles
      notifyOnChangeProps: 'tracked', // Optimisation des re-renders
    },
    mutations: {
      retry: false, // Pas de retry automatique pour les mutations
    },
  },
})

// Préchargement des requêtes critiques
queryClient.prefetchQuery(['userCapsules'], () => Promise.resolve(null))
queryClient.prefetchQuery(['stats'], () => Promise.resolve(null))

interface OptimizedQueryProviderProps {
  children: ReactNode
}

export function OptimizedQueryProvider({ children }: OptimizedQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default OptimizedQueryProvider