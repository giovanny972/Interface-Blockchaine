// Middleware de sécurité API pour Capsule Network
import { NextRequest, NextResponse } from 'next/server'
import { frontendSecurity } from './security'

export interface SecurityHeaders {
  'Content-Security-Policy': string
  'X-Content-Type-Options': string
  'X-Frame-Options': string
  'X-XSS-Protection': string
  'Strict-Transport-Security': string
  'Referrer-Policy': string
  'Permissions-Policy': string
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

export class APISecurityMiddleware {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  private blockedIPs: Set<string> = new Set()
  private suspiciousPatterns: RegExp[] = [
    /[<>\"'%;()&+]/,  // XSS patterns
    /union\s+select/i, // SQL injection
    /script[^>]*>.*?<\/script>/gi, // Script tags
    /(javascript|vbscript|onload|onerror):/i, // Event handlers
    /\.\.\/|\.\.\\/, // Path traversal
    /<iframe|<object|<embed/i // Dangerous tags
  ]

  // Headers de sécurité par défaut
  private securityHeaders: SecurityHeaders = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxé pour Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://rpc.cosmos.directory https://lcd.cosmos.directory ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  }

  // Configuration rate limiting par défaut
  private defaultRateLimit: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requêtes par fenêtre
    keyGenerator: (req) => this.getClientIP(req)
  }

  constructor() {
    this.startCleanupTimer()
  }

  // Middleware principal de sécurité
  public async secureRequest(
    request: NextRequest,
    rateLimit?: RateLimitConfig
  ): Promise<NextResponse | null> {
    const clientIP = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const path = request.nextUrl.pathname

    // 1. Vérifier si l'IP est bloquée
    if (this.blockedIPs.has(clientIP)) {
      return this.createErrorResponse('IP blocked due to suspicious activity', 403)
    }

    // 2. Validation des headers requis
    const headerValidation = this.validateHeaders(request)
    if (!headerValidation.valid) {
      this.logSecurityEvent('invalid_headers', {
        ip: clientIP,
        userAgent,
        path,
        error: headerValidation.error
      })
      return this.createErrorResponse('Invalid request headers', 400)
    }

    // 3. Détection de patterns malveillants
    const maliciousCheck = await this.checkMaliciousPatterns(request)
    if (maliciousCheck.isMalicious) {
      this.blockIP(clientIP, 'Malicious pattern detected')
      return this.createErrorResponse('Request blocked', 403)
    }

    // 4. Rate limiting
    const rateLimitResult = this.checkRateLimit(request, rateLimit || this.defaultRateLimit)
    if (!rateLimitResult.allowed) {
      this.logSecurityEvent('rate_limit_exceeded', {
        ip: clientIP,
        userAgent,
        path,
        currentCount: rateLimitResult.currentCount,
        limit: rateLimitResult.limit
      })
      return this.createErrorResponse('Rate limit exceeded', 429, {
        'Retry-After': '900', // 15 minutes
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      })
    }

    // 5. Validation CSRF pour les requêtes POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const csrfValid = await this.validateCSRF(request)
      if (!csrfValid) {
        this.logSecurityEvent('csrf_validation_failed', {
          ip: clientIP,
          userAgent,
          path,
          method: request.method
        })
        return this.createErrorResponse('CSRF token invalid', 403)
      }
    }

    // 6. Validation spécifique aux routes Cosmos/TimeLoke
    if (path.includes('/api/')) {
      const cosmosValidation = await this.validateCosmosRequest(request)
      if (!cosmosValidation.valid) {
        return this.createErrorResponse(cosmosValidation.error || 'Invalid Cosmos request', 400)
      }
    }

    // Requête sécurisée - continuer
    return null
  }

  // Ajouter les headers de sécurité à la réponse
  public addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(this.securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Headers additionnels pour l'API
    response.headers.set('X-Powered-By', 'Capsule Network')
    response.headers.set('X-API-Version', '2.0.0')
    response.headers.set('X-Security-Level', 'Enhanced')

    return response
  }

  // Obtenir l'IP du client
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('remote-addr')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (remoteAddr) {
      return remoteAddr
    }
    
