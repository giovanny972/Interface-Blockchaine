// ============================================================================
// GOUVERNANCE MODULE TYPES - Sirius Network
// ============================================================================

// Types de votes possibles
export enum VoteOption {
  YES = 'YES',
  NO = 'NO',
  NO_WITH_VETO = 'NO_WITH_VETO',
  ABSTAIN = 'ABSTAIN'
}

// Statut d'une proposition
export enum ProposalStatus {
  UNSPECIFIED = 'UNSPECIFIED',             // Non spécifié
  DEPOSIT_PERIOD = 'DEPOSIT_PERIOD',       // En attente de dépôt minimum
  VOTING_PERIOD = 'VOTING_PERIOD',         // En période de vote
  PASSED = 'PASSED',                       // Acceptée
  REJECTED = 'REJECTED',                   // Rejetée
  FAILED = 'FAILED',                       // Échouée (quorum non atteint)
  VETOED = 'VETOED'                        // Vetoed (trop de NoWithVeto)
}

// Types de propositions
export enum ProposalType {
  TEXT_PROPOSAL = 'TEXT_PROPOSAL',         // Proposition de texte / signal politique
  PARAMETER_CHANGE = 'PARAMETER_CHANGE',   // Changement de paramètres
  SOFTWARE_UPGRADE = 'SOFTWARE_UPGRADE',   // Mise à jour logicielle
  COMMUNITY_POOL_SPEND = 'COMMUNITY_POOL_SPEND', // Dépense du pool communautaire
  CLIENT_UPDATE = 'CLIENT_UPDATE',         // Mise à jour client IBC
  CUSTOM = 'CUSTOM'                        // Proposition custom
}

// Proposition de gouvernance
export interface Proposal {
  id: string
  proposal_id: string
  title: string
  description: string
  type: ProposalType
  status: ProposalStatus

  // Informations temporelles
  submit_time: string
  deposit_end_time: string
  voting_start_time?: string
  voting_end_time?: string

  // Dépôt
  total_deposit: Coin[]

  // Résultats du vote
  final_tally_result?: TallyResult

  // Proposeur
  proposer: string

  // Messages à exécuter (gov v1)
  messages?: any[]

  // Métadonnées
  metadata?: string
  summary?: string
}

// Résultat du vote
export interface TallyResult {
  yes_count: string
  no_count: string
  abstain_count: string
  no_with_veto_count: string
}

// Vote d'un utilisateur
export interface Vote {
  proposal_id: string
  voter: string
  options: WeightedVoteOption[]
  metadata?: string
}

// Option de vote pondérée
export interface WeightedVoteOption {
  option: VoteOption
  weight: string
}

// Dépôt pour une proposition
export interface Deposit {
  proposal_id: string
  depositor: string
  amount: Coin[]
}

// Coin (montant + dénomination)
export interface Coin {
  denom: string
  amount: string
}

// Paramètres de dépôt
export interface DepositParams {
  min_deposit: Coin[]
  max_deposit_period: string // Duration en nanosecondes
}

// Paramètres de vote
export interface VotingParams {
  voting_period: string // Duration en nanosecondes
}

// Paramètres de décompte
export interface TallyParams {
  quorum: string          // Pourcentage minimum de participation (ex: "0.334" = 33.4%)
  threshold: string       // Pourcentage minimum de Yes (ex: "0.500" = 50%)
  veto_threshold: string  // Pourcentage maximum de NoWithVeto (ex: "0.334" = 33.4%)
}

// Paramètres de gouvernance complets
export interface GovParams {
  deposit_params: DepositParams
  voting_params: VotingParams
  tally_params: TallyParams
}

// ============================================================================
// MESSAGES DE TRANSACTION
// ============================================================================

// Soumettre une proposition
export interface MsgSubmitProposal {
  messages: any[]
  initial_deposit: Coin[]
  proposer: string
  metadata: string
  title: string
  summary: string
}

