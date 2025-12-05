'use client'

import { useEffect, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/stores/authStore'
import Navigation from '@/components/Navigation'
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  KeyIcon, 
  CubeIcon,
  ArrowRightIcon,
  SparklesIcon,
  LockClosedIcon,
  GlobeAltIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  StarIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BeakerIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  ServerIcon,
  CloudIcon,
  FireIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  LinkIcon,
  PuzzlePieceIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

// Lazy load heavy sections
const ValidatorSection = lazy(() => import('@/components/sections/ValidatorSection'))
const FooterSection = lazy(() => import('@/components/sections/FooterSection'))

export default function HomePage() {
  const { initializeWalletManager, isAuthenticated } = useAuth()

  useEffect(() => {
    initializeWalletManager()
  }, [initializeWalletManager])

  // Memoized feature data to prevent re-renders
  const features = useMemo(() => [
    {
      icon: ShieldCheckIcon,
      title: "Sécurité Militaire",
      description: "Chiffrement AES-256-GCM avec Shamir Secret Sharing pour une sécurité inégalée. Vos données sont protégées par les mêmes standards que les gouvernements.",
      color: "text-success-500"
    },
    {
      icon: ClockIcon,
      title: "Déclenchement Temporel",
      description: "Programmez l'ouverture de vos capsules à une date précise ou selon des conditions complexes. Perfect pour les testaments, messages différés ou contrats intelligents.",
      color: "text-primary-500"
    },
    {
      icon: KeyIcon,
      title: "Contrôle Granulaire",
      description: "5 types de capsules : Coffre-fort, Verrouillage temporel, Conditionnel, Multi-signatures et Dead Man's Switch. Chaque besoin a sa solution.",
      color: "text-warning-500"
    },
    {
      icon: GlobeAltIcon,
      title: "Stockage Hybride",
      description: "Petits fichiers sur blockchain pour la rapidité, gros fichiers sur IPFS pour l'économie. Le meilleur des deux mondes automatiquement.",
      color: "text-secondary-500"
    },
    {
      icon: LockClosedIcon,
      title: "Zero-Knowledge",
      description: "Nous ne pouvons pas voir le contenu de vos capsules. Seules les clés détenues par les masternodes permettent le déchiffrement.",
      color: "text-danger-500"
    },
    {
      icon: TrophyIcon,
      title: "Cosmos SDK",
      description: "Bâti sur l'écosystème Cosmos pour une interopérabilité maximale et des performances de niveau entreprise avec CometBFT.",
      color: "text-primary-400"
    }
  ], [])

  // Memoized how-it-works steps to prevent re-renders
  const steps = useMemo(() => [
    {
      step: "01",
      title: "Créer",
      description: "Uploadez vos données, choisissez le type de capsule et définissez les conditions d'ouverture.",
      icon: SparklesIcon
    },
    {
      step: "02", 
      title: "Chiffrer",
      description: "Vos données sont chiffrées avec AES-256-GCM. La clé est divisée en parts distribuées aux masternodes.",
      icon: LockClosedIcon
    },
    {
      step: "03",
      title: "Stocker", 
      description: "Stockage intelligent : blockchain pour les petits fichiers, IPFS pour les gros. Optimisé automatiquement.",
      icon: CubeIcon
    },
    {
      step: "04",
      title: "Déclencher",
      description: "Quand les conditions sont remplies, les parts de clé sont rassemblées pour décrypter vos données.",
      icon: KeyIcon
    }
  ], [])

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient-crypto">Révolutionnez</span>
                <br />
                <span className="text-white">le Stockage de Données Temporelles</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-dark-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Sirius Network est la première blockchain spécialisée dans les <strong className="text-gradient">capsules temporelles numériques</strong>. 
              Construite sur Cosmos SDK avec le token natif <strong className="text-primary-400">TimeLoke (MTQ)</strong>, elle offre un chiffrement militaire AES-256-GCM 
              et des mécanismes de déclenchement programmables pour vos données les plus sensibles.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary group whitespace-nowrap flex items-center justify-center">
                  Accéder au Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link href="/auth/connect" className="btn-primary group whitespace-nowrap flex items-center justify-center">
                  Commencer maintenant
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link href="#demo" className="btn-outline whitespace-nowrap">
                Voir la démo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-2">1B</div>
                <div className="text-dark-400">Supply Total MTQ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-2">21</div>
                <div className="text-dark-400">Validateurs Principal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-2">6s</div>
                <div className="text-dark-400">Temps de bloc</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary-500/10 rounded-full animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-success-500/10 rounded-full animate-float" style={{ animationDelay: '-4s' }} />
      </section>

      {/* RWA Section - Tokenisation d'Actifs Réels - Version Compacte */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Header Compact */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 mb-3">
                <BanknotesIcon className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-semibold text-primary-400">NOUVEAU</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Tokenisation <span className="text-gradient">RWA</span>
              </h2>
              <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                Transformez vos actifs réels en tokens échangeables. Immobilier, art, brevets, equity.
              </p>
            </div>

            {/* Compact Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="card-dark text-center p-4 hover:border-blue-500/50 transition-all"
              >
                <BuildingOfficeIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Immobilier</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="card-dark text-center p-4 hover:border-purple-500/50 transition-all"
              >
                <BeakerIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Brevets & IP</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="card-dark text-center p-4 hover:border-pink-500/50 transition-all"
              >
                <SparklesIcon className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Art & NFTs</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="card-dark text-center p-4 hover:border-green-500/50 transition-all"
              >
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Equity</h3>
              </motion.div>
            </div>

            {/* CTA Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                href="/rwa"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/50 transition-all group text-sm"
              >
                Découvrir la Tokenisation RWA
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating decorations */}
        <div className="absolute top-5 right-10 w-16 h-16 bg-primary-500/5 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-5 left-10 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-float" style={{ animationDelay: '-3s' }} />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pourquoi choisir <span className="text-gradient">Sirius Network</span> ?
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Une technologie de pointe pour protéger vos données les plus sensibles avec des fonctionnalités uniques dans l'écosystème blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card card-hover group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dark-800 ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-all">
                  {feature.title}
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Capsule Types Section */}
      <section id="capsule-types" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              5 Types de <span className="text-gradient">Capsules</span> pour tous vos besoins
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Solutions adaptées à chaque cas d'usage, du stockage personnel aux testaments numériques en passant par les contrats d'entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SAFE - Coffre-Fort */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-success-900/20 to-success-800/10 border-success-700/30"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-success-500/20 text-success-400">
                    <LockClosedIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                      Coffre-Fort (SAFE)
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-success-500/20 text-success-400 rounded-full">
                      🔐 SÉCURISÉ
                    </span>
                  </div>
                  <p className="text-dark-300 mb-4 leading-relaxed">
                    Stockage sécurisé accessible à tout moment par le propriétaire. Idéal pour mots de passe, 
                    clés privées et documents sensibles avec déchiffrement instantané.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-dark-800/50 text-success-300 rounded-full">Gestionnaire mots de passe</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-success-300 rounded-full">Clés cryptographiques</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-success-300 rounded-full">Documents d'identité</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* TIME_LOCK - Verrouillage Temporel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-700/30"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-500/20 text-primary-400">
                    <ClockIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                      Verrouillage Temporel (TIME_LOCK)
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-500/20 text-primary-400 rounded-full">
                      ⏰ PROGRAMMÉ
                    </span>
                  </div>
                  <p className="text-dark-300 mb-4 leading-relaxed">
                    Capsule qui s'ouvre automatiquement à une date/heure précise. Impossible d'ouvrir avant l'échéance 
                    avec vérification automatisée par les validateurs blockchain.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-dark-800/50 text-primary-300 rounded-full">Testament numérique</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-primary-300 rounded-full">Embargo scientifique</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-primary-300 rounded-full">Messages anniversaire</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CONDITIONAL - Conditionnel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-warning-900/20 to-warning-800/10 border-warning-700/30"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-warning-500/20 text-warning-400">
                    <ChartBarIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                      Conditionnel (CONDITIONAL)
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-warning-500/20 text-warning-400 rounded-full">
                      🎯 INTELLIGENT
                    </span>
                  </div>
                  <p className="text-dark-300 mb-4 leading-relaxed">
                    Ouverture basée sur des conditions externes vérifiables : prix d'actifs, événements on-chain, 
                    signatures multiples, données météorologiques via oracles.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-dark-800/50 text-warning-300 rounded-full">BTC 100k USD</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-warning-300 rounded-full">Événements blockchain</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-warning-300 rounded-full">Oracles externes</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* MULTI_SIG - Multi-Signatures */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-secondary-900/20 to-secondary-800/10 border-secondary-700/30"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-secondary-500/20 text-secondary-400">
                    <UserGroupIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                      Multi-Signatures (MULTI_SIG)
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-secondary-500/20 text-secondary-400 rounded-full">
                      👥 COLLABORATIF
                    </span>
                  </div>
                  <p className="text-dark-300 mb-4 leading-relaxed">
                    Nécessite l'approbation de plusieurs parties pour l'ouverture. Configurations m-of-n 
                    personnalisables (2-of-3, 3-of-5, etc.) pour une sécurité collaborative.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-dark-800/50 text-secondary-300 rounded-full">Accords entreprise</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-secondary-300 rounded-full">Succession familiale</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-secondary-300 rounded-full">Fonds investissement</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* DEAD_MANS_SWITCH - Dead Man's Switch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-danger-900/20 to-danger-800/10 border-danger-700/30 lg:col-span-2"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-danger-500/20 text-danger-400">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                      Dead Man's Switch (DEAD_MANS_SWITCH)
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-danger-500/20 text-danger-400 rounded-full">
                      💀 AUTOMATIQUE
                    </span>
                  </div>
                  <p className="text-dark-300 mb-4 leading-relaxed">
                    S'ouvre automatiquement si le propriétaire ne donne pas signe de vie pendant une période configurable. 
                    Système "heartbeat" avec notifications préventives pour assurer la continuité en cas d'urgence.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-dark-800/50 text-danger-300 rounded-full">Testament automatique</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-danger-300 rounded-full">Procédures urgence</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-danger-300 rounded-full">Continuité affaires</span>
                    <span className="px-3 py-1 bg-dark-800/50 text-danger-300 rounded-full">Mots passe critiques</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Comment fonctionne <span className="text-gradient">Sirius Network</span> ?
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Un processus simple en 4 étapes pour créer et gérer vos capsules temporelles en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-2">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-900/50 to-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Architecture <span className="text-gradient">Technique</span> de Pointe
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Une infrastructure robuste construite sur Cosmos SDK avec CometBFT pour des performances 
              et une sécurité de niveau entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Architecture Diagram */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="space-y-4">
                <div className="card p-4 bg-gradient-to-r from-primary-900/30 to-primary-800/20 border-primary-700/50">
                  <div className="flex items-center space-x-3">
                    <ComputerDesktopIcon className="w-6 h-6 text-primary-400" />
                    <span className="font-semibold text-white">Interface Web (Next.js + TypeScript)</span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-secondary-900/30 to-secondary-800/20 border-secondary-700/50">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="w-6 h-6 text-secondary-400" />
                    <span className="font-semibold text-white">Couche Wallet (Keplr, Cosmostation, Leap)</span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-success-900/30 to-success-800/20 border-success-700/50">
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="w-6 h-6 text-success-400" />
                    <span className="font-semibold text-white">Application Blockchain (Cosmos SDK)</span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-warning-900/30 to-warning-800/20 border-warning-700/50">
                  <div className="flex items-center space-x-3">
                    <CogIcon className="w-6 h-6 text-warning-400" />
                    <span className="font-semibold text-white">Consensus Engine (CometBFT)</span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-danger-900/30 to-danger-800/20 border-danger-700/50">
                  <div className="flex items-center space-x-3">
                    <ServerIcon className="w-6 h-6 text-danger-400" />
                    <span className="font-semibold text-white">Stockage Distribué (Blockchain + IPFS)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technical Specifications */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Spécifications Techniques</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-white">Consensus Byzantine Fault Tolerant</div>
                    <div className="text-dark-300">CometBFT avec finalité instantanée et résistance jusqu'à 1/3 de validateurs malveillants</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-white">Performance Optimisée</div>
                    <div className="text-dark-300">~6 secondes par bloc, 1000+ TPS avec architecture modulaire extensible</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-white">Chiffrement Militaire</div>
                    <div className="text-dark-300">AES-256-GCM avec Shamir Secret Sharing et génération CSPRNG</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-white">Stockage Hybride Intelligent</div>
                    <div className="text-dark-300">
                       1MB on-chain pour la rapidité, ≥ 1MB sur IPFS pour l'économie</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-success-900/20 to-success-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 text-success-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sécurité Quantum-Résistante</h3>
              <p className="text-dark-300">
                Architecture préparée pour résister aux menaces futures, y compris l'informatique quantique
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-primary-900/20 to-primary-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Interopérabilité Cosmos</h3>
              <p className="text-dark-300">
                IBC protocol pour les transferts cross-chain et l'intégration avec l'écosystème Cosmos
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-secondary-900/20 to-secondary-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <CloudIcon className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Redondance Distribuée</h3>
              <p className="text-dark-300">
                Réplication automatique sur minimum 3 nœuds IPFS avec mécanismes de récupération
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Écosystème et <span className="text-gradient">Cas d'Usage</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              De la succession numérique aux contrats d'entreprise, Sirius Network transforme 
              la façon dont nous gérons nos données les plus sensibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Secteur Juridique */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-primary-900/20 to-primary-800/10"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <BuildingLibraryIcon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  Secteur Juridique
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-dark-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Testaments numériques avec héritiers vérifiés</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Contrats avec conditions d'exécution automatisées</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Dépôts de garantie programmables</span>
                </li>
              </ul>
            </motion.div>

            {/* Recherche & Innovation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-success-900/20 to-success-800/10"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-success-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <BeakerIcon className="w-7 h-7 text-success-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  Recherche & Innovation
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-dark-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Publications avec embargo scientifique</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Brevets avec divulgation différée</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Collaboration R&D sécurisée</span>
                </li>
              </ul>
            </motion.div>

            {/* Secteur Financier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-warning-900/20 to-warning-800/10"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-warning-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <BanknotesIcon className="w-7 h-7 text-warning-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  Secteur Financier
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-dark-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Gestion de patrimoine automatisée</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Coffres-forts numériques bancaires</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Audit de conformité décentralisé</span>
                </li>
              </ul>
            </motion.div>

            {/* Applications Personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card card-hover group bg-gradient-to-br from-secondary-900/20 to-secondary-800/10"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <HeartIcon className="w-7 h-7 text-secondary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  Applications Personnelles
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-dark-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Messages d'anniversaire programmés</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Capsules temporelles familiales</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sauvegarde sécurisée de clés privées</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Integration Examples */}
          <div className="mt-16 card bg-gradient-to-r from-dark-800/50 to-dark-700/30 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">Intégrations B2B</h3>
                <p className="text-dark-300 mb-6">
                  SDKs complets et APIs REST pour intégrer facilement Sirius Network 
                  dans vos applications existantes.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-success-400" />
                    <span className="text-dark-300">APIs RESTful documentées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-success-400" />
                    <span className="text-dark-300">SDKs JavaScript, Python, Go</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-success-400" />
                    <span className="text-dark-300">Support white-label personnalisé</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-dark-900/50 p-6 rounded-lg border border-dark-700/50"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                </div>
                <pre className="text-sm text-dark-300 overflow-x-auto">
{`import { CapsuleSDK } from '@capsule/sdk'

const capsule = new CapsuleSDK({
  network: 'mainnet',
  apiKey: 'your-api-key'
})

// Créer une capsule TIME_LOCK
await capsule.create({
  type: 'TIME_LOCK',
  data: sensitiveDocument,
  unlockTime: '2025-12-25T00:00:00Z',
  recipient: 'cosmos1abc...'
})`}
                </pre>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Program Section - Lazy loaded */}
      <Suspense fallback={
        <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="h-8 bg-dark-800/50 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-dark-800/30 rounded animate-pulse max-w-xl mx-auto"></div>
          </div>
        </div>
      }>
        <ValidatorSection />
      </Suspense>

      {/* MTQ Tokenomics Section */}
      <section id="tokenomics" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900/10 to-secondary-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Token <span className="text-gradient">TimeLoke (MTQ)</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Le token natif qui propulse l'écosystème Sirius Network avec des mécanismes 
              économiques durables et une gouvernance décentralisée.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Token Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Distribution des 1B MTQ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-primary-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                    <span className="font-semibold text-white">Staking Rewards</span>
                  </div>
                  <span className="text-primary-400 font-bold">350M (35%)</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-secondary-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-secondary-500 rounded-full"></div>
                    <span className="font-semibold text-white">Développement</span>
                  </div>
                  <span className="text-secondary-400 font-bold">200M (20%)</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-success-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-success-500 rounded-full"></div>
                    <span className="font-semibold text-white">Lancement</span>
                  </div>
                  <span className="text-success-400 font-bold">150M (15%)</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-warning-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-warning-500 rounded-full"></div>
                    <span className="font-semibold text-white">Équipe</span>
                  </div>
                  <span className="text-warning-400 font-bold">100M (10%)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-dark-800/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                      <span className="text-sm text-white">Marketing</span>
                    </div>
                    <span className="text-danger-400 font-semibold text-sm">100M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-800/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-white">Réserve</span>
                    </div>
                    <span className="text-purple-400 font-semibold text-sm">100M</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Token Utilities */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Utilités du Token MTQ</h3>
              <div className="space-y-6">
                <div className="card bg-gradient-to-r from-primary-900/20 to-primary-800/10 border-primary-700/50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <FireIcon className="w-5 h-5 text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Frais de Transaction</h4>
                      <p className="text-dark-300 text-sm">0.025 MTQ par unité de gas avec frais adaptatifs</p>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-r from-success-900/20 to-success-800/10 border-success-700/50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center">
                        <TrophyIcon className="w-5 h-5 text-success-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Staking & Validation</h4>
                      <p className="text-dark-300 text-sm">8-12% APY pour les stakeurs, 21 validateurs élus</p>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-secondary-900/20 to-secondary-800/10 border-secondary-700/50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-5 h-5 text-secondary-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Gouvernance</h4>
                      <p className="text-dark-300 text-sm">1 MTQ = 1 vote, propositions à partir de 1000 MTQ</p>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-warning-900/20 to-warning-800/10 border-warning-700/50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-warning-500/20 rounded-lg flex items-center justify-center">
                        <StarIcon className="w-5 h-5 text-warning-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Services Premium</h4>
                      <p className="text-dark-300 text-sm">Capsules étendues, conditions avancées, support prioritaire</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Economic Mechanisms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-success-900/20 to-success-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-8 h-8 text-success-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Inflation Contrôlée</h3>
              <p className="text-dark-300 mb-4">
                Taux initial de 8% diminuant de -0.5% tous les 2 ans, plancher à 2%
              </p>
              <div className="text-2xl font-bold text-gradient">8% → 2%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-danger-900/20 to-danger-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <FireIcon className="w-8 h-8 text-danger-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Burn Automatique</h3>
              <p className="text-dark-300 mb-4">
                10% des frais détruits + tokens non réclamés après expiration
              </p>
              <div className="text-2xl font-bold text-gradient">Déflationnaire</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover text-center group bg-gradient-to-br from-primary-900/20 to-primary-800/10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <CurrencyDollarIcon className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stabilité Long-terme</h3>
              <p className="text-dark-300 mb-4">
                Trésor de réserve + buyback périodique pour la stabilité
              </p>
              <div className="text-2xl font-bold text-gradient">Durable</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marketplace & Ecosystem Section */}
      <section id="marketplace" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-900 to-primary-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              <span className="text-gradient">Marketplace</span> & Écosystème
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Découvrez un écosystème riche d'applications développées par la communauté pour étendre
              les fonctionnalités de vos capsules temporelles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Marketplace Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card card-hover bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <PuzzlePieceIcon className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">App Store Capsule</h3>
                  <p className="text-purple-300">Marketplace d'applications décentralisées</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">🔐</div>
                    <div>
                      <div className="text-white font-medium">TimeLock Wallet Pro</div>
                      <div className="text-gray-400 text-sm">Finance • Gratuit</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-300">4.8</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-sm">🎨</div>
                    <div>
                      <div className="text-white font-medium">NFT Capsule Studio</div>
                      <div className="text-gray-400 text-sm">NFT • $24.99</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-300">4.9</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-sm">📊</div>
                    <div>
                      <div className="text-white font-medium">Analytics Pro</div>
                      <div className="text-gray-400 text-sm">Analytics • $19.99</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-300">4.5</span>
                  </div>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="btn-primary w-full sm:w-auto group flex items-center justify-center whitespace-nowrap"
              >
                Explorer le Marketplace
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Ecosystem Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="card bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Métriques Ecosystem</h4>
                    <p className="text-blue-300">Données temps réel</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">74.8K</div>
                    <div className="text-gray-400 text-sm">Téléchargements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">1.2K</div>
                    <div className="text-gray-400 text-sm">Développeurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">6</div>
                    <div className="text-gray-400 text-sm">Catégories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">4.6</div>
                    <div className="text-gray-400 text-sm">Note Moyenne</div>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <RocketLaunchIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Programme Développeur</h4>
                    <p className="text-green-300">Rejoignez l'écosystème</p>
                  </div>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>SDK complet avec documentation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Revenue sharing 70/30</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Support technique dédié</span>
                  </li>
                </ul>

                <Link
                  href="/docs"
                  className="btn-outline w-full"
                >
                  Documentation Développeur
                </Link>
              </div>
            </motion.div>
          </div>

          {/* App Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-blue-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BoltIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h5 className="text-white font-medium mb-1">Finance</h5>
              <p className="text-gray-400 text-xs">DeFi & Wallets</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-green-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
              </div>
              <h5 className="text-white font-medium mb-1">Productivité</h5>
              <p className="text-gray-400 text-xs">Outils & Automation</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-purple-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <StarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h5 className="text-white font-medium mb-1">NFT & Art</h5>
              <p className="text-gray-400 text-xs">Collections & Studios</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-orange-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h5 className="text-white font-medium mb-1">Business</h5>
              <p className="text-gray-400 text-xs">Enterprise & Legal</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-cyan-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h5 className="text-white font-medium mb-1">Social</h5>
              <p className="text-gray-400 text-xs">Community & Sharing</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-red-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ArrowTrendingUpIcon className="w-6 h-6 text-red-400" />
              </div>
              <h5 className="text-white font-medium mb-1">Analytics</h5>
              <p className="text-gray-400 text-xs">Insights & Reports</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Roadmap de <span className="text-gradient">Développement</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              De la fondation technique au déploiement à grande échelle, découvrez les phases clés 
              de l'évolution de Sirius Network.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-primary-500 via-secondary-500 to-success-500 rounded-full hidden lg:block"></div>

            <div className="space-y-12">
              {/* Phase 1 - Foundation (Completed) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row items-center"
              >
                <div className="lg:w-1/2 lg:pr-12">
                  <div className="card bg-gradient-to-br from-success-900/20 to-success-800/10 border-success-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center">
                        <CheckBadgeIcon className="w-6 h-6 text-success-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Phase 1 : Foundation</h3>
                        <span className="text-success-400 font-semibold">Q1 2025 - Complétée ✅</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-dark-300">
                      <li className="flex items-center space-x-2">
                        <CheckBadgeIcon className="w-4 h-4 text-success-400 flex-shrink-0" />
                        <span>Architecture Cosmos SDK de base</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckBadgeIcon className="w-4 h-4 text-success-400 flex-shrink-0" />
                        <span>Module TimeCapsule core</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckBadgeIcon className="w-4 h-4 text-success-400 flex-shrink-0" />
                        <span>Chiffrement AES-256-GCM</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckBadgeIcon className="w-4 h-4 text-success-400 flex-shrink-0" />
                        <span>Interface web MVP</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-success-500 rounded-full border-4 border-dark-900"></div>
                <div className="lg:w-1/2 lg:pl-12 mt-6 lg:mt-0"></div>
              </motion.div>

              {/* Phase 2 - Security & Testing (Current) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row items-center"
              >
                <div className="lg:w-1/2 lg:pr-12 order-2 lg:order-1 mt-6 lg:mt-0"></div>
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-500 rounded-full border-4 border-dark-900 animate-pulse"></div>
                <div className="lg:w-1/2 lg:pl-12 order-1 lg:order-2">
                  <div className="card bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                        <CogIcon className="w-6 h-6 text-primary-400 animate-spin-slow" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Phase 2 : Security & Testing</h3>
                        <span className="text-primary-400 font-semibold">Q2 2025 - En cours 🔄</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-dark-300">
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-400 rounded-full animate-pulse flex-shrink-0"></div>
                        <span>Audit de sécurité complet</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-400 rounded-full animate-pulse flex-shrink-0"></div>
                        <span>Test network public</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-400 rounded-full animate-pulse flex-shrink-0"></div>
                        <span>Programme bug bounty</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-400 rounded-full animate-pulse flex-shrink-0"></div>
                        <span>SDKs et APIs publiques</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Phase 3 - Mainnet Launch */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row items-center"
              >
                <div className="lg:w-1/2 lg:pr-12">
                  <div className="card bg-gradient-to-br from-secondary-900/20 to-secondary-800/10 border-secondary-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                        <RocketLaunchIcon className="w-6 h-6 text-secondary-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Phase 3 : Mainnet Launch</h3>
                        <span className="text-secondary-400 font-semibold">Q3 2025 - Planifiée 🚀</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-dark-300">
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary-400/50 rounded-full flex-shrink-0"></div>
                        <span>Lancement du mainnet</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary-400/50 rounded-full flex-shrink-0"></div>
                        <span>Programme de staking</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary-400/50 rounded-full flex-shrink-0"></div>
                        <span>Gouvernance on-chain active</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary-400/50 rounded-full flex-shrink-0"></div>
                        <span>Mobile apps (iOS/Android)</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-secondary-900/20 rounded-lg">
                      <div className="text-xs text-secondary-400 mb-1">Métriques cibles :</div>
                      <div className="text-sm text-dark-300">21 validateurs • 10K+ MTQ stakés • 1K+ capsules</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-secondary-500/50 rounded-full border-4 border-dark-900"></div>
                <div className="lg:w-1/2 lg:pl-12 mt-6 lg:mt-0"></div>
              </motion.div>

              {/* Phase 4 - Ecosystem Growth */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row items-center"
              >
                <div className="lg:w-1/2 lg:pr-12 order-2 lg:order-1 mt-6 lg:mt-0"></div>
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-warning-500/50 rounded-full border-4 border-dark-900"></div>
                <div className="lg:w-1/2 lg:pl-12 order-1 lg:order-2">
                  <div className="card bg-gradient-to-br from-warning-900/20 to-warning-800/10 border-warning-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-warning-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Phase 4 : Ecosystem Growth</h3>
                        <span className="text-warning-400 font-semibold">Q4 2025 - Vision 🌱</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-dark-300">
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-warning-400/30 rounded-full flex-shrink-0"></div>
                        <span>Oracles intégrés conditions complexes</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-warning-400/30 rounded-full flex-shrink-0"></div>
                        <span>Cross-chain bridges (ETH, BSC)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-warning-400/30 rounded-full flex-shrink-0"></div>
                        <span>Marketplace de capsules</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-warning-400/30 rounded-full flex-shrink-0"></div>
                        <span>Intégrations enterprise</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Phase 5 - Mass Adoption */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row items-center"
              >
                <div className="lg:w-1/2 lg:pr-12">
                  <div className="card bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <GlobeAltIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Phase 5 : Mass Adoption</h3>
                        <span className="text-purple-400 font-semibold">2026+ - Futur 🌍</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-semibold text-white">Objectifs 2030 :</div>
                        <div className="text-purple-300">• 1B capsules créées</div>
                        <div className="text-purple-300">• 100M utilisateurs actifs</div>
                        <div className="text-purple-300">• Support multi-chain natif</div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-white">Innovations :</div>
                        <div className="text-purple-300">• IA conditions prédictives</div>
                        <div className="text-purple-300">• Quantum resistance</div>
                        <div className="text-purple-300">• Zero-knowledge proofs</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500/30 rounded-full border-4 border-dark-900"></div>
                <div className="lg:w-1/2 lg:pl-12 mt-6 lg:mt-0"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border-y border-dark-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à sécuriser vos données les plus précieuses ?
            </h2>
            <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
              Rejoignez la révolution des capsules temporelles sur blockchain. 
              Commencez dès maintenant avec votre première capsule gratuite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/capsules/create" className="btn-primary btn-lg group whitespace-nowrap flex items-center justify-center">
                  Créer ma première capsule
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link href="/auth/connect" className="btn-primary btn-lg group whitespace-nowrap flex items-center justify-center">
                  Commencer maintenant
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link href="/docs" className="btn-outline btn-lg whitespace-nowrap">
                Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cyberlab's Section */}
      <section id="cyberlab" className="py-24 bg-gradient-to-br from-dark-800/50 via-dark-900 to-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <BuildingOfficeIcon className="w-10 h-10 text-primary-400" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Développé par 
              <span className="text-gradient ml-3">Cyberlab's</span>
            </h2>
            
            <p className="text-xl text-dark-300 max-w-3xl mx-auto leading-relaxed">
              Laboratoire d'innovation numérique martiniquais dédié à l'émancipation technologique 
              et au développement de solutions blockchain révolutionnaires.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <GlobeAmericasIcon className="w-8 h-8 text-primary-400 mr-4" />
                  <h3 className="text-2xl font-bold text-white">Notre Mission</h3>
                </div>
                <p className="text-dark-200 leading-relaxed mb-6">
                  Fondé en septembre 2023 à Fort-de-France, Martinique, par <strong className="text-white">Giovanny ADELAIDE</strong>, 
                  Cyberlab's est une association dédiée à l'émancipation des jeunes passionnés du numérique.
                </p>
                <p className="text-dark-200 leading-relaxed">
                  Nous créons des solutions technologiques innovantes, de la conception de projets 
                  à la recherche de partenaires, en guidant chaque étape du développement.
                </p>
              </div>

              <div className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <CogIcon className="w-8 h-8 text-secondary-400 mr-4" />
                  <h3 className="text-2xl font-bold text-white">Expertise Technique</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                    <div className="text-primary-400 font-semibold text-sm mb-1">Web & Mobile</div>
                    <div className="text-xs text-dark-300">Symfony, React, Flutter</div>
                  </div>
                  <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                    <div className="text-secondary-400 font-semibold text-sm mb-1">Automatisation</div>
                    <div className="text-xs text-dark-300">Python, Scripts</div>
                  </div>
                  <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                    <div className="text-success-400 font-semibold text-sm mb-1">Data Mining</div>
                    <div className="text-xs text-dark-300">Analyse de données</div>
                  </div>
                  <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                    <div className="text-warning-400 font-semibold text-sm mb-1">Blockchain</div>
                    <div className="text-xs text-dark-300">Cosmos SDK</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Values & CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-success-500/10 border border-primary-500/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Nos Valeurs
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mr-4 flex-shrink-0"></div>
                    <span className="text-dark-200">Innovation numérique et technologies émergentes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-secondary-500 rounded-full mr-4 flex-shrink-0"></div>
                    <span className="text-dark-200">Insertion professionnelle des jeunes talents</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-success-500 rounded-full mr-4 flex-shrink-0"></div>
                    <span className="text-dark-200">Formation en drones, robotique et multimédia</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-warning-500 rounded-full mr-4 flex-shrink-0"></div>
                    <span className="text-dark-200">Pratiques durables et inclusion numérique</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-4">
                  Découvrir Cyberlab's
                </h4>
                <p className="text-dark-300 mb-8">
                  Magazine mensuel sur la cybersécurité, projets innovants, 
                  et accompagnement technologique personnalisé.
                </p>
                
                <motion.a
                  href="https://cyberlabs-mq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-3" />
                  Visiter le Site Officiel
                  <LinkIcon className="w-4 h-4 ml-3" />
                </motion.a>
                
                <div className="mt-6 flex items-center justify-center text-sm text-dark-400">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Fort-de-France, Martinique • Fondé en 2023
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - Lazy loaded */}
      <Suspense fallback={
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-900 border-t border-dark-800">
          <div className="max-w-7xl mx-auto">
            <div className="h-16 bg-dark-800/30 rounded animate-pulse"></div>
          </div>
        </footer>
      }>
        <FooterSection />
      </Suspense>
    </div>
  )
}