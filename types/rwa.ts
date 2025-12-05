/**
 * Types pour le module RWA (Real World Assets) de la blockchain
 * Permet la tokenisation d'actifs réels en fractions échangeables
 */

import { EncodeObject } from '@cosmjs/proto-signing'

// Types d'actifs RWA supportés
export enum AssetType {
  REAL_ESTATE = 'real_estate',
  PATENT = 'patent',
  ART = 'art',
  EQUITY = 'equity',
  BOND = 'bond',
  COMMODITY = 'commodity',
  OTHER = 'other'
}

// Statut du token RWA
export enum TokenStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  REDEEMED = 'redeemed',
  CANCELLED = 'cancelled'
}

// Type d'ordre sur le marché
export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market'
}

// Statut d'un ordre
export enum OrderStatus {
  OPEN = 'open',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Type de redemption
export enum RedemptionType {
  PHYSICAL = 'physical',
  CASH = 'cash',
  PARTIAL = 'partial'
}

// Statut de redemption
export enum RedemptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

// Métadonnées d'un actif
export interface AssetMetadata {
  assetType: AssetType
  name: string
  description: string
  location?: string
  legalOwner: string
  legalDocumentURI?: string
  appraisalURI?: string
  images?: string[]
  certificates?: string[]
  additionalInfo?: Record<string, any>
}

// Données de conformité
export interface ComplianceData {
  requireKYC: boolean
  requireAccredited: boolean
  allowedJurisdictions: string[]
  blockedJurisdictions: string[]
  minimumHoldingPeriod?: number // en secondes
  transferRestrictions?: string[]
  auditTrailRequired: boolean
}

// Token RWA complet
export interface RWAToken {
  tokenID: string
  capsuleID: string
  creator: string
  totalFractions: string
  availableFractions: string
  currentValuation: {
    denom: string
    amount: string
  }
  assetMetadata: AssetMetadata
  complianceData: ComplianceData
  status: TokenStatus
  createdAt: Date
  lastValuationUpdate: Date
  holdersCount: number
  tradingVolume: string
  totalValueLocked: string
}

// Solde de fractions d'un holder
export interface FractionalBalance {
  owner: string
  tokenID: string
  fractionsOwned: string
  lockedFractions: string
  availableFractions: string
  purchasePrice: {
    denom: string
    amount: string
  }
  currentValue: {
    denom: string
    amount: string
  }
  profitLoss: {
    denom: string
    amount: string
  }
  profitLossPercentage: number
}

// Ordre sur le marché
export interface MarketOrder {
  orderID: string
  tokenID: string
  seller: string
  fractionsAmount: string
  pricePerFraction: {
    denom: string
    amount: string
  }
  totalPrice: {
    denom: string
    amount: string
  }
  orderType: OrderType
  status: OrderStatus
  useEscrow: boolean
  createdAt: Date
  expiresAt?: Date
  filledAmount: string
}

// Demande de redemption
export interface RedemptionRequest {
  requestID: string
  tokenID: string
  redeemer: string
  fractionsAmount: string
  redemptionType: RedemptionType
  status: RedemptionStatus
  isFullRedemption: boolean
  requestedAt: Date
  processedAt?: Date
  deliveryAddress?: string
  notes?: string
}

// ============================================================================
// MESSAGES TRANSACTIONS
// ============================================================================

// Message de tokenisation de capsule
export interface MsgTokenizeCapsule {
  creator: string
  capsuleID: string
  totalFractions: string
  initialValuation: {
    denom: string
    amount: string
  }
  assetMetadata: AssetMetadata
  complianceData: ComplianceData
}

export interface MsgTokenizeCapsuleEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgTokenizeCapsule'
  readonly value: MsgTokenizeCapsule
}

// Message de création d'ordre de vente
export interface MsgCreateMarketOrder {
  seller: string
  tokenID: string
  fractionsAmount: string
  pricePerFraction: {
    denom: string
    amount: string
  }
  orderType: OrderType
  useEscrow: boolean
  expiresAt?: Date
}

export interface MsgCreateMarketOrderEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgCreateMarketOrder'
  readonly value: {
    seller: string
    tokenID: string
    fractionsAmount: string
    pricePerFraction: {
      denom: string
      amount: string
    }
    orderType: string
    useEscrow: boolean
    expiresAt?: {
      seconds: number
      nanos: number
    }
  }
}

// Message d'achat de fractions
export interface MsgBuyRWAToken {
  buyer: string
  orderID: string
  fractionsAmount: string
}

export interface MsgBuyRWATokenEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgBuyRWAToken'
  readonly value: MsgBuyRWAToken
}

// Message d'annulation d'ordre
export interface MsgCancelOrder {
  seller: string
  orderID: string
}

export interface MsgCancelOrderEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgCancelOrder'
  readonly value: MsgCancelOrder
}

// Message de mise à jour de valorisation
export interface MsgUpdateValuation {
  authority: string
  tokenID: string
  newValuation: {
    denom: string
    amount: string
  }
  appraisalURI?: string
}

