'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  CubeIcon,
  ScaleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/stores/authStore'
import { VoteOption, ProposalStatus, ProposalType } from '@/types/governance'
import toast from 'react-hot-toast'

// Mock data - à remplacer par API
const MOCK_PROPOSAL = {
  id: '1',
  proposal_id: '1',
  title: 'Augmentation de la période de vote à 7 jours',
  description: `# Contexte

La période de vote actuelle de 5 jours peut être insuffisante pour permettre une participation optimale de la communauté internationale et donner le temps nécessaire pour analyser en profondeur les propositions complexes.

## Motivation

- **Participation internationale** : Les différents fuseaux horaires rendent difficile une coordination rapide
- **Analyse technique** : Les propositions de changement de paramètres ou d'upgrade nécessitent du temps de revue
- **Discussion communautaire** : Plus de temps permet des débats plus riches sur le forum

## Spécification Technique

Modification du paramètre \`voting_period\` dans le module x/gov :

\`\`\`json
{
  "subspace": "gov",
  "key": "votingparams",
  "value": {"voting_period": "604800s"}
}
\`\`\`

**Changement** : 432,000s (5 jours) → 604,800s (7 jours)

## Impact

### Avantages
✅ Meilleure participation des délégateurs internationaux
✅ Plus de temps pour débattre sur le forum
✅ Analyse technique plus approfondie possible
✅ Réduit la pression sur les validateurs pour voter rapidement

### Inconvénients
⚠️ Ralentit légèrement le processus de gouvernance
⚠️ Peut retarder les upgrades urgents (mitigation : processus d'urgence séparé)

## Alternatives Considérées

1. **6 jours** : Compromis, mais ne change pas fondamentalement la dynamique
2. **10 jours** : Trop long, risque de lassitude et baisse de participation
3. **Période variable** : Trop complexe à implémenter

## Risques & Mitigations

**Risque** : Urgences nécessitant un vote rapide
**Mitigation** : Cette proposition ne concerne que les votes standards. En cas d'urgence critique (faille de sécurité), un mécanisme hors-gouvernance reste possible via coordination validateurs.

## Tests

Cette proposition a été testée sur le testnet pendant 2 semaines avec succès.

## Plan d'Implémentation

1. ✅ Tests sur testnet (complété)
2. ✅ Discussion communautaire (15 jours sur forum)
3. 🔄 Vote on-chain (en cours)
4. ⏳ Exécution automatique si accepté

## Références

- Forum discussion: https://forum.sirius.network/t/voting-period-extension
- Testnet results: https://testnet.sirius.network/proposals/3
- Cosmos Hub similar change: https://cosmos.network/proposals/23
`,
  type: ProposalType.PARAMETER_CHANGE,
  status: ProposalStatus.VOTING_PERIOD,
  submit_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  deposit_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  voting_start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  voting_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  total_deposit: [{ denom: 'ucaps', amount: '500000000' }],
  proposer: 'cosmos1validator3k2l5m8p9q',
  proposer_moniker: 'Sirius Validator',
  final_tally_result: {
    yes: '12500000',
    no: '3200000',
    abstain: '1800000',
    no_with_veto: '500000'
  },
  messages: [
    {
      '@type': '/cosmos.gov.v1.MsgExecLegacyContent',
      content: {
        '@type': '/cosmos.params.v1beta1.ParameterChangeProposal',
        title: 'Augmentation de la période de vote à 7 jours',
        description: 'Voir description complète',
        changes: [
          {
            subspace: 'gov',
            key: 'votingparams',
            value: '{"voting_period":"604800s"}'
          }
        ]
      }
    }
  ]
}

