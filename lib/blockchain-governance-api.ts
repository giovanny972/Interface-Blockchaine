/**
 * Blockchain Governance API
 * Integration with Cosmos SDK x/gov module
 */

import type {
  Proposal,
  Vote,
  Deposit,
  TallyResult,
  GovernanceParams,
  VoteOption,
  ProposalStatus
} from '@/types/governance'

// Configuration des endpoints blockchain
export const BLOCKCHAIN_CONFIG = {
  // REST API (LCD - Light Client Daemon)
  REST_URL: process.env.NEXT_PUBLIC_REST_URL || 'http://localhost:1317',

  // gRPC Web
  GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:9090',

  // Tendermint RPC
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:26657',

  // Chain ID
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-1',

  // Denom
  DENOM: process.env.NEXT_PUBLIC_DENOM || 'ucaps',
  DENOM_DISPLAY: process.env.NEXT_PUBLIC_DENOM_DISPLAY || 'CAPS',

  // Endpoints gouvernance
  GOV_ENDPOINTS: {
    proposals: '/cosmos/gov/v1/proposals',
    proposal: (id: string) => `/cosmos/gov/v1/proposals/${id}`,
    votes: (id: string) => `/cosmos/gov/v1/proposals/${id}/votes`,
    vote: (id: string, voter: string) => `/cosmos/gov/v1/proposals/${id}/votes/${voter}`,
    deposits: (id: string) => `/cosmos/gov/v1/proposals/${id}/deposits`,
    deposit: (id: string, depositor: string) => `/cosmos/gov/v1/proposals/${id}/deposits/${depositor}`,
    tally: (id: string) => `/cosmos/gov/v1/proposals/${id}/tally`,
    params: (type: 'voting' | 'tallying' | 'deposit') => `/cosmos/gov/v1/params/${type}`,
  },

  // TX Broadcasting
  BROADCAST_TX: '/cosmos/tx/v1beta1/txs',

  // Bank module
  BANK_BALANCE: (address: string) => `/cosmos/bank/v1beta1/balances/${address}`,
  COMMUNITY_POOL: '/cosmos/distribution/v1beta1/community_pool',
}

// Types pour les réponses API
interface ApiResponse<T> {
  data?: T
  error?: string
  code?: number
}

interface ProposalsResponse {
  proposals: any[]
  pagination: {
    next_key: string | null
    total: string
  }
}

interface ProposalResponse {
  proposal: any
}

interface VotesResponse {
  votes: any[]
  pagination: {
    next_key: string | null
    total: string
  }
}

interface DepositsResponse {
  deposits: any[]
  pagination: {
    next_key: string | null
    total: string
  }
}

interface TallyResponse {
  tally: {
    yes_count: string
    abstain_count: string
    no_count: string
    no_with_veto_count: string
  }
}

interface ParamsResponse {
  voting_params?: {
    voting_period: string
  }
  deposit_params?: {
    min_deposit: Array<{ denom: string; amount: string }>
    max_deposit_period: string
  }
  tally_params?: {
    quorum: string
    threshold: string
    veto_threshold: string
  }
  params?: {
    min_deposit: Array<{ denom: string; amount: string }>
    max_deposit_period: string
    voting_period: string
    quorum: string
    threshold: string
    veto_threshold: string
  }
}

// Mapping des status de proposition
const statusMap: Record<number, ProposalStatus> = {
  0: 'UNSPECIFIED',
  1: 'DEPOSIT_PERIOD',
  2: 'VOTING_PERIOD',
  3: 'PASSED',
  4: 'REJECTED',
  5: 'FAILED'
}

const voteOptionMap: Record<number, VoteOption> = {
  0: 'UNSPECIFIED',
  1: 'YES',
  2: 'ABSTAIN',
  3: 'NO',
  4: 'NO_WITH_VETO'
}

/**
 * Fonction helper pour faire des requêtes à la blockchain
 */
async function fetchFromBlockchain<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const url = `${BLOCKCHAIN_CONFIG.REST_URL}${endpoint}`
    console.log('🔗 Fetching from blockchain:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 10 secondes
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data, code: response.status }
  } catch (error) {
    console.error('❌ Blockchain fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500
    }
  }
}

/**
 * Convertir les données brutes de la blockchain en format frontend
 */
