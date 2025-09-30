'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  BookOpenIcon, 
  CogIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MapIcon,
  UsersIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

const documentSections = [
  {
    id: 'executive-summary',
    title: 'Résumé Exécutif',
    description: 'Vue d\'ensemble du projet Capsule Network',
    icon: DocumentTextIcon,
    href: '/docs/whitepaper#résumé-exécutif'
  },
  {
    id: 'architecture',
    title: 'Architecture Technique',
    description: 'Détails de l\'implémentation blockchain et composants',
    icon: CogIcon,
    href: '/docs/whitepaper#architecture-technique'
  },
  {
    id: 'token',
    title: 'Token MTQ',
    description: 'Économie et utilités du token TimeLoke',
    icon: CurrencyDollarIcon,
    href: '/docs/whitepaper#token-timeloke-mtq'
  },
  {
    id: 'security',
    title: 'Sécurité & Cryptographie',
    description: 'Chiffrement AES-256 et Shamir Secret Sharing',
    icon: ShieldCheckIcon,
    href: '/docs/whitepaper#sécurité-et-cryptographie'
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    description: 'Plan de développement et phases du projet',
    icon: MapIcon,
    href: '/docs/whitepaper#roadmap-et-développement'
  },
  {
    id: 'ecosystem',
    title: 'Écosystème & Cas d\'Usage',
    description: 'Applications pratiques et secteurs d\'application',
    icon: UsersIcon,
    href: '/docs/whitepaper#écosystème-et-cas-dusage'
  }
]

const externalLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/capsule-network',
    description: 'Code source et contributions'
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/capsule',
    description: 'Communauté et support'
  },
  {
    name: 'Telegram',
    url: 'https://t.me/capsule_network',
    description: 'Annonces et discussions'
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <BookOpenIcon className="w-10 h-10 text-primary-400" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Documentation
            <span className="text-primary-400 ml-3">Capsule Network</span>
          </h1>
          
          <p className="text-xl text-dark-300 max-w-3xl mx-auto leading-relaxed">
            Découvrez l'architecture, la vision et les détails techniques de la première blockchain 
            dédiée au stockage temporel sécurisé de données sensibles.
          </p>
        </motion.div>

        {/* Main Documentation Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            📖 Livre Blanc
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link 
                  href={section.href}
                  className="block group"
                >
                  <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-6 hover:border-primary-500/50 hover:bg-dark-700/50 transition-all duration-300 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-500/20 transition-all duration-300">
                        <section.icon className="w-6 h-6 text-primary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors duration-300">
                        {section.title}
                      </h3>
                    </div>
                    
                    <p className="text-dark-400 text-sm leading-relaxed">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center mt-4 text-primary-400 group-hover:text-primary-300 transition-colors duration-300">
                      <span className="text-sm font-medium">Lire la section</span>
                      <LinkIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technologies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <div className="bg-dark-800/30 border border-dark-600 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🚀 Stack Technologique
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary-300">Frontend</h3>
                <div className="space-y-2 text-sm text-dark-300">
                  <div>Next.js 14 + TypeScript</div>
                  <div>Tailwind CSS + Framer Motion</div>
                  <div>Zustand + React Query</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary-300">Blockchain</h3>
                <div className="space-y-2 text-sm text-dark-300">
                  <div>Cosmos SDK + CometBFT</div>
                  <div>CosmJS + Keplr</div>
                  <div>IPFS + Smart Contracts</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary-300">Sécurité</h3>
                <div className="space-y-2 text-sm text-dark-300">
                  <div>AES-256-GCM</div>
                  <div>Shamir Secret Sharing</div>
                  <div>Byzantine Fault Tolerance</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* External Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            🔗 Liens & Communauté
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {externalLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="bg-dark-800/50 border border-dark-600 rounded-2xl p-6 text-center hover:border-primary-500/50 hover:bg-dark-700/50 transition-all duration-300 group"
              >
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">
                  {link.name}
                </h3>
                <p className="text-dark-400 text-sm">
                  {link.description}
                </p>
                <div className="flex items-center justify-center mt-4 text-primary-400 group-hover:text-primary-300 transition-colors duration-300">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Visiter</span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Access to Whitepaper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Link
            href="/docs/whitepaper"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary-500/25"
          >
            <BookOpenIcon className="w-5 h-5 mr-3" />
            Lire le Livre Blanc Complet
            <LinkIcon className="w-4 h-4 ml-3" />
          </Link>
          
          <p className="text-dark-400 text-sm mt-4">
            Document complet de 50+ pages • Mis à jour en Janvier 2025
          </p>
        </motion.div>
      </div>
    </div>
  )
}