import { Window as KeplrWindow } from '@keplr-wallet/types'

declare global {
  interface Window extends KeplrWindow {}
}

export interface WalletInfo {
  name: string
  logo: string
  description: string
  isInstalled: boolean
  connect: () => Promise<any>
}

export class WalletManager {
  private chainId: string
  private rpcEndpoint: string
  
  constructor(chainId: string, rpcEndpoint: string) {
    this.chainId = chainId
    this.rpcEndpoint = rpcEndpoint
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
        
        return window.keplr.getOfflineSigner(this.chainId)
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
    signer: any
    client: any
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
      // Obtenir le signer d'abord
      console.log('Connexion au wallet...')
      const signer = await wallet.connect()
      
      const accounts = await signer.getAccounts()
      if (accounts.length === 0) {
        throw new Error('Aucun compte trouvé')
      }

      // En mode développement, éviter les connexions RPC qui causent des erreurs CORS
      let client = null
      
      if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true') {
        console.log('Mode développement détecté - pas de connexion RPC')
        console.log('Connexion wallet réussie en mode offline')
      } else {
        try {
          // Import dynamique de CosmJS uniquement quand nécessaire
          console.log('Import dynamique de CosmJS...')
          const { SigningStargateClient } = await import('@cosmjs/stargate')
          
          console.log('Connexion avec le signer...')
          client = await SigningStargateClient.connectWithSigner(
            this.rpcEndpoint,
            signer,
            {
              gasPrice: {
                denom: 'stake',
                amount: '0.025'
              }
            }
          )
          console.log('Connexion RPC réussie')
        } catch (rpcError) {
          console.warn('Impossible de se connecter au RPC:', rpcError)
          console.log('Connexion wallet réussie malgré l\'échec RPC')
        }
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

  async getQueryClient(): Promise<any> {
    // En mode développement, retourner directement un client mock
    if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true') {
      console.log('Mode développement - utilisation du client mock')
      return {
        getBalance: async () => ({ amount: '1000000', denom: 'stake' }),
        getAllBalances: async () => [{ amount: '1000000', denom: 'stake' }],
        getHeight: async () => Math.floor(Math.random() * 1000000),
      }
    }

    try {
      // Import dynamique de CosmJS
      console.log('Import CosmJS pour query client...')
      const { StargateClient } = await import('@cosmjs/stargate')
      console.log('Connexion au RPC pour les requêtes...')
      return await StargateClient.connect(this.rpcEndpoint)
    } catch (error) {
      console.warn('Impossible de se connecter au RPC pour les requêtes:', error)
      // Retourner un client mock pour éviter les erreurs
      return {
        getBalance: async () => ({ amount: '1000000', denom: 'stake' }),
        getAllBalances: async () => [{ amount: '1000000', denom: 'stake' }],
        getHeight: async () => Math.floor(Math.random() * 1000000),
      }
    }
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
        bech32PrefixAccAddr: 'cosmos',
        bech32PrefixAccPub: 'cosmospub',
        bech32PrefixValAddr: 'cosmosvaloper',
        bech32PrefixValPub: 'cosmosvaloperpub',
        bech32PrefixConsAddr: 'cosmosvalcons',
        bech32PrefixConsPub: 'cosmosvalconspub',
      },
      currencies: [
        {
          coinDenom: 'STAKE',
          coinMinimalDenom: 'stake',
          coinDecimals: 6,
          coinGeckoId: 'capsule-network',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'STAKE',
          coinMinimalDenom: 'stake',
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
        coinDenom: 'STAKE',
        coinMinimalDenom: 'stake',
        coinDecimals: 6,
        coinGeckoId: 'capsule-network',
      },
      features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
    }
  }

  // Utilitaires pour formater les montants
  static formatBalance(amount: string, denom: string = 'MTQ'): string {
    const num = parseFloat(amount) // stake tokens are already in base units
    return `${num.toLocaleString()} ${denom}`
  }

  static parseAmount(amount: string): string {
    const num = parseFloat(amount)
    return Math.floor(num).toString() // stake tokens are in base units
  }

  // Validation d'adresse Cosmos
  static validateAddress(address: string): boolean {
    const cosmosPattern = /^cosmos[0-9a-z]{39}$/
    return cosmosPattern.test(address)
  }
}