// Voter sur une proposition
export interface MsgVote {
  proposal_id: string
  voter: string
  option: VoteOption
  metadata?: string
}

// Vote pondéré
export interface MsgVoteWeighted {
  proposal_id: string
  voter: string
  options: WeightedVoteOption[]
  metadata?: string
}

// Déposer pour une proposition
export interface MsgDeposit {
  proposal_id: string
  depositor: string
  amount: Coin[]
}

// ============================================================================
// TYPES DE PROPOSITIONS SPÉCIFIQUES
// ============================================================================

// Proposition de changement de paramètres
export interface ParameterChangeProposal {
  title: string
  description: string
  changes: ParamChange[]
}

export interface ParamChange {
  subspace: string  // module concerné (ex: "staking", "slashing", "gov")
  key: string       // paramètre à modifier
  value: string     // nouvelle valeur (JSON string)
}

// Proposition de mise à jour logicielle
export interface SoftwareUpgradeProposal {
  title: string
  description: string
  plan: UpgradePlan
}

export interface UpgradePlan {
  name: string
  height: string
  info: string
  upgraded_client_state?: any
}

// Proposition de dépense du pool communautaire
export interface CommunityPoolSpendProposal {
  title: string
  description: string
  recipient: string
  amount: Coin[]
}

// ============================================================================
// RÉPONSES DE REQUÊTE
// ============================================================================

export interface QueryProposalResponse {
  proposal: Proposal
}

export interface QueryProposalsResponse {
  proposals: Proposal[]
  pagination?: {
    next_key?: string
    total: string
  }
}

export interface QueryVoteResponse {
  vote: Vote
}

export interface QueryVotesResponse {
  votes: Vote[]
  pagination?: {
    next_key?: string
    total: string
  }
}

export interface QueryDepositResponse {
  deposit: Deposit
}

export interface QueryDepositsResponse {
  deposits: Deposit[]
  pagination?: {
    next_key?: string
    total: string
  }
}

export interface QueryParamsResponse {
  voting_params: VotingParams
  deposit_params: DepositParams
  tally_params: TallyParams
}

// ============================================================================
// TYPES UI / FRONTEND
// ============================================================================

export interface ProposalCardData extends Proposal {
  // Données calculées côté client
  participationRate?: number
  yesPercentage?: number
  noPercentage?: number
  vetoPercentage?: number
  abstainPercentage?: number
  timeRemaining?: string
  hasVoted?: boolean
  userVote?: VoteOption
  isActive?: boolean
  canVote?: boolean
}

export interface CreateProposalForm {
  title: string
  description: string
  type: ProposalType
  deposit: string

  // Pour ParameterChange
  paramChanges?: ParamChange[]

  // Pour SoftwareUpgrade
  upgradePlan?: {
    name: string
    height: string
    info: string
  }

  // Pour CommunityPoolSpend
  recipient?: string
  spendAmount?: string

  // Métadonnées
  metadata?: string
  summary?: string
}

export interface GovStats {
  totalProposals: number
  activeProposals: number
  passedProposals: number
  rejectedProposals: number
  votingPower: string
  communityPoolBalance: Coin[]
  averageParticipation: number
}

// ============================================================================
// CONSTITUTION / CHARTE DE GOUVERNANCE
// ============================================================================

export interface GovernanceCharter {
  version: string
  lastUpdated: string
  sections: GovernanceSection[]
}

export interface GovernanceSection {
  id: string
  title: string
  content: string
  subsections?: GovernanceSubsection[]
}

export interface GovernanceSubsection {
  id: string
  title: string
  content: string
}

// ============================================================================
// DÉLÉGATION & POUVOIR DE VOTE
// ============================================================================

export interface ValidatorVotingPower {
  validator_address: string
  moniker: string
  voting_power: string
  commission: string
  voted?: boolean
  vote_option?: VoteOption
}

export interface DelegatorInfo {
  delegator_address: string
  total_voting_power: string
  validators: ValidatorVotingPower[]
  can_override_validator_vote: boolean
}
