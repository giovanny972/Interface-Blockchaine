/**
 * Helper pour créer et envoyer des transactions vers le module timecapsule
 * Utilise CosmJS pour interagir avec la blockchain Cosmos
 */

import { SigningStargateClient, StdFee } from '@cosmjs/stargate'
import { OfflineSigner } from '@cosmjs/proto-signing'
import {
  MsgCreateCapsuleEncodeObject,
  MsgOpenCapsuleEncodeObject,
  MsgTransferCapsuleEncodeObject,
  MsgCancelCapsuleEncodeObject,
  MsgCreateCapsule,
  MsgOpenCapsule,
  MsgTransferCapsule,
  MsgCancelCapsule,
  dateToTimestamp,
  encodeContent,
  CapsuleTypeChain
} from '@/types/timecapsule'

/**
 * Configuration pour les transactions timecapsule
 */
export interface TimeCapsuleConfig {
  rpcEndpoint: string
  chainId: string
  denom: string
  gasPrice: string
}

/**
 * Classe helper pour gérer les transactions timecapsule
 */
export class TimeCapsuleTransactions {
  private config: TimeCapsuleConfig
  private client: SigningStargateClient | null = null
  private signer: OfflineSigner | null = null

  constructor(config?: Partial<TimeCapsuleConfig>) {
    this.config = {
      rpcEndpoint: config?.rpcEndpoint || process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://141.95.160.10:26657',
      chainId: config?.chainId || process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-mainnet-1',
      denom: config?.denom || process.env.NEXT_PUBLIC_DENOM || 'ucaps',
      gasPrice: config?.gasPrice || process.env.NEXT_PUBLIC_GAS_PRICE || '0.025ucaps'
    }
  }

  /**
   * Connecter le client avec un signer (Keplr/Leap)
   */
  async connect(signer: OfflineSigner): Promise<void> {
    try {
      console.log(`🔌 Connexion au RPC: ${this.config.rpcEndpoint}`)

      this.signer = signer
      this.client = await SigningStargateClient.connectWithSigner(
        this.config.rpcEndpoint,
        signer,
        {
          broadcastPollIntervalMs: 300,
          broadcastTimeoutMs: 8000
        }
      )

      console.log('✅ Client CosmJS connecté')
    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      throw new Error('Impossible de se connecter à la blockchain')
    }
  }

  /**
   * Obtenir l'adresse du compte connecté
   */
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer non initialisé. Appelez connect() d\'abord.')
    }

    const accounts = await this.signer.getAccounts()
    if (accounts.length === 0) {
      throw new Error('Aucun compte trouvé dans le wallet')
    }

    return accounts[0].address
  }

  /**
   * Créer une capsule sur la blockchain
   */
  async createCapsule(params: MsgCreateCapsule): Promise<{
    capsuleId: string
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    // Construire le message
    const msg: MsgCreateCapsuleEncodeObject = {
      typeUrl: '/cosmos.timecapsule.v1.MsgCreateCapsule',
      value: {
        creator: params.creator || address,
        recipient: params.recipient,
        content: typeof params.content === 'string'
          ? encodeContent(params.content)
          : params.content,
        capsuleType: params.capsuleType,
        unlockTime: params.unlockTime ? dateToTimestamp(params.unlockTime) : undefined,
        metadata: params.metadata,
        threshold: params.threshold,
        totalShares: params.totalShares,
        condition: params.condition
      }
    }

    // Calculer les frais
    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '5000' // 0.005 CAPS
      }],
      gas: '200000'
    }

    console.log('📤 Envoi de la transaction de création de capsule...')
    console.log('Créateur:', msg.value.creator)
    console.log('Destinataire:', msg.value.recipient)
    console.log('Type:', msg.value.capsuleType)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Création capsule: ${params.metadata ? JSON.parse(params.metadata).title : 'Sans titre'}`
      )

      if (result.code !== 0) {
        console.error('❌ Transaction échouée:', result.rawLog)
        throw new Error(`Échec de la création: ${result.rawLog}`)
      }

      console.log('✅ Capsule créée avec succès!')
      console.log('Hash de transaction:', result.transactionHash)
      console.log('Hauteur du block:', result.height)

      // Extraire l'ID de la capsule depuis les events
      const createEvent = result.events.find(e => e.type === 'create_capsule')
      const capsuleId = createEvent?.attributes.find(a => a.key === 'capsule_id')?.value

      if (!capsuleId) {
        console.warn('⚠️ ID de capsule non trouvé dans les events, génération d\'un ID temporaire')
        return {
          capsuleId: `temp-${result.transactionHash}`,
          transactionHash: result.transactionHash,
          height: result.height
        }
      }

      return {
        capsuleId,
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)
      throw new Error(error.message || 'Erreur inconnue lors de la création de la capsule')
    }
  }

  /**
   * Ouvrir une capsule
   */
  async openCapsule(capsuleId: string): Promise<{
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgOpenCapsuleEncodeObject = {
      typeUrl: '/cosmos.timecapsule.v1.MsgOpenCapsule',
      value: {
        opener: address,
        capsuleId
      }
    }

    const fee: StdFee = {
      amount: [{ denom: this.config.denom, amount: '3000' }],
      gas: '150000'
    }

    console.log('🔓 Ouverture de la capsule:', capsuleId)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Ouverture capsule ${capsuleId}`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de l'ouverture: ${result.rawLog}`)
      }

      console.log('✅ Capsule ouverte!')

      return {
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'ouverture:', error)
      throw new Error(error.message || 'Erreur inconnue lors de l\'ouverture de la capsule')
    }
  }

  /**
   * Transférer une capsule à un autre utilisateur
   */
  async transferCapsule(capsuleId: string, newOwner: string): Promise<{
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgTransferCapsuleEncodeObject = {
      typeUrl: '/cosmos.timecapsule.v1.MsgTransferCapsule',
      value: {
        owner: address,
        capsuleId,
        newOwner
      }
    }

    const fee: StdFee = {
      amount: [{ denom: this.config.denom, amount: '3000' }],
      gas: '150000'
    }

    console.log('📮 Transfert de la capsule:', capsuleId)
    console.log('Vers:', newOwner)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Transfert capsule ${capsuleId} vers ${newOwner}`
      )

      if (result.code !== 0) {
        throw new Error(`Échec du transfert: ${result.rawLog}`)
      }

      console.log('✅ Capsule transférée!')

      return {
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du transfert:', error)
      throw new Error(error.message || 'Erreur inconnue lors du transfert de la capsule')
    }
  }

  /**
   * Annuler une capsule
   */
  async cancelCapsule(capsuleId: string): Promise<{
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgCancelCapsuleEncodeObject = {
      typeUrl: '/cosmos.timecapsule.v1.MsgCancelCapsule',
      value: {
        creator: address,
        capsuleId
      }
    }

    const fee: StdFee = {
      amount: [{ denom: this.config.denom, amount: '2000' }],
      gas: '100000'
    }

    console.log('❌ Annulation de la capsule:', capsuleId)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Annulation capsule ${capsuleId}`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de l'annulation: ${result.rawLog}`)
      }

      console.log('✅ Capsule annulée!')

      return {
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'annulation:', error)
      throw new Error(error.message || 'Erreur inconnue lors de l\'annulation de la capsule')
    }
  }

  /**
   * Déconnecter le client
   */
  disconnect(): void {
    this.client = null
    this.signer = null
    console.log('🔌 Client déconnecté')
  }
}

/**
 * Instance globale pour faciliter l'utilisation
 */
export const timecapsuleTx = new TimeCapsuleTransactions()
