// Module de sécurité frontend pour Capsule Network
import CryptoJS from 'crypto-js'

export interface SecurityEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  details: Record<string, any>
  userAgent: string
  url: string
  ip?: string
}

export interface SecurityMetrics {
  failedAttempts: number
  lastActivity: Date
  suspiciousActivities: SecurityEvent[]
  sessionStart: Date
  deviceFingerprint: string
  riskScore: number
}

export class FrontendSecurity {
  private static instance: FrontendSecurity
  private metrics: SecurityMetrics
  private encryptionKey: string
  private sessionToken: string | null = null
  private maxFailedAttempts = 5
  private sessionTimeout = 30 * 60 * 1000 // 30 minutes
  private securityEvents: SecurityEvent[] = []

  private constructor() {
    this.encryptionKey = this.generateEncryptionKey()
    this.metrics = {
      failedAttempts: 0,
      lastActivity: new Date(),
      suspiciousActivities: [],
      sessionStart: new Date(),
      deviceFingerprint: this.generateDeviceFingerprint(),
      riskScore: 0
    }
    
    this.initializeSecurityListeners()
    this.startSessionMonitoring()
  }

  public static getInstance(): FrontendSecurity {
    if (!FrontendSecurity.instance) {
      FrontendSecurity.instance = new FrontendSecurity()
    }
    return FrontendSecurity.instance
  }

  // Génération d'une clé de chiffrement basée sur l'appareil
  private generateEncryptionKey(): string {
    const deviceInfo = this.getDeviceInfo()
    return CryptoJS.SHA256(JSON.stringify(deviceInfo)).toString()
  }

