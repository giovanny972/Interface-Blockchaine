/**
 * Blockchain API Client
 * Intégration complète avec l'API Capsule Blockchain
 *
 * Base URL: http://141.95.160.10:1317
 * Network: capsule-mainnet-1
 * RPC: http://141.95.160.10:26657
 */

import axios, { AxiosInstance } from 'axios'

// ============================================================================
// CONFIGURATION
// ============================================================================

const BLOCKCHAIN_CONFIG = {
  REST_ENDPOINT: process.env.NEXT_PUBLIC_REST_ENDPOINT || 'http://141.95.160.10:1317',
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://141.95.160.10:26657',
  GRPC_ENDPOINT: process.env.NEXT_PUBLIC_GRPC_ENDPOINT || 'http://141.95.160.10:9090',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-mainnet-1',
  DENOM: 'stake', // À confirmer avec votre token natif
}

// ============================================================================
// TYPES - TimeCapsule Module
// ============================================================================

export type CapsuleStatus = 'CAPSULE_STATUS_ACTIVE' | 'CAPSULE_STATUS_UNLOCKED' | 'CAPSULE_STATUS_CANCELLED'

export interface BlockchainCapsule {
  id: string
  creator: string
  recipient: string
  data: string // base64 encoded
  unlock_time: string // RFC3339 format
  status: CapsuleStatus
  metadata: string
  created_at: string
  unlocked_at: string | null
}

export interface TimeCapsuleParams {
  minimum_lock_duration: string
  maximum_lock_duration: string
  creation_fee: string
}

export interface PaginationRequest {
  limit?: number
  offset?: number
  key?: string
  count_total?: boolean
  reverse?: boolean
}

export interface PaginationResponse {
  next_key: string | null
  total: string
}

export interface CapsulesListResponse {
  capsules: BlockchainCapsule[]
  pagination: PaginationResponse
}

export interface CapsuleResponse {
  capsule: BlockchainCapsule
}

export interface TimeCapsuleParamsResponse {
  params: TimeCapsuleParams
}

// ============================================================================
// TYPES - CapsuleRWA Module
// ============================================================================

export type AssetType = 'REAL_ESTATE' | 'ARTWORK' | 'COLLECTIBLE' | 'VEHICLE' | 'OTHER'
export type AssetStatus = 'ASSET_STATUS_PENDING' | 'ASSET_STATUS_ACTIVE' | 'ASSET_STATUS_FROZEN' | 'ASSET_STATUS_RETIRED'

export interface RWAAsset {
  id: string
  owner: string
  name: string
  description: string
  asset_type: AssetType
  value: string // micro-units
  total_fractions: string
  available_fractions: string
  status: AssetStatus
  created_at: string
  metadata: string // JSON string
}

export interface FractionBalance {
  asset_id: string
  owner: string
  fractions: string
}

export interface CapsuleRWAParams {
  minimum_fractions: string
  tokenization_fee: string
}

export interface AssetsListResponse {
  assets: RWAAsset[]
  pagination: PaginationResponse
}

export interface AssetResponse {
  asset: RWAAsset
}

export interface BalancesListResponse {
  balances: FractionBalance[]
  pagination: PaginationResponse
}

export interface BalanceResponse {
  balance: FractionBalance
}

export interface CapsuleRWAParamsResponse {
  params: CapsuleRWAParams
}

// ============================================================================
// TYPES - Cosmos SDK Standard
// ============================================================================

export interface Coin {
  denom: string
  amount: string
}

export interface Balance {
  balances: Coin[]
  pagination: PaginationResponse
}

export interface AccountInfo {
  '@type': string
  address: string
  pub_key?: {
    '@type': string
    key: string
  }
  account_number: string
  sequence: string
}

export interface NodeStatus {
  node_info: {
    protocol_version: {
      p2p: string
      block: string
      app: string
    }
    id: string
    listen_addr: string
    network: string
    version: string
    channels: string
    moniker: string
    other: {
      tx_index: string
      rpc_address: string
    }
  }
  sync_info: {
    latest_block_hash: string
    latest_app_hash: string
    latest_block_height: string
    latest_block_time: string
    earliest_block_hash: string
    earliest_app_hash: string
    earliest_block_height: string
    earliest_block_time: string
    catching_up: boolean
  }
  validator_info: {
    address: string
    pub_key: {
      type: string
      value: string
    }
    voting_power: string
  }
}

