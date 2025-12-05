/**
 * Helper pour créer et envoyer des transactions vers le module RWA
 * Gestion de la tokenisation, marketplace, et redemption d'actifs réels
 */

import { SigningStargateClient, StdFee } from '@cosmjs/stargate'
import { OfflineSigner } from '@cosmjs/proto-signing'
import {
  MsgTokenizeCapsuleEncodeObject,
  MsgCreateMarketOrderEncodeObject,
  MsgBuyRWATokenEncodeObject,
  MsgCancelOrderEncodeObject,
  MsgTransferFractionsEncodeObject,
  MsgRedeemRWAEncodeObject,
  MsgTokenizeCapsule,
  MsgCreateMarketOrder,
  MsgBuyRWAToken,
  MsgCancelOrder,
  MsgTransferFractions,
  MsgRedeemRWA,
  dateToTimestamp,
  OrderType,
  RedemptionType
} from '@/types/rwa'

/**
 * Configuration pour les transactions RWA
 */
export interface RWAConfig {
  rpcEndpoint: string
  chainId: string
  denom: string
  gasPrice: string
}

/**
 * Classe helper pour gérer les transactions RWA
 */
export class RWATransactions {
  private config: RWAConfig
  private client: SigningStargateClient | null = null
  private signer: OfflineSigner | null = null

  constructor(config?: Partial<RWAConfig>) {
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
      console.log(`🔌 Connexion au RPC pour RWA: ${this.config.rpcEndpoint}`)

      this.signer = signer
      this.client = await SigningStargateClient.connectWithSigner(
        this.config.rpcEndpoint,
        signer,
        {
          broadcastPollIntervalMs: 300,
          broadcastTimeoutMs: 8000
        }
      )

      console.log('✅ Client RWA connecté')
    } catch (error) {
      console.error('❌ Erreur de connexion RWA:', error)
      throw new Error('Impossible de se connecter à la blockchain pour RWA')
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
   * Tokeniser une capsule en RWA
   */
  async tokenizeCapsule(params: MsgTokenizeCapsule): Promise<{
    tokenID: string
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgTokenizeCapsuleEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgTokenizeCapsule',
      value: {
        creator: params.creator || address,
        capsuleID: params.capsuleID,
        totalFractions: params.totalFractions,
        initialValuation: params.initialValuation,
        assetMetadata: params.assetMetadata,
        complianceData: params.complianceData
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '10000' // 0.01 CAPS pour tokenisation
      }],
      gas: '300000'
    }

