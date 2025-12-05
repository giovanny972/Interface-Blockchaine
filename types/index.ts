// Types pour l'interface web de Capsule
export interface User {
  address: string
  balance: string
  isConnected: boolean
  walletType: 'keplr' | 'cosmostation' | 'leap' | null
  username?: string
  email?: string
  preferences?: Record<string, any>
}

export interface TimeCapsule {
  id: string
  owner: string
  recipient?: string
  type: CapsuleType
  status: CapsuleStatus
  title: string
  description?: string
  encryptedData?: string
  dataSize: number
  dataHash: string
  storageType: 'blockchain' | 'ipfs'
  ipfsHash?: string
  unlockTime?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
  threshold: number
  totalShares: number
  isUnlockable: boolean
  isPublic: boolean
  // Blockchain specific fields
  blockHeight?: number
  transactionHash?: string
  gasUsed?: string
  conditions?: TimeCapsuleConditions
  keyShares?: KeyShare[]
  cryptoAssets?: CryptoAsset[]
  // Additional properties
  network?: string
  visibility?: 'public' | 'private' | 'restricted'
}

export enum CapsuleType {
  SAFE = 'SAFE',
  TIME_LOCK = 'TIME_LOCK', 
  CONDITIONAL = 'CONDITIONAL',
  MULTI_SIG = 'MULTI_SIG',
  DEAD_MANS_SWITCH = 'DEAD_MANS_SWITCH'
}

// Blockchain specific types matching protobuf definitions
export enum BlockchainCapsuleType {
  CAPSULE_TYPE_UNSPECIFIED = 0,
  CAPSULE_TYPE_SAFE = 1,
  CAPSULE_TYPE_TIME_LOCK = 2,
  CAPSULE_TYPE_CONDITIONAL = 3,
  CAPSULE_TYPE_MULTI_SIG = 4,
  CAPSULE_TYPE_DEAD_MANS_SWITCH = 5
}

export enum CapsuleStatus {
  ACTIVE = 'ACTIVE',
  UNLOCKED = 'UNLOCKED',
  EXPIRED = 'EXPIRED',
  TRANSFERRED = 'TRANSFERRED'
}

// Blockchain specific status matching protobuf definitions
export enum BlockchainCapsuleStatus {
  CAPSULE_STATUS_UNSPECIFIED = 0,
  CAPSULE_STATUS_ACTIVE = 1,
  CAPSULE_STATUS_UNLOCKED = 2,
  CAPSULE_STATUS_EXPIRED = 3,
  CAPSULE_STATUS_TRANSFERRED = 4
}

export interface KeyShare {
  capsuleId: string
  shareIndex: number
  nodeId: string
  encryptedShare: string
  createdAt: Date
  // Blockchain specific fields
  validator?: string
  weight?: number
  isActive?: boolean
}

export interface TransferHistory {
  id: string
  capsuleId: string
  fromOwner: string
  toOwner: string
  transferType: string
  status: string
  transferTime: Date
  message?: string
  blockHeight: number
  txHash: string
}

export interface CapsuleStats {
  totalCapsules: number
  activeCapsules: number
  unlockedCapsules: number
  myCapsulesCount: number
  totalDataStored: string
  averageUnlockTime: number
  mostUsedType: CapsuleType
}

export interface NetworkStats {
  blockHeight: number
  totalTransactions: number
  networkHealth: 'healthy' | 'degraded' | 'down'
  averageBlockTime: number
  connectedNodes: number
  ipfsNodes: number
}

export interface WalletConnection {
  isConnecting: boolean
  error: string | null
  connect: (walletType: 'keplr' | 'cosmostation' | 'leap') => Promise<void>
  disconnect: () => void
}

export interface CreateCapsuleForm {
  title: string
  description: string
  recipient: string
  type: CapsuleType
  unlockTime?: Date
  file?: File
  message?: string
  threshold: number
  totalShares: number
  conditions?: ConditionContract
  isPublic: boolean
  cryptoAssets?: CryptoAsset[]
}

export interface CryptoAsset {
  denom: string
  amount: string
  displayName: string
  symbol: string
  decimals: number
  logo?: string
}

export interface ConditionContract {
  type: string
  conditions: Record<string, any>
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  email: string
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  notifyOnCapsuleUnlock: boolean
  notifyOnTransfer: boolean
  notifyBeforeUnlock: boolean
  advanceNotificationDays: number
}

export interface BackofficeUser {
  address: string
  role: 'admin' | 'moderator' | 'viewer'
  permissions: string[]
  lastActivity: Date
  isActive: boolean
}

