/**
 * Intégration Blockchain API <-> Frontend API
 * Ce fichier sert de pont entre l'API blockchain et l'API frontend
 */

import { blockchainAPI, BlockchainCapsule as BCCapsule } from './blockchain-api'
import { TimeCapsule, CapsuleType, CapsuleStatus } from '@/types'

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

/**
 * Convertir le statut blockchain vers le statut frontend
 */
function transformStatus(blockchainStatus: string): CapsuleStatus {
  switch (blockchainStatus) {
    case 'CAPSULE_STATUS_ACTIVE':
      return CapsuleStatus.ACTIVE
    case 'CAPSULE_STATUS_UNLOCKED':
      return CapsuleStatus.UNLOCKED
    case 'CAPSULE_STATUS_CANCELLED':
    case 'CAPSULE_STATUS_EXPIRED':
      return CapsuleStatus.EXPIRED
    default:
      return CapsuleStatus.ACTIVE
  }
}

/**
 * Transformer une capsule blockchain vers une capsule frontend
 */
export function transformBlockchainCapsule(bcCapsule: BCCapsule): TimeCapsule {
  // Parser les métadonnées
  const metadata = blockchainAPI.parseMetadata<any>(bcCapsule.metadata) || {}

  const capsule: TimeCapsule = {
    id: bcCapsule.id,
    owner: bcCapsule.creator,
    recipient: bcCapsule.recipient,
    type: (metadata.type || CapsuleType.TIME_LOCK) as CapsuleType,
    status: transformStatus(bcCapsule.status),
    title: metadata.title || 'Capsule sans titre',
    description: metadata.description || '',
    encryptedData: bcCapsule.data,
    dataSize: metadata.size || 0,
    dataHash: metadata.dataHash || '',
    storageType: metadata.storageType || 'blockchain',
    ipfsHash: metadata.ipfsHash,
    createdAt: new Date(bcCapsule.created_at),
    updatedAt: new Date(bcCapsule.created_at),
    metadata: metadata,
    threshold: metadata.threshold || 1,
    totalShares: metadata.totalShares || 1,
    isUnlockable: blockchainAPI.isCapsuleUnlockable(bcCapsule),
    isPublic: metadata.isPublic || false,
    transactionHash: metadata.transactionHash,
    blockHeight: metadata.blockHeight,
  }

  // Ajouter unlockTime seulement s'il existe
  if (bcCapsule.unlock_time) {
    capsule.unlockTime = new Date(bcCapsule.unlock_time)
  }

  return capsule
}

// ============================================================================
// FONCTIONS D'INTÉGRATION
// ============================================================================

/**
 * Service d'intégration blockchain
 */
export class BlockchainIntegrationService {
  private enableBlockchain: boolean

  constructor() {
    // Activer la blockchain seulement si pas en mode développement
    this.enableBlockchain = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true'
  }

  /**
   * Vérifier si la blockchain est disponible
   */
  async isBlockchainAvailable(): Promise<boolean> {
    if (!this.enableBlockchain) return false

    try {
      await blockchainAPI.getBlockHeight()
      return true
    } catch (error) {
      console.warn('Blockchain non disponible:', error)
      return false
    }
  }

  /**
   * Récupérer une capsule par ID depuis la blockchain
   */
  async getCapsuleById(id: string): Promise<TimeCapsule | null> {
    if (!this.enableBlockchain) return null

    try {
      const bcCapsule = await blockchainAPI.getCapsuleById(id)
      return transformBlockchainCapsule(bcCapsule)
    } catch (error) {
      console.warn(`Capsule ${id} non trouvée sur la blockchain:`, error)
      return null
    }
  }

  /**
   * Récupérer toutes les capsules d'un créateur
   */
  async getCapsulesByCreator(creator: string): Promise<TimeCapsule[]> {
    if (!this.enableBlockchain) return []

    try {
      const response = await blockchainAPI.getCapsulesByCreator(creator, { limit: 100 })
      return response.capsules.map(transformBlockchainCapsule)
    } catch (error) {
      console.warn('Erreur lors de la récupération des capsules du créateur:', error)
      return []
    }
  }

  /**
   * Récupérer toutes les capsules destinées à un recipient
   */
  async getCapsulesByRecipient(recipient: string): Promise<TimeCapsule[]> {
    if (!this.enableBlockchain) return []

    try {
      const response = await blockchainAPI.getCapsulesByRecipient(recipient, { limit: 100 })
      return response.capsules.map(transformBlockchainCapsule)
    } catch (error) {
      console.warn('Erreur lors de la récupération des capsules du destinataire:', error)
      return []
    }
  }

  /**
   * Récupérer toutes les capsules
   */
  async getAllCapsules(): Promise<TimeCapsule[]> {
    if (!this.enableBlockchain) return []

    try {
      const response = await blockchainAPI.getAllCapsules({ limit: 100 })
      return response.capsules.map(transformBlockchainCapsule)
    } catch (error) {
      console.warn('Erreur lors de la récupération de toutes les capsules:', error)
      return []
    }
  }

  /**
   * Récupérer le solde d'une adresse
   */
  async getBalance(address: string): Promise<string> {
    if (!this.enableBlockchain) return '0'

    try {
      const denom = process.env.NEXT_PUBLIC_DENOM || 'ucaps'
      const balance = await blockchainAPI.getBalanceByDenom(address, denom)

      // Convertir de micro-unités vers unités normales
      const amount = blockchainAPI.fromMicroUnits(balance)
      return `${amount.toFixed(2)} CAPS`
    } catch (error) {
      console.warn('Erreur lors de la récupération du solde:', error)
      return '0 CAPS'
    }
  }

  /**
   * Récupérer la hauteur du bloc actuel
   */
  async getBlockHeight(): Promise<number> {
    if (!this.enableBlockchain) return 0

    try {
      return await blockchainAPI.getBlockHeight()
    } catch (error) {
      console.warn('Erreur lors de la récupération de la hauteur du bloc:', error)
      return 0
    }
  }

  /**
   * Vérifier si le nœud est synchronisé
   */
  async isNodeSynced(): Promise<boolean> {
    if (!this.enableBlockchain) return false

    try {
      return await blockchainAPI.isNodeSynced()
    } catch (error) {
      console.warn('Erreur lors de la vérification de la synchronisation:', error)
      return false
    }
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

export const blockchainIntegration = new BlockchainIntegrationService()
export default blockchainIntegration
