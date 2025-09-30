'use client'

import { DirectSecp256k1HdWallet, EncodeObject } from '@cosmjs/proto-signing'
import { SigningStargateClient, StargateClient, GasPrice } from '@cosmjs/stargate'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { 
  MsgCreateCapsule, 
  MsgUnlockCapsule, 
  MsgTransferCapsule, 
  MsgDeleteCapsule,
  BlockchainCapsuleType,
  BlockchainCapsuleStatus,
  TxResponse,
  QueryCapsuleResponse,
  QueryUserCapsulesResponse,
  CapsuleType
} from '@/types'

// Configuration de la blockchain
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1'
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://localhost:26657'
const REST_ENDPOINT = process.env.NEXT_PUBLIC_REST_ENDPOINT || 'http://localhost:1317'
const ADDRESS_PREFIX = process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'
const DENOM = process.env.NEXT_PUBLIC_DENOM || 'ucaps'
const GAS_PRICE = process.env.NEXT_PUBLIC_GAS_PRICE || '0.025ucaps'

// Types de messages pour CosmJS
const typeUrl = {
  MsgCreateCapsule: '/cosmos.timecapsule.v1.MsgCreateCapsule',
  MsgUnlockCapsule: '/cosmos.timecapsule.v1.MsgUnlockCapsule',
  MsgTransferCapsule: '/cosmos.timecapsule.v1.MsgTransferCapsule',
  MsgDeleteCapsule: '/cosmos.timecapsule.v1.MsgDeleteCapsule',
}

class BlockchainClient {
  private client: SigningStargateClient | null = null
  private queryClient: StargateClient | null = null
  private wallet: DirectSecp256k1HdWallet | null = null
  private address: string | null = null

  // Initialiser le client de requête (lecture seule)
  async initQueryClient(): Promise<void> {
    if (!this.queryClient) {
      const tmClient = await Tendermint37Client.connect(RPC_ENDPOINT)
      this.queryClient = await StargateClient.create(tmClient)
    }
  }

  // Initialiser le client de signature avec un wallet
  async initSigningClient(mnemonic: string): Promise<void> {
    try {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: ADDRESS_PREFIX,
      })

      const [firstAccount] = await this.wallet.getAccounts()
      this.address = firstAccount.address

