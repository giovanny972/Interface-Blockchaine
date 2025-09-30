'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/stores/authStore'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

type Theme = 'dark' | 'light' | 'system'
type Language = 'fr' | 'en' | 'es'

interface UserSettings {
  theme: Theme
  language: Language
  notifications: {
    email: boolean
    push: boolean
    capsuleUnlock: boolean
    transfer: boolean
    beforeUnlock: boolean
    advanceNotificationDays: number
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
    allowPublicCapsules: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'security'>('general')
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'fr',
    notifications: {
      email: true,
      push: true,
      capsuleUnlock: true,
      transfer: true,
      beforeUnlock: true,
      advanceNotificationDays: 3
    },
    privacy: {
      showProfile: true,
      showActivity: false,
      allowPublicCapsules: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('capsule-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...settings, ...parsed })
      } catch (error) {
        console.warn('Erreur lors du chargement des paramètres:', error)
      }
    }
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Sauvegarder en local
      localStorage.setItem('capsule-settings', JSON.stringify(settings))
      
      toast.success('Paramètres sauvegardés avec succès!')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres')
      console.error('Erreur sauvegarde paramètres:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const generateApiKey = () => {
    const apiKey = 'cap_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('capsule-api-key', apiKey)
    toast.success('Nouvelle clé API générée!')
  }

  const copyApiKey = () => {
    const apiKey = localStorage.getItem('capsule-api-key') || 'Aucune clé générée'
    navigator.clipboard.writeText(apiKey)
    toast.success('Clé API copiée!')
  }

  const clearData = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données locales ? Cette action est irréversible.')) {
      localStorage.clear()
      toast.success('Données locales effacées')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const tabs = [
    { key: 'general', label: 'Général', icon: CogIcon },
    { key: 'notifications', label: 'Notifications', icon: BellIcon },
    { key: 'privacy', label: 'Confidentialité', icon: ShieldCheckIcon },
    { key: 'security', label: 'Sécurité', icon: KeyIcon }
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative">
        <StarryBackground starCount={300} enableShootingStars={true} enableNebula={true} />
        
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-glass border-b border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Dashboard
                </button>
                
                <div className="flex items-center gap-3">
                  <CogIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Paramètres</span>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8"
            >
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
                  <p className="text-dark-400 font-mono text-sm">
                    {address?.slice(0, 12)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex space-x-1 bg-dark-800/50 rounded-2xl p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Thème */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <PaintBrushIcon className="w-6 h-6 mr-3 text-purple-400" />
                      Apparence
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-3">
                          Thème
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'dark', label: 'Sombre', icon: MoonIcon },
                            { key: 'light', label: 'Clair', icon: SunIcon },
                            { key: 'system', label: 'Système', icon: ComputerDesktopIcon }
                          ].map((theme) => (
                            <motion.button
                              key={theme.key}
                              onClick={() => updateSettings('theme' as any, 'theme', theme.key)}
                              className={`flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all ${
                                settings.theme === theme.key
                                  ? 'border-primary-500 bg-primary-500/10'
                                  : 'border-dark-600 hover:border-dark-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <theme.icon className="w-5 h-5" />
                              <span className="text-sm font-medium text-white">{theme.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-3">
                          Langue
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSettings('language' as any, 'language', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                        >
                          <option value="fr">🇫🇷 Français</option>
                          <option value="en">🇺🇸 English</option>
                          <option value="es">🇪🇸 Español</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <KeyIcon className="w-6 h-6 mr-3 text-yellow-400" />
                      Clé API
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-dark-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-dark-300">Clé API personnelle</span>
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-dark-400 hover:text-white transition-colors"
                          >
                            {showApiKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="font-mono text-sm text-white bg-dark-800 rounded px-3 py-2">
                          {showApiKey 
                            ? localStorage.getItem('capsule-api-key') || 'Aucune clé générée'
                            : '••••••••••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={generateApiKey}
                          className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors"
                        >
                          Générer nouvelle clé
                        </button>
                        <button
                          onClick={copyApiKey}
                          className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <BellIcon className="w-6 h-6 mr-3 text-blue-400" />
                    Préférences de notification
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div>
                        <p className="font-medium text-white">Notifications email</p>
                        <p className="text-sm text-dark-400">Recevoir des emails pour les événements importants</p>
                      </div>
                      <button
                        onClick={() => updateSettings('notifications', 'email', !settings.notifications.email)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.email ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div>
                        <p className="font-medium text-white">Notifications push</p>
                        <p className="text-sm text-dark-400">Notifications dans le navigateur</p>
                      </div>
                      <button
                        onClick={() => updateSettings('notifications', 'push', !settings.notifications.push)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.push ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div>
                        <p className="font-medium text-white">Déverrouillage de capsule</p>
                        <p className="text-sm text-dark-400">Notifier quand une capsule est déverrouillée</p>
                      </div>
                      <button
                        onClick={() => updateSettings('notifications', 'capsuleUnlock', !settings.notifications.capsuleUnlock)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.capsuleUnlock ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.capsuleUnlock ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Notification avant déverrouillage (jours)
                      </label>
                      <select
                        value={settings.notifications.advanceNotificationDays}
                        onChange={(e) => updateSettings('notifications', 'advanceNotificationDays', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                      >
                        <option value={1}>1 jour</option>
                        <option value={3}>3 jours</option>
                        <option value={7}>7 jours</option>
                        <option value={14}>14 jours</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <ShieldCheckIcon className="w-6 h-6 mr-3 text-green-400" />
                    Confidentialité
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div>
                        <p className="font-medium text-white">Profil public</p>
                        <p className="text-sm text-dark-400">Permettre aux autres de voir votre profil</p>
                      </div>
                      <button
                        onClick={() => updateSettings('privacy', 'showProfile', !settings.privacy.showProfile)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.showProfile ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy.showProfile ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div>
                        <p className="font-medium text-white">Activité visible</p>
                        <p className="text-sm text-dark-400">Afficher votre activité récente</p>
                      </div>
                      <button
                        onClick={() => updateSettings('privacy', 'showActivity', !settings.privacy.showActivity)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.showActivity ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-white">Capsules publiques</p>
                        <p className="text-sm text-dark-400">Autoriser la création de capsules publiques</p>
                      </div>
                      <button
                        onClick={() => updateSettings('privacy', 'allowPublicCapsules', !settings.privacy.allowPublicCapsules)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.allowPublicCapsules ? 'bg-primary-600' : 'bg-dark-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy.allowPublicCapsules ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="card">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <KeyIcon className="w-6 h-6 mr-3 text-red-400" />
                      Sécurité
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-3 border-b border-dark-700">
                        <div>
                          <p className="font-medium text-white">Authentification à deux facteurs</p>
                          <p className="text-sm text-dark-400">Sécuriser votre compte avec un second facteur</p>
                        </div>
                        <button
                          onClick={() => updateSettings('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.security.twoFactorEnabled ? 'bg-primary-600' : 'bg-dark-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Délai d'expiration de session (minutes)
                        </label>
                        <select
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 heure</option>
                          <option value={240}>4 heures</option>
                          <option value={0}>Jamais</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Zone de danger */}
                  <div className="card border-red-600/50 bg-red-900/10">
                    <h3 className="text-xl font-semibold text-red-400 mb-6 flex items-center">
                      <TrashIcon className="w-6 h-6 mr-3" />
                      Zone de danger
                    </h3>
                    
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-300">
                          <p className="font-medium mb-2">Effacer toutes les données</p>
                          <p className="mb-4">Cette action supprimera définitivement toutes vos données locales, paramètres et capsules stockées. Cette opération ne peut pas être annulée.</p>
                          <button
                            onClick={clearData}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                          >
                            Effacer toutes les données
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}