/**
 * Types pour le module timecapsule de la blockchain Cosmos
 * Générés à partir des définitions protobuf du module
 */

import { EncodeObject } from '@cosmjs/proto-signing'

// Types de capsules supportés
export enum CapsuleTypeChain {
  TIME_LOCK = 'time_lock',
  SAFE = 'safe',
  CONDITIONAL = 'conditional',
  SOCIAL_RECOVERY = 'social_recovery',
  INHERITANCE = 'inheritance',
  SUBSCRIPTION = 'subscription'
}

// Statut des capsules
export enum CapsuleStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

// Message de création de capsule
export interface MsgCreateCapsule {
  creator: string
  recipient: string
  content: Uint8Array
  capsuleType: CapsuleTypeChain
  unlockTime?: Date
  metadata?: string
  threshold?: number
  totalShares?: number
  condition?: string
}

// EncodeObject pour MsgCreateCapsule
export interface MsgCreateCapsuleEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.timecapsule.v1.MsgCreateCapsule'
  readonly value: {
    creator: string
    recipient: string
    content: Uint8Array
    capsuleType: string
    unlockTime?: {
      seconds: number
      nanos: number
    }
    metadata?: string
    threshold?: number
    totalShares?: number
    condition?: string
  }
}

// Message d'ouverture de capsule
export interface MsgOpenCapsule {
  opener: string
  capsuleId: string
}

export interface MsgOpenCapsuleEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.timecapsule.v1.MsgOpenCapsule'
  readonly value: {
    opener: string
    capsuleId: string
  }
}

// Message de transfert de capsule
export interface MsgTransferCapsule {
  owner: string
  capsuleId: string
  newOwner: string
}

export interface MsgTransferCapsuleEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.timecapsule.v1.MsgTransferCapsule'
  readonly value: {
    owner: string
    capsuleId: string
    newOwner: string
  }
}

// Message d'annulation de capsule
export interface MsgCancelCapsule {
  creator: string
  capsuleId: string
}

export interface MsgCancelCapsuleEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.timecapsule.v1.MsgCancelCapsule'
  readonly value: {
    creator: string
    capsuleId: string
  }
}

// Réponse de création de capsule
export interface MsgCreateCapsuleResponse {
  capsuleId: string
}

// Structure d'une capsule stockée sur la blockchain
export interface TimeCapsuleChain {
  id: string
  creator: string
  recipient: string
  content: Uint8Array
  capsuleType: CapsuleTypeChain
  status: CapsuleStatus
  unlockTime?: Date
  createdAt: Date
  unlockedAt?: Date
  metadata?: string
  threshold?: number
  totalShares?: number
  condition?: string
  txHash?: string
}

// Paramètres du module timecapsule
export interface TimeCapsuleParams {
  minimumLockDuration: string
  maximumLockDuration: string
  creationFee: string
}

// Statistiques du module
export interface TimeCapsuleStats {
  totalCapsules: number
  activeCapsules: number
  unlockedCapsules: number
  cancelledCapsules: number
  totalValueLocked: string
}

// Query pour récupérer une capsule
export interface QueryCapsuleRequest {
  capsuleId: string
}

export interface QueryCapsuleResponse {
  capsule: TimeCapsuleChain
}

// Query pour récupérer les capsules d'un utilisateur
export interface QueryUserCapsulesRequest {
  address: string
  pagination?: {
    limit: number
    offset: number
  }
}

export interface QueryUserCapsulesResponse {
  capsules: TimeCapsuleChain[]
  pagination?: {
    total: number
  }
}

// Helper pour convertir Date en Timestamp protobuf
export function dateToTimestamp(date: Date): { seconds: number; nanos: number } {
  const milliseconds = date.getTime()
  const seconds = Math.floor(milliseconds / 1000)
  const nanos = (milliseconds % 1000) * 1000000
  return { seconds, nanos }
}

// Helper pour convertir Timestamp protobuf en Date
export function timestampToDate(timestamp: { seconds: number; nanos: number }): Date {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanos / 1000000
  return new Date(milliseconds)
}

// Helper pour encoder du contenu en Uint8Array
export function encodeContent(content: any): Uint8Array {
  const jsonString = typeof content === 'string' ? content : JSON.stringify(content)
  return new TextEncoder().encode(jsonString)
}

// Helper pour décoder le contenu depuis Uint8Array
export function decodeContent(content: Uint8Array): any {
  const jsonString = new TextDecoder().decode(content)
  try {
    return JSON.parse(jsonString)
  } catch {
    return jsonString
  }
}
