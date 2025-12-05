'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BuildingOffice2Icon,
  LightBulbIcon,
  PaintBrushIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function RWAPage() {
  const router = useRouter()

  const features = [
    {
      icon: BuildingOffice2Icon,
      title: 'Immobilier',
      description: 'Tokenisez des propriétés en fractions. Investissez dans l\'immobilier à partir de 50€.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      example: 'Appartement à Paris : 10,000 fractions × 50€'
    },
    {
      icon: LightBulbIcon,
      title: 'Propriété Intellectuelle',
      description: 'Monétisez vos brevets et droits d\'auteur via fractionnement et royalties.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      example: 'Brevet IA : 100,000 fractions, royalties trimestrielles'
    },
    {
      icon: PaintBrushIcon,
      title: 'Art & Collectibles',
      description: 'Co-propriété d\'œuvres d\'art et d\'objets rares. Liquidité instantanée.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      example: 'Tableau : 1,000 fractions × 500€'
    },
    {
      icon: ChartBarIcon,
      title: 'Actions & Equity',
      description: 'Tokenisez des parts d\'entreprises pour une liquidité immédiate.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      example: 'Startup : 10,000 fractions, gouvernance incluse'
    }
  ]

  const benefits = [
    {
      icon: BanknotesIcon,
      title: 'Propriété Fractionnée',
      description: 'Achetez une fraction d\'actifs de grande valeur'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Liquidité Instantanée',
      description: 'Vendez vos fractions 24/7 sur le marketplace'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Conformité Intégrée',
      description: 'KYC/AML et régulations automatiques'
    }
  ]

  const stats = [
    { label: 'Marché Adressable', value: '$20T+' },
    { label: 'Frais de Tokenisation', value: '0.5%' },
    { label: 'Frais de Trading', value: '0.3%' },
    { label: 'Types d\'Actifs', value: '6+' }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">
            Tokenisation RWA
            <span className="block text-gradient mt-2">
              Real World Assets
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transformez vos actifs réels en tokens échangeables. Propriété fractionnée,
            liquidité instantanée, et conformité automatique.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-dark text-center"
            >
              <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="card-dark hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-3">{feature.description}</p>
                <div className="text-sm text-gray-500 font-mono">
                  📊 {feature.example}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Avantages Clés</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="card-dark text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="card-dark mb-16"
        >
          <h2 className="text-2xl font-bold mb-6">Comment ça fonctionne ?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Tokenisation</h4>
                <p className="text-gray-400 text-sm">
                  Créez une capsule avec les documents de votre actif, puis tokenisez-la en fractions échangeables.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Marketplace</h4>
                <p className="text-gray-400 text-sm">
                  Listez vos fractions sur le marketplace. Les acheteurs peuvent acheter instantanément avec vérification KYC.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Trading & DeFi</h4>
                <p className="text-gray-400 text-sm">
                  Tradez 24/7, utilisez vos fractions comme collatéral, ou stakez pour des rendements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Redemption</h4>
                <p className="text-gray-400 text-sm">
                  Convertissez vos fractions en actif physique (100% ownership) ou en cash (partiel).
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push('/rwa/tokenize')}
            className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
          >
            Tokeniser un Actif
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/rwa/marketplace')}
            className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
          >
            Explorer le Marketplace
            <ChartBarIcon className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 card-dark bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/30"
        >
          <div className="flex items-start gap-4">
            <ShieldCheckIcon className="w-8 h-8 text-primary-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Conformité & Sécurité</h3>
              <p className="text-gray-400 text-sm">
                Toutes les transactions RWA sont soumises aux vérifications KYC/AML automatiques.
                Les juridictions bloquées sont automatiquement filtrées. Les transferts respectent
                les périodes de détention minimales selon les régulations en vigueur.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
