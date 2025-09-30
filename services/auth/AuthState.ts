import { User } from '@/types';

/**
 * État d'authentification selon le principe SRP (Single Responsibility)
 * Responsabilité unique : gérer l'état de l'authentification
 */
export interface AuthState extends User {
  signer: any | null;
  client: any | null;
  queryClient: any | null;
  isConnecting: boolean;
  error: string | null;
  lastConnectionCheck: number | null;
}

/**
 * État initial de l'authentification
 */
export const initialAuthState: AuthState = {
  address: '',
  balance: '0',
  isConnected: false,
  walletType: null,
  username: '',
  email: '',
  preferences: {},
  signer: null,
  client: null,
  queryClient: null,
  isConnecting: false,
  error: null,
  lastConnectionCheck: null,
};

/**
 * Utilitaires pour l'état d'authentification
 */
export class AuthStateUtils {
  /**
   * Vérifie si l'utilisateur est complètement authentifié
   */
  static isFullyAuthenticated(state: AuthState): boolean {
    return state.isConnected && 
           state.address !== '' && 
           state.signer !== null && 
           state.client !== null;
  }

  /**
   * Génère une adresse courte pour l'affichage
   */
  static getShortAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }

  /**
   * Vérifie si une reconnexion est nécessaire
   */
  static needsReconnection(state: AuthState): boolean {
    return state.address !== '' && 
           state.walletType !== null && 
           !state.isConnected && 
           !state.isConnecting;
  }

  /**
   * Nettoie l'état lors de la déconnexion
   */
  static getDisconnectedState(): Partial<AuthState> {
    return {
      address: '',
      balance: '0',
      isConnected: false,
      walletType: null,
      signer: null,
      client: null,
      queryClient: null,
      error: null,
      isConnecting: false,
      lastConnectionCheck: null,
    };
  }
}