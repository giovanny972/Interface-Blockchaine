'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ScaleIcon,
  PlusIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/stores/authStore'
import { ProposalStatus, ProposalType } from '@/types/governance'
import type { Proposal } from '@/types/governance'
import {
  fetchProposals,
  fetchGovernanceParams,
  fetchCommunityPool,
  checkBlockchainConnection,
  formatAmount,
  calculateTimeRemaining,
  BLOCKCHAIN_CONFIG
} from '@/lib/blockchain-governance-api'
import toast from 'react-hot-toast'

// Types pour les statistiques
interface GovStats {
  totalProposals: number
  activeProposals: number
  passedProposals: number
  rejectedProposals: number
  votingPower: string
  communityPoolBalance: Array<{ denom: string; amount: string }>
  averageParticipation: number
}

export default function GovernancePage() {
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all')
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<GovStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger les données depuis la blockchain
  useEffect(() => {
    loadGovernanceData()
  }, [])

  const loadGovernanceData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Vérifier la connexion blockchain
      console.log('🔍 Checking blockchain connection...')
      const connected = await checkBlockchainConnection()
      setIsConnected(connected)

      if (!connected) {
        console.warn('⚠️ Blockchain not connected, showing empty state')
        // Ne pas throw d'erreur, juste afficher l'état vide
        setProposals([])
        setStats({
          totalProposals: 0,
          activeProposals: 0,
          passedProposals: 0,
          rejectedProposals: 0,
          votingPower: '0',
          communityPoolBalance: [],
          averageParticipation: 0
        })
        setError('La blockchain n\'est pas accessible. Assurez-vous que votre nœud est en cours d\'exécution.')
        return
      }

      // 2. Charger toutes les propositions
      console.log('📥 Loading proposals...')
      const proposalsResult = await fetchProposals()

      if (proposalsResult.error) {
        throw new Error(proposalsResult.error)
      }

      const allProposals = proposalsResult.data || []
      setProposals(allProposals)

      // 3. Charger les paramètres de gouvernance
      console.log('⚙️ Loading governance params...')
      const paramsResult = await fetchGovernanceParams()

      // 4. Charger le community pool
      console.log('💰 Loading community pool...')
      const poolResult = await fetchCommunityPool()

      // 5. Calculer les statistiques
      const statsData: GovStats = {
        totalProposals: allProposals.length,
        activeProposals: allProposals.filter(
          p => p.status === ProposalStatus.VOTING_PERIOD || p.status === ProposalStatus.DEPOSIT_PERIOD
        ).length,
        passedProposals: allProposals.filter(p => p.status === ProposalStatus.PASSED).length,
        rejectedProposals: allProposals.filter(
          p => p.status === ProposalStatus.REJECTED || p.status === ProposalStatus.FAILED
        ).length,
        votingPower: '0', // TODO: Récupérer du staking module
        communityPoolBalance: poolResult.data || [],
        averageParticipation: 0 // TODO: Calculer depuis les votes
      }

      setStats(statsData)
      console.log('✅ Governance data loaded successfully')
      toast.success('Données de gouvernance chargées')
    } catch (err) {
      console.error('❌ Error loading governance data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load governance data'
      setError(errorMessage)
      toast.error(errorMessage)
      // Définir un état vide même en cas d'erreur
      setStats({
        totalProposals: 0,
        activeProposals: 0,
        passedProposals: 0,
        rejectedProposals: 0,
        votingPower: '0',
        communityPoolBalance: [],
        averageParticipation: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les propositions
  const filteredProposals = proposals.filter(proposal => {
    switch (filter) {
      case 'active':
        return proposal.status === ProposalStatus.VOTING_PERIOD ||
               proposal.status === ProposalStatus.DEPOSIT_PERIOD
      case 'passed':
        return proposal.status === ProposalStatus.PASSED
      case 'rejected':
        return proposal.status === ProposalStatus.REJECTED ||
               proposal.status === ProposalStatus.FAILED
      default:
        return true
    }
  })

  // Obtenir la couleur du status
  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.VOTING_PERIOD:
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      case ProposalStatus.PASSED:
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case ProposalStatus.REJECTED:
      case ProposalStatus.FAILED:
        return 'bg-danger-500/20 text-danger-400 border-danger-500/30'
      case ProposalStatus.DEPOSIT_PERIOD:
        return 'bg-warning-500/20 text-warning-400 border-warning-500/30'
      default:
        return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    }
  }

  // Obtenir le label du status
  const getStatusLabel = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.VOTING_PERIOD:
        return 'Vote en cours'
      case ProposalStatus.PASSED:
        return 'Acceptée'
      case ProposalStatus.REJECTED:
        return 'Rejetée'
      case ProposalStatus.FAILED:
        return 'Échouée'
      case ProposalStatus.DEPOSIT_PERIOD:
        return 'Période de dépôt'
      default:
        return status
    }
  }

  // Obtenir l'icône du type
  const getTypeIcon = (type: ProposalType) => {
    switch (type) {
      case ProposalType.TEXT_PROPOSAL:
        return DocumentTextIcon
      case ProposalType.PARAMETER_CHANGE:
        return BeakerIcon
      case ProposalType.SOFTWARE_UPGRADE:
        return ArrowTrendingUpIcon
      case ProposalType.COMMUNITY_POOL_SPEND:
        return BanknotesIcon
      case ProposalType.CLIENT_UPDATE:
        return ShieldCheckIcon
      default:
        return DocumentTextIcon
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
              <h1 className="text-lg font-semibold text-white flex items-center">
                <ScaleIcon className="w-6 h-6 mr-2 text-primary-400" />
                Gouvernance
              </h1>
            </div>

            {isAuthenticated && (
              <Link href="/governance/create" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvelle proposition
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Gouvernance du réseau
          </h2>
          <p className="text-dark-300 text-lg leading-relaxed max-w-4xl">
            Participez activement à l'évolution du réseau Sirius en votant sur les propositions et en soumettant vos propres idées.
            La gouvernance on-chain garantit une décentralisation complète des décisions.
          </p>

          {/* Status de connexion */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-danger-500'}`} />
              <span className="text-sm text-dark-300">
                {isConnected ? 'Connecté à la blockchain' : 'Déconnecté'}
              </span>
            </div>
            {!isConnected && (
              <button
                onClick={loadGovernanceData}
                className="text-sm text-primary-400 hover:text-primary-300 underline"
              >
                Réessayer
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center space-x-2 text-xs text-dark-400">
            <span>Endpoint:</span>
            <code className="px-2 py-1 bg-dark-800 rounded font-mono">{BLOCKCHAIN_CONFIG.REST_URL}</code>
          </div>
        </motion.div>

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg flex items-start space-x-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-danger-400 mb-1">Erreur de connexion</h4>
              <p className="text-xs text-danger-300">{error}</p>
              <p className="text-xs text-dark-400 mt-2">
                Assurez-vous que votre nœud blockchain est en cours d'exécution sur {BLOCKCHAIN_CONFIG.REST_URL}
              </p>
            </div>
          </motion.div>
        )}

        {/* Statistiques */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-dark-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-400 text-sm">Total Propositions</span>
                <ChartBarIcon className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalProposals}</p>
              <p className="text-xs text-dark-500 mt-1">
                {stats.activeProposals} active{stats.activeProposals > 1 ? 's' : ''}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-400 text-sm">Taux d'adoption</span>
                <CheckBadgeIcon className="w-5 h-5 text-success-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.totalProposals > 0 ? Math.round((stats.passedProposals / stats.totalProposals) * 100) : 0}%
              </p>
              <p className="text-xs text-dark-500 mt-1">
                {stats.passedProposals}/{stats.totalProposals} acceptées
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-400 text-sm">Participation</span>
                <UserGroupIcon className="w-5 h-5 text-secondary-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.averageParticipation.toFixed(1)}%
              </p>
              <p className="text-xs text-dark-500 mt-1">
                Moyenne des votes
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-400 text-sm">Pool Communautaire</span>
                <BanknotesIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.communityPoolBalance[0] ?
                  formatAmount(stats.communityPoolBalance[0].amount, 6) : '0'} {BLOCKCHAIN_CONFIG.DENOM_DISPLAY}
              </p>
              <p className="text-xs text-dark-500 mt-1">
                Disponibles
              </p>
            </div>
          </motion.div>
        )}

        {/* Liens rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Charte de gouvernance */}
          <Link href="/governance/charter" className="block card hover:border-primary-500/50 transition-all group cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                  📜 Charte de Gouvernance
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Règles et processus du réseau
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Créer une proposition */}
          <Link href="/governance/create" className="block card hover:border-secondary-500/50 transition-all group cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                  ✨ Créer une Proposition
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Soumettez votre idée à la communauté
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-secondary-500/10 flex items-center justify-center group-hover:bg-secondary-500/20 transition-colors">
                  <PlusIcon className="w-4 h-4 text-secondary-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          {[
            { key: 'all', label: 'Toutes', count: proposals.length },
            { key: 'active', label: 'Actives', count: proposals.filter(p =>
              p.status === ProposalStatus.VOTING_PERIOD || p.status === ProposalStatus.DEPOSIT_PERIOD
            ).length },
            { key: 'passed', label: 'Acceptées', count: proposals.filter(p => p.status === ProposalStatus.PASSED).length },
            { key: 'rejected', label: 'Rejetées', count: proposals.filter(p =>
              p.status === ProposalStatus.REJECTED || p.status === ProposalStatus.FAILED
            ).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {label} <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          ))}
        </motion.div>

        {/* Liste des propositions */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-dark-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-dark-700 rounded w-full mb-2" />
                <div className="h-4 bg-dark-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <DocumentTextIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune proposition</h3>
            <p className="text-dark-400 mb-6">
              {filter === 'all'
                ? 'Il n\'y a pas encore de propositions sur le réseau.'
                : `Il n'y a pas de propositions ${filter === 'active' ? 'actives' : filter === 'passed' ? 'acceptées' : 'rejetées'}.`
              }
            </p>
            {isAuthenticated && filter === 'all' && (
              <Link href="/governance/create" className="btn-primary inline-flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Créer la première proposition
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {filteredProposals.map((proposal, index) => {
              const TypeIcon = getTypeIcon(proposal.type)
              const totalDeposit = proposal.total_deposit.reduce((sum, d) => sum + parseInt(d.amount), 0)

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/governance/${proposal.id}`}>
                    <div className="card hover:border-primary-500/50 transition-all cursor-pointer group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-mono text-dark-500">#{proposal.proposal_id}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                              {getStatusLabel(proposal.status)}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gradient transition-all">
                            {proposal.title}
                          </h3>
                          <p className="text-sm text-dark-400 line-clamp-2">
                            {proposal.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          <TypeIcon className="w-8 h-8 text-primary-400" />
                        </div>
                      </div>

                      {/* Informations */}
                      <div className="flex items-center justify-between text-xs text-dark-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>
                              {proposal.voting_end_time
                                ? calculateTimeRemaining(proposal.voting_end_time)
                                : proposal.deposit_end_time
                                  ? calculateTimeRemaining(proposal.deposit_end_time)
                                  : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BanknotesIcon className="w-4 h-4" />
                            <span>{formatAmount(totalDeposit.toString(), 6)} {BLOCKCHAIN_CONFIG.DENOM_DISPLAY}</span>
                          </div>
                        </div>
                        <span className="text-primary-400 group-hover:translate-x-1 transition-transform inline-block">
                          Voir les détails →
                        </span>
                      </div>

                      {/* Barre de progression des votes si en période de vote */}
                      {proposal.status === ProposalStatus.VOTING_PERIOD && proposal.final_tally_result && (
                        <div className="mt-4 pt-4 border-t border-dark-700/50">
                          <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                            <div className="text-center">
                              <div className="text-success-400 font-medium">
                                {proposal.final_tally_result.yes_count ?
                                  formatAmount(proposal.final_tally_result.yes_count, 6) : '0'}
                              </div>
                              <div className="text-dark-500">Oui</div>
                            </div>
                            <div className="text-center">
                              <div className="text-danger-400 font-medium">
                                {proposal.final_tally_result.no_count ?
                                  formatAmount(proposal.final_tally_result.no_count, 6) : '0'}
                              </div>
                              <div className="text-dark-500">Non</div>
                            </div>
                            <div className="text-center">
                              <div className="text-purple-400 font-medium">
                                {proposal.final_tally_result.no_with_veto_count ?
                                  formatAmount(proposal.final_tally_result.no_with_veto_count, 6) : '0'}
                              </div>
                              <div className="text-dark-500">Veto</div>
                            </div>
                            <div className="text-center">
                              <div className="text-dark-400 font-medium">
                                {proposal.final_tally_result.abstain_count ?
                                  formatAmount(proposal.final_tally_result.abstain_count, 6) : '0'}
                              </div>
                              <div className="text-dark-500">Abstention</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
