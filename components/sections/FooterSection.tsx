'use client'

import Link from 'next/link'
import { CubeIcon } from '@heroicons/react/24/outline'

export default function FooterSection() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-900 border-t border-dark-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">Capsule Network</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-dark-400">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/help" className="hover:text-white transition-colors">Support</Link>
            <Link href="#security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/explorer" className="hover:text-white transition-colors">Explorer</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-dark-800 text-center text-sm text-dark-500">
          © 2025 Capsule Network. Propulsé par Cosmos SDK & IPFS. Construit avec ❤️ pour la communauté Web3.
        </div>
      </div>
    </footer>
  )
}