const MOCK_VOTES = [
  { voter: 'cosmos1val1...', moniker: 'Validator Alpha', option: VoteOption.YES, voting_power: '2500000', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { voter: 'cosmos1val2...', moniker: 'Beta Node', option: VoteOption.YES, voting_power: '1800000', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { voter: 'cosmos1val3...', moniker: 'Gamma Validator', option: VoteOption.NO, voting_power: '1200000', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { voter: 'cosmos1val4...', moniker: 'Delta Staking', option: VoteOption.YES, voting_power: '980000', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { voter: 'cosmos1val5...', moniker: 'Epsilon Network', option: VoteOption.ABSTAIN, voting_power: '750000', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
]

export default function ProposalDetailPage() {
  const params = useParams()
  const { isAuthenticated, address } = useAuth()
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)

  const proposal = MOCK_PROPOSAL

  // Calculs
  const totalVotes = parseInt(proposal.final_tally_result.yes) +
                     parseInt(proposal.final_tally_result.no) +
                     parseInt(proposal.final_tally_result.abstain) +
                     parseInt(proposal.final_tally_result.no_with_veto)

  const yesPercentage = (parseInt(proposal.final_tally_result.yes) / totalVotes * 100).toFixed(1)
  const noPercentage = (parseInt(proposal.final_tally_result.no) / totalVotes * 100).toFixed(1)
  const vetoPercentage = (parseInt(proposal.final_tally_result.no_with_veto) / totalVotes * 100).toFixed(1)
  const abstainPercentage = (parseInt(proposal.final_tally_result.abstain) / totalVotes * 100).toFixed(1)

  const participationRate = 68.5 // Mock - à calculer depuis le total voting power

  const timeRemaining = Math.floor((new Date(proposal.voting_end_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const handleVote = async () => {
    if (!selectedVote) {
      toast.error('Veuillez sélectionner une option de vote')
      return
    }

    setIsVoting(true)
    try {
      // Simulation - à remplacer par appel API réel
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Vote ${selectedVote} enregistré avec succès !`)
      setShowVoteModal(false)
      setSelectedVote(null)
    } catch (error) {
      toast.error('Erreur lors du vote')
    } finally {
      setIsVoting(false)
    }
  }

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
              <div className="h-6 w-px bg-dark-600 hidden sm:block" />
              <Link href="/governance" className="flex items-center text-dark-400 hover:text-white transition-colors">
                <ScaleIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:block">Gouvernance</span>
              </Link>
            </div>

            <Link href="/governance" className="btn-secondary text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de la proposition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-mono text-dark-400">Proposition #{proposal.proposal_id}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-900/30 border border-blue-500/50 text-blue-300">
                      {proposal.type}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {proposal.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-dark-400">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>Proposé par {proposal.proposer_moniker}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>Il y a 2 jours</span>
                    </div>
                  </div>
                </div>

                {proposal.status === ProposalStatus.VOTING_PERIOD && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-900/30 border border-blue-500/50 text-blue-300">
                    En vote
                  </span>
                )}
              </div>

              {/* Barre de progression du temps */}
              {proposal.status === ProposalStatus.VOTING_PERIOD && (
                <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark-400">Temps restant</span>
                    <span className="text-sm font-semibold text-white">{timeRemaining} jours</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                      style={{ width: `${(timeRemaining / 7) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-400" />
                Description Détaillée
              </h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-dark-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: proposal.description
                      .split('\n')
                      .map(line => {
                        if (line.startsWith('# ')) return `<h2 class="text-white font-bold text-xl mt-6 mb-3">${line.replace('# ', '')}</h2>`
                        if (line.startsWith('## ')) return `<h3 class="text-white font-semibold text-lg mt-4 mb-2">${line.replace('## ', '')}</h3>`
                        if (line.startsWith('### ')) return `<h4 class="text-white font-medium mt-3 mb-2">${line.replace('### ', '')}</h4>`
                        if (line.startsWith('- ')) return `<li class="ml-6">${line.replace('- ', '')}</li>`
                        if (line.startsWith('✅')) return `<div class="flex items-start space-x-2 text-green-400 my-1"><span>✅</span><span>${line.replace('✅', '').trim()}</span></div>`
                        if (line.startsWith('⚠️')) return `<div class="flex items-start space-x-2 text-yellow-400 my-1"><span>⚠️</span><span>${line.replace('⚠️', '').trim()}</span></div>`
                        if (line.startsWith('🔄')) return `<div class="flex items-start space-x-2 text-blue-400 my-1"><span>🔄</span><span>${line.replace('🔄', '').trim()}</span></div>`
                        if (line.startsWith('⏳')) return `<div class="flex items-start space-x-2 text-purple-400 my-1"><span>⏳</span><span>${line.replace('⏳', '').trim()}</span></div>`
                        if (line.trim().startsWith('```')) return line
                        if (line.trim()) return `<p class="mb-3">${line}</p>`
                        return ''
                      })
                      .join('')
                  }}
                />
              </div>
            </motion.div>

            {/* Votes récents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-primary-400" />
                Votes Récents ({MOCK_VOTES.length})
              </h2>
              <div className="space-y-3">
                {MOCK_VOTES.map((vote, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        vote.option === VoteOption.YES ? 'bg-green-900/30 border border-green-500/50' :
                        vote.option === VoteOption.NO ? 'bg-red-900/30 border border-red-500/50' :
                        vote.option === VoteOption.ABSTAIN ? 'bg-gray-900/30 border border-gray-500/50' :
                        'bg-purple-900/30 border border-purple-500/50'
                      }`}>
                        {vote.option === VoteOption.YES ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> :
                         vote.option === VoteOption.NO ? <XCircleIcon className="w-5 h-5 text-red-400" /> :
                         <InformationCircleIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{vote.moniker}</p>
                        <p className="text-dark-400 text-xs">{vote.voter}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        vote.option === VoteOption.YES ? 'text-green-400' :
                        vote.option === VoteOption.NO ? 'text-red-400' :
                        vote.option === VoteOption.ABSTAIN ? 'text-gray-400' :
                        'text-purple-400'
                      }`}>
                        {vote.option}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {(parseInt(vote.voting_power) / 1_000_000).toFixed(2)}M CAPS
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bouton de vote */}
            {isAuthenticated && proposal.status === ProposalStatus.VOTING_PERIOD && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border-primary-500/30"
              >
                <h3 className="font-semibold text-white mb-4 text-center">Voter sur cette proposition</h3>
                <button
                  onClick={() => setShowVoteModal(true)}
                  className="btn-primary w-full"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Voter maintenant
                </button>
              </motion.div>
            )}

            {/* Résultats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="font-semibold text-white mb-4">Résultats Actuels</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark-400">Participation</span>
                    <span className="text-sm font-semibold text-white">{participationRate}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${participationRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-dark-400">Oui</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{yesPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm text-dark-400">Non</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{noPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${noPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm text-dark-400">Veto</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{vetoPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${vetoPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span className="text-sm text-dark-400">Abstention</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{abstainPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${abstainPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Informations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h3 className="font-semibold text-white mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Dépôt Total</span>
                  <span className="text-white font-medium">
                    {parseInt(proposal.total_deposit[0].amount) / 1_000_000} CAPS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Début du Vote</span>
                  <span className="text-white font-medium">
                    {proposal.voting_start_time && new Date(proposal.voting_start_time).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Fin du Vote</span>
                  <span className="text-white font-medium">
                    {proposal.voting_end_time && new Date(proposal.voting_end_time).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Proposeur</span>
                  <span className="text-white font-medium font-mono text-xs">
                    {proposal.proposer.slice(0, 12)}...
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de vote */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Voter sur la Proposition #{proposal.proposal_id}</h3>

            <div className="space-y-3 mb-6">
              {[
                { option: VoteOption.YES, label: 'Oui', description: 'En faveur de la proposition', color: 'green' },
                { option: VoteOption.NO, label: 'Non', description: 'Contre la proposition', color: 'red' },
                { option: VoteOption.NO_WITH_VETO, label: 'Non avec Veto', description: 'Contre et malveillante', color: 'purple' },
                { option: VoteOption.ABSTAIN, label: 'Abstention', description: 'Ne prend pas position', color: 'gray' }
              ].map(({ option, label, description, color }) => (
                <button
                  key={option}
                  onClick={() => setSelectedVote(option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedVote === option
                      ? `border-${color}-500 bg-${color}-900/20`
                      : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-xs text-dark-400 mt-1">{description}</p>
                    </div>
                    {selectedVote === option && (
                      <CheckCircleIcon className={`w-6 h-6 text-${color}-400`} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowVoteModal(false)
                  setSelectedVote(null)
                }}
                className="flex-1 py-3 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleVote}
                disabled={!selectedVote || isVoting}
                className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVoting ? 'Vote en cours...' : 'Confirmer le Vote'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
