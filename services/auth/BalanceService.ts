import { WalletManager } from '@/lib/wallet-dynamic';

/**
 * Service de gestion des soldes selon le principe SRP
 * Responsabilité unique : récupération et mise à jour des soldes
 */
export class BalanceService {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true';
  }

  /**
   * Récupère le solde d'une adresse
   */
  async getBalance(address: string, queryClient?: any): Promise<string> {
    if (!address) return '0';

    try {
      // En mode développement, utiliser un solde simulé
      if (this.isDevelopment) {
        return this.getSimulatedBalance(address);
      }

      // Essayer de récupérer le vrai solde depuis la blockchain
      if (queryClient) {
        return await this.getRealBalance(address, queryClient);
      }

      // Fallback sur le service blockchain
      return await this.getBlockchainBalance(address);

    } catch (error) {
      console.warn('Impossible de récupérer le solde, utilisation d\'un solde simulé:', error);
      return this.getFallbackBalance(address);
    }
  }

  /**
   * Génère un solde simulé basé sur l'adresse
   */
  private getSimulatedBalance(address: string): string {
    const addressHash = this.getAddressHash(address);
    const baseBalance = 10000 + (addressHash % 50000); // Entre 10k et 60k
    const timeVariation = Math.sin(Date.now() / 100000) * 1000; // Variation temporelle
    const simulatedBalance = Math.max(0, baseBalance + timeVariation);
    
    console.log(`Solde simulé généré: ${simulatedBalance.toFixed(2)} CAPS`);
    return simulatedBalance.toFixed(2);
  }

  /**
   * Récupère le solde réel depuis le queryClient
   */
  private async getRealBalance(address: string, queryClient: any): Promise<string> {
    try {
      const balanceResponse = await queryClient.getBalance(address, 'mtq');
      const formattedBalance = WalletManager.formatBalance(balanceResponse.amount);
      console.log(`Solde réel récupéré: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      console.error('Erreur lors de la récupération du solde réel:', error);
      throw error;
    }
  }

  /**
   * Récupère le solde depuis le service blockchain
   */
  private async getBlockchainBalance(address: string): Promise<string> {
    try {
      const { blockchainClient } = await import('@/lib/blockchain');
      
      if (blockchainClient.isConnected()) {
        const realBalance = await blockchainClient.getBalance();
        const formattedBalance = (parseInt(realBalance) / 1000000).toFixed(2); // Conversion µcaps vers CAPS
        console.log(`Solde blockchain récupéré: ${formattedBalance} CAPS`);
        return formattedBalance;
      }

      throw new Error('Client blockchain non connecté');
    } catch (error) {
      console.error('Erreur lors de la récupération du solde blockchain:', error);
      throw error;
    }
  }

  /**
   * Solde de fallback basé sur l'adresse
   */
  private getFallbackBalance(address: string): string {
    const addressHash = this.getAddressHash(address);
    const fallbackBalance = 1000 + (addressHash % 10000);
    console.log(`Solde fallback généré: ${fallbackBalance.toFixed(2)} CAPS`);
    return fallbackBalance.toFixed(2);
  }

  /**
   * Génère un hash numérique d'une adresse pour la cohérence des simulations
   */
  private getAddressHash(address: string): number {
    return address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  /**
   * Formate un solde pour l'affichage
   */
  static formatBalanceForDisplay(balance: string, symbol = 'CAPS'): string {
    const numBalance = parseFloat(balance);
    if (numBalance >= 1000000) {
      return `${(numBalance / 1000000).toFixed(1)}M ${symbol}`;
    }
    if (numBalance >= 1000) {
      return `${(numBalance / 1000).toFixed(1)}K ${symbol}`;
    }
    return `${numBalance.toFixed(2)} ${symbol}`;
  }

  /**
   * Vérifie si un solde est suffisant pour une transaction
   */
  static isBalanceSufficient(balance: string, required: string): boolean {
    return parseFloat(balance) >= parseFloat(required);
  }
}