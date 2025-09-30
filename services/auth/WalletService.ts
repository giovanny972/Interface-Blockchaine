import { WalletManager } from '@/lib/wallet-dynamic';
import { AuthState } from './AuthState';

/**
 * Service de gestion des wallets selon le principe SRP
 * Responsabilité unique : interactions avec les wallets
 */
export class WalletService {
  private walletManager: WalletManager | null = null;
  private readonly chainId: string;
  private readonly rpcEndpoint: string;

  constructor(
    chainId = process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1',
    rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://localhost:26657'
  ) {
    this.chainId = chainId;
    this.rpcEndpoint = rpcEndpoint;
  }

  /**
   * Initialise le gestionnaire de wallet
   */
  initialize(): void {
    if (!this.walletManager) {
      this.walletManager = new WalletManager(this.chainId, this.rpcEndpoint);
    }
  }

  /**
   * Vérifie si le service est initialisé
   */
  isInitialized(): boolean {
    return this.walletManager !== null;
  }

  /**
   * Connexion à un wallet spécifique
   */
  async connectWallet(walletType: 'keplr' | 'cosmostation' | 'leap'): Promise<{
    signer: any;
    client: any;
    queryClient: any;
    address: string;
  }> {
    if (!this.walletManager) {
      throw new Error('WalletService non initialisé');
    }

    try {
      const { signer, client, address } = await this.walletManager.connectWallet(walletType);
      const queryClient = await this.walletManager.getQueryClient();

      return { signer, client, queryClient, address };
    } catch (error) {
      console.error('Erreur de connexion wallet:', error);
      throw new Error(`Impossible de se connecter au wallet ${walletType}: ${error.message}`);
    }
  }

  /**
   * Récupère la liste des wallets disponibles
   */
  async getAvailableWallets(): Promise<Array<{ name: string; isInstalled: boolean }>> {
    if (!this.walletManager) {
      throw new Error('WalletService non initialisé');
    }

    return await this.walletManager.getAvailableWallets();
  }

  /**
   * Vérifie si un wallet spécifique est disponible
   */
  async isWalletAvailable(walletType: string): Promise<boolean> {
    try {
      const wallets = await this.getAvailableWallets();
      const wallet = wallets.find(w => w.name.toLowerCase() === walletType.toLowerCase());
      return wallet?.isInstalled || false;
    } catch {
      return false;
    }
  }

  /**
   * Récupère le gestionnaire de wallet (pour compatibilité)
   */
  getWalletManager(): WalletManager | null {
    return this.walletManager;
  }

  /**
   * Nettoie les ressources du service
   */
  cleanup(): void {
    this.walletManager = null;
  }
}