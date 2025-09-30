import { NetworkNode, NodeUtils } from './NetworkNode';
import { NodeHealthService } from './NodeHealthService';

/**
 * Source de découverte des nœuds
 */
export interface NodeDiscoverySource {
  name: string;
  url: string;
  priority: number;
  isActive: boolean;
}

/**
 * Résultat de la découverte
 */
export interface DiscoveryResult {
  source: string;
  nodes: NetworkNode[];
  discoveredAt: Date;
  success: boolean;
  error?: string;
}

/**
 * Service de découverte automatique des nœuds
 * Implémente le pattern Strategy pour différentes sources de découverte
 */
export class NodeDiscoveryService {
  private discoveredNodes: NetworkNode[] = [];
  private lastDiscovery: Date | null = null;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private healthService: NodeHealthService;

  // Sources de découverte configurables
  private discoverySources: NodeDiscoverySource[] = [
    {
      name: 'Cosmos Chain Registry',
      url: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/capsule/chain.json',
      priority: 1,
      isActive: true
    },
    {
      name: 'Official Capsule API',
      url: 'https://api.capsule.network/v1/nodes',
      priority: 2,
      isActive: true
    },
    {
      name: 'Community Node Directory',
      url: 'https://nodes.capsule.community/api/nodes',
      priority: 3,
      isActive: true
    },
    {
      name: 'Validators Directory',
      url: 'https://validators.capsule.network/api/endpoints',
      priority: 4,
      isActive: false // Désactivé par défaut
    }
  ];

  constructor(chainId: string) {
    this.healthService = new NodeHealthService();
    console.log(`🔍 NodeDiscoveryService initialisé pour ${chainId}`);
  }

  /**
   * Démarre la découverte automatique périodique
   */
  startAutoDiscovery(intervalMs: number = 3600000): void { // 1 heure par défaut
    if (this.discoveryInterval) {
      this.stopAutoDiscovery();
    }

    // Découverte initiale
    this.discoverNodes();

    // Découverte périodique
    this.discoveryInterval = setInterval(() => {
      this.discoverNodes();
    }, intervalMs);

    console.log(`🔄 Découverte automatique démarrée (interval: ${intervalMs}ms)`);
  }