      this.client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        this.wallet,
        {
          gasPrice: GasPrice.fromString(GAS_PRICE),
        }
      )
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du client signing:', error)
      throw new Error('Impossible d\'initialiser le client blockchain')
    }
  }

  // Initialiser avec Keplr
  async initWithKeplr(): Promise<void> {
    if (typeof window === 'undefined' || !window.keplr) {
      throw new Error('Keplr wallet non disponible')
    }

    try {
      // Suggérer la chaîne à Keplr si elle n'est pas connue
      await this.suggestChain()

      // Activer la chaîne
      await window.keplr.enable(CHAIN_ID)

      // Obtenir l'offline signer
      const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID)
      
      // Obtenir l'adresse
      const accounts = await offlineSigner.getAccounts()
      this.address = accounts[0].address

      // Créer le client de signature
      this.client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(GAS_PRICE),
        }
      )
    } catch (error) {
      console.error('Erreur lors de la connexion à Keplr:', error)
      throw new Error('Connexion à Keplr échouée')
    }
  }

  // Suggérer la configuration de la chaîne à Keplr
  private async suggestChain(): Promise<void> {
    if (!window.keplr) return

    const chainInfo = {
      chainId: CHAIN_ID,
      chainName: 'Capsule Network Testnet',
      rpc: RPC_ENDPOINT,
      rest: REST_ENDPOINT,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: ADDRESS_PREFIX,
        bech32PrefixAccPub: `${ADDRESS_PREFIX}pub`,
        bech32PrefixValAddr: `${ADDRESS_PREFIX}valoper`,
        bech32PrefixValPub: `${ADDRESS_PREFIX}valoperpub`,
        bech32PrefixConsAddr: `${ADDRESS_PREFIX}valcons`,
        bech32PrefixConsPub: `${ADDRESS_PREFIX}valconspub`,
      },
      currencies: [
        {
          coinDenom: 'CAPS',
          coinMinimalDenom: DENOM,
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'CAPS',
          coinMinimalDenom: DENOM,
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: 'CAPS',
        coinMinimalDenom: DENOM,
        coinDecimals: 6,
      },
    }

    try {
      await window.keplr.experimentalSuggestChain(chainInfo)
    } catch (error) {
      console.warn('Impossible de suggérer la chaîne à Keplr:', error)
    }
  }

  // Obtenir l'adresse actuelle
  getAddress(): string | null {
    return this.address
  }

  // Vérifier si le client est initialisé
  isConnected(): boolean {
    return this.client !== null && this.address !== null
  }

  // =============================
  // TRANSACTIONS
  // =============================

  // Créer une capsule
  async createCapsule(params: {
    recipient: string
    capsuleType: CapsuleType
    title: string
    description: string
    data: string
    unlockTime?: Date
    metadata?: Record<string, any>
    threshold: number
    totalShares: number
    isPublic: boolean
  }): Promise<TxResponse> {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    // Convertir le type d'enum
    const blockchainType = this.convertCapsuleType(params.capsuleType)

    const msg: EncodeObject = {
      typeUrl: typeUrl.MsgCreateCapsule,
      value: {
        creator: this.address,
        recipient: params.recipient,
        capsule_type: blockchainType,
        title: params.title,
        description: params.description,
        data: params.data,
        unlock_time: params.unlockTime?.toISOString(),
        metadata: params.metadata,
        threshold: params.threshold,
        total_shares: params.totalShares,
        is_public: params.isPublic,
      } as MsgCreateCapsule,
    }

    const fee = {
      amount: [{ denom: DENOM, amount: '5000' }],
      gas: '200000',
    }

    try {
      const result = await this.client.signAndBroadcast(this.address, [msg], fee, 'Création de capsule temporelle')
      
      // Vérifier que la transaction a été acceptée
      if (result.code !== 0) {
        console.error('Transaction rejetée par la blockchain:', result.rawLog)
        throw new Error(`Transaction rejetée: ${result.rawLog || 'Erreur inconnue'}`)
      }
      
      console.log('Capsule créée avec succès:', {
        txHash: result.transactionHash,
        height: result.height,
        gasUsed: result.gasUsed
      })
      
      return this.formatTxResponse(result)
    } catch (error: any) {
      console.error('Erreur lors de la création de la capsule:', error)
      
      // Améliorer les messages d'erreur pour l'utilisateur
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Fonds insuffisants pour payer les frais de transaction')
      } else if (error.message?.includes('account sequence mismatch')) {
        throw new Error('Erreur de synchronisation du compte, veuillez réessayer')
      } else if (error.message?.includes('tx not found')) {
        throw new Error('Transaction non trouvée sur la blockchain')
      } else if (error.message?.includes('broadcast timeout')) {
        throw new Error('Timeout lors de la diffusion de la transaction')
      }
      
      throw new Error(error.message || 'Échec de la création de la capsule')
    }
  }

  // Déverrouiller une capsule
  async unlockCapsule(capsuleId: string): Promise<TxResponse> {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    const msg: EncodeObject = {
      typeUrl: typeUrl.MsgUnlockCapsule,
      value: {
        creator: this.address,
        capsule_id: capsuleId,
      } as MsgUnlockCapsule,
    }

    const fee = {
      amount: [{ denom: DENOM, amount: '3000' }],
      gas: '150000',
    }

    try {
      const result = await this.client.signAndBroadcast(this.address, [msg], fee, 'Déverrouillage de capsule')
      return this.formatTxResponse(result)
    } catch (error) {
      console.error('Erreur lors du déverrouillage:', error)
      throw new Error('Échec du déverrouillage de la capsule')
    }
  }

  // Transférer une capsule
  async transferCapsule(capsuleId: string, newOwner: string, message?: string): Promise<TxResponse> {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    const msg: EncodeObject = {
      typeUrl: typeUrl.MsgTransferCapsule,
      value: {
        creator: this.address,
        capsule_id: capsuleId,
        new_owner: newOwner,
        message: message,
      } as MsgTransferCapsule,
    }

    const fee = {
      amount: [{ denom: DENOM, amount: '2000' }],
      gas: '100000',
    }

    try {
      const result = await this.client.signAndBroadcast(this.address, [msg], fee, 'Transfert de capsule')
      return this.formatTxResponse(result)
    } catch (error) {
      console.error('Erreur lors du transfert:', error)
      throw new Error('Échec du transfert de la capsule')
    }
  }

  // Supprimer une capsule
  async deleteCapsule(capsuleId: string): Promise<TxResponse> {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    const msg: EncodeObject = {
      typeUrl: typeUrl.MsgDeleteCapsule,
      value: {
        creator: this.address,
        capsule_id: capsuleId,
      } as MsgDeleteCapsule,
    }

    const fee = {
      amount: [{ denom: DENOM, amount: '1000' }],
      gas: '80000',
    }

    try {
      const result = await this.client.signAndBroadcast(this.address, [msg], fee, 'Suppression de capsule')
      return this.formatTxResponse(result)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw new Error('Échec de la suppression de la capsule')
    }
  }

  // =============================
  // REQUÊTES
  // =============================

  // Obtenir une capsule par ID
  async queryCapsule(capsuleId: string): Promise<QueryCapsuleResponse> {
    await this.initQueryClient()
    
    if (!this.queryClient) {
      throw new Error('Client de requête non initialisé')
    }

    try {
      const response = await this.queryClient.queryAbci(
        `/cosmos/timecapsule/v1/capsule/${capsuleId}`,
        new Uint8Array()
      )
      
      // Décoder la réponse (cela dépendra de votre implémentation protobuf)
      return this.decodeCapsuleResponse(response.value)
    } catch (error) {
      console.error('Erreur lors de la requête de capsule:', error)
      throw new Error('Impossible de récupérer la capsule')
    }
  }

  // Obtenir les capsules d'un utilisateur
  async queryUserCapsules(userAddress: string, limit = 50, offset = 0): Promise<QueryUserCapsulesResponse> {
    await this.initQueryClient()
    
    if (!this.queryClient) {
      throw new Error('Client de requête non initialisé')
    }

    try {
      const response = await this.queryClient.queryAbci(
        `/cosmos/timecapsule/v1/user/${userAddress}/capsules?pagination.limit=${limit}&pagination.offset=${offset}`,
        new Uint8Array()
      )
      
      return this.decodeUserCapsulesResponse(response.value)
    } catch (error) {
      console.error('Erreur lors de la requête des capsules utilisateur:', error)
      throw new Error('Impossible de récupérer les capsules utilisateur')
    }
  }

  // Obtenir les statistiques globales
  async queryStats(): Promise<any> {
    await this.initQueryClient()
    
    if (!this.queryClient) {
      throw new Error('Client de requête non initialisé')
    }

    try {
      const response = await this.queryClient.queryAbci(
        '/cosmos/timecapsule/v1/stats',
        new Uint8Array()
      )
      
      return this.decodeStatsResponse(response.value)
    } catch (error) {
      console.error('Erreur lors de la requête des statistiques:', error)
      throw new Error('Impossible de récupérer les statistiques')
    }
  }

  // =============================
  // UTILITAIRES
  // =============================

  private convertCapsuleType(type: CapsuleType): BlockchainCapsuleType {
    switch (type) {
      case CapsuleType.SAFE:
        return BlockchainCapsuleType.CAPSULE_TYPE_SAFE
      case CapsuleType.TIME_LOCK:
        return BlockchainCapsuleType.CAPSULE_TYPE_TIME_LOCK
      case CapsuleType.CONDITIONAL:
        return BlockchainCapsuleType.CAPSULE_TYPE_CONDITIONAL
      case CapsuleType.MULTI_SIG:
        return BlockchainCapsuleType.CAPSULE_TYPE_MULTI_SIG
      case CapsuleType.DEAD_MANS_SWITCH:
        return BlockchainCapsuleType.CAPSULE_TYPE_DEAD_MANS_SWITCH
      default:
        return BlockchainCapsuleType.CAPSULE_TYPE_UNSPECIFIED
    }
  }

  private formatTxResponse(result: any): TxResponse {
    return {
      code: result.code,
      txhash: result.transactionHash,
      height: result.height,
      events: result.events || [],
      gasUsed: result.gasUsed?.toString() || '0',
      gasWanted: result.gasWanted?.toString() || '0',
      rawLog: result.rawLog,
      timestamp: new Date().toISOString(),
    }
  }

  // Ces méthodes devront être implémentées selon vos définitions protobuf
  private decodeCapsuleResponse(data: Uint8Array): QueryCapsuleResponse {
    // TODO: Implémenter le décodage protobuf
    throw new Error('Décodage protobuf non implémenté')
  }

  private decodeUserCapsulesResponse(data: Uint8Array): QueryUserCapsulesResponse {
    // TODO: Implémenter le décodage protobuf
    throw new Error('Décodage protobuf non implémenté')
  }

  private decodeStatsResponse(data: Uint8Array): any {
    // TODO: Implémenter le décodage protobuf
    throw new Error('Décodage protobuf non implémenté')
  }

  // Déconnecter le client
  disconnect(): void {
    this.client = null
    this.queryClient = null
    this.wallet = null
    this.address = null
  }

  // Obtenir le solde
  async getBalance(): Promise<string> {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    try {
      const balance = await this.client.getBalance(this.address, DENOM)
      return balance.amount
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error)
      return '0'
    }
  }

  // Obtenir les informations du compte
  async getAccountInfo() {
    if (!this.client || !this.address) {
      throw new Error('Client non initialisé')
    }

    try {
      const account = await this.client.getAccount(this.address)
      return account
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du compte:', error)
      throw new Error('Impossible de récupérer les informations du compte')
    }
  }

  // Obtenir les statistiques du réseau
  async getNetworkStats() {
    try {
      if (!this.queryClient) {
        await this.initQueryClient()
      }

      // Obtenir la hauteur de bloc actuelle
      const blockHeight = await this.queryClient!.getHeight()
      
      // Obtenir le dernier bloc pour calculer le temps de bloc
      const latestBlock = await this.queryClient!.getBlock()
      const previousBlock = blockHeight > 1 ? await this.queryClient!.getBlock(blockHeight - 1) : null
      
      let averageBlockTime = 0
      if (latestBlock && previousBlock) {
        const latestTime = new Date(latestBlock.header.time).getTime()
        const previousTime = new Date(previousBlock.header.time).getTime()
        averageBlockTime = (latestTime - previousTime) / 1000 // en secondes
      }

      // Vérifier l'état du réseau
      const networkHealth = this.isConnected() ? 'healthy' : 'down'

      return {
        blockHeight,
        totalTransactions: latestBlock ? parseInt(latestBlock.header.totalTxs || '0', 10) : 0,
        networkHealth,
        averageBlockTime,
        connectedNodes: 1, // Au moins ce nœud
        ipfsNodes: 0, // À implémenter selon votre infrastructure IPFS
        latency: 0 // À calculer selon vos besoins
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats réseau:', error)
      return {
        blockHeight: 0,
        totalTransactions: 0,
        networkHealth: 'down' as const,
        averageBlockTime: 0,
        connectedNodes: 0,
        ipfsNodes: 0,
        latency: 0
      }
    }
  }

  // Obtenir les statistiques des capsules depuis la blockchain
  async getCapsuleStats() {
    try {
      if (!this.queryClient) {
        await this.initQueryClient()
      }

      // TODO: Remplacer par de vraies requêtes vers votre module timecapsule
      // Pour l'instant, retourner des données simulées basées sur les capacités réelles
      
      const networkStats = await this.getNetworkStats()
      
      return {
        totalCapsules: 0, // À implémenter: query total capsules
        activeCapsules: 0, // À implémenter: query active capsules
        unlockedCapsules: 0, // À implémenter: query unlocked capsules
        myCapsulesCount: 0, // À implémenter: query user capsules count
        totalDataStored: '0 MB', // À implémenter: calcul de la taille totale des données
        averageUnlockTime: 0, // À implémenter: moyenne des temps d'unlock
        mostUsedType: 'TIME_LOCK', // À implémenter: type le plus utilisé
        networkHealth: networkStats.networkHealth,
        blockHeight: networkStats.blockHeight,
        connectedValidators: networkStats.connectedNodes
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats capsules:', error)
      throw new Error('Impossible de récupérer les statistiques des capsules')
    }
  }
}

// Instance globale
export const blockchainClient = new BlockchainClient()
export default blockchainClient

// Types pour les déclarations de fenêtre
declare global {
  interface Window {
    keplr?: any
  }
}