function convertProposal(rawProposal: any): Proposal {
  return {
    id: rawProposal.id || rawProposal.proposal_id,
    proposal_id: rawProposal.id || rawProposal.proposal_id,
    title: rawProposal.title || rawProposal.messages?.[0]?.title || 'Sans titre',
    description: rawProposal.summary || rawProposal.description || '',
    type: determineProposalType(rawProposal),
    status: statusMap[rawProposal.status] || 'UNSPECIFIED',
    submit_time: rawProposal.submit_time,
    deposit_end_time: rawProposal.deposit_end_time,
    voting_start_time: rawProposal.voting_start_time,
    voting_end_time: rawProposal.voting_end_time,
    total_deposit: rawProposal.total_deposit || [],
    final_tally_result: rawProposal.final_tally_result ? {
      yes_count: rawProposal.final_tally_result.yes_count || '0',
      abstain_count: rawProposal.final_tally_result.abstain_count || '0',
      no_count: rawProposal.final_tally_result.no_count || '0',
      no_with_veto_count: rawProposal.final_tally_result.no_with_veto_count || '0'
    } : undefined,
    proposer: rawProposal.proposer || 'unknown',
    messages: rawProposal.messages || []
  }
}

function determineProposalType(proposal: any): any {
  if (!proposal.messages || proposal.messages.length === 0) {
    return 'TEXT_PROPOSAL'
  }

  const typeUrl = proposal.messages[0]['@type'] || proposal.messages[0].typeUrl

  if (typeUrl?.includes('MsgUpdateParams')) return 'PARAMETER_CHANGE'
  if (typeUrl?.includes('SoftwareUpgrade')) return 'SOFTWARE_UPGRADE'
  if (typeUrl?.includes('CommunityPoolSpend')) return 'COMMUNITY_POOL_SPEND'
  if (typeUrl?.includes('ClientUpdate')) return 'CLIENT_UPDATE'

  return 'TEXT_PROPOSAL'
}

/**
 * 1. Récupérer toutes les propositions
 */
export async function fetchProposals(
  status?: ProposalStatus,
  limit: number = 100
): Promise<ApiResponse<Proposal[]>> {
  let endpoint = `${BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.proposals}?pagination.limit=${limit}`

  // Filtrer par status si fourni
  if (status && status !== 'UNSPECIFIED') {
    const statusCode = Object.entries(statusMap).find(([_, v]) => v === status)?.[0]
    if (statusCode) {
      endpoint += `&proposal_status=${statusCode}`
    }
  }

  const result = await fetchFromBlockchain<ProposalsResponse>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch proposals' }
  }

  const proposals = result.data.proposals?.map(convertProposal) || []

  return { data: proposals }
}

/**
 * 2. Récupérer une proposition spécifique
 */
export async function fetchProposal(proposalId: string): Promise<ApiResponse<Proposal>> {
  const endpoint = BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.proposal(proposalId)
  const result = await fetchFromBlockchain<ProposalResponse>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch proposal' }
  }

  const proposal = convertProposal(result.data.proposal)

  return { data: proposal }
}

/**
 * 3. Récupérer les votes d'une proposition
 */
export async function fetchVotes(
  proposalId: string,
  limit: number = 100
): Promise<ApiResponse<Vote[]>> {
  const endpoint = `${BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.votes(proposalId)}?pagination.limit=${limit}`
  const result = await fetchFromBlockchain<VotesResponse>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch votes' }
  }

  const votes: Vote[] = result.data.votes?.map((v: any) => ({
    proposal_id: proposalId,
    voter: v.voter,
    options: v.options?.map((o: any) => ({
      option: voteOptionMap[o.option] || 'UNSPECIFIED',
      weight: o.weight || '1.0'
    })) || [{ option: voteOptionMap[v.option] || 'UNSPECIFIED', weight: '1.0' }],
    metadata: v.metadata || ''
  })) || []

  return { data: votes }
}

/**
 * 4. Récupérer le vote d'un utilisateur spécifique
 */
export async function fetchUserVote(
  proposalId: string,
  voter: string
): Promise<ApiResponse<Vote>> {
  const endpoint = BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.vote(proposalId, voter)
  const result = await fetchFromBlockchain<{ vote: any }>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch user vote' }
  }

  const vote: Vote = {
    proposal_id: proposalId,
    voter: result.data.vote.voter,
    options: result.data.vote.options?.map((o: any) => ({
      option: voteOptionMap[o.option] || 'UNSPECIFIED',
      weight: o.weight || '1.0'
    })) || [],
    metadata: result.data.vote.metadata || ''
  }

  return { data: vote }
}