  /**
   * Arrête la découverte automatique
   */
  stopAutoDiscovery(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
      console.log('🛑 Découverte automatique arrêtée');
    }
  }

  /**
   * Lance la découverte depuis toutes les sources actives
   */
  async discoverNodes(): Promise<DiscoveryResult[]> {
    console.log('🔍 Début de la découverte de nœuds...');
    
    const activeSources = this.discoverySources.filter(s => s.isActive);
    const discoveryPromises = activeSources.map(source => 
      this.discoverFromSource(source)
    );

    const results = await Promise.allSettled(discoveryPromises);
    const discoveryResults: DiscoveryResult[] = [];

    results.forEach((result, index) => {
      const source = activeSources[index];
      
      if (result.status === 'fulfilled') {
        discoveryResults.push(result.value);
        if (result.value.success) {
          this.mergeDiscoveredNodes(result.value.nodes);
        }
      } else {
        discoveryResults.push({
          source: source.name,
          nodes: [],
          discoveredAt: new Date(),
          success: false,
          error: result.reason.message
        });
      }
    });

    this.lastDiscovery = new Date();
    
    console.log(`✅ Découverte terminée: ${this.discoveredNodes.length} nœuds trouvés`);
    return discoveryResults;
  }

  /**
   * Découvre les nœuds depuis une source spécifique
   */
  private async discoverFromSource(source: NodeDiscoverySource): Promise<DiscoveryResult> {
    try {
      console.log(`🔎 Découverte depuis ${source.name}...`);
      
      const response = await fetch(source.url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Capsule-Network-Client/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const nodes = await this.parseNodesFromResponse(data, source);

      return {
        source: source.name,
        nodes,
        discoveredAt: new Date(),
        success: true
      };

    } catch (error) {
      console.warn(`❌ Erreur lors de la découverte depuis ${source.name}:`, error.message);
      
      return {
        source: source.name,
        nodes: [],
        discoveredAt: new Date(),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse les nœuds depuis différents formats de réponse
   */
  private async parseNodesFromResponse(data: any, source: NodeDiscoverySource): Promise<NetworkNode[]> {
    const nodes: NetworkNode[] = [];

    try {
      // Format Cosmos Chain Registry
      if (data.apis && Array.isArray(data.apis.rpc)) {
        for (const rpc of data.apis.rpc) {
          if (rpc.address) {
            const restEndpoint = data.apis.rest?.find((r: any) => 
              r.provider === rpc.provider
            )?.address || rpc.address.replace(':26657', ':1317');

            const node = NodeUtils.createCustomNode(
              rpc.address,
              restEndpoint,
              data.chain_id || 'capsule-mainnet',
              {
                name: `${rpc.provider || 'Unknown'} (${source.name})`,
                region: this.inferRegionFromProvider(rpc.provider),
                priority: source.priority + 2, // Sources découvertes ont priorité plus basse
                isValidator: rpc.provider?.includes('validator')
              }
            );

            nodes.push(node);
          }
        }
      }

      // Format API Capsule officielle
      if (data.nodes && Array.isArray(data.nodes)) {
        for (const nodeData of data.nodes) {
          if (nodeData.rpc_endpoint && nodeData.rest_endpoint) {
            const node = NodeUtils.createCustomNode(
              nodeData.rpc_endpoint,
              nodeData.rest_endpoint,
              nodeData.chain_id || 'capsule-mainnet',
              {
                name: nodeData.name || `Node (${source.name})`,
                region: nodeData.region || 'unknown',
                priority: nodeData.priority || (source.priority + 2),
                isValidator: nodeData.is_validator || false,
                version: nodeData.version
              }
            );

            nodes.push(node);
          }
        }
      }

      // Format générique avec endpoints
      if (data.endpoints && Array.isArray(data.endpoints)) {
        for (const endpoint of data.endpoints) {
          if (endpoint.rpc && endpoint.api) {
            const node = NodeUtils.createCustomNode(
              endpoint.rpc,
              endpoint.api,
              endpoint.chain_id || 'capsule-mainnet',
              {
                name: endpoint.name || `Endpoint (${source.name})`,
                region: endpoint.region || 'unknown',
                priority: source.priority + 3
              }
            );

            nodes.push(node);
          }
        }
      }

      console.log(`📡 ${nodes.length} nœuds parsés depuis ${source.name}`);
      return nodes;

    } catch (error) {
      console.error(`Erreur lors du parsing depuis ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Infère la région depuis le nom du provider
   */
  private inferRegionFromProvider(provider?: string): string {
    if (!provider) return 'unknown';
    
    const providerLower = provider.toLowerCase();
    
    if (providerLower.includes('eu') || providerLower.includes('europe')) {
      return 'eu-west';
    }
    if (providerLower.includes('asia') || providerLower.includes('sg') || providerLower.includes('jp')) {
      return 'asia-east';
    }
    if (providerLower.includes('us') || providerLower.includes('america')) {
      return 'us-east';
    }
    
    return 'global';
  }

  /**
   * Fusionne les nouveaux nœuds découverts avec les existants
   */
  private mergeDiscoveredNodes(newNodes: NetworkNode[]): void {
    for (const newNode of newNodes) {
      // Vérifier si le nœud existe déjà (même endpoint RPC)
      const existingNode = this.discoveredNodes.find(
        existing => existing.rpcEndpoint === newNode.rpcEndpoint
      );

      if (existingNode) {
        // Mettre à jour les informations si nécessaire
        existingNode.name = newNode.name || existingNode.name;
        existingNode.region = newNode.region || existingNode.region;
        existingNode.version = newNode.version || existingNode.version;
        existingNode.isValidator = newNode.isValidator ?? existingNode.isValidator;
      } else {
        // Ajouter le nouveau nœud
        this.discoveredNodes.push(newNode);
      }
    }
  }

  /**
   * Valide les nœuds découverts
   */
  async validateDiscoveredNodes(): Promise<NetworkNode[]> {
    console.log(`🔬 Validation de ${this.discoveredNodes.length} nœuds découverts...`);
    
    const validationPromises = this.discoveredNodes.map(async (node) => {
      try {
        const isHealthy = await this.healthService.testNodeConnectivity(node, 1);
        return { ...node, isHealthy };
      } catch (error) {
        return { ...node, isHealthy: false };
      }
    });

    const validatedNodes = await Promise.all(validationPromises);
    const healthyNodes = validatedNodes.filter(node => node.isHealthy);
    
    console.log(`✅ Validation terminée: ${healthyNodes.length}/${this.discoveredNodes.length} nœuds sains`);
    
    this.discoveredNodes = validatedNodes;
    return healthyNodes;
  }

  /**
   * Obtient les nœuds découverts
   */
  getDiscoveredNodes(): NetworkNode[] {
    return this.discoveredNodes;
  }

  /**
   * Obtient les nœuds sains découverts
   */
  getHealthyDiscoveredNodes(): NetworkNode[] {
    return this.discoveredNodes.filter(node => node.isHealthy);
  }

  /**
   * Ajoute une source de découverte personnalisée
   */
  addDiscoverySource(source: NodeDiscoverySource): void {
    this.discoverySources.push(source);
    console.log(`➕ Source de découverte ajoutée: ${source.name}`);
  }

  /**
   * Active/désactive une source de découverte
   */
  toggleDiscoverySource(sourceName: string, isActive: boolean): void {
    const source = this.discoverySources.find(s => s.name === sourceName);
    if (source) {
      source.isActive = isActive;
      console.log(`🔄 Source ${sourceName} ${isActive ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Obtient les statistiques de découverte
   */
  getDiscoveryStats(): {
    totalSources: number;
    activeSources: number;
    discoveredNodes: number;
    healthyNodes: number;
    lastDiscovery: Date | null;
  } {
    return {
      totalSources: this.discoverySources.length,
      activeSources: this.discoverySources.filter(s => s.isActive).length,
      discoveredNodes: this.discoveredNodes.length,
      healthyNodes: this.discoveredNodes.filter(n => n.isHealthy).length,
      lastDiscovery: this.lastDiscovery
    };
  }

  /**
   * Nettoie les nœuds non sains après un certain délai
   */
  cleanupUnhealthyNodes(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const initialCount = this.discoveredNodes.length;

    this.discoveredNodes = this.discoveredNodes.filter(node => {
      if (!node.isHealthy && node.lastHealthCheck && node.lastHealthCheck < cutoff) {
        return false; // Supprimer les nœuds non sains anciens
      }
      return true;
    });

    const removedCount = initialCount - this.discoveredNodes.length;
    if (removedCount > 0) {
      console.log(`🧹 ${removedCount} nœuds non sains supprimés (âge > ${maxAgeHours}h)`);
    }
  }

  /**
   * Nettoyage des ressources
   */
  dispose(): void {
    this.stopAutoDiscovery();
    this.healthService.dispose();
    this.discoveredNodes = [];
    console.log('🧹 NodeDiscoveryService nettoyé');
  }
}