'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  KeyIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentIcon,
  GlobeAltIcon,
  CloudIcon,
  CubeIcon,
  SparklesIcon,
  LockClosedIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string | JSX.Element
  category: 'general' | 'security' | 'usage' | 'technical'
}

interface GuideSection {
  id: string
  title: string
  icon: any
  content: JSX.Element
}

export default function HelpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'types' | 'security'>('guide')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [activeGuide, setActiveGuide] = useState<string>('getting-started')

  const faqData: FAQItem[] = [
    {
      question: "Qu'est-ce qu'une capsule temporelle ?",
      answer: "Une capsule temporelle est un conteneur numérique sécurisé qui permet de stocker des données (fichiers, messages, documents) de manière chiffrée sur la blockchain. Elle ne peut être ouverte qu'à une date spécifique ou sous certaines conditions prédéfinies.",
      category: 'general'
    },
    {
      question: "Comment créer ma première capsule ?",
      answer: (
        <div className="space-y-2">
          <p>1. Connectez votre wallet Cosmos sur la page de connexion</p>
          <p>2. Allez dans le Dashboard et cliquez sur "Créer une capsule"</p>
          <p>3. Choisissez le type de capsule (TIME_LOCK recommandé pour débuter)</p>
          <p>4. Ajoutez vos fichiers et définissez la date de déverrouillage</p>
          <p>5. Confirmez la transaction sur votre wallet</p>
        </div>
      ),
      category: 'usage'
    },
    {
      question: "Mes données sont-elles vraiment sécurisées ?",
      answer: "Oui, vos données sont chiffrées avec AES-256-GCM avant d'être stockées. Les clés de déchiffrement sont fragmentées en plusieurs parties et distribuées sur le réseau. Sans ces fragments, il est cryptographiquement impossible d'accéder au contenu.",
      category: 'security'
    },
    {
      question: "Que se passe-t-il si je perds mon wallet ?",
      answer: "Si vous perdez l'accès à votre wallet, vous ne pourrez plus gérer vos capsules (transfert, suppression). Cependant, les capsules continueront de fonctionner et se déverrouilleront automatiquement selon leurs conditions. Il est crucial de sauvegarder votre phrase de récupération.",
      category: 'security'
    },
    {
      question: "Puis-je annuler une capsule après sa création ?",
      answer: "Une fois créée et confirmée sur la blockchain, une capsule ne peut plus être annulée. Vous pouvez la supprimer si elle n'est pas encore déverrouillée, ou la transférer à un autre wallet. C'est pourquoi il est important de bien vérifier avant de confirmer.",
      category: 'usage'
    },
    {
      question: "Combien coûte la création d'une capsule ?",
      answer: "Les frais incluent les gas fees de la blockchain Cosmos (très faibles, généralement < 0.01 ATOM) plus les frais de stockage IPFS si applicable. Aucun frais supplémentaire n'est prélevé par l'application.",
      category: 'technical'
    },
    {
      question: "Quelle est la taille maximale d'une capsule ?",
      answer: "Techniquement, il n'y a pas de limite stricte, mais nous recommandons de rester sous 100 MB pour des performances optimales. Pour des fichiers plus volumineux, utilisez le stockage IPFS.",
      category: 'technical'
    },
    {
      question: "Puis-je partager une capsule avec d'autres personnes ?",
      answer: "Oui ! Vous pouvez créer des capsules publiques visibles dans l'explorateur, ou utiliser le système Multi-Sig pour créer des capsules collaboratives nécessitant plusieurs signatures pour s'ouvrir.",
      category: 'usage'
    }
  ]

  const guideSection: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Premiers Pas',
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold text-blue-400">Bienvenue dans Capsule Network</h3>
            </div>
            <p className="text-blue-300">
              Capsule Network vous permet de créer des capsules temporelles numériques sécurisées sur la blockchain Cosmos. 
              Stockez vos souvenirs, documents importants ou messages pour le futur de manière décentralisée et sécurisée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-primary-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">1. Connecter son Wallet</h4>
              <p className="text-dark-300 text-sm">
                Connectez votre wallet Cosmos (Keplr recommandé) pour commencer à créer vos capsules.
              </p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <PlusIcon className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">2. Créer une Capsule</h4>
              <p className="text-dark-300 text-sm">
                Choisissez le type de capsule, ajoutez vos fichiers et définissez les conditions d'ouverture.
              </p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <ClockIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">3. Attendre l'Ouverture</h4>
              <p className="text-dark-300 text-sm">
                Votre capsule se déverrouillera automatiquement selon les conditions définies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-3 text-yellow-400" />
              Conseils pour débuter
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-dark-700/50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Commencez simple</p>
                  <p className="text-dark-300 text-sm">Créez d'abord une capsule TIME_LOCK avec un petit fichier texte pour vous familiariser.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-dark-700/50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Sauvegardez votre phrase de récupération</p>
                  <p className="text-dark-300 text-sm">Sans elle, vous perdrez l'accès à vos capsules en cas de problème avec votre wallet.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-dark-700/50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Testez avec de petites quantités</p>
                  <p className="text-dark-300 text-sm">Les frais de transaction sont minimes, n'hésitez pas à expérimenter.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'creating-capsules',
      title: 'Créer des Capsules',
      icon: PlusIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Guide de création étape par étape</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold text-white mb-2">Étape 1: Choisir le type de capsule</h4>
              <p className="text-dark-300">
                Sélectionnez le type qui correspond à vos besoins. TIME_LOCK est parfait pour les débutants, 
                tandis que CONDITIONAL offre plus de flexibilité pour les utilisateurs avancés.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-white mb-2">Étape 2: Ajouter du contenu</h4>
              <p className="text-dark-300">
                Glissez-déposez vos fichiers ou utilisez le sélecteur. Formats supportés : images, documents, 
                vidéos, archives. Taille recommandée : moins de 100 MB par capsule.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-white mb-2">Étape 3: Configurer les conditions</h4>
              <p className="text-dark-300">
                Définissez quand et comment votre capsule s'ouvrira. Date future pour TIME_LOCK, 
                nombre de signatures pour MULTI_SIG, etc.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-white mb-2">Étape 4: Confirmer et payer</h4>
              <p className="text-dark-300">
                Vérifiez tous les détails et confirmez la transaction dans votre wallet. 
                Une fois confirmée, votre capsule est créée de manière irréversible.
              </p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400">Important</h3>
            </div>
            <p className="text-yellow-300">
              Une fois la transaction confirmée sur la blockchain, votre capsule ne peut plus être modifiée. 
              Vérifiez soigneusement tous les paramètres avant de confirmer.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'managing-capsules',
      title: 'Gérer ses Capsules',
      icon: CogIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Actions disponibles sur vos capsules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <EyeIcon className="w-6 h-6 text-blue-400" />
                <h4 className="font-semibold text-white">Voir les détails</h4>
              </div>
              <p className="text-dark-300 text-sm">
                Consultez toutes les informations de votre capsule : contenu, conditions, historique d'activité.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <KeyIcon className="w-6 h-6 text-green-400" />
                <h4 className="font-semibold text-white">Déverrouiller</h4>
              </div>
              <p className="text-dark-300 text-sm">
                Ouvrez votre capsule si les conditions sont remplies. Le processus est automatique et sécurisé.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <PaperAirplaneIcon className="w-6 h-6 text-purple-400" />
                <h4 className="font-semibold text-white">Transférer</h4>
              </div>
              <p className="text-dark-300 text-sm">
                Transférez la propriété de votre capsule à une autre adresse Cosmos. Action irréversible.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <DocumentArrowDownIcon className="w-6 h-6 text-yellow-400" />
                <h4 className="font-semibold text-white">Télécharger</h4>
              </div>
              <p className="text-dark-300 text-sm">
                Récupérez le contenu des capsules déverrouillées sous forme d'archive ZIP complète.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">États des capsules</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <span className="text-green-400 font-medium">ACTIVE</span>
                  <p className="text-green-300 text-sm">La capsule est créée et en attente de déverrouillage</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div>
                  <span className="text-blue-400 font-medium">UNLOCKED</span>
                  <p className="text-blue-300 text-sm">La capsule est déverrouillée et son contenu est accessible</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div>
                  <span className="text-red-400 font-medium">EXPIRED</span>
                  <p className="text-red-300 text-sm">La capsule a expiré sans être déverrouillée</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div>
                  <span className="text-yellow-400 font-medium">TRANSFERRED</span>
                  <p className="text-yellow-300 text-sm">La capsule a été transférée à un autre propriétaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const capsuleTypes = [
    {
      type: 'TIME_LOCK',
      name: 'Verrouillage Temporel',
      icon: ClockIcon,
      description: 'Se déverrouille automatiquement à une date spécifique',
      color: 'text-blue-400 bg-blue-900/20 border-blue-500/50',
      useCases: ['Messages pour le futur', 'Souvenirs d\'anniversaire', 'Documents à révéler plus tard'],
      example: 'Capsule qui s\'ouvre le 1er janvier 2025 à minuit'
    },
    {
      type: 'SAFE',
      name: 'Coffre-fort',
      icon: ShieldCheckIcon,
      description: 'Accessible immédiatement par le propriétaire',
      color: 'text-green-400 bg-green-900/20 border-green-500/50',
      useCases: ['Stockage sécurisé', 'Backup de documents', 'Archive personnelle'],
      example: 'Capsule pour stocker des mots de passe ou documents importants'
    },
    {
      type: 'CONDITIONAL',
      name: 'Conditionnel',
      icon: KeyIcon,
      description: 'S\'ouvre selon des conditions externes spécifiques',
      color: 'text-purple-400 bg-purple-900/20 border-purple-500/50',
      useCases: ['Événements déclencheurs', 'Conditions complexes', 'Oracles externes'],
      example: 'Capsule qui s\'ouvre quand le Bitcoin atteint 100 000$'
    },
    {
      type: 'MULTI_SIG',
      name: 'Multi-signatures',
      icon: UserGroupIcon,
      description: 'Nécessite plusieurs signatures pour s\'ouvrir',
      color: 'text-orange-400 bg-orange-900/20 border-orange-500/50',
      useCases: ['Projets collaboratifs', 'Héritage numérique', 'Décisions de groupe'],
      example: 'Capsule nécessitant 3 signatures sur 5 pour s\'ouvrir'
    },
    {
      type: 'DEAD_MANS_SWITCH',
      name: 'Homme Mort',
      icon: HeartIcon,
      description: 'S\'ouvre si le propriétaire devient inactif',
      color: 'text-red-400 bg-red-900/20 border-red-500/50',
      useCases: ['Testament numérique', 'Héritage automatique', 'Messages posthumes'],
      example: 'Capsule qui s\'ouvre si aucune activité pendant 1 an'
    }
  ]

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const filteredFAQs = activeTab === 'faq' ? faqData : []

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative">
        <StarryBackground starCount={200} enableShootingStars={true} />
        
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
                  <QuestionMarkCircleIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Centre d'Aide</span>
                </div>

                <div className="w-24"></div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-6">
                <BookOpenIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Guide d'Utilisation
              </h1>
              <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                Découvrez comment utiliser Capsule Network pour créer et gérer vos capsules temporelles sur la blockchain Cosmos.
              </p>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-wrap justify-center space-x-2 bg-dark-800/50 rounded-2xl p-2">
                {[
                  { key: 'guide', label: 'Guide', icon: BookOpenIcon },
                  { key: 'types', label: 'Types de Capsules', icon: CubeIcon },
                  { key: 'security', label: 'Sécurité', icon: ShieldCheckIcon },
                  { key: 'faq', label: 'FAQ', icon: QuestionMarkCircleIcon }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-3 px-6 rounded-xl transition-all duration-200 ${
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

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'guide' && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                >
                  {/* Guide Navigation */}
                  <div className="space-y-2">
                    {guideSection.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveGuide(section.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          activeGuide === section.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-800/50 text-dark-300 hover:text-white hover:bg-dark-700'
                        }`}
                      >
                        <section.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{section.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Guide Content */}
                  <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                      {guideSection.map((section) => (
                        activeGuide === section.id && (
                          <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="card"
                          >
                            <div className="flex items-center space-x-3 mb-6">
                              <section.icon className="w-8 h-8 text-primary-400" />
                              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                            </div>
                            {section.content}
                          </motion.div>
                        )
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {activeTab === 'types' && (
                <motion.div
                  key="types"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Types de Capsules Disponibles</h2>
                    <p className="text-dark-300">
                      Chaque type de capsule répond à des besoins spécifiques. Choisissez celui qui correspond le mieux à votre usage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capsuleTypes.map((capsuleType) => (
                      <motion.div
                        key={capsuleType.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className={`p-6 rounded-2xl border ${capsuleType.color} transition-all duration-300`}
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`p-2 rounded-lg ${capsuleType.color.split(' ').slice(1).join(' ')}`}>
                            <capsuleType.icon className={`w-6 h-6 ${capsuleType.color.split(' ')[0]}`} />
                          </div>
                          <h3 className="font-semibold text-white">{capsuleType.name}</h3>
                        </div>

                        <p className="text-dark-300 mb-4">{capsuleType.description}</p>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Cas d'usage :</h4>
                            <ul className="space-y-1">
                              {capsuleType.useCases.map((useCase, index) => (
                                <li key={index} className="text-sm text-dark-400 flex items-center">
                                  <div className="w-1 h-1 bg-dark-500 rounded-full mr-2 flex-shrink-0"></div>
                                  {useCase}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-3 border-t border-dark-600">
                            <p className="text-xs text-dark-500">
                              <span className="font-medium">Exemple :</span> {capsuleType.example}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Sécurité et Chiffrement</h2>
                    <p className="text-dark-300">
                      Comprendre comment vos données sont protégées dans Capsule Network.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <LockClosedIcon className="w-6 h-6 mr-3 text-green-500" />
                        Chiffrement des Données
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-green-400 mb-2">AES-256-GCM</h4>
                          <p className="text-green-300 text-sm">
                            Vos fichiers sont chiffrés avec l'algorithme AES-256-GCM, standard militaire 
                            utilisé par les gouvernements et institutions financières.
                          </p>
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-400 mb-2">Clés Uniques</h4>
                          <p className="text-blue-300 text-sm">
                            Chaque capsule utilise une clé de chiffrement unique générée aléatoirement, 
                            garantissant qu'aucune capsule ne peut être compromise par une autre.
                          </p>
                        </div>
                        
                        <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-purple-400 mb-2">Shamir Secret Sharing</h4>
                          <p className="text-purple-300 text-sm">
                            Les clés sont fragmentées en plusieurs parts distribuées sur le réseau. 
                            Seule la combinaison des fragments permet le déchiffrement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <ShieldCheckIcon className="w-6 h-6 mr-3 text-blue-500" />
                        Protection de la Blockchain
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-cyan-900/20 border border-cyan-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-cyan-400 mb-2">Immutabilité</h4>
                          <p className="text-cyan-300 text-sm">
                            Une fois créée sur la blockchain Cosmos, votre capsule ne peut plus être 
                            modifiée ou supprimée par des tiers.
                          </p>
                        </div>
                        
                        <div className="bg-indigo-900/20 border border-indigo-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-indigo-400 mb-2">Décentralisation</h4>
                          <p className="text-indigo-300 text-sm">
                            Vos capsules existent sur un réseau décentralisé de validateurs, 
                            éliminant les points de défaillance uniques.
                          </p>
                        </div>
                        
                        <div className="bg-teal-900/20 border border-teal-500/50 rounded-lg p-4">
                          <h4 className="font-medium text-teal-400 mb-2">Consensus Byzantin</h4>
                          <p className="text-teal-300 text-sm">
                            Le consensus Tendermint garantit que vos capsules fonctionnent correctement 
                            même si jusqu'à 1/3 des validateurs sont malveillants.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                      <h3 className="font-semibold text-yellow-400">Bonnes Pratiques de Sécurité</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-yellow-300 font-medium">À faire :</p>
                        <ul className="space-y-1 text-yellow-300 text-sm">
                          <li>• Sauvegarder votre phrase de récupération</li>
                          <li>• Utiliser un wallet sécurisé (Keplr)</li>
                          <li>• Vérifier les adresses avant transfert</li>
                          <li>• Tester avec de petites capsules d'abord</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-yellow-300 font-medium">À éviter :</p>
                        <ul className="space-y-1 text-yellow-300 text-sm">
                          <li>• Partager vos clés privées</li>
                          <li>• Utiliser des réseaux WiFi publics</li>
                          <li>• Stocker des informations ultra-sensibles</li>
                          <li>• Ignorer les avertissements de sécurité</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'faq' && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Questions Fréquentes</h2>
                    <p className="text-dark-300">
                      Trouvez rapidement des réponses aux questions les plus courantes.
                    </p>
                  </div>

                  {faqData.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-dark-600 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-700/50 transition-colors text-left"
                      >
                        <span className="font-medium text-white">{faq.question}</span>
                        <motion.div
                          animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDownIcon className="w-5 h-5 text-dark-400" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedFAQ === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-dark-900/50 border-t border-dark-600">
                              <div className="text-dark-300">
                                {typeof faq.answer === 'string' ? (
                                  <p>{faq.answer}</p>
                                ) : (
                                  faq.answer
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}