import { NetworkNode, NodeUtils, NETWORK_NODES, FALLBACK_NODES } from './NetworkNode';
import { NodeHealthService } from './NodeHealthService';
import { errorService, ErrorType } from '../error/ErrorService';

/**
 * Stratégies de sélection des nœuds
 */
export enum NodeSelectionStrategy {
  PRIORITY_FIRST = 'PRIORITY_FIRST',           // Priorité puis latence
  LOWEST_LATENCY = 'LOWEST_LATENCY',           // Plus faible latence
  ROUND_ROBIN = 'ROUND_ROBIN',                 // Rotation équitable
  RANDOM = 'RANDOM',                           // Aléatoire
  GEOGRAPHIC_NEAREST = 'GEOGRAPHIC_NEAREST'    // Plus proche géographiquement
}

/**
 * Configuration du gestionnaire de réseau
 */
export interface NetworkManagerConfig {
  chainId: string;
  selectionStrategy: NodeSelectionStrategy;
  enableHealthMonitoring: boolean;
  healthCheckInterval: number;
  maxRetries: number;
  timeoutDuration: number;
  enableFallback: boolean;
  customNodes?: NetworkNode[];
}

/**
 * Gestionnaire de réseau multi-nœuds avec load balancing et failover
 * Implémente les patterns Strategy, Observer et Circuit Breaker
 */
export class NetworkManager {
  private config: NetworkManagerConfig;
  private availableNodes: NetworkNode[] = [];
  private currentNodeIndex: number = 0;
  private healthService: NodeHealthService;
  private nodeUsageStats: Map<string, { requests: number; failures: number; lastUsed: Date }> = new Map();
  
  // Circuit Breaker state
  private circuitBreakerState: Map<string, 'CLOSED' | 'OPEN' | 'HALF_OPEN'> = new Map();
  private circuitBreakerFailures: Map<string, number> = new Map();
  private readonly circuitBreakerThreshold = 5; // Seuil d'ouverture
  private readonly circuitBreakerTimeout = 60000; // 1 minute de récupération

  constructor(config: NetworkManagerConfig) {
    this.config = config;
    this.healthService = new NodeHealthService(
      config.healthCheckInterval,
      config.timeoutDuration,
      config.maxRetries
    );

    this.initializeNodes();
    this.setupHealthMonitoring();
  }

  /**
   * Initialise les nœuds disponibles
   */
  private initializeNodes(): void {
    // Nœuds du réseau principal
    const networkNodes = NETWORK_NODES[this.config.chainId] || [];
    
    // Nœuds personnalisés
    const customNodes = this.config.customNodes || [];
    
    // Combinaison des nœuds
    this.availableNodes = [...networkNodes, ...customNodes];
    
    // Initialisation des statistiques et circuit breakers
    this.availableNodes.forEach(node => {
      this.nodeUsageStats.set(node.id, {
        requests: 0,
        failures: 0,
        lastUsed: new Date(0)
      });
      this.circuitBreakerState.set(node.id, 'CLOSED');
      this.circuitBreakerFailures.set(node.id, 0);
    });

    console.log(`🌐 NetworkManager initialisé avec ${this.availableNodes.length} nœuds pour ${this.config.chainId}`);
  }

  /**
   * Configure la surveillance de santé
   */
  private setupHealthMonitoring(): void {
    if (!this.config.enableHealthMonitoring) return;

    // Listener pour les changements de santé
    this.healthService.addHealthListener((node, status) => {
      this.updateNodeFromHealthCheck(node, status);
    });

    // Démarrage de la surveillance
    this.healthService.startHealthMonitoring(this.availableNodes);
  }

  /**
   * Met à jour un nœud suite à un check de santé
   */
  private updateNodeFromHealthCheck(updatedNode: NetworkNode, status: any): void {
    const nodeIndex = this.availableNodes.findIndex(n => n.id === updatedNode.id);
    if (nodeIndex !== -1) {
      this.availableNodes[nodeIndex] = updatedNode;
      
      // Gestion du circuit breaker
      if (status.isOnline && status.isSynced) {
        this.closeCircuitBreaker(updatedNode.id);
      }
    }
  }

