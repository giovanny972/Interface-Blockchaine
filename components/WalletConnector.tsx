'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Ce composant sera chargé côté client uniquement
const WalletConnectorClient = dynamic(
  () => import('./WalletConnectorClient'),
  { 
    ssr: false,
    loading: () => <div>Chargement des wallets...</div>
  }
)

export default function WalletConnector() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Chargement des wallets...</div>
  }

  return <WalletConnectorClient />
}