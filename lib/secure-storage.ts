import CryptoJS from 'crypto-js';

/**
 * Service de stockage sécurisé utilisant le chiffrement AES
 * Implémente le principe de responsabilité unique (SRP)
 */
export class SecureStorageService {
  private readonly encryptionKey: string;
  private readonly storagePrefix = 'capsule_secure_';

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || this.generateSecureKey();
  }

  /**
   * Génère une clé de chiffrement sécurisée basée sur l'environnement du navigateur
   */
  private generateSecureKey(): string {
    const browserFingerprint = this.getBrowserFingerprint();
    const timestamp = Date.now().toString();
    return CryptoJS.SHA256(browserFingerprint + timestamp).toString();
  }

  /**
   * Génère une empreinte unique du navigateur pour la sécurité
   */
  private getBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    return [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      canvas.toDataURL(),
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('|');
  }

  /**
   * Chiffre et stocke une valeur de manière sécurisée
   */
  public setSecureItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = CryptoJS.AES.encrypt(serializedValue, this.encryptionKey).toString();
      const storageKey = this.storagePrefix + key;
      
      localStorage.setItem(storageKey, encryptedValue);
      return true;
    } catch (error) {
      console.error('Erreur lors du stockage sécurisé:', error);
      return false;
    }
  }

  /**
   * Récupère et déchiffre une valeur stockée de manière sécurisée
   */
  public getSecureItem<T>(key: string): T | null {
    try {
      const storageKey = this.storagePrefix + key;
      const encryptedValue = localStorage.getItem(storageKey);
      
      if (!encryptedValue) return null;

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey);
      const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedValue) return null;

      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.error('Erreur lors de la récupération sécurisée:', error);
      return null;
    }
  }

  /**
   * Supprime une valeur stockée de manière sécurisée
   */
  public removeSecureItem(key: string): boolean {
    try {
      const storageKey = this.storagePrefix + key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression sécurisée:', error);
      return false;
    }
  }

  /**
   * Efface toutes les données sécurisées du stockage
   */
  public clearSecureStorage(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const secureKeys = keys.filter(key => key.startsWith(this.storagePrefix));
      
      secureKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'effacement du stockage sécurisé:', error);
      return false;
    }
  }

  /**
   * Vérifie l'intégrité du stockage sécurisé
   */
  public validateStorageIntegrity(): boolean {
    try {
      const testData = { test: 'integrity-check', timestamp: Date.now() };
      const testKey = 'integrity_test';
      
      this.setSecureItem(testKey, testData);
      const retrievedData = this.getSecureItem<typeof testData>(testKey);
      this.removeSecureItem(testKey);
      
      return retrievedData !== null && 
             retrievedData.test === testData.test && 
             retrievedData.timestamp === testData.timestamp;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'intégrité:', error);
      return false;
    }
  }
}

/**
 * Instance singleton du service de stockage sécurisé
 */
export const secureStorage = new SecureStorageService();

/**
 * Hook React pour utiliser le stockage sécurisé
 */
export const useSecureStorage = () => {
  return {
    setSecureItem: secureStorage.setSecureItem.bind(secureStorage),
    getSecureItem: secureStorage.getSecureItem.bind(secureStorage),
    removeSecureItem: secureStorage.removeSecureItem.bind(secureStorage),
    clearSecureStorage: secureStorage.clearSecureStorage.bind(secureStorage),
    validateStorageIntegrity: secureStorage.validateStorageIntegrity.bind(secureStorage)
  };
};