    console.log('🪙 Tokenisation de la capsule:', params.capsuleID)
    console.log('Fractions totales:', params.totalFractions)
    console.log('Valorisation initiale:', params.initialValuation.amount, params.initialValuation.denom)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Tokenisation RWA: ${params.assetMetadata.name}`
      )

      if (result.code !== 0) {
        console.error('❌ Tokenisation échouée:', result.rawLog)
        throw new Error(`Échec de la tokenisation: ${result.rawLog}`)
      }

      console.log('✅ Capsule tokenisée avec succès!')

      // Extraire l'ID du token depuis les events
      const tokenEvent = result.events.find(e => e.type === 'tokenize_capsule')
      const tokenID = tokenEvent?.attributes.find(a => a.key === 'token_id')?.value

      if (!tokenID) {
        console.warn('⚠️ ID de token non trouvé, génération d\'un ID temporaire')
        return {
          tokenID: `rwa-${result.transactionHash}`,
          transactionHash: result.transactionHash,
          height: result.height
        }
      }

      return {
        tokenID,
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la tokenisation:', error)
      throw new Error(error.message || 'Erreur inconnue lors de la tokenisation')
    }
  }

  /**
   * Créer un ordre de vente sur le marketplace
   */
  async createMarketOrder(params: MsgCreateMarketOrder): Promise<{
    orderID: string
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgCreateMarketOrderEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgCreateMarketOrder',
      value: {
        seller: params.seller || address,
        tokenID: params.tokenID,
        fractionsAmount: params.fractionsAmount,
        pricePerFraction: params.pricePerFraction,
        orderType: params.orderType,
        useEscrow: params.useEscrow,
        expiresAt: params.expiresAt ? dateToTimestamp(params.expiresAt) : undefined
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '5000' // 0.005 CAPS
      }],
      gas: '200000'
    }

    console.log('📋 Création d\'ordre de vente')
    console.log('Token:', params.tokenID)
    console.log('Fractions:', params.fractionsAmount)
    console.log('Prix/fraction:', params.pricePerFraction.amount)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Ordre de vente RWA`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de la création d'ordre: ${result.rawLog}`)
      }

      console.log('✅ Ordre créé!')

      const orderEvent = result.events.find(e => e.type === 'create_market_order')
      const orderID = orderEvent?.attributes.find(a => a.key === 'order_id')?.value || `order-${result.transactionHash}`

      return {
        orderID,
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la création d\'ordre:', error)
      throw new Error(error.message || 'Erreur inconnue lors de la création d\'ordre')
    }
  }

  /**
   * Acheter des fractions RWA
   */
  async buyRWAToken(params: MsgBuyRWAToken): Promise<{
    transactionHash: string
    height: number
    fractionsReceived: string
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgBuyRWATokenEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgBuyRWAToken',
      value: {
        buyer: params.buyer || address,
        orderID: params.orderID,
        fractionsAmount: params.fractionsAmount
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '7000' // 0.007 CAPS
      }],
      gas: '250000'
    }

    console.log('🛒 Achat de fractions RWA')
    console.log('Ordre:', params.orderID)
    console.log('Quantité:', params.fractionsAmount)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Achat RWA`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de l'achat: ${result.rawLog}`)
      }

      console.log('✅ Achat réussi!')

      return {
        transactionHash: result.transactionHash,
        height: result.height,
        fractionsReceived: params.fractionsAmount
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'achat:', error)
      throw new Error(error.message || 'Erreur inconnue lors de l\'achat')
    }
  }

  /**
   * Annuler un ordre de vente
   */
  async cancelOrder(params: MsgCancelOrder): Promise<{
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgCancelOrderEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgCancelOrder',
      value: {
        seller: params.seller || address,
        orderID: params.orderID
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '3000' // 0.003 CAPS
      }],
      gas: '150000'
    }

    console.log('❌ Annulation d\'ordre:', params.orderID)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Annulation ordre RWA`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de l'annulation: ${result.rawLog}`)
      }

      console.log('✅ Ordre annulé!')

      return {
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'annulation:', error)
      throw new Error(error.message || 'Erreur inconnue lors de l\'annulation')
    }
  }

  /**
   * Transférer des fractions à un autre utilisateur
   */
  async transferFractions(params: MsgTransferFractions): Promise<{
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgTransferFractionsEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgTransferFractions',
      value: {
        from: params.from || address,
        to: params.to,
        tokenID: params.tokenID,
        fractionsAmount: params.fractionsAmount
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '4000' // 0.004 CAPS
      }],
      gas: '180000'
    }

    console.log('📮 Transfert de fractions')
    console.log('Vers:', params.to)
    console.log('Quantité:', params.fractionsAmount)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Transfert RWA`
      )

      if (result.code !== 0) {
        throw new Error(`Échec du transfert: ${result.rawLog}`)
      }

      console.log('✅ Transfert réussi!')

      return {
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du transfert:', error)
      throw new Error(error.message || 'Erreur inconnue lors du transfert')
    }
  }

  /**
   * Redemption de fractions (convertir en actif physique ou cash)
   */
  async redeemRWA(params: MsgRedeemRWA): Promise<{
    requestID: string
    transactionHash: string
    height: number
  }> {
    if (!this.client) {
      throw new Error('Client non connecté. Appelez connect() d\'abord.')
    }

    const address = await this.getAddress()

    const msg: MsgRedeemRWAEncodeObject = {
      typeUrl: '/cosmos.capsulerwa.v1.MsgRedeemRWA',
      value: {
        redeemer: params.redeemer || address,
        tokenID: params.tokenID,
        fractionsAmount: params.fractionsAmount,
        redemptionType: params.redemptionType,
        deliveryAddress: params.deliveryAddress,
        notes: params.notes
      }
    }

    const fee: StdFee = {
      amount: [{
        denom: this.config.denom,
        amount: '8000' // 0.008 CAPS
      }],
      gas: '250000'
    }

    console.log('🔄 Demande de redemption')
    console.log('Token:', params.tokenID)
    console.log('Fractions:', params.fractionsAmount)
    console.log('Type:', params.redemptionType)

    try {
      const result = await this.client.signAndBroadcast(
        address,
        [msg],
        fee,
        `Redemption RWA`
      )

      if (result.code !== 0) {
        throw new Error(`Échec de la redemption: ${result.rawLog}`)
      }

      console.log('✅ Demande de redemption créée!')

      const redemptionEvent = result.events.find(e => e.type === 'redeem_rwa')
      const requestID = redemptionEvent?.attributes.find(a => a.key === 'request_id')?.value || `req-${result.transactionHash}`

      return {
        requestID,
        transactionHash: result.transactionHash,
        height: result.height
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la redemption:', error)
      throw new Error(error.message || 'Erreur inconnue lors de la redemption')
    }
  }

  /**
   * Déconnecter le client
   */
  disconnect(): void {
    this.client = null
    this.signer = null
    console.log('🔌 Client RWA déconnecté')
  }
}

/**
 * Instance globale pour faciliter l'utilisation
 */
export const rwaTx = new RWATransactions()