// ============================================================================
// BLOCKCHAIN API CLIENT
// ============================================================================

class BlockchainAPIClient {
  private restClient: AxiosInstance
  private rpcClient: AxiosInstance

  constructor() {
    // REST API client (Cosmos SDK)
    this.restClient = axios.create({
      baseURL: BLOCKCHAIN_CONFIG.REST_ENDPOINT,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // RPC client (CometBFT)
    this.rpcClient = axios.create({
      baseURL: BLOCKCHAIN_CONFIG.RPC_ENDPOINT,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Intercepteur de réponse pour gérer les erreurs
    this.restClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Blockchain API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ==========================================================================
  // TIMECAPSULE MODULE - QUERIES
  // ==========================================================================

  /**
   * Obtenir les paramètres du module TimeCapsule
   */
  async getTimeCapsuleParams(): Promise<TimeCapsuleParams> {
    const response = await this.restClient.get<TimeCapsuleParamsResponse>(
      '/cosmos/timecapsule/v1/params'
    )
    return response.data.params
  }

  /**
   * Lister toutes les capsules avec pagination
   */
  async getAllCapsules(pagination?: PaginationRequest): Promise<CapsulesListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<CapsulesListResponse>(
      '/cosmos/timecapsule/v1/capsules',
      { params }
    )
    return response.data
  }

  /**
   * Obtenir une capsule spécifique par ID
   */
  async getCapsuleById(id: string): Promise<BlockchainCapsule> {
    const response = await this.restClient.get<CapsuleResponse>(
      `/cosmos/timecapsule/v1/capsules/${id}`
    )
    return response.data.capsule
  }

  /**
   * Obtenir les capsules créées par une adresse
   */
  async getCapsulesByCreator(creator: string, pagination?: PaginationRequest): Promise<CapsulesListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<CapsulesListResponse>(
      `/cosmos/timecapsule/v1/capsules/creator/${creator}`,
      { params }
    )
    return response.data
  }

  /**
   * Obtenir les capsules destinées à une adresse
   */
  async getCapsulesByRecipient(recipient: string, pagination?: PaginationRequest): Promise<CapsulesListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<CapsulesListResponse>(
      `/cosmos/timecapsule/v1/capsules/recipient/${recipient}`,
      { params }
    )
    return response.data
  }

  // ==========================================================================
  // CAPSULERWA MODULE - QUERIES
  // ==========================================================================

  /**
   * Obtenir les paramètres du module CapsuleRWA
   */
  async getCapsuleRWAParams(): Promise<CapsuleRWAParams> {
    const response = await this.restClient.get<CapsuleRWAParamsResponse>(
      '/cosmos/capsulerwa/v1/params'
    )
    return response.data.params
  }

  /**
   * Lister tous les actifs RWA
   */
  async getAllAssets(pagination?: PaginationRequest): Promise<AssetsListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<AssetsListResponse>(
      '/cosmos/capsulerwa/v1/assets',
      { params }
    )
    return response.data
  }

  /**
   * Obtenir un actif RWA spécifique
   */
  async getAssetById(id: string): Promise<RWAAsset> {
    const response = await this.restClient.get<AssetResponse>(
      `/cosmos/capsulerwa/v1/assets/${id}`
    )
    return response.data.asset
  }

  /**
   * Obtenir les actifs d'un propriétaire
   */
  async getAssetsByOwner(owner: string, pagination?: PaginationRequest): Promise<AssetsListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<AssetsListResponse>(
      `/cosmos/capsulerwa/v1/assets/owner/${owner}`,
      { params }
    )
    return response.data
  }

  /**
   * Obtenir toutes les balances de fractions
   */
  async getAllFractionBalances(pagination?: PaginationRequest): Promise<BalancesListResponse> {
    const params = this.buildPaginationParams(pagination)
    const response = await this.restClient.get<BalancesListResponse>(
      '/cosmos/capsulerwa/v1/balances',
      { params }
    )
    return response.data
  }

  /**
   * Obtenir la balance de fractions d'un utilisateur pour un actif
   */
  async getFractionBalance(owner: string, assetId: string): Promise<FractionBalance> {
    const response = await this.restClient.get<BalanceResponse>(
      `/cosmos/capsulerwa/v1/balances/${owner}/${assetId}`
    )
    return response.data.balance
  }

  // ==========================================================================
  // COSMOS SDK STANDARD - AUTH & BANK
  // ==========================================================================

