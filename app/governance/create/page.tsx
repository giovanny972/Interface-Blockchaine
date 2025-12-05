'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CubeIcon,
  DocumentTextIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ProposalType } from '@/types/governance'
import toast from 'react-hot-toast'

export default function CreateProposalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: ProposalType.TEXT_PROPOSAL,
    title: '',
    description: '',
    deposit: '500', // En CAPS (sera converti en ucaps)
  })

  // Types de propositions disponibles
  const proposalTypes = [
    {
      type: ProposalType.TEXT_PROPOSAL,
      label: 'Proposition de texte',
      description: 'Proposition générale ou signal politique',
      icon: DocumentTextIcon,
      color: 'text-blue-400'
    },
    {
      type: ProposalType.PARAMETER_CHANGE,
      label: 'Changement de paramètre',
      description: 'Modifier les paramètres du réseau',
      icon: BeakerIcon,
      color: 'text-purple-400'
    },
    {
      type: ProposalType.SOFTWARE_UPGRADE,
      label: 'Mise à jour logicielle',
      description: 'Mise à jour du protocole',
      icon: ArrowTrendingUpIcon,
      color: 'text-green-400'
    },
    {
      type: ProposalType.COMMUNITY_POOL_SPEND,
      label: 'Dépense du pool communautaire',
      description: 'Utiliser les fonds du pool',
      icon: BanknotesIcon,
      color: 'text-yellow-400'
    },
    {
      type: ProposalType.CLIENT_UPDATE,
      label: 'Mise à jour client IBC',
      description: 'Mettre à jour un client IBC',
      icon: ShieldCheckIcon,
      color: 'text-red-400'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (!formData.description.trim()) {
      toast.error('La description est requise')
      return
    }
    if (!formData.deposit || parseFloat(formData.deposit) < 500) {
      toast.error('Le dépôt minimum est de 500 CAPS')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implémenter l'intégration blockchain
      // const depositAmount = (parseFloat(formData.deposit) * 1_000_000).toString() // Convertir en ucaps

      // Simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Proposition créée avec succès !')
      router.push('/governance')
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast.error('Erreur lors de la création de la proposition')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = proposalTypes.find(t => t.type === formData.type)
  const SelectedIcon = selectedType?.icon || DocumentTextIcon

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/20 backdrop-blur-md border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gradient hidden sm:block">Sirius Network</span>
              </Link>
            </div>

            <Link
              href="/governance"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour à la gouvernance
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Créer une nouvelle proposition
          </h1>
          <p className="text-dark-300 text-lg">
            Soumettez une proposition de gouvernance pour améliorer le réseau Sirius
          </p>
        </motion.div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-start space-x-3"
        >
          <InformationCircleIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-primary-300">
            <p className="font-medium mb-1">Avant de soumettre votre proposition :</p>
            <ul className="list-disc list-inside space-y-1 text-primary-400">
              <li>Consultez la <Link href="/governance/charter" className="underline hover:text-primary-300">charte de gouvernance</Link></li>
              <li>Discutez de votre idée avec la communauté</li>
              <li>Assurez-vous d'avoir au moins 500 CAPS pour le dépôt initial</li>
              <li>Rédigez une description claire et détaillée</li>
            </ul>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          {/* Type de proposition */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Type de proposition
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proposalTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.type
                return (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.type })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-400' : type.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium mb-1 ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-dark-400">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Titre <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Augmentation de la période de vote à 7 jours"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              maxLength={140}
            />
            <div className="mt-1 text-xs text-dark-500 text-right">
              {formData.title.length}/140
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description détaillée <span className="text-danger-400">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Décrivez votre proposition en détail...\n\n- Quel est le problème actuel ?\n- Quelle est votre solution ?\n- Quels sont les avantages ?\n- Y a-t-il des risques ou inconvénients ?`}
              rows={12}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
            <div className="mt-1 text-xs text-dark-500">
              Format Markdown supporté
            </div>
          </div>

          {/* Dépôt initial */}
          <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-white mb-2">
              Dépôt initial <span className="text-danger-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="deposit"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                placeholder="500"
                min="500"
                step="1"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium">
                CAPS
              </span>
            </div>
            <div className="mt-2 text-xs text-dark-400">
              Minimum requis : 500 CAPS • Votre dépôt sera remboursé si la proposition passe
            </div>
          </div>

          {/* Résumé */}
          <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
            <h3 className="text-sm font-medium text-white mb-3">Résumé de la proposition</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Type</span>
                <div className="flex items-center space-x-2">
                  <SelectedIcon className={`w-4 h-4 ${selectedType?.color}`} />
                  <span className="text-white">{selectedType?.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Dépôt initial</span>
                <span className="text-white font-medium">
                  {formData.deposit || '0'} CAPS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Période de dépôt</span>
                <span className="text-white">7 jours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Période de vote</span>
                <span className="text-white">5 jours (si dépôt atteint)</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-warning-500/10 border border-warning-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-300">
                <p className="font-medium mb-1">⚠️ Important</p>
                <p className="text-warning-400">
                  Une fois soumise, votre proposition ne pourra pas être modifiée. Assurez-vous que toutes les informations sont correctes.
                  Si le dépôt minimum n'est pas atteint dans les 7 jours, votre dépôt sera perdu.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/governance"
              className="px-5 py-2.5 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                'Soumettre la proposition'
              )}
            </button>
          </div>
        </motion.form>

        {/* Note finale */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-dark-500"
        >
          <p>
            Besoin d'aide ? Consultez le{' '}
            <Link href="/help" className="text-primary-400 hover:text-primary-300 underline">
              guide de gouvernance
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
