'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  PlusIcon,
  KeyIcon,
  PaperAirplaneIcon,
  DocumentMagnifyingGlassIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline'

export function QuickActions() {
  // Memoize actions to prevent re-creation on every render
  const actions = useMemo(() => [
    {
      title: 'Créer une Capsule',
      description: 'Nouvelle capsule temporelle',
      icon: PlusIcon,
      href: '/capsules/create',
      color: 'bg-primary-600 hover:bg-primary-700',
      iconColor: 'text-white'
    },
    {
      title: 'Ouvrir une Capsule',
      description: 'Déchiffrer avec vos clés',
      icon: KeyIcon,
      href: '/capsules/unlock',
      color: 'bg-success-600 hover:bg-success-700',
      iconColor: 'text-white'
    },
    {
      title: 'Transférer',
      description: 'Envoyer à un autre utilisateur',
      icon: PaperAirplaneIcon,
      href: '/capsules/transfer',
      color: 'bg-secondary-600 hover:bg-secondary-700',
      iconColor: 'text-white'
    },
    {
      title: 'Explorer',
      description: 'Capsules publiques',
      icon: DocumentMagnifyingGlassIcon,
      href: '/explorer',
      color: 'bg-warning-600 hover:bg-warning-700',
      iconColor: 'text-white'
    },
    {
      title: 'Marketplace',
      description: 'Applications & outils',
      icon: PuzzlePieceIcon,
      href: '/marketplace',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'text-white'
    },
    {
      title: 'Paramètres',
      description: 'Configuration du compte',
      icon: CogIcon,
      href: '/settings',
      color: 'bg-dark-600 hover:bg-dark-500',
      iconColor: 'text-dark-300'
    },
    {
      title: 'Aide',
      description: 'Guide & documentation',
      icon: QuestionMarkCircleIcon,
      href: '/help',
      color: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-white'
    }
  ], [])

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-6">Actions Rapides</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layoutId={action.title}
          >
            <Link href={action.href}>
              <motion.div
                className="flex flex-col items-center p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-all duration-200 group cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-3 rounded-full ${action.color} mb-3 transition-colors`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-gradient transition-all text-center">
                  {action.title}
                </span>
                <span className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors text-center mt-1">
                  {action.description}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}