  /**
   * Obtenir le solde d'une adresse
   */
  async getBalance(address: string): Promise<Coin[]> {
    const response = await this.restClient.get<Balance>(
      `/cosmos/bank/v1beta1/balances/${address}`
    )
    return response.data.balances
  }

  /**
   * Obtenir le solde d'un denom spécifique
   */
  async getBalanceByDenom(address: string, denom: string): Promise<string> {
    const balances = await this.getBalance(address)
    const balance = balances.find(b => b.denom === denom)
    return balance?.amount || '0'
  }

  /**
   * Obtenir les informations d'un compte
   */
  async getAccountInfo(address: string): Promise<AccountInfo> {
    const response = await this.restClient.get<{ account: AccountInfo }>(
      `/cosmos/auth/v1beta1/accounts/${address}`
    )
    return response.data.account
  }

  /**
   * Obtenir le statut du nœud
   */
  async getNodeStatus(): Promise<NodeStatus> {
    const response = await this.rpcClient.get<{ result: NodeStatus }>('/status')
    return response.data.result
  }

  /**
   * Obtenir la hauteur actuelle du bloc
   */
  async getBlockHeight(): Promise<number> {
    const status = await this.getNodeStatus()
    return parseInt(status.sync_info.latest_block_height)
  }

  /**
   * Vérifier si le nœud est synchronisé
   */
  async isNodeSynced(): Promise<boolean> {
    const status = await this.getNodeStatus()
    return !status.sync_info.catching_up
  }

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  /**
   * Construire les paramètres de pagination
   */
  private buildPaginationParams(pagination?: PaginationRequest): Record<string, any> {
    if (!pagination) return {}

    const params: Record<string, any> = {}
    if (pagination.limit) params['pagination.limit'] = pagination.limit
    if (pagination.offset) params['pagination.offset'] = pagination.offset
    if (pagination.key) params['pagination.key'] = pagination.key
    if (pagination.count_total) params['pagination.count_total'] = pagination.count_total
    if (pagination.reverse) params['pagination.reverse'] = pagination.reverse

    return params
  }

  /**
   * Décoder du base64
   */
  decodeBase64(encoded: string): string {
    if (typeof window !== 'undefined') {
      return atob(encoded)
    }
    return Buffer.from(encoded, 'base64').toString('utf-8')
  }

  /**
   * Encoder en base64
   */
  encodeBase64(data: string): string {
    if (typeof window !== 'undefined') {
      return btoa(data)
    }
    return Buffer.from(data).toString('base64')
  }

  /**
   * Convertir des micro-unités en unités normales
   */
  fromMicroUnits(amount: string, decimals: number = 6): number {
    return parseInt(amount) / Math.pow(10, decimals)
  }

  /**
   * Convertir des unités normales en micro-unités
   */
  toMicroUnits(amount: number, decimals: number = 6): string {
    return Math.floor(amount * Math.pow(10, decimals)).toString()
  }

  /**
   * Formater un timestamp RFC3339
   */
  formatTimestamp(timestamp: string): Date {
    return new Date(timestamp)
  }

  /**
   * Créer un timestamp RFC3339
   */
  createTimestamp(date: Date): string {
    return date.toISOString()
  }

  /**
   * Vérifier si une capsule est déverrouillable
   */
  isCapsuleUnlockable(capsule: BlockchainCapsule): boolean {
    if (capsule.status !== 'CAPSULE_STATUS_ACTIVE') return false
    const unlockTime = new Date(capsule.unlock_time)
    return unlockTime <= new Date()
  }

  /**
   * Parser les métadonnées JSON
   */
  parseMetadata<T = any>(metadata: string): T | null {
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }
}

// ============================================================================
// INSTANCE SINGLETON (Lazy loaded pour éviter les problèmes SSR)
// ============================================================================

let _blockchainAPIInstance: BlockchainAPIClient | null = null

export const getBlockchainAPI = (): BlockchainAPIClient => {
  if (!_blockchainAPIInstance) {
    _blockchainAPIInstance = new BlockchainAPIClient()
  }
  return _blockchainAPIInstance
}

// Export pour compatibilité
export const blockchainAPI = new Proxy({} as BlockchainAPIClient, {
  get: (_target, prop) => {
    const instance = getBlockchainAPI()
    return instance[prop as keyof BlockchainAPIClient]
  }
})

export default blockchainAPI
