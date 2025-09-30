import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { AuthState, AuthStateUtils, initialAuthState } from '@/services/auth/AuthState';
import { AuthService } from '@/services/auth/AuthService';

/**
 * Interface du store d'authentification refactorisé
 * Applique les principes SOLID et Clean Architecture
 */
interface AuthStore extends AuthState {
  // Services
  authService: AuthService | null;
  
  // Actions
  initialize: () => void;
  connect: (walletType: 'keplr' | 'cosmostation' | 'leap') => Promise<void>;
  disconnect: () => Promise<void>;
  updateBalance: () => Promise<void>;
  checkConnection: () => Promise<void>;
  
  // Getters calculés
  isAuthenticated: boolean;
  shortAddress: string;
}

/**
 * Store d'authentification refactorisé selon les principes Clean Code
 */
export const useAuthStoreV2 = createWithEqualityFn<AuthStore>()(
  (set, get) => ({
    // État initial
    ...initialAuthState,
    
    // Services
    authService: null,

    // Getters calculés
    get isAuthenticated() {
      const state = get();
      return AuthStateUtils.isFullyAuthenticated(state);
    },

    get shortAddress() {
      const state = get();
      return AuthStateUtils.getShortAddress(state.address);
    },

    // Actions
    initialize: () => {
      const authService = new AuthService();
      authService.initialize();
      
      set({ authService });

      // Vérification différée de la session stockée
      setTimeout(async () => {
        const state = get();
        const storedSession = await authService.getStoredSession();
        
        if (storedSession && AuthStateUtils.needsReconnection(storedSession as AuthState)) {
          console.log('Session stockée détectée, tentative de restauration...');
          set({ ...storedSession });
          state.checkConnection();
        }
      }, 1500);
    },

    connect: async (walletType: 'keplr' | 'cosmostation' | 'leap') => {
      const { authService } = get();
      
      if (!authService) {
        throw new Error('Service d\'authentification non initialisé');
      }

      set({ isConnecting: true, error: null });

      try {
        const currentState = get();
        const newState = await authService.connect(walletType, currentState);
        
        set(newState);
        
      } catch (error) {
        set({
          isConnecting: false,
          error: error.message,
        });
        throw error;
      }
    },

    disconnect: async () => {
      const { authService } = get();
      
      if (!authService) {
        console.warn('Service d\'authentification non initialisé');
        set(AuthStateUtils.getDisconnectedState());
        return;
      }

      try {
        const disconnectedState = await authService.disconnect();
        set(disconnectedState);
        
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // Forcer la déconnexion même en cas d'erreur
        set(AuthStateUtils.getDisconnectedState());
      }
    },

    updateBalance: async () => {
      const { authService } = get();
      
      if (!authService) {
        console.warn('Service d\'authentification non initialisé');
        return;
      }

      try {
        const currentState = get();
        const newBalance = await authService.updateBalance(currentState);
        
        set({ balance: newBalance });
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour du solde:', error);
        set({ error: 'Impossible de mettre à jour le solde' });
      }
    },

    checkConnection: async () => {
      const { authService } = get();
      
      if (!authService) {
        console.warn('Service d\'authentification non initialisé');
        return;
      }

      if (get().isConnecting) {
        console.log('Connexion déjà en cours, attente...');
        return;
      }

      try {
        const currentState = get();
        const newState = await authService.checkConnection(currentState);
        
        if (newState) {
          set(newState);
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification de connexion:', error);
        set({ 
          error: 'Erreur de vérification de connexion',
          lastConnectionCheck: Date.now(),
        });
      }
    },
  })
);

/**
 * Hook personnalisé optimisé pour l'authentification
 * Suit le principe de séparation des responsabilités
 */
export const useAuth = () => {
  const authStore = useAuthStoreV2((state) => ({
    // État
    address: state.address,
    balance: state.balance,
    isConnected: state.isConnected,
    walletType: state.walletType,
    signer: state.signer,
    client: state.client,
    queryClient: state.queryClient,
    isConnecting: state.isConnecting,
    error: state.error,
    lastConnectionCheck: state.lastConnectionCheck,
    
    // Getters calculés
    isAuthenticated: state.isAuthenticated,
    shortAddress: state.shortAddress,
    
    // Actions
    initialize: state.initialize,
    connect: state.connect,
    disconnect: state.disconnect,
    updateBalance: state.updateBalance,
    checkConnection: state.checkConnection,
    
    // Services
    authService: state.authService,
  }), shallow);

  // Auto-initialisation si nécessaire
  if (!authStore.authService) {
    authStore.initialize();
  }

  return authStore;
};

/**
 * Hook pour les transactions avec gestion d'erreurs améliorée
 */
export const useTransaction = () => {
  const { client, address, updateBalance, isAuthenticated } = useAuth();

  const sendTransaction = async (msgs: any[], memo: string = '') => {
    if (!isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    if (!client || !address) {
      // Mode simulation pour le développement
      console.warn('Mode simulation - transaction simulée');
      
      const mockResult = {
        code: 0,
        transactionHash: `mock-tx-${Date.now()}`,
        height: Math.floor(Math.random() * 1000000),
        gasUsed: 150000,
        gasWanted: 200000,
        events: [],
        timestamp: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockResult;
    }

    try {
      const fee = {
        amount: [{ denom: 'mtq', amount: '5000' }],
        gas: '200000',
      };

      console.log('Envoi de transaction:', { msgs, fee, memo });
      const result = await client.signAndBroadcast(address, msgs, fee, memo);
      
      // Mise à jour différée du solde
      setTimeout(() => {
        updateBalance().catch(console.error);
      }, 2000);
      
      console.log('Transaction réussie:', result);
      return result;

    } catch (error) {
      console.error('Erreur de transaction:', error);
      throw new Error(`Échec de la transaction: ${error.message}`);
    }
  };

  const estimateGas = async (msgs: any[]): Promise<number> => {
    if (!client) {
      // Estimation par défaut en mode simulation
      return 200000;
    }

    try {
      // Ici, on pourrait implémenter une vraie estimation de gas
      // Pour l'instant, on retourne une estimation conservatrice
      return msgs.length * 150000;
    } catch (error) {
      console.warn('Impossible d\'estimer le gas:', error);
      return 200000;
    }
  };

  return { 
    sendTransaction, 
    estimateGas,
    isTransactionReady: isAuthenticated && client !== null,
  };
};