'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ServerIcon,
  StarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function ValidatorSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 mb-6">
              <ServerIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Sécurisez le Réseau <span className="text-gradient">Capsule</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Participez à la révolution du stockage temporel décentralisé. Comme les validateurs de Bitcoin, Ethereum et Solana, 
              devenez un pilier essentiel de l'infrastructure Capsule Network et générez des revenus passifs.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <StarIcon className="w-8 h-8 text-yellow-500 mr-3" />
                Revenus de Validation
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: BanknotesIcon,
                    title: "Récompenses de Bloc",
                    description: "Jusqu'à 15% APY sur vos CAPS stakés + récompenses de transaction. Revenus prévisibles comme les mineurs Bitcoin.",
                    color: "text-green-400"
                  },
                  {
                    icon: ShieldCheckIcon,
                    title: "Sécurité & Réputation",
                    description: "Construisez votre réputation de validateur fiable. Slashing minimal grâce aux mécanismes Cosmos SDK éprouvés.",
                    color: "text-blue-400"
                  },
                  {
                    icon: CpuChipIcon,
                    title: "Infrastructure Rentable",
                    description: "Consommation énergétique 99% inférieure au mining Bitcoin. ROI attractif comme les validateurs Ethereum 2.0.",
                    color: "text-purple-400"
                  },
                  {
                    icon: GlobeAltIcon,
                    title: "Réseau Global",
                    description: "Rejoignez un réseau décentralisé mondial. Contribuez à la censure-résistance du stockage temporel.",
                    color: "text-cyan-400"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800/70 transition-all duration-300 group"
                  >
                    <div className={`p-3 rounded-lg ${benefit.color} bg-dark-700/50 group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">{benefit.title}</h4>
                      <p className="text-dark-300 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Requirements & Process */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <AcademicCapIcon className="w-8 h-8 text-primary-500 mr-3" />
                Spécifications de Validation
              </h3>
              <div className="bg-dark-800/30 rounded-2xl p-6 border border-dark-600/50">
                <div className="space-y-4">
                  {[
                    { label: "Stake Minimum", value: "32,000 CAPS (~$50k)", icon: "💰" },
                    { label: "Hardware", value: "4 vCPU, 16GB RAM, 500GB NVMe", icon: "⚡" },
                    { label: "Connexion", value: "100Mbps symétrique", icon: "🌐" },
                    { label: "Uptime", value: "99.5% (comme Solana)", icon: "🔧" },
                    { label: "Monitoring", value: "Surveillance 24/7", icon: "📊" }
                  ].map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{req.icon}</span>
                        <span className="text-dark-300 font-medium">{req.label}</span>
                      </div>
                      <span className="text-white font-semibold">{req.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Guide de Démarrage</h3>
              <div className="space-y-3">
                {[
                  "🖥️ Setup de votre nœud validateur",
                  "💰 Stake de 32,000 CAPS minimum", 
                  "🔐 Configuration sécurisée (clés HSM recommandées)",
                  "⚡ Test de performance & synchronisation",
                  "🚀 Activation en tant que validateur actif"
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 text-dark-300"
                  >
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-500/20">
            <h4 className="text-2xl font-bold text-white mb-4">
              Rejoignez les Pionniers de la Validation
            </h4>
            <p className="text-dark-300 mb-6 max-w-2xl mx-auto">
              Comme les premiers mineurs Bitcoin ou validateurs Ethereum, participez au lancement de Capsule Network. 
              <span className="text-primary-400 font-semibold">Ensemble maximal de 150 validateurs</span> pour une sécurité optimale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/validators/apply" 
                className="btn-primary btn-lg group whitespace-nowrap flex items-center justify-center"
              >
                Postuler Maintenant
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/docs/validators" 
                className="btn-outline btn-lg whitespace-nowrap"
              >
                Guide Technique
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">~15%</div>
                <div className="text-xs text-dark-400">APY estimé</div>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">42</div>
                <div className="text-xs text-dark-400">Validateurs actifs</div>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <div className="text-2xl font-bold text-purple-400 mb-1">108</div>
                <div className="text-xs text-dark-400">Places restantes</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}