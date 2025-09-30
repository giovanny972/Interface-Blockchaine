import { AuthState, AuthStateUtils, initialAuthState } from './AuthState';
import { WalletService } from './WalletService';
import { BalanceService } from './BalanceService';
import { secureStorage } from '@/lib/secure-storage';

/**
 * Service principal d'authentification selon les principes SOLID
 * Applique le principe de composition et d'injection de dépendances
 */
export class AuthService {
  private walletService: WalletService;
  private balanceService: BalanceService;
  private readonly storageKey = 'auth-session';

  constructor(
    walletService?: WalletService,
    balanceService?: BalanceService
  ) {
    this.walletService = walletService || new WalletService();
    this.balanceService = balanceService || new BalanceService();
  }

  /**
   * Initialise le service d'authentification
   */
  initialize(): void {
    this.walletService.initialize();
  }

  /**
   * Connexion à un wallet
   */
  async connect(
    walletType: 'keplr' | 'cosmostation' | 'leap', 
    currentState: AuthState
  ): Promise<Partial<AuthState>> {
    if (!this.walletService.isInitialized()) {
      throw new Error('Service d\'authentification non initialisé');
    }

    if (currentState.isConnecting) {
      throw new Error('Connexion déjà en cours');
    }

    console.log(`Début de la connexion avec ${walletType}`);

    try {
      // Étape 1: Connexion au wallet
      const { signer, client, queryClient, address } = await this.walletService.connectWallet(walletType);
      
      // Étape 2: Récupération du solde
      const balance = await this.balanceService.getBalance(address, queryClient);

      // Étape 3: Création du nouvel état
      const newState: Partial<AuthState> = {
        address,
        balance,
        isConnected: true,
        walletType,
        signer,
        client,
        queryClient,
        isConnecting: false,
        error: null,
        lastConnectionCheck: Date.now(),
      };

      // Étape 4: Sauvegarde sécurisée de la session
      await this.saveSession(newState);

      console.log(`Connexion réussie avec ${walletType}: ${address}`);
      return newState;

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      const errorState: Partial<AuthState> = {
        isConnecting: false,
        error: error.message || 'Erreur de connexion inconnue',
      };

      throw new Error(errorState.error);
    }
  }

  /**
   * Déconnexion
   */
  async disconnect(): Promise<Partial<AuthState>> {
    console.log('Déconnexion en cours...');
    
    // Nettoyage de la session sécurisée
    await this.clearSession();
    
    const disconnectedState = AuthStateUtils.getDisconnectedState();
    console.log('Déconnexion terminée');
    
    return disconnectedState;
  }

  /**
   * Mise à jour du solde
   */
  async updateBalance(currentState: AuthState): Promise<string> {
    if (!currentState.address) {
      return '0';
    }

    try {
      const newBalance = await this.balanceService.getBalance(
        currentState.address, 
        currentState.queryClient
      );

      // Sauvegarder le nouveau solde
      await this.saveSession({ ...currentState, balance: newBalance });

      return newBalance;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      throw error;
    }
  }

  /**
   * Vérification et reconnexion automatique
   */
  async checkConnection(currentState: AuthState): Promise<Partial<AuthState> | null> {
    console.log('Vérification de la connexion...');

    if (!AuthStateUtils.needsReconnection(currentState)) {
      console.log('Aucune reconnexion nécessaire');
      return null;
    }

    if (!currentState.walletType) {
      console.log('Type de wallet non spécifié');
      return null;
    }

    try {
      // Vérifier la disponibilité du wallet
      const isWalletAvailable = await this.walletService.isWalletAvailable(currentState.walletType);
      
      if (!isWalletAvailable) {
        console.log('Wallet non disponible, conservation des données pour retry manuel');
        return null;
      }

      // Tentative de reconnexion
      console.log('Tentative de reconnexion automatique...');
      const newState = await this.connect(currentState.walletType, currentState);
      
      console.log('Reconnexion automatique réussie');
      return newState;

    } catch (error) {
      console.error('Reconnexion automatique échouée:', error);
      
      // Conserver les données pour un retry manuel
      return {
        error: `Reconnexion échouée: ${error.message}`,
        lastConnectionCheck: Date.now(),
      };
    }
  }

  /**
   * Récupération de la session sauvegardée
   */
  async getStoredSession(): Promise<Partial<AuthState> | null> {
    try {
      const session = secureStorage.getSecureItem<Partial<AuthState>>(this.storageKey);
      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Sauvegarde sécurisée de la session
   */
  private async saveSession(state: Partial<AuthState>): Promise<void> {
    try {
      // Sauvegarder uniquement les données essentielles (pas les objets complexes)
      const sessionData = {
        address: state.address,
        balance: state.balance,
        isConnected: state.isConnected,
        walletType: state.walletType,
        lastConnectionCheck: state.lastConnectionCheck,
      };

      secureStorage.setSecureItem(this.storageKey, sessionData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }
  }

  /**
   * Nettoyage de la session
   */
  private async clearSession(): Promise<void> {
    try {
      secureStorage.removeSecureItem(this.storageKey);
    } catch (error) {
      console.error('Erreur lors du nettoyage de la session:', error);
    }
  }

  /**
   * Obtient le gestionnaire de wallet (pour compatibilité)
   */
  getWalletManager() {
    return this.walletService.getWalletManager();
  }

  /**
   * Nettoyage des ressources
   */
  cleanup(): void {
    this.walletService.cleanup();
  }
}