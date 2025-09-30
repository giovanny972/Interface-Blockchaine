import { NetworkNode, NodeHealthStatus } from './NetworkNode';

/**
 * Service de surveillance de santé des nœuds
 * Implémente le pattern Observer pour notifier les changements
 */
export class NodeHealthService {
  private healthCheckInterval: number = 30000; // 30 secondes
  private timeoutDuration: number = 5000; // 5 secondes
  private maxRetries: number = 3;
  private intervalId: NodeJS.Timeout | null = null;
  private healthListeners: Array<(node: NetworkNode, status: NodeHealthStatus) => void> = [];

  constructor(
    healthCheckInterval = 30000,
    timeoutDuration = 5000,
    maxRetries = 3
  ) {
    this.healthCheckInterval = healthCheckInterval;
    this.timeoutDuration = timeoutDuration;
    this.maxRetries = maxRetries;
  }

  /**
   * Démarre la surveillance automatique des nœuds
   */
  startHealthMonitoring(nodes: NetworkNode[]): void {
    if (this.intervalId) {
      this.stopHealthMonitoring();
    }

    // Vérification initiale
    this.checkAllNodesHealth(nodes);

    // Vérifications périodiques
    this.intervalId = setInterval(() => {
      this.checkAllNodesHealth(nodes);
    }, this.healthCheckInterval);

    console.log(`🏥 Surveillance de santé démarrée pour ${nodes.length} nœuds`);
  }

  /**
   * Arrête la surveillance automatique
   */
  stopHealthMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🏥 Surveillance de santé arrêtée');
    }
  }

  /**
   * Vérifie la santé de tous les nœuds
   */
  async checkAllNodesHealth(nodes: NetworkNode[]): Promise<NetworkNode[]> {
    const healthCheckPromises = nodes.map(node => 
      this.checkNodeHealth(node)
        .then(status => this.updateNodeHealth(node, status))
        .catch(error => {
          console.error(`Erreur lors du check de santé pour ${node.name}:`, error);
          return this.updateNodeHealth(node, {
            isOnline: false,
            responseTime: this.timeoutDuration,
            blockHeight: 0,
            isSynced: false,
            lastError: error.message,
            timestamp: new Date()
          });
        })
    );

    return await Promise.all(healthCheckPromises);
  }

  /**
   * Vérifie la santé d'un nœud spécifique
   */
  async checkNodeHealth(node: NetworkNode): Promise<NodeHealthStatus> {
    const startTime = Date.now();

    try {
      // Test de connectivité RPC
      const rpcHealth = await this.checkRPCHealth(node);
      const responseTime = Date.now() - startTime;

      // Test de synchronisation
      const syncStatus = await this.checkSyncStatus(node);

      const status: NodeHealthStatus = {
        isOnline: rpcHealth.isHealthy,
        responseTime,
        blockHeight: rpcHealth.blockHeight,
        isSynced: syncStatus.isSynced,
        timestamp: new Date()
      };

      return status;

    } catch (error) {
      return {
        isOnline: false,
        responseTime: Date.now() - startTime,
        blockHeight: 0,
        isSynced: false,
        lastError: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Vérifie la santé RPC d'un nœud
   */
  private async checkRPCHealth(node: NetworkNode): Promise<{
    isHealthy: boolean;
    blockHeight: number;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

    try {
      // Test du endpoint /health ou /status
      const healthUrl = `${node.rpcEndpoint}/health`;
      const statusUrl = `${node.rpcEndpoint}/status`;

      let response;
      try {
        response = await fetch(healthUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
      } catch {
        // Fallback sur /status si /health n'existe pas
        response = await fetch(statusUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraction de la hauteur de bloc selon le format de réponse
      let blockHeight = 0;
      if (data.result?.sync_info?.latest_block_height) {
        blockHeight = parseInt(data.result.sync_info.latest_block_height, 10);
      } else if (data.sync_info?.latest_block_height) {
        blockHeight = parseInt(data.sync_info.latest_block_height, 10);
      } else if (data.latest_block_height) {
        blockHeight = parseInt(data.latest_block_height, 10);
      }

      return {
        isHealthy: true,
        blockHeight
      };

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Vérifie le statut de synchronisation d'un nœud
   */
  private async checkSyncStatus(node: NetworkNode): Promise<{
    isSynced: boolean;
    catchingUp?: boolean;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

    try {
      const response = await fetch(`${node.rpcEndpoint}/status`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Vérification du statut de sync selon le format de réponse
      let catchingUp = false;
      if (data.result?.sync_info?.catching_up !== undefined) {
        catchingUp = data.result.sync_info.catching_up;
      } else if (data.sync_info?.catching_up !== undefined) {
        catchingUp = data.sync_info.catching_up;
      }

      return {
        isSynced: !catchingUp,
        catchingUp
      };

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Met à jour la santé d'un nœud et notifie les listeners
   */
  private updateNodeHealth(node: NetworkNode, status: NodeHealthStatus): NetworkNode {
    const updatedNode: NetworkNode = {
      ...node,
      isHealthy: status.isOnline && status.isSynced,
      lastHealthCheck: status.timestamp,
      responseTime: status.responseTime,
      blockHeight: status.blockHeight
    };

    // Notification des listeners
    this.healthListeners.forEach(listener => {
      try {
        listener(updatedNode, status);
      } catch (error) {
        console.error('Erreur dans un health listener:', error);
      }
    });

    return updatedNode;
  }

  /**
   * Ajoute un listener pour les changements de santé
   */
  addHealthListener(listener: (node: NetworkNode, status: NodeHealthStatus) => void): void {
    this.healthListeners.push(listener);
  }

  /**
   * Supprime un listener
   */
  removeHealthListener(listener: (node: NetworkNode, status: NodeHealthStatus) => void): void {
    const index = this.healthListeners.indexOf(listener);
    if (index > -1) {
      this.healthListeners.splice(index, 1);
    }
  }

  /**
   * Test manuel de connectivité avec retry
   */
  async testNodeConnectivity(node: NetworkNode, retries = this.maxRetries): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const status = await this.checkNodeHealth(node);
        if (status.isOnline) {
          return true;
        }
      } catch (error) {
        console.warn(`Tentative ${attempt}/${retries} échouée pour ${node.name}:`, error.message);
        
        if (attempt < retries) {
          // Délai exponentiel entre les tentatives
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    return false;
  }

  /**
   * Obtient les statistiques de santé globale
   */
  getHealthStats(nodes: NetworkNode[]): {
    total: number;
    healthy: number;
    unhealthy: number;
    averageResponseTime: number;
    lastCheck: Date | null;
  } {
    const total = nodes.length;
    const healthy = nodes.filter(n => n.isHealthy).length;
    const unhealthy = total - healthy;
    
    const responseTimes = nodes
      .filter(n => n.responseTime > 0)
      .map(n => n.responseTime);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const lastChecks = nodes
      .map(n => n.lastHealthCheck)
      .filter(Boolean) as Date[];
    
    const lastCheck = lastChecks.length > 0
      ? new Date(Math.max(...lastChecks.map(d => d.getTime())))
      : null;

    return {
      total,
      healthy,
      unhealthy,
      averageResponseTime: Math.round(averageResponseTime),
      lastCheck
    };
  }

  /**
   * Nettoyage des ressources
   */
  dispose(): void {
    this.stopHealthMonitoring();
    this.healthListeners = [];
  }
}