  // Génération d'une empreinte d'appareil unique
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Capsule Network Security Check', 2, 2)
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint()
    }

    return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString()
  }

  // Empreinte WebGL pour identification unique
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return ''

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (!debugInfo) return ''

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      
      return `${vendor}~${renderer}`
    } catch {
      return ''
    }
  }

  // Obtenir des informations sur l'appareil
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      timestamp: Date.now()
    }
  }

  // Chiffrement sécurisé des données locales
  public encryptLocalData(data: any): string {
    try {
      const jsonData = JSON.stringify(data)
      const encrypted = CryptoJS.AES.encrypt(jsonData, this.encryptionKey).toString()
      return encrypted
    } catch (error) {
      this.logSecurityEvent('encryption_error', 'high', { error: error.message })
      throw new Error('Erreur de chiffrement des données')
    }
  }

  // Déchiffrement sécurisé des données locales
  public decryptLocalData(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
      const jsonData = decrypted.toString(CryptoJS.enc.Utf8)
      if (!jsonData) {
        throw new Error('Données corrompues ou clé invalide')
      }
      return JSON.parse(jsonData)
    } catch (error) {
      this.logSecurityEvent('decryption_error', 'high', { error: error.message })
      throw new Error('Erreur de déchiffrement des données')
    }
  }

  // Stockage sécurisé dans localStorage
  public setSecureItem(key: string, value: any): void {
    try {
      const encryptedValue = this.encryptLocalData(value)
      const secureKey = CryptoJS.SHA256(key + this.encryptionKey).toString()
      localStorage.setItem(secureKey, encryptedValue)
    } catch (error) {
      this.logSecurityEvent('secure_storage_error', 'medium', { key, error: error.message })
      throw error
    }
  }

  // Récupération sécurisée depuis localStorage
  public getSecureItem(key: string): any | null {
    try {
      const secureKey = CryptoJS.SHA256(key + this.encryptionKey).toString()
      const encryptedValue = localStorage.getItem(secureKey)
      if (!encryptedValue) return null
      
      return this.decryptLocalData(encryptedValue)
    } catch (error) {
      this.logSecurityEvent('secure_retrieval_error', 'medium', { key, error: error.message })
      return null
    }
  }

  // Suppression sécurisée
  public removeSecureItem(key: string): void {
    const secureKey = CryptoJS.SHA256(key + this.encryptionKey).toString()
    localStorage.removeItem(secureKey)
  }

  // Validation d'adresse TimeLoke/Cosmos
  public validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      this.logSecurityEvent('invalid_address_format', 'low', { address })
      return false
    }

    // Validation pour les adresses Cosmos
    const cosmosPattern = /^cosmos[a-z0-9]{39}$/
    const isValid = cosmosPattern.test(address)
    
    if (!isValid) {
      this.logSecurityEvent('invalid_address', 'medium', { address })
    }
    
    return isValid
  }

  // Validation des montants TimeLoke (MTQ)
  public validateAmount(amount: string): boolean {
    if (!amount || typeof amount !== 'string') {
      this.logSecurityEvent('invalid_amount_format', 'low', { amount })
      return false
    }

    const num = parseFloat(amount)
    const isValid = !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER

    if (!isValid) {
      this.logSecurityEvent('invalid_amount', 'medium', { amount })
    }

    return isValid
  }

  // Protection CSRF
  public generateCSRFToken(): string {
    const token = CryptoJS.lib.WordArray.random(256/8).toString()
    this.setSecureItem('csrf_token', token)
    return token
  }

  public validateCSRFToken(token: string): boolean {
    const storedToken = this.getSecureItem('csrf_token')
    const isValid = storedToken === token
    
    if (!isValid) {
      this.logSecurityEvent('csrf_token_invalid', 'high', { providedToken: token })
    }
    
    return isValid
  }

  // Détection d'activités suspectes
  public detectSuspiciousActivity(): boolean {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Compter les événements suspects dans la dernière heure
    const recentSuspiciousEvents = this.securityEvents.filter(event => 
      event.timestamp > oneHourAgo && 
      (event.severity === 'high' || event.severity === 'critical')
    )

    // Détecter les tentatives de force brute
    if (this.metrics.failedAttempts >= this.maxFailedAttempts) {
      this.logSecurityEvent('brute_force_detected', 'critical', {
        failedAttempts: this.metrics.failedAttempts
      })
      return true
    }

    // Détecter les changements d'empreinte d'appareil
    const currentFingerprint = this.generateDeviceFingerprint()
    if (currentFingerprint !== this.metrics.deviceFingerprint) {
      this.logSecurityEvent('device_fingerprint_changed', 'high', {
        oldFingerprint: this.metrics.deviceFingerprint,
        newFingerprint: currentFingerprint
      })
      return true
    }

    // Trop d'événements suspects récents
    if (recentSuspiciousEvents.length > 10) {
      this.logSecurityEvent('high_suspicious_activity', 'critical', {
        eventCount: recentSuspiciousEvents.length
      })
      return true
    }

    return false
  }

  // Gestion des échecs de connexion
  public recordFailedAttempt(): void {
    this.metrics.failedAttempts++
    this.logSecurityEvent('failed_attempt', 'medium', {
      totalFailedAttempts: this.metrics.failedAttempts
    })

    if (this.metrics.failedAttempts >= this.maxFailedAttempts) {
      this.lockSession()
    }
  }

  // Réinitialiser les tentatives échouées
  public resetFailedAttempts(): void {
    this.metrics.failedAttempts = 0
    this.logSecurityEvent('attempts_reset', 'low', {})
  }

  // Verrouillage de session
  private lockSession(): void {
    this.clearSecureStorage()
    this.logSecurityEvent('session_locked', 'critical', {
      reason: 'Too many failed attempts'
    })
    
    // Rediriger vers une page de sécurité
    window.location.href = '/security-lockout'
  }

  // Nettoyage sécurisé du stockage
  public clearSecureStorage(): void {
    // Effacer toutes les données sensibles
    const keysToRemove = ['wallet_data', 'session_token', 'csrf_token', 'user_preferences']
    keysToRemove.forEach(key => this.removeSecureItem(key))
    
    this.sessionToken = null
    this.logSecurityEvent('secure_storage_cleared', 'low', {})
  }

  // Journalisation des événements de sécurité
  private logSecurityEvent(type: string, severity: SecurityEvent['severity'], details: Record<string, any>): void {
    const event: SecurityEvent = {
      type,
      severity,
      timestamp: new Date(),
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ip: undefined // Sera ajouté côté serveur si nécessaire
    }

    this.securityEvents.push(event)
    this.metrics.suspiciousActivities.push(event)

    // Garder seulement les 1000 derniers événements
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }

    // Log en console pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SÉCURITÉ] ${type} (${severity}):`, details)
    }

    // Calculer le score de risque
    this.updateRiskScore()
  }

  // Mise à jour du score de risque
  private updateRiskScore(): void {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentEvents = this.securityEvents.filter(event => event.timestamp > oneHourAgo)
    
    let score = 0
    recentEvents.forEach(event => {
      switch (event.severity) {
        case 'critical': score += 50; break
        case 'high': score += 20; break
        case 'medium': score += 10; break
        case 'low': score += 2; break
      }
    })

    // Ajouter le score basé sur les tentatives échouées
    score += this.metrics.failedAttempts * 10

    this.metrics.riskScore = Math.min(score, 100)
  }

  // Initialisation des écouteurs de sécurité
  private initializeSecurityListeners(): void {
    // Détection de DevTools
    let devtools = false
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true
          this.logSecurityEvent('devtools_opened', 'medium', {})
        }
      } else {
        devtools = false
      }
    }, 500)

    // Détection de tentatives de débogage
    window.addEventListener('keydown', (event) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (event.key === 'F12' || 
          (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
          (event.ctrlKey && event.key === 'U')) {
        this.logSecurityEvent('debug_key_pressed', 'low', { key: event.key })
      }
    })

    // Détection de copier-coller (potentiel vol de données)
    document.addEventListener('copy', () => {
      this.logSecurityEvent('data_copied', 'low', {})
    })

    // Détection de changement de focus (possible attaque)
    window.addEventListener('blur', () => {
      this.logSecurityEvent('window_focus_lost', 'low', {})
    })

    // Détection de tentatives de manipulation DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.logSecurityEvent('dom_manipulation', 'low', {
            type: mutation.type,
            addedNodes: mutation.addedNodes.length
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }

  // Monitoring de session
  private startSessionMonitoring(): void {
    setInterval(() => {
      const now = new Date()
      const sessionDuration = now.getTime() - this.metrics.sessionStart.getTime()
      
      // Timeout de session
      if (sessionDuration > this.sessionTimeout) {
        this.logSecurityEvent('session_timeout', 'medium', { duration: sessionDuration })
        this.clearSecureStorage()
      }

      // Mise à jour de l'activité
      this.metrics.lastActivity = now

      // Vérification périodique d'activité suspecte
      if (this.detectSuspiciousActivity()) {
        this.logSecurityEvent('periodic_security_check_failed', 'high', {})
      }
    }, 60000) // Vérification chaque minute
  }

  // Obtenir les métriques de sécurité
  public getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics }
  }

  // Obtenir les événements de sécurité récents
  public getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit)
  }

  // Protection contre les attaques XSS
  public sanitizeHTML(input: string): string {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  }

  // Validation stricte des entrées utilisateur
  public validateInput(input: string, type: 'address' | 'amount' | 'text' | 'alphanumeric'): boolean {
    if (!input || typeof input !== 'string') return false

    switch (type) {
      case 'address':
        return this.validateAddress(input)
      case 'amount':
        return this.validateAmount(input)
      case 'text':
        // Pas de scripts ou HTML
        return !/[<>\"'&]/.test(input)
      case 'alphanumeric':
        return /^[a-zA-Z0-9\s\-_]+$/.test(input)
      default:
        return false
    }
  }

  // Générateur de mots de passe sécurisés
  public generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    
    return password
  }

  // Nettoyage sécurisé lors de la fermeture
  public cleanup(): void {
    this.clearSecureStorage()
    this.logSecurityEvent('security_cleanup', 'low', {})
  }
}

// Instance globale de sécurité
export const frontendSecurity = FrontendSecurity.getInstance()

// Hook pour utilisation dans React
export const useSecurityMetrics = () => {
  const security = FrontendSecurity.getInstance()
  return {
    metrics: security.getSecurityMetrics(),
    recentEvents: security.getRecentSecurityEvents(),
    validateAddress: security.validateAddress.bind(security),
    validateAmount: security.validateAmount.bind(security),
    encryptData: security.encryptLocalData.bind(security),
    decryptData: security.decryptLocalData.bind(security),
    setSecureItem: security.setSecureItem.bind(security),
    getSecureItem: security.getSecureItem.bind(security),
    clearStorage: security.clearSecureStorage.bind(security)
  }
}

// Protection automatique au chargement
if (typeof window !== 'undefined') {
  const security = FrontendSecurity.getInstance()
  
  // Nettoyage automatique lors de la fermeture
  window.addEventListener('beforeunload', () => {
    // Ne pas nettoyer automatiquement - laisser l'utilisateur décider
    security.logSecurityEvent('page_unload', 'low', {})
  })
  
  // Protection contre les injections
  window.addEventListener('error', (event) => {
    security.logSecurityEvent('javascript_error', 'medium', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    })
  })
}