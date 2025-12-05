import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { User, WalletConnection } from '@/types'
import { WalletManager } from '@/lib/wallet-dynamic'

interface AuthState extends User, WalletConnection {
  signer: any | null
  client: any | null
  queryClient: any | null
  walletManager: WalletManager | null
  needsFunding: boolean

  // Actions
  initializeWalletManager: () => void
  connect: (walletType: 'keplr' | 'cosmostation' | 'leap') => Promise<void>
  disconnect: () => void
  updateBalance: () => Promise<void>
  checkConnection: () => Promise<void>
}

export const useAuthStore = createWithEqualityFn<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      address: '',
      balance: '0',
      isConnected: false,
      walletType: null,
      signer: null,
      client: null,
      queryClient: null,
      walletManager: null,
      isConnecting: false,
      error: null,
      needsFunding: false,

      // Initialisation du wallet manager
      initializeWalletManager: () => {
        const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1'
        const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://localhost:26657'
        
        const walletManager = new WalletManager(chainId, rpcEndpoint)
        set({ walletManager })
        
        // Vérification initiale unique et différée
        setTimeout(() => {
          const state = get()
          if (state.address && state.walletType && !state.isConnected) {
            console.log('🔄 Restauration de session détectée')
            state.checkConnection()
          }
        }, 2000) // Augmenté à 2s pour laisser le temps au store de se stabiliser
      },

      // Connexion au wallet
      connect: async (walletType: 'keplr' | 'cosmostation' | 'leap') => {
        const { walletManager } = get()
        console.log('1. Début de la connexion avec:', walletType)
        
        if (!walletManager) {
          console.error('Wallet manager non initialisé')
          set({ error: 'Wallet manager non initialisé' })
          return
        }

        set({ isConnecting: true, error: null })
        console.log('2. État mis à jour - isConnecting: true')

        try {
          console.log('3. Appel de walletManager.connectWallet...')
          const { signer, client, address } = await walletManager.connectWallet(walletType)
          console.log('4. Connexion wallet réussie, adresse:', address)
          
          // Obtenir le client de requête
          console.log('5. Récupération du client de requête...')
          const queryClient = await walletManager.getQueryClient()
          
          // Récupérer le solde initial
          console.log('6. Récupération du solde...')
          const denom = process.env.NEXT_PUBLIC_DENOM || 'ucaps'
          let formattedBalance = '0 CAPS'
          let balanceAmount = 0
          try {
            const balanceResponse = await queryClient.getBalance(address, denom)
            balanceAmount = parseInt(balanceResponse.amount || '0')
            formattedBalance = `${(balanceAmount / 1000000).toFixed(2)} CAPS`
            console.log('7. Solde récupéré:', formattedBalance)
          } catch (balanceError: any) {
            console.warn('Impossible de récupérer le solde:', balanceError?.message || balanceError)
            console.log('7. Utilisation du solde par défaut')
          }

          // Détecter si c'est un nouveau compte qui a besoin de financement
          const isNewAccount = balanceAmount === 0
          if (isNewAccount) {
            console.log('🆕 Nouveau compte détecté - faucet disponible')
          }

          console.log('8. Mise à jour de l\'état final...')
          set({
            address,
            balance: formattedBalance,
            isConnected: true,
            walletType,
            signer,
            client,
            queryClient,
            isConnecting: false,
            error: null,
            needsFunding: isNewAccount,
          })

          console.log(`9. Connexion terminée avec succès - ${walletType}:`, address)
        } catch (error: any) {
          console.error('Erreur de connexion détaillée:', error)
          set({
            isConnecting: false,
            error: error.message || 'Erreur de connexion inconnue',
          })
          throw error // Re-throw pour que la page puisse l'attraper
        }
      },

      // Déconnexion
      disconnect: () => {
        set({
          address: '',
          balance: '0',
          isConnected: false,
          walletType: null,
          signer: null,
          client: null,
          queryClient: null,
          error: null,
          needsFunding: false,
        })
        console.log('Déconnecté du wallet')
      },

      // Mise à jour du solde
      updateBalance: async () => {
        const { address, queryClient, walletManager } = get()
        if (!address) {
          set({ balance: '0 CAPS' })
          return
        }

        try {
          const denom = process.env.NEXT_PUBLIC_DENOM || 'ucaps'

          // Essayer d'utiliser le queryClient déjà existant
          let client = queryClient

          // Si pas de queryClient, en créer un nouveau
          if (!client && walletManager) {
            client = await walletManager.getQueryClient()
          }

          if (client) {
            // Récupérer le vrai solde depuis la blockchain
            const balanceResponse = await client.getBalance(address, denom)
            const balanceAmount = parseInt(balanceResponse.amount || '0')
            const formattedBalance = `${(balanceAmount / 1000000).toFixed(2)} CAPS`

            set({ balance: formattedBalance })
            console.log(`✅ Solde blockchain mis à jour: ${formattedBalance}`)
          } else {
            console.warn('Aucun client de requête disponible')
            set({ balance: '0.00 CAPS' })
          }
        } catch (error) {
          console.warn('Erreur lors de la mise à jour du solde:', error)
          set({ balance: '0.00 CAPS' })
        }
      },

      // Vérification de la connexion
      checkConnection: async () => {
        const state = get()
        console.log('🔍 Vérification de la connexion...')
        
        if (!state.walletManager) {
          console.log('❌ Wallet manager non initialisé')
          return
        }
        
        // Éviter les vérifications multiples si déjà en cours de connexion
        if (state.isConnecting) {
          console.log('⏳ Connexion déjà en cours, attente...')
          return
        }
        
        // Si on a des données persistées mais pas d'état connecté, essayer de reconnecter
        if (state.address && state.walletType && !state.isConnected) {
          console.log('📡 Tentative de reconnexion automatique...')
          try {
            // Vérifier d'abord que le wallet est toujours installé
            const wallets = await state.walletManager.getAvailableWallets()
            const currentWallet = wallets.find(w => 
              w.name.toLowerCase() === state.walletType.toLowerCase()
            )
            
            if (!currentWallet?.isInstalled) {
              console.log('❌ Wallet non installé, conservation des données pour retry manuel')
              return // Ne pas déconnecter, juste attendre
            }
            
            // Reconnecter silencieusement
            await state.connect(state.walletType!)
            console.log('✅ Reconnexion automatique réussie')
          } catch (error: any) {
            console.error('❌ Reconnexion automatique échouée:', error?.message || error)
            // Conserver les données pour permettre un retry manuel
            console.log('💾 Session conservée pour retry manuel')
          }
        } else if (state.isConnected) {
          console.log('✅ Session déjà active')
        }
      },
    }),
    {
      name: 'capsule-auth',
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        walletType: state.walletType,
      }),
      // Storage sécurisé avec fallback
      storage: typeof window !== 'undefined' ? {
        getItem: (name) => {
          try {
            const item = localStorage.getItem(name)
            return item
          } catch (error) {
            console.warn('localStorage getItem failed:', error)
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch (error) {
            console.warn('localStorage setItem failed:', error)
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.warn('localStorage removeItem failed:', error)
          }
        },
      } : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }
  )
)

