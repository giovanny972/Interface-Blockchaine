'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/stores/authStore'
import { useQuery } from 'react-query'
import { 
  CubeIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ShieldExclamationIcon,
  ServerIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

// Simuler des données admin
const mockAdminStats = {
  totalUsers: 1247,
  activeCapsules: 8934,
  totalTransactions: 45623,
  networkHealth: 'healthy' as const,
  ipfsNodes: 15,
  avgBlockTime: 6.2
}

const mockRecentActivity = [
  {
    id: '1',
    user: 'cosmos1abc...def123',
    action: 'Capsule créée',
    resource: 'Capsule #12456',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    details: 'Type: TIME_LOCK, Taille: 2.5MB'
  },
  {
    id: '2', 
    user: 'cosmos1xyz...789',
    action: 'Capsule débloquée',
    resource: 'Capsule #12455',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    details: 'Déchiffrement réussi'
  },
  {
    id: '3',
    user: 'cosmos1qwe...456',
    action: 'Transfert initié',
    resource: 'Capsule #12454',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    details: 'Vers: cosmos1rty...890'
  }
]

const mockSystemHealth = {
  blockchain: { status: 'online', blockHeight: 1234567, latency: 45 },
  ipfs: { status: 'online', nodesConnected: 15, latency: 120 },
  api: { status: 'online', responseTime: 85 }
}

export default function AdminPage() {
  const { isAuthenticated, address } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'capsules' | 'users' | 'system' | 'logs'>('overview')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Vérifier les droits admin (simulé)
    // En pratique, cela devrait être vérifié côté serveur
    const checkAdminRights = async () => {
      if (!isAuthenticated) {
        window.location.href = '/auth/connect'
        return
      }
      
      // Simuler une vérification admin (à remplacer par une vraie vérification)
      const adminAddresses = [
        'cosmos1admin...', // Remplacer par de vraies adresses admin
      ]
      
      if (!adminAddresses.some(admin => address.startsWith('cosmos1'))) {
        // En réalité, vous feriez une vraie vérification
        setIsAdmin(true) // Temporaire pour la démo
      } else {
        setIsAdmin(true)
      }
    }

    checkAdminRights()
  }, [isAuthenticated, address])

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `Il y a ${minutes} min`
    return `Il y a ${hours}h`
  }

  const getHealthBadge = (status: string) => {
    const colors = {
      online: 'bg-success-500/20 text-success-500 border-success-500/30',
      degraded: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
      offline: 'bg-danger-500/20 text-danger-500 border-danger-500/30'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.offline}`}>
        {status === 'online' ? '🟢 En ligne' : status === 'degraded' ? '🟡 Dégradé' : '🔴 Hors ligne'}
      </span>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldExclamationIcon className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-dark-300 mb-6">Vous n'avez pas les droits administrateur requis.</p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 bg-glass border-b border-danger-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-danger-500 to-warning-500 rounded-lg flex items-center justify-center">
                <ShieldExclamationIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Administration</h1>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-dark-300">Super Administrateur</p>
              <p className="font-mono text-sm text-danger-400">{address.slice(0, 12)}...</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
              { key: 'capsules', label: 'Capsules', icon: CubeIcon },
              { key: 'users', label: 'Utilisateurs', icon: UserGroupIcon },
              { key: 'system', label: 'Système', icon: ServerIcon },
              { key: 'logs', label: 'Logs', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-danger-600 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu selon l'onglet actif */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Utilisateurs Totaux', value: mockAdminStats.totalUsers.toLocaleString(), icon: UserGroupIcon, color: 'text-primary-500' },
                  { title: 'Capsules Actives', value: mockAdminStats.activeCapsules.toLocaleString(), icon: CubeIcon, color: 'text-success-500' },
                  { title: 'Transactions', value: mockAdminStats.totalTransactions.toLocaleString(), icon: ChartBarIcon, color: 'text-warning-500' },
                  { title: 'Nœuds IPFS', value: mockAdminStats.ipfsNodes.toString(), icon: ServerIcon, color: 'text-secondary-500' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-dark-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* État du système */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">État du Système</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { service: 'Blockchain', ...mockSystemHealth.blockchain },
                    { service: 'IPFS', ...mockSystemHealth.ipfs },
                    { service: 'API', ...mockSystemHealth.api }
                  ].map((service, index) => (
                    <div key={index} className="bg-dark-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{service.service}</h4>
                        {getHealthBadge(service.status)}
                      </div>
                      <div className="space-y-1 text-sm text-dark-400">
                        {'blockHeight' in service && <p>Bloc: {service.blockHeight?.toLocaleString()}</p>}
                        {'nodesConnected' in service && <p>Nœuds: {service.nodesConnected}</p>}
                        <p>Latence: {'latency' in service ? service.latency : service.responseTime}ms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité récente */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Activité Récente</h3>
                  <button className="text-danger-400 hover:text-danger-300 text-sm font-medium">
                    Voir tout
                  </button>
                </div>
                <div className="space-y-3">
                  {mockRecentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-dark-800 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{activity.action}</span>
                          <span className="text-primary-400">{activity.resource}</span>
                        </div>
                        <div className="text-sm text-dark-400">
                          {activity.user} • {activity.details}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-dark-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Configuration Système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Seuil de stockage IPFS (MB)
                      </label>
                      <input 
                        type="number" 
                        defaultValue="1" 
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Taille maximale de capsule (MB)
                      </label>
                      <input 
                        type="number" 
                        defaultValue="100" 
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Frais de transaction (ucapsule)
                      </label>
                      <input 
                        type="number" 
                        defaultValue="5000" 
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Timeout IPFS (secondes)
                      </label>
                      <input 
                        type="number" 
                        defaultValue="30" 
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <button className="btn-primary mr-4">
                    Sauvegarder
                  </button>
                  <button className="btn-outline">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Autres onglets seraient implémentés de manière similaire */}
          {activeTab !== 'overview' && activeTab !== 'system' && (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CubeIcon className="w-8 h-8 text-dark-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Section {activeTab} en développement
              </h3>
              <p className="text-dark-400">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}