/**
 * 5. Récupérer les dépôts d'une proposition
 */
export async function fetchDeposits(
  proposalId: string,
  limit: number = 100
): Promise<ApiResponse<Deposit[]>> {
  const endpoint = `${BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.deposits(proposalId)}?pagination.limit=${limit}`
  const result = await fetchFromBlockchain<DepositsResponse>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch deposits' }
  }

  const deposits: Deposit[] = result.data.deposits?.map((d: any) => ({
    proposal_id: proposalId,
    depositor: d.depositor,
    amount: d.amount || []
  })) || []

  return { data: deposits }
}

/**
 * 6. Récupérer le résultat du décompte (tally)
 */
export async function fetchTally(proposalId: string): Promise<ApiResponse<TallyResult>> {
  const endpoint = BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.tally(proposalId)
  const result = await fetchFromBlockchain<TallyResponse>(endpoint)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch tally' }
  }

  const tally: TallyResult = {
    yes_count: result.data.tally.yes_count || '0',
    abstain_count: result.data.tally.abstain_count || '0',
    no_count: result.data.tally.no_count || '0',
    no_with_veto_count: result.data.tally.no_with_veto_count || '0'
  }

  return { data: tally }
}

/**
 * 7. Récupérer les paramètres de gouvernance
 */
export async function fetchGovernanceParams(): Promise<ApiResponse<GovernanceParams>> {
  try {
    // Récupérer tous les types de paramètres
    const [votingResult, tallyingResult, depositResult] = await Promise.all([
      fetchFromBlockchain<ParamsResponse>(BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.params('voting')),
      fetchFromBlockchain<ParamsResponse>(BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.params('tallying')),
      fetchFromBlockchain<ParamsResponse>(BLOCKCHAIN_CONFIG.GOV_ENDPOINTS.params('deposit'))
    ])

    // Certaines versions du SDK retournent tout dans un seul objet "params"
    const votingParams = votingResult.data?.voting_params || votingResult.data?.params
    const depositParams = depositResult.data?.deposit_params || depositResult.data?.params
    const tallyParams = tallyingResult.data?.tally_params || tallyingResult.data?.params

    const params: GovernanceParams = {
      voting_params: {
        voting_period: votingParams?.voting_period || '432000s' // 5 jours par défaut
      },
      deposit_params: {
        min_deposit: depositParams?.min_deposit || [{ denom: BLOCKCHAIN_CONFIG.DENOM, amount: '500000000' }],
        max_deposit_period: depositParams?.max_deposit_period || '604800s' // 7 jours par défaut
      },
      tally_params: {
        quorum: tallyParams?.quorum || '0.334000000000000000',
        threshold: tallyParams?.threshold || '0.500000000000000000',
        veto_threshold: tallyParams?.veto_threshold || '0.334000000000000000'
      }
    }

    return { data: params }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch governance params'
    }
  }
}

/**
 * 8. Récupérer le community pool
 */
export async function fetchCommunityPool(): Promise<ApiResponse<Array<{ denom: string; amount: string }>>> {
  const result = await fetchFromBlockchain<{ pool: any[] }>(BLOCKCHAIN_CONFIG.COMMUNITY_POOL)

  if (result.error || !result.data) {
    return { error: result.error || 'Failed to fetch community pool' }
  }

  return { data: result.data.pool || [] }
}

/**
 * Vérifier si la blockchain est accessible
 */
export async function checkBlockchainConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${BLOCKCHAIN_CONFIG.REST_URL}/cosmos/base/tendermint/v1beta1/node_info`, {
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Formater un montant en dénomination lisible
 */
export function formatAmount(amount: string, decimals: number = 6): string {
  const num = parseInt(amount) / Math.pow(10, decimals)
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
}

/**
 * Calculer le pourcentage de votes
 */
export function calculateVotePercentage(tally: TallyResult, option: keyof TallyResult): number {
  const total =
    parseInt(tally.yes_count) +
    parseInt(tally.no_count) +
    parseInt(tally.abstain_count) +
    parseInt(tally.no_with_veto_count)

  if (total === 0) return 0

  return (parseInt(tally[option]) / total) * 100
}

/**
 * Calculer le temps restant
 */
export function calculateTimeRemaining(endTime: string): string {
  const end = new Date(endTime)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Terminé'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}j ${hours}h`
  return `${hours}h`
}