// Hook personnalisé optimisé pour l'auth
export const useAuth = () => {
  const {
    address,
    balance,
    isConnected,
    walletType,
    signer,
    client,
    queryClient,
    walletManager,
    isConnecting,
    error,
    needsFunding,
    initializeWalletManager,
    connect,
    disconnect,
    updateBalance,
    checkConnection
  } = useAuthStore(state => ({
    address: state.address,
    balance: state.balance,
    isConnected: state.isConnected,
    walletType: state.walletType,
    signer: state.signer,
    client: state.client,
    queryClient: state.queryClient,
    walletManager: state.walletManager,
    isConnecting: state.isConnecting,
    error: state.error,
    needsFunding: state.needsFunding,
    initializeWalletManager: state.initializeWalletManager,
    connect: state.connect,
    disconnect: state.disconnect,
    updateBalance: state.updateBalance,
    checkConnection: state.checkConnection,
  }), shallow)
  
  // Auto-initialisation du wallet manager si nécessaire
  if (!walletManager) {
    initializeWalletManager()
  }

  const isAuthenticated = isConnected && address !== ''
  const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''

  return {
    address,
    balance,
    isConnected,
    walletType,
    signer,
    client,
    queryClient,
    walletManager,
    isConnecting,
    error,
    needsFunding,
    initializeWalletManager,
    connect,
    disconnect,
    updateBalance,
    checkConnection,
    isAuthenticated,
    shortAddress,
  }
}

// Hook pour les transactions
export const useTransaction = () => {
  const { client, address, updateBalance } = useAuth()

  const sendTransaction = async (msgs: any[], memo: string = '') => {
    if (!client || !address) {
      // En mode hors ligne, simuler une transaction
      console.warn('Mode hors ligne - simulation de transaction')
      
      // Créer un résultat de transaction simulé
      const mockResult = {
        code: 0,
        transactionHash: 'mock-tx-' + Date.now(),
        height: Math.floor(Math.random() * 1000000),
        gasUsed: 150000,
        gasWanted: 200000,
        events: []
      }
      
      // Simuler un délai de transaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return mockResult
    }

    try {
      const denom = process.env.NEXT_PUBLIC_DENOM || 'ucaps'
      const gasPrice = parseFloat(process.env.NEXT_PUBLIC_GAS_PRICE?.replace(denom, '') || '0.025')
      const gasLimit = '200000'

      // Calculer les frais : gasLimit * gasPrice
      const feeAmount = Math.ceil(parseInt(gasLimit) * gasPrice).toString()

      const fee = {
        amount: [{ denom: denom, amount: feeAmount }],
        gas: gasLimit,
      }

      console.log(`💰 Frais de transaction: ${feeAmount} ${denom} (${(parseInt(feeAmount) / 1000000).toFixed(6)} CAPS)`)

      const result = await client.signAndBroadcast(address, msgs, fee, memo)
      
      // Mettre à jour le solde après la transaction
      setTimeout(updateBalance, 2000)
      
      return result
    } catch (error) {
      console.error('Erreur de transaction:', error)
      throw error
    }
  }

  return { sendTransaction }
}