'use client'

import { useEffect } from 'react'

export default function KeplrScript() {
  useEffect(() => {
    // Check if Keplr is already available
    if (typeof window !== 'undefined' && window.keplr) {
      console.log('Keplr wallet already available')
      return
    }

    // Initialize Keplr detection
    const initializeKeplr = () => {
      if (window.keplr) {
        console.log('Keplr wallet detected and ready')
      } else {
        console.log('Keplr wallet not found. Please install Keplr extension.')
      }
    }

    // Wait for Keplr to load or initialize immediately if already available
    if (document.readyState === 'complete') {
      initializeKeplr()
    } else {
      window.addEventListener('load', initializeKeplr)
    }

    // Listen for Keplr events
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Keplr keystore changed')
    })

    return () => {
      window.removeEventListener('load', initializeKeplr)
      window.removeEventListener('keplr_keystorechange', () => {})
    }
  }, [])

  return null
}