export interface MsgUpdateValuationEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgUpdateValuation'
  readonly value: MsgUpdateValuation
}

// Message de transfert de fractions
export interface MsgTransferFractions {
  from: string
  to: string
  tokenID: string
  fractionsAmount: string
}

export interface MsgTransferFractionsEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgTransferFractions'
  readonly value: MsgTransferFractions
}

// Message de redemption
export interface MsgRedeemRWA {
  redeemer: string
  tokenID: string
  fractionsAmount: string
  redemptionType: RedemptionType
  deliveryAddress?: string
  notes?: string
}

export interface MsgRedeemRWAEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.capsulerwa.v1.MsgRedeemRWA'
  readonly value: {
    redeemer: string
    tokenID: string
    fractionsAmount: string
    redemptionType: string
    deliveryAddress?: string
    notes?: string
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convertir Date en Timestamp protobuf
 */
export function dateToTimestamp(date: Date): { seconds: number; nanos: number } {
  const milliseconds = date.getTime()
  const seconds = Math.floor(milliseconds / 1000)
  const nanos = (milliseconds % 1000) * 1000000
  return { seconds, nanos }
}

/**
 * Convertir Timestamp protobuf en Date
 */
export function timestampToDate(timestamp: { seconds: number; nanos: number }): Date {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanos / 1000000
  return new Date(milliseconds)
}

/**
 * Calculer le pourcentage de détention
 */
export function calculateOwnershipPercentage(
  fractionsOwned: string,
  totalFractions: string
): number {
  const owned = BigInt(fractionsOwned)
  const total = BigInt(totalFractions)
  if (total === BigInt(0)) return 0
  return Number((owned * BigInt(10000)) / total) / 100 // 2 décimales
}

/**
 * Calculer la valeur actuelle des fractions
 */
export function calculateFractionValue(
  fractionsAmount: string,
  totalFractions: string,
  totalValuation: string
): string {
  const fractions = BigInt(fractionsAmount)
  const total = BigInt(totalFractions)
  const valuation = BigInt(totalValuation)

  if (total === BigInt(0)) return '0'

  return ((fractions * valuation) / total).toString()
}

/**
 * Calculer le profit/perte
 */
export function calculateProfitLoss(
  currentValue: string,
  purchasePrice: string
): {
  amount: string
  percentage: number
} {
  const current = BigInt(currentValue)
  const purchase = BigInt(purchasePrice)

  const amount = (current - purchase).toString()
  const percentage = purchase === BigInt(0)
    ? 0
    : Number((current - purchase) * BigInt(10000) / purchase) / 100

  return { amount, percentage }
}

/**
 * Formater un montant en fractions
 */
export function formatFractions(amount: string): string {
  const num = BigInt(amount)
  return num.toLocaleString()
}

/**
 * Formater un prix en monnaie
 */
export function formatPrice(amount: string, denom: string): string {
  const num = Number(amount) / 1_000_000 // Supposant 6 décimales
  const symbol = denom === 'ucaps' ? 'CAPS' : denom.toUpperCase()
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${symbol}`
}

/**
 * Valider les données de conformité
 */
export function validateComplianceData(data: ComplianceData): string[] {
  const errors: string[] = []

  if (data.allowedJurisdictions.length === 0 && data.blockedJurisdictions.length === 0) {
    errors.push('Au moins une juridiction autorisée ou bloquée doit être spécifiée')
  }

  if (data.minimumHoldingPeriod && data.minimumHoldingPeriod < 0) {
    errors.push('La période de détention minimale ne peut pas être négative')
  }

  return errors
}

/**
 * Valider les métadonnées d'actif
 */
export function validateAssetMetadata(metadata: AssetMetadata): string[] {
  const errors: string[] = []

  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push('Le nom de l\'actif est requis')
  }

  if (!metadata.description || metadata.description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères')
  }

  if (!metadata.legalOwner || metadata.legalOwner.trim().length === 0) {
    errors.push('Le propriétaire légal est requis')
  }

  return errors
}

/**
 * Vérifier si un utilisateur peut acheter un token
 */
export function canPurchaseToken(
  userJurisdiction: string,
  complianceData: ComplianceData
): { allowed: boolean; reason?: string } {
  // Vérifier juridiction bloquée
  if (complianceData.blockedJurisdictions.includes(userJurisdiction)) {
    return {
      allowed: false,
      reason: `Achat non autorisé depuis ${userJurisdiction}`
    }
  }

  // Vérifier juridiction autorisée (si la liste n'est pas vide)
  if (
    complianceData.allowedJurisdictions.length > 0 &&
    !complianceData.allowedJurisdictions.includes(userJurisdiction)
  ) {
    return {
      allowed: false,
      reason: `Achat autorisé uniquement depuis: ${complianceData.allowedJurisdictions.join(', ')}`
    }
  }

  return { allowed: true }
}