  /**
   * Obtient le meilleur nœud selon la stratégie configurée
   */
  async getBestNode(): Promise<NetworkNode | null> {
    const healthyNodes = this.getHealthyNodes();
    
    if (healthyNodes.length === 0) {
      console.warn('⚠️ Aucun nœud sain disponible');
      
      if (this.config.enableFallback) {
        return await this.getFallbackNode();
      }
      
      return null;
    }

    switch (this.config.selectionStrategy) {
      case NodeSelectionStrategy.PRIORITY_FIRST:
        return this.selectByPriority(healthyNodes);
      
      case NodeSelectionStrategy.LOWEST_LATENCY:
        return this.selectByLatency(healthyNodes);
      
      case NodeSelectionStrategy.ROUND_ROBIN:
        return this.selectRoundRobin(healthyNodes);
      
      case NodeSelectionStrategy.RANDOM:
        return this.selectRandom(healthyNodes);
      
      case NodeSelectionStrategy.GEOGRAPHIC_NEAREST:
        return await this.selectByGeography(healthyNodes);
      
      default:
        return this.selectByPriority(healthyNodes);
    }
  }

  /**
   * Obtient tous les nœuds sains et disponibles
   */
  private getHealthyNodes(): NetworkNode[] {
    return this.availableNodes.filter(node => 
      node.isHealthy && 
      this.circuitBreakerState.get(node.id) !== 'OPEN'
    );
  }

  /**
   * Sélection par priorité et latence
   */
  private selectByPriority(nodes: NetworkNode[]): NetworkNode {
    return nodes.sort((a, b) => {
      // D'abord par priorité
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Puis par latence
      return a.responseTime - b.responseTime;
    })[0];
  }

  /**
   * Sélection par latence
   */
  private selectByLatency(nodes: NetworkNode[]): NetworkNode {
    return nodes.sort((a, b) => a.responseTime - b.responseTime)[0];
  }

  /**
   * Sélection en round robin
   */
  private selectRoundRobin(nodes: NetworkNode[]): NetworkNode {
    const sortedNodes = nodes.sort((a, b) => a.priority - b.priority);
    const node = sortedNodes[this.currentNodeIndex % sortedNodes.length];
    this.currentNodeIndex = (this.currentNodeIndex + 1) % sortedNodes.length;
    return node;
  }

  /**
   * Sélection aléatoire
   */
  private selectRandom(nodes: NetworkNode[]): NetworkNode {
    return nodes[Math.floor(Math.random() * nodes.length)];
  }

  /**
   * Sélection par proximité géographique
   */
  private async selectByGeography(nodes: NetworkNode[]): Promise<NetworkNode> {
    // Estimation simple basée sur la latence pour la géolocalisation
    // En production, on pourrait utiliser une API de géolocalisation
    const userRegion = await this.estimateUserRegion();
    
    const regionalNodes = nodes.filter(node => node.region === userRegion);
    if (regionalNodes.length > 0) {
      return this.selectByLatency(regionalNodes);
    }
    
    return this.selectByLatency(nodes);
  }

  /**
   * Estime la région de l'utilisateur
   */
  private async estimateUserRegion(): Promise<string> {
    // Implémentation simplifiée - en production, utiliser une API de géolocalisation
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('America/')) return 'us-east';
    if (timezone.includes('Europe/')) return 'eu-west';
    if (timezone.includes('Asia/')) return 'asia-east';
    