    return 'unknown'
  }

  // Validation des headers requis
  private validateHeaders(request: NextRequest): { valid: boolean; error?: string } {
    const userAgent = request.headers.get('user-agent')
    const contentType = request.headers.get('content-type')

    // Vérifier User-Agent (protection contre les bots basiques)
    if (!userAgent || userAgent.length < 10) {
      return { valid: false, error: 'Invalid or missing User-Agent' }
    }

    // Vérifier Content-Type pour les requêtes POST/PUT
    if (['POST', 'PUT'].includes(request.method)) {
      if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
        return { valid: false, error: 'Invalid Content-Type' }
      }
    }

    // Détecter les User-Agents suspects
    const suspiciousUA = [
      'curl', 'wget', 'python', 'postman', 'insomnia', 'httpie'
    ]
    
    if (suspiciousUA.some(ua => userAgent.toLowerCase().includes(ua))) {
      this.logSecurityEvent('suspicious_user_agent', {
        userAgent,
        ip: this.getClientIP(request)
      })
      // Ne pas bloquer, juste logger
    }

    return { valid: true }
  }

  // Vérification des patterns malveillants
  private async checkMaliciousPatterns(request: NextRequest): Promise<{ isMalicious: boolean; patterns?: string[] }> {
    const url = request.url
    const userAgent = request.headers.get('user-agent') || ''
    
    let body = ''
    try {
      if (request.body && ['POST', 'PUT'].includes(request.method)) {
        const clonedRequest = request.clone()
        body = await clonedRequest.text()
      }
    } catch {
      // Ignorer les erreurs de lecture du body
    }

    const testStrings = [url, userAgent, body]
    const foundPatterns: string[] = []

    for (const testString of testStrings) {
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(testString)) {
          foundPatterns.push(pattern.source)
        }
      }
    }

    if (foundPatterns.length > 0) {
      this.logSecurityEvent('malicious_pattern_detected', {
        patterns: foundPatterns,
        url,
        userAgent,
        ip: this.getClientIP(request)
      })
      return { isMalicious: true, patterns: foundPatterns }
    }

    return { isMalicious: false }
  }

  // Rate limiting
  private checkRateLimit(request: NextRequest, config: RateLimitConfig): {
    allowed: boolean;
    currentCount: number;
    limit: number;
    resetTime: number;
  } {
    const key = config.keyGenerator ? config.keyGenerator(request) : this.getClientIP(request)
    const now = Date.now()
    
    const entry = this.rateLimitStore.get(key)
    
    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou première requête
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      
      return {
        allowed: true,
        currentCount: 1,
        limit: config.maxRequests,
        resetTime: now + config.windowMs
      }
    }

    entry.count++
    
    return {
      allowed: entry.count <= config.maxRequests,
      currentCount: entry.count,
      limit: config.maxRequests,
      resetTime: entry.resetTime
    }
  }

  // Validation CSRF
  private async validateCSRF(request: NextRequest): Promise<boolean> {
    const csrfToken = request.headers.get('x-csrf-token') || 
                     request.headers.get('csrf-token')

    if (!csrfToken) {
      return false
    }

    // Dans un vrai environnement, on vérifierait contre une session
    // Ici on utilise une validation basique
    return csrfToken.length > 10 && /^[a-zA-Z0-9]+$/.test(csrfToken)
  }

  // Validation spécifique aux requêtes Cosmos
  private async validateCosmosRequest(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
    const path = request.nextUrl.pathname

    // Validation des adresses dans les paramètres
    if (path.includes('/balance/') || path.includes('/address/')) {
      const pathParts = path.split('/')
      const address = pathParts[pathParts.length - 1]
      
      if (address && !this.isValidCosmosAddress(address)) {
        return { valid: false, error: 'Invalid Cosmos address format' }
      }
    }

    // Validation des montants dans le body pour les transactions
    if (['POST', 'PUT'].includes(request.method) && path.includes('/tx')) {
      try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json()
        
        if (body.amount && !this.isValidAmount(body.amount)) {
          return { valid: false, error: 'Invalid amount format' }
        }
        
        if (body.recipient && !this.isValidCosmosAddress(body.recipient)) {
          return { valid: false, error: 'Invalid recipient address' }
        }
        
      } catch {
        return { valid: false, error: 'Invalid JSON body' }
      }
    }

    return { valid: true }
  }

  // Validation d'adresse Cosmos
  private isValidCosmosAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false
    return /^cosmos[a-z0-9]{39}$/.test(address)
  }

  // Validation de montant
  private isValidAmount(amount: string | number): boolean {
    if (typeof amount === 'number') {
      return amount > 0 && amount <= Number.MAX_SAFE_INTEGER
    }
    if (typeof amount === 'string') {
      const num = parseFloat(amount)
      return !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER
    }
    return false
  }

  // Bloquer une IP
  private blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip)
    this.logSecurityEvent('ip_blocked', { ip, reason })
    
    // Auto-déblocage après 1 heure
    setTimeout(() => {
      this.blockedIPs.delete(ip)
      this.logSecurityEvent('ip_unblocked', { ip, reason: 'Auto-unblock after timeout' })
    }, 60 * 60 * 1000)
  }

  // Créer une réponse d'erreur sécurisée
  private createErrorResponse(
    message: string, 
    status: number,
    additionalHeaders?: Record<string, string>
  ): NextResponse {
    const response = NextResponse.json(
      { 
        error: message,
        timestamp: new Date().toISOString(),
        code: status
      },
      { status }
    )

    // Ajouter les headers de sécurité
    this.addSecurityHeaders(response)

    // Ajouter les headers additionnels
    if (additionalHeaders) {
      Object.entries(additionalHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return response
  }

  // Logger les événements de sécurité
  private logSecurityEvent(type: string, details: Record<string, any>): void {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      details,
      severity: this.getSeverityForEventType(type)
    }

    // En développement, logger en console
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API SECURITY] ${type}:`, details)
    }

    // En production, envoyer vers un service de monitoring
    // this.sendToMonitoringService(event)
  }

  // Déterminer la sévérité d'un événement
  private getSeverityForEventType(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'ip_blocked': 'critical',
      'malicious_pattern_detected': 'high',
      'rate_limit_exceeded': 'medium',
      'csrf_validation_failed': 'high',
      'invalid_headers': 'medium',
      'suspicious_user_agent': 'low'
    }

    return severityMap[type] || 'medium'
  }

  // Nettoyage périodique du rate limit store
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (now > entry.resetTime) {
          this.rateLimitStore.delete(key)
        }
      }
    }, 5 * 60 * 1000) // Nettoyer toutes les 5 minutes
  }

  // Obtenir les statistiques de sécurité
  public getSecurityStats(): {
    blockedIPs: number;
    activeRateLimits: number;
    totalRequests: number;
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      activeRateLimits: this.rateLimitStore.size,
      totalRequests: Array.from(this.rateLimitStore.values())
        .reduce((sum, entry) => sum + entry.count, 0)
    }
  }

  // Débloquer une IP manuellement
  public unblockIP(ip: string): boolean {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip)
      this.logSecurityEvent('ip_unblocked', { ip, reason: 'Manual unblock' })
      return true
    }
    return false
  }

  // Ajouter un pattern malveillant personnalisé
  public addMaliciousPattern(pattern: RegExp): void {
    this.suspiciousPatterns.push(pattern)
  }
}

// Instance globale du middleware de sécurité
export const apiSecurityMiddleware = new APISecurityMiddleware()

// Helper pour l'utilisation dans les API routes
export const withSecurity = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimit?: RateLimitConfig
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Vérification de sécurité
    const securityResult = await apiSecurityMiddleware.secureRequest(req, rateLimit)
    if (securityResult) {
      return securityResult // Requête bloquée
    }

    try {
      // Exécuter le handler original
      const response = await handler(req)
      
      // Ajouter les headers de sécurité
      return apiSecurityMiddleware.addSecurityHeaders(response)
    } catch (error) {
      // Logger l'erreur de façon sécurisée
      console.error('API Handler Error:', error)
      
      const errorResponse = NextResponse.json(
        { 
          error: 'Internal server error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
      
      return apiSecurityMiddleware.addSecurityHeaders(errorResponse)
    }
  }
}

// Configuration spécifique pour les endpoints Cosmos
export const cosmosRateLimit: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50, // 50 requêtes max
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    return `cosmos:${ip}`
  }
}

// Configuration pour les endpoints de transaction
export const transactionRateLimit: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 10, // 10 transactions max
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    return `tx:${ip}`
  }
}