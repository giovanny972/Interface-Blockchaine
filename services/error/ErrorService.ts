/**
 * Types d'erreurs dans l'application
 */
export enum ErrorType {
  WALLET_CONNECTION = 'WALLET_CONNECTION',
  TRANSACTION = 'TRANSACTION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  STORAGE = 'STORAGE',
  BLOCKCHAIN = 'BLOCKCHAIN',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Niveaux de sévérité des erreurs
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Interface pour une erreur structurée
 */
export interface StructuredError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage?: string;
  actionable?: boolean;
  retryable?: boolean;
}

/**
 * Service centralisé de gestion des erreurs
 * Implémente les principes de Clean Code et de responsabilité unique
 */
export class ErrorService {
  private static instance: ErrorService;
  private errorLog: StructuredError[] = [];
  private readonly maxLogSize = 100;

  private constructor() {}

  /**
   * Singleton pattern pour assurer une instance unique
   */
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Traite et structure une erreur
   */
  public handleError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    context?: Record<string, any>
  ): StructuredError {
    const structuredError = this.createStructuredError(error, type, context);
    
    this.logError(structuredError);
    this.notifyError(structuredError);
    
    return structuredError;
  }

  /**
   * Crée une erreur structurée
   */
  private createStructuredError(
    error: Error | string,
    type: ErrorType,
    context?: Record<string, any>
  ): StructuredError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;

    const structuredError: StructuredError = {
      id: this.generateErrorId(),
      type,
      severity: this.determineSeverity(type, errorMessage),
      message: errorMessage,
      originalError,
      context,
      timestamp: new Date(),
      userMessage: this.generateUserMessage(type, errorMessage),
      actionable: this.isActionable(type),
      retryable: this.isRetryable(type),
    };

    return structuredError;
  }

  /**
   * Détermine la sévérité d'une erreur
   */
  private determineSeverity(type: ErrorType, message: string): ErrorSeverity {
    // Erreurs critiques
    if (type === ErrorType.AUTHENTICATION || message.includes('security')) {
      return ErrorSeverity.CRITICAL;
    }

    // Erreurs importantes
    if (type === ErrorType.WALLET_CONNECTION || type === ErrorType.BLOCKCHAIN) {
      return ErrorSeverity.HIGH;
    }

    // Erreurs moyennes
    if (type === ErrorType.TRANSACTION || type === ErrorType.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }

    // Erreurs légères
    return ErrorSeverity.LOW;
  }

  /**
   * Génère un message utilisateur compréhensible
   */
  private generateUserMessage(type: ErrorType, message: string): string {
    const userMessages: Record<ErrorType, string> = {
      [ErrorType.WALLET_CONNECTION]: 'Impossible de se connecter au wallet. Vérifiez que votre wallet est installé et débloqué.',
      [ErrorType.TRANSACTION]: 'La transaction a échoué. Vérifiez votre solde et réessayez.',
      [ErrorType.NETWORK]: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
      [ErrorType.VALIDATION]: 'Les données saisies ne sont pas valides. Vérifiez les champs requis.',
      [ErrorType.AUTHENTICATION]: 'Problème d\'authentification. Reconnectez-vous.',
      [ErrorType.STORAGE]: 'Problème de stockage local. Vérifiez l\'espace disponible.',
      [ErrorType.BLOCKCHAIN]: 'Erreur de communication avec la blockchain. Réessayez plus tard.',
      [ErrorType.UNKNOWN]: 'Une erreur inattendue s\'est produite.',
    };

    return userMessages[type] || message;
  }

  /**
   * Détermine si une erreur est actionnable par l'utilisateur
   */
  private isActionable(type: ErrorType): boolean {
    return [
      ErrorType.WALLET_CONNECTION,
      ErrorType.VALIDATION,
      ErrorType.AUTHENTICATION
    ].includes(type);
  }

  /**
   * Détermine si une erreur est réessayable
   */
  private isRetryable(type: ErrorType): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TRANSACTION,
      ErrorType.BLOCKCHAIN
    ].includes(type);
  }

  /**
   * Enregistre l'erreur dans le log
   */
  private logError(error: StructuredError): void {
    // Ajouter au log
    this.errorLog.unshift(error);
    
    // Maintenir la taille du log
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log console selon la sévérité
    const logMethod = this.getConsoleLogMethod(error.severity);
    logMethod(`[${error.type}] ${error.message}`, error.context);
  }

  /**
   * Obtient la méthode de log console appropriée
   */
  private getConsoleLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return console.error;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      default:
        return console.log;
    }
  }

  /**
   * Notifie l'erreur via les systèmes de notification
   */
  private notifyError(error: StructuredError): void {
    // Pour les erreurs critiques, on pourrait envoyer à un service de monitoring
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(error);
    }

    // Notification toast pour l'utilisateur
    if (error.actionable || error.severity === ErrorSeverity.HIGH) {
      this.showUserNotification(error);
    }
  }

  /**
   * Envoi vers un service de monitoring (simulé)
   */
  private sendToMonitoring(error: StructuredError): void {
    // En production, envoyer à Sentry, LogRocket, etc.
    console.error('CRITICAL ERROR - Should be sent to monitoring service:', error);
  }

  /**
   * Affiche une notification à l'utilisateur
   */
  private showUserNotification(error: StructuredError): void {
    // Utiliser react-hot-toast ou un système de notification similaire
    if (typeof window !== 'undefined') {
      // Import dynamique pour éviter les problèmes SSR
      import('react-hot-toast').then((toast) => {
        toast.default.error(error.userMessage || error.message, {
          id: error.id,
          duration: error.severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
        });
      }).catch(() => {
        // Fallback si react-hot-toast n'est pas disponible
        console.error('Notification error:', error.userMessage);
      });
    }
  }

  /**
   * Génère un ID unique pour l'erreur
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupère les erreurs récentes
   */
  public getRecentErrors(limit = 10): StructuredError[] {
    return this.errorLog.slice(0, limit);
  }

  /**
   * Efface les erreurs du log
   */
  public clearErrors(): void {
    this.errorLog = [];
  }

  /**
   * Récupère les statistiques d'erreurs
   */
  public getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

/**
 * Instance globale du service d'erreurs
 */
export const errorService = ErrorService.getInstance();

/**
 * Helper functions pour une utilisation simplifiée
 */
export const handleWalletError = (error: Error | string, context?: Record<string, any>) => {
  return errorService.handleError(error, ErrorType.WALLET_CONNECTION, context);
};

export const handleTransactionError = (error: Error | string, context?: Record<string, any>) => {
  return errorService.handleError(error, ErrorType.TRANSACTION, context);
};

export const handleNetworkError = (error: Error | string, context?: Record<string, any>) => {
  return errorService.handleError(error, ErrorType.NETWORK, context);
};

export const handleValidationError = (error: Error | string, context?: Record<string, any>) => {
  return errorService.handleError(error, ErrorType.VALIDATION, context);
};