    return 'us-east'; // Défaut
  }

  /**
   * Obtient un nœud de fallback
   */
  private async getFallbackNode(): Promise<NetworkNode | null> {
    console.log('🔄 Tentative d\'utilisation des nœuds de fallback');
    
    for (const fallbackNode of FALLBACK_NODES) {
      const isConnected = await this.healthService.testNodeConnectivity(fallbackNode);
      if (isConnected) {
        console.log(`✅ Nœud de fallback trouvé: ${fallbackNode.name}`);
        return fallbackNode;
      }
    }
    
    return null;
  }

  /**
   * Exécute une requête avec retry automatique et failover
   */
  async executeRequest<T>(
    requestFn: (node: NetworkNode) => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < maxRetries) {
      const node = await this.getBestNode();
      
      if (!node) {
        throw new Error('Aucun nœud disponible pour traiter la requête');
      }

      try {
        attempts++;
        this.recordNodeUsage(node.id);
        
        const result = await requestFn(node);
        this.recordNodeSuccess(node.id);
        
        return result;

      } catch (error) {
        lastError = error as Error;
        this.recordNodeFailure(node.id);
        
        console.warn(`Tentative ${attempts}/${maxRetries} échouée pour ${node.name}:`, error.message);
        
        // Gestion du circuit breaker
        this.handleCircuitBreaker(node.id);
        
        // Délai avant retry
        if (attempts < maxRetries) {
          await this.delay(attempts * 1000);
        }
      }
    }

    // Enregistrement de l'erreur globale
    errorService.handleError(
      lastError || new Error('Toutes les tentatives de requête ont échoué'),
      ErrorType.NETWORK,
      { attempts, chainId: this.config.chainId }
    );

    throw lastError || new Error('Toutes les tentatives de requête ont échoué');
  }

  /**
   * Enregistre l'utilisation d'un nœud
   */
  private recordNodeUsage(nodeId: string): void {
    const stats = this.nodeUsageStats.get(nodeId);
    if (stats) {
      stats.requests++;
      stats.lastUsed = new Date();
    }
  }

  /**
   * Enregistre un succès pour un nœud
   */
  private recordNodeSuccess(nodeId: string): void {
    // Reset du circuit breaker en cas de succès
    this.closeCircuitBreaker(nodeId);
  }

  /**
   * Enregistre un échec pour un nœud
   */
  private recordNodeFailure(nodeId: string): void {
    const stats = this.nodeUsageStats.get(nodeId);
    if (stats) {
      stats.failures++;
    }
  }

  /**
   * Gestion du circuit breaker
   */
  private handleCircuitBreaker(nodeId: string): void {
    const failures = this.circuitBreakerFailures.get(nodeId) || 0;
    this.circuitBreakerFailures.set(nodeId, failures + 1);

    if (failures >= this.circuitBreakerThreshold) {
      this.openCircuitBreaker(nodeId);
    }
  }

  /**
   * Ouvre un circuit breaker
   */
  private openCircuitBreaker(nodeId: string): void {
    this.circuitBreakerState.set(nodeId, 'OPEN');
    console.warn(`⚡ Circuit breaker ouvert pour le nœud ${nodeId}`);

    // Programmation de la récupération
    setTimeout(() => {
      this.circuitBreakerState.set(nodeId, 'HALF_OPEN');
      console.log(`🔄 Circuit breaker en semi-ouverture pour ${nodeId}`);
    }, this.circuitBreakerTimeout);
  }

  /**
   * Ferme un circuit breaker
   */
  private closeCircuitBreaker(nodeId: string): void {
    this.circuitBreakerState.set(nodeId, 'CLOSED');
    this.circuitBreakerFailures.set(nodeId, 0);
  }

  /**
   * Délai d'attente
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ajoute un nœud personnalisé
   */
  addCustomNode(node: NetworkNode): void {
    this.availableNodes.push(node);
    this.nodeUsageStats.set(node.id, {
      requests: 0,
      failures: 0,
      lastUsed: new Date(0)
    });
    this.circuitBreakerState.set(node.id, 'CLOSED');
    this.circuitBreakerFailures.set(node.id, 0);

    console.log(`➕ Nœud personnalisé ajouté: ${node.name}`);
  }

  /**
   * Supprime un nœud
   */
  removeNode(nodeId: string): void {
    const index = this.availableNodes.findIndex(n => n.id === nodeId);
    if (index !== -1) {
      this.availableNodes.splice(index, 1);
      this.nodeUsageStats.delete(nodeId);
      this.circuitBreakerState.delete(nodeId);
      this.circuitBreakerFailures.delete(nodeId);
      
      console.log(`➖ Nœud supprimé: ${nodeId}`);
    }
  }

  /**
   * Obtient les statistiques du réseau
   */
  getNetworkStats(): {
    totalNodes: number;
    healthyNodes: number;
    averageResponseTime: number;
    nodeStats: Array<{ node: NetworkNode; usage: any; circuitState: string }>;
  } {
    const healthyNodes = this.getHealthyNodes();
    const averageResponseTime = this.availableNodes.reduce((sum, node) => 
      sum + node.responseTime, 0) / this.availableNodes.length;

    const nodeStats = this.availableNodes.map(node => ({
      node,
      usage: this.nodeUsageStats.get(node.id),
      circuitState: this.circuitBreakerState.get(node.id) || 'CLOSED'
    }));

    return {
      totalNodes: this.availableNodes.length,
      healthyNodes: healthyNodes.length,
      averageResponseTime: Math.round(averageResponseTime),
      nodeStats
    };
  }

  /**
   * Change la stratégie de sélection
   */
  setSelectionStrategy(strategy: NodeSelectionStrategy): void {
    this.config.selectionStrategy = strategy;
    console.log(`🎯 Stratégie de sélection changée: ${strategy}`);
  }

  /**
   * Nettoyage des ressources
   */
  dispose(): void {
    this.healthService.dispose();
    this.nodeUsageStats.clear();
    this.circuitBreakerState.clear();
    this.circuitBreakerFailures.clear();
    console.log('🧹 NetworkManager nettoyé');
  }
}