export interface SystemHealth {
  blockchain: {
    status: 'online' | 'offline'
    blockHeight: number
    latency: number
  }
  ipfs: {
    status: 'online' | 'offline'
    nodesConnected: number
    latency: number
  }
  api: {
    status: 'online' | 'offline'
    responseTime: number
  }
}

export interface ActivityLog {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Blockchain interaction types
export interface TxResponse {
  code: number
  txhash: string
  height: number
  events: any[]
  gasUsed: string
  gasWanted: string
  rawLog?: string
  timestamp?: string
}

export interface QueryResponse<T> {
  data: T
  height: string
}

// Blockchain specific transaction messages
export interface MsgCreateCapsule {
  creator: string
  recipient: string
  capsule_type: BlockchainCapsuleType
  title: string
  description: string
  data: string
  unlock_time?: string
  metadata?: Record<string, any>
  threshold: number
  total_shares: number
  is_public: boolean
}

export interface MsgUnlockCapsule {
  creator: string
  capsule_id: string
}

export interface MsgTransferCapsule {
  creator: string
  capsule_id: string
  new_owner: string
  message?: string
}

export interface MsgDeleteCapsule {
  creator: string
  capsule_id: string
}

// Blockchain query responses
export interface QueryCapsuleResponse {
  capsule: BlockchainCapsule
}

export interface QueryUserCapsulesResponse {
  capsules: BlockchainCapsule[]
  pagination?: {
    next_key?: string
    total: string
  }
}

export interface BlockchainCapsule {
  id: string
  owner: string
  recipient: string
  capsule_type: BlockchainCapsuleType
  status: BlockchainCapsuleStatus
  title: string
  description: string
  encrypted_data: string
  data_size: string
  data_hash: string
  storage_type: string
  ipfs_hash?: string
  unlock_time?: string
  created_time: string
  updated_time: string
  metadata?: Record<string, any>
  threshold: number
  total_shares: number
  is_public: boolean
  block_height: string
  transaction_hash: string
}

// Conditions for conditional capsules
export interface TimeCapsuleConditions {
  price_condition?: PriceCondition
  event_condition?: EventCondition
  multi_sig_condition?: MultiSigCondition
  dead_mans_switch_condition?: DeadMansSwitchCondition
}

export interface PriceCondition {
  asset: string
  target_price: string
  comparison: 'GREATER_THAN' | 'LESS_THAN' | 'EQUAL'
  oracle_source: string
}

export interface EventCondition {
  event_type: string
  event_data: Record<string, any>
  verification_source: string
}

export interface MultiSigCondition {
  required_signatures: number
  authorized_signers: string[]
}

export interface DeadMansSwitchCondition {
  check_interval: string // Duration
  max_inactivity: string // Duration
  fallback_recipients: string[]
}

// ============================================================================
// RWA (Real World Assets) Module Types
// ============================================================================

export type RWAAssetType = 'REAL_ESTATE' | 'ARTWORK' | 'COLLECTIBLE' | 'VEHICLE' | 'OTHER'
export type RWAAssetStatus = 'ASSET_STATUS_PENDING' | 'ASSET_STATUS_ACTIVE' | 'ASSET_STATUS_FROZEN' | 'ASSET_STATUS_RETIRED'

export interface RWAAsset {
  id: string
  owner: string
  name: string
  description: string
  asset_type: RWAAssetType
  value: string // in micro-units
  total_fractions: string
  available_fractions: string
  status: RWAAssetStatus
  created_at: string
  metadata: string // JSON string
}

export interface RWAFractionBalance {
  asset_id: string
  owner: string
  fractions: string
}

export interface RWAAssetMetadata {
  address?: string
  size?: string
  location?: string
  year?: string
  condition?: string
  certification?: string
  images?: string[]
  documents?: string[]
  [key: string]: any
}

// RWA Transaction Messages
export interface MsgTokenizeAsset {
  owner: string
  name: string
  description: string
  asset_type: RWAAssetType
  value: string
  total_fractions: string
  metadata: string
}

export interface MsgTransferFractions {
  from: string
  to: string
  asset_id: string
  fractions: string
}

export interface MsgUpdateAsset {
  owner: string
  asset_id: string
  name?: string
  description?: string
  value?: string
  metadata?: string
}

export interface MsgFreezeAsset {
  authority: string
  asset_id: string
  reason: string
}

export interface MsgRetireAsset {
  owner: string
  asset_id: string
}