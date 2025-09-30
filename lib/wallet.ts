import { SigningStargateClient, StargateClient, GasPrice } from '@cosmjs/stargate'
import { OfflineAminoSigner, OfflineSigner } from '@cosmjs/proto-signing'
import { Window as KeplrWindow } from '@keplr-wallet/types'
import { blockchainClient } from './blockchain'

declare global {
  interface Window extends KeplrWindow {}
}

export interface WalletInfo {
  name: string
  logo: string
  description: string
  isInstalled: boolean
  connect: () => Promise<OfflineSigner>
}

export interface ConnectedWallet {
  signer: OfflineSigner
  client: SigningStargateClient
  address: string
  walletType: string
}

export class WalletManager {
  private chainId: string
  private rpcEndpoint: string
  
  constructor(chainId: string, rpcEndpoint: string) {
    this.chainId = chainId
    this.rpcEndpoint = rpcEndpoint
  }

  // Intégration avec le client blockchain
  async connectToBlockchain(walletName: string): Promise<ConnectedWallet> {
    const connection = await this.connectWallet(walletName)
    
    // Initialiser le client blockchain avec Keplr si c'est le wallet utilisé
    if (walletName.toLowerCase() === 'keplr') {
      await blockchainClient.initWithKeplr()
    }
    
    return {
      ...connection,
      walletType: walletName
    }
  }

  async getAvailableWallets(): Promise<WalletInfo[]> {
    const wallets: WalletInfo[] = []

    // Keplr Wallet
    console.log('Vérification de Keplr:', !!window.keplr)
    wallets.push({
      name: 'Keplr',
      logo: '/wallets/keplr.svg',
      description: 'Keplr Wallet - L\'extension officielle pour Cosmos',
      isInstalled: !!window.keplr,
      connect: async () => {
        console.log('Tentative de connexion Keplr...')
        if (!window.keplr) {
          throw new Error('Keplr n\'est pas installé')
        }

        console.log('Ajout de la chaîne Capsule...')
        await this.suggestChain()
        console.log('Activation de Keplr pour la chaîne...')
        await window.keplr.enable(this.chainId)
        console.log('Récupération du signer...')
        
        const signer = window.keplr.getOfflineSigner(this.chainId)
        
        // Initialiser le client blockchain automatiquement
        try {
          await blockchainClient.initWithKeplr()
          console.log('Client blockchain initialisé avec Keplr')
        } catch (error) {
          console.warn('Impossible d\'initialiser le client blockchain:', error)
        }
        
        return signer
      }
    })

    // Cosmostation
    wallets.push({
      name: 'Cosmostation',
      logo: '/wallets/cosmostation.svg', 
      description: 'Cosmostation - Wallet multi-chaînes pour Cosmos',
      isInstalled: !!(window as any).cosmostation,
      connect: async () => {
        const cosmostation = (window as any).cosmostation
        if (!cosmostation) {
          throw new Error('Cosmostation n\'est pas installé')
        }

        await cosmostation.cosmos.request({
          method: 'cos_addChain',
          params: await this.getChainInfo()
        })

        return cosmostation.cosmos.getOfflineSigner(this.chainId)
      }
    })

    // Leap Wallet  
    wallets.push({
      name: 'Leap',
      logo: '/wallets/leap.svg',
      description: 'Leap Wallet - Wallet moderne pour l\'écosystème Cosmos',
      isInstalled: !!(window as any).leap,
      connect: async () => {
        const leap = (window as any).leap
        if (!leap) {
          throw new Error('Leap n\'est pas installé')
        }

        await leap.experimentalSuggestChain(await this.getChainInfo())
        await leap.enable(this.chainId)
        
        return leap.getOfflineSigner(this.chainId)
      }
    })

    return wallets
  }

  async connectWallet(walletName: string): Promise<{
    signer: OfflineSigner
    client: SigningStargateClient
    address: string
  }> {
    console.log('Recherche du wallet:', walletName)
    const wallets = await this.getAvailableWallets()
    console.log('Wallets disponibles:', wallets.map(w => w.name))
    
    // Recherche insensible à la casse et flexible
    const wallet = wallets.find(w => 
      w.name.toLowerCase() === walletName.toLowerCase() ||
      w.name === walletName
    )
    
    if (!wallet) {
      console.error(`Wallet ${walletName} non trouvé dans:`, wallets.map(w => w.name))
      throw new Error(`Wallet ${walletName} non trouvé`)
    }

    console.log('Wallet trouvé:', wallet.name, 'installé:', wallet.isInstalled)
    if (!wallet.isInstalled) {
      throw new Error(`${walletName} n'est pas installé`)
    }

    try {
      const signer = await wallet.connect()
      const client = await SigningStargateClient.connectWithSigner(
        this.rpcEndpoint,
        signer,
        {
          gasPrice: GasPrice.fromString('0.025' + (process.env.NEXT_PUBLIC_DENOM || 'ucaps'))
        }
      )

      const accounts = await signer.getAccounts()
      if (accounts.length === 0) {
        throw new Error('Aucun compte trouvé')
      }

      return {
        signer,
        client,
        address: accounts[0].address
      }
    } catch (error) {
      console.error('Erreur de connexion wallet:', error)
      throw error
    }
  }

  async getQueryClient(): Promise<StargateClient> {
    return StargateClient.connect(this.rpcEndpoint)
  }

  private async suggestChain(): Promise<void> {
    if (!window.keplr) return

    const chainInfo = await this.getChainInfo()
    
    try {
      await window.keplr.experimentalSuggestChain(chainInfo)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la chaîne:', error)
      throw error
    }
  }

  private async getChainInfo(): Promise<any> {
    return {
      chainId: this.chainId,
      chainName: 'Capsule Network',
      rpc: this.rpcEndpoint,
      rest: process.env.NEXT_PUBLIC_REST_ENDPOINT || 'http://localhost:1317',
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos',
        bech32PrefixAccPub: `${process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'}pub`,
        bech32PrefixValAddr: `${process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'}valoper`,
        bech32PrefixValPub: `${process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'}valoperpub`,
        bech32PrefixConsAddr: `${process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'}valcons`,
        bech32PrefixConsPub: `${process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'}valconspub`,
      },
      currencies: [
        {
          coinDenom: 'CAPS',
          coinMinimalDenom: process.env.NEXT_PUBLIC_DENOM || 'ucaps',
          coinDecimals: 6,
          coinGeckoId: 'capsule-network',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'CAPS',
          coinMinimalDenom: process.env.NEXT_PUBLIC_DENOM || 'ucaps',
          coinDecimals: 6,
          coinGeckoId: 'capsule-network',
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: 'CAPS',
        coinMinimalDenom: process.env.NEXT_PUBLIC_DENOM || 'ucaps',
        coinDecimals: 6,
        coinGeckoId: 'capsule-network',
      },
      features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
    }
  }

  // Utilitaires pour formater les montants
  static formatBalance(amount: string, denom: string = 'CAPS'): string {
    const num = parseFloat(amount) / 1000000 // Convert from micro units
    return `${num.toLocaleString()} ${denom}`
  }

  static parseAmount(amount: string): string {
    const num = parseFloat(amount)
    return Math.floor(num * 1000000).toString() // Convert to micro units
  }

  // Validation d'adresse selon le préfixe configuré
  static validateAddress(address: string): boolean {
    const prefix = process.env.NEXT_PUBLIC_ADDRESS_PREFIX || 'cosmos'
    const pattern = new RegExp(`^${prefix}[0-9a-z]{39}$`)
    return pattern.test(address)
  }

  // Méthodes pour interagir avec le blockchain client
  async createTimeCapsule(params: {
    recipient: string
    capsuleType: any
    title: string
    description: string
    data: string
    unlockTime?: Date
    metadata?: Record<string, any>
    threshold: number
    totalShares: number
    isPublic: boolean
  }) {
    return blockchainClient.createCapsule(params)
  }

  async unlockTimeCapsule(capsuleId: string) {
    return blockchainClient.unlockCapsule(capsuleId)
  }

  async transferTimeCapsule(capsuleId: string, newOwner: string, message?: string) {
    return blockchainClient.transferCapsule(capsuleId, newOwner, message)
  }

  async deleteTimeCapsule(capsuleId: string) {
    return blockchainClient.deleteCapsule(capsuleId)
  }

  async getCapsule(capsuleId: string) {
    return blockchainClient.queryCapsule(capsuleId)
  }

  async getUserCapsules(userAddress: string, limit?: number, offset?: number) {
    return blockchainClient.queryUserCapsules(userAddress, limit, offset)
  }

  async getStats() {
    return blockchainClient.queryStats()
  }

  async getBalance() {
    return blockchainClient.getBalance()
  }
}