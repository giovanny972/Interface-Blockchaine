import { WalletManager } from '@/lib/wallet-dynamic';
import { NetworkManager, NetworkManagerConfig, NodeSelectionStrategy } from './NetworkManager';
import { NodeDiscoveryService } from './NodeDiscoveryService';
import { NetworkNode } from './NetworkNode';

/**
 * Service de wallet multi-nœuds avec découverte automatique et failover
 * Remplace le WalletService à nœud unique
 */
export class MultiNodeWalletService {
  private networkManager: NetworkManager;
  private discoveryService: NodeDiscoveryService;
  private walletManager: WalletManager | null = null;
  private currentNode: NetworkNode | null = null;
  private readonly chainId: string;

  constructor(
    chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1',
    selectionStrategy: NodeSelectionStrategy = NodeSelectionStrategy.PRIORITY_FIRST
  ) {
    this.chainId = chainId;

    // Configuration du gestionnaire de réseau
    const networkConfig: NetworkManagerConfig = {
      chainId,
      selectionStrategy,
      enableHealthMonitoring: true,
      healthCheckInterval: 30000, // 30 secondes
      maxRetries: 3,
      timeoutDuration: 5000,
      enableFallback: true
    };

    this.networkManager = new NetworkManager(networkConfig);
    this.discoveryService = new NodeDiscoveryService(chainId);

    this.initializeServices();
  }

  /**
   * Initialise les services de réseau
   */
  private async initializeServices(): Promise<void> {
    try {
      // Démarre la découverte automatique de nœuds
      await this.discoveryService.discoverNodes();
      
      // Valide les nœuds découverts
      const healthyNodes = await this.discoveryService.validateDiscoveredNodes();
      
      // Ajoute les nœuds découverts au gestionnaire de réseau
      healthyNodes.forEach(node => {
        this.networkManager.addCustomNode(node);
      });

      // Démarre la surveillance automatique
      this.discoveryService.startAutoDiscovery(3600000); // 1 heure

      console.log(`🚀 MultiNodeWalletService initialisé pour ${this.chainId}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des services réseau:', error);
    }
  }

  /**
   * Initialise le wallet manager avec le meilleur nœud disponible
   */
  async initialize(): Promise<void> {
    const bestNode = await this.networkManager.getBestNode();
    
    if (!bestNode) {
      throw new Error('Aucun nœud disponible pour initialiser le wallet');
    }

    this.currentNode = bestNode;
    this.walletManager = new WalletManager(this.chainId, bestNode.rpcEndpoint);
    
    console.log(`✅ Wallet initialisé avec le nœud: ${bestNode.name} (${bestNode.rpcEndpoint})`);
  }

  /**
   * Connecte un wallet avec retry automatique sur plusieurs nœuds
   */
  async connectWallet(walletType: 'keplr' | 'cosmostation' | 'leap'): Promise<{
    signer: any;
    client: any;
    queryClient: any;
    address: string;
    node: NetworkNode;
  }> {
    return await this.networkManager.executeRequest(async (node) => {
      // Créer ou mettre à jour le wallet manager si le nœud a changé
      if (!this.walletManager || this.currentNode?.id !== node.id) {
        this.currentNode = node;
        this.walletManager = new WalletManager(this.chainId, node.rpcEndpoint);
        console.log(`🔄 Wallet manager mis à jour pour le nœud: ${node.name}`);
      }

      const { signer, client, address } = await this.walletManager.connectWallet(walletType);
      const queryClient = await this.walletManager.getQueryClient();

      console.log(`🔗 Wallet connecté via ${node.name}: ${address}`);

      return {
        signer,
        client,
        queryClient,
        address,
        node: node
      };
    });
  }

  /**
   * Obtient le client de requête avec failover automatique
   */
  async getQueryClient(): Promise<any> {
    return await this.networkManager.executeRequest(async (node) => {
      // Créer ou mettre à jour le wallet manager si nécessaire
      if (!this.walletManager || this.currentNode?.id !== node.id) {
        this.currentNode = node;
        this.walletManager = new WalletManager(this.chainId, node.rpcEndpoint);
      }

      return await this.walletManager.getQueryClient();
    });
  }

  /**
   * Exécute une transaction avec retry sur plusieurs nœuds
   */
  async executeTransaction(
    signer: any,
    address: string,
    msgs: any[],
    fee: any,
    memo: string = ''
  ): Promise<any> {
    return await this.networkManager.executeRequest(async (node) => {
      // S'assurer que le client est configuré pour le bon nœud
      if (!this.walletManager || this.currentNode?.id !== node.id) {
        this.currentNode = node;
        this.walletManager = new WalletManager(this.chainId, node.rpcEndpoint);
      }

      const client = await this.walletManager.getStargateClient(signer);
      const result = await client.signAndBroadcast(address, msgs, fee, memo);

      console.log(`📝 Transaction exécutée via ${node.name}: ${result.transactionHash}`);
      return result;
    });
  }

  /**
   * Requête générique avec failover
   */
  async executeQuery<T>(queryFn: (queryClient: any) => Promise<T>): Promise<T> {
    return await this.networkManager.executeRequest(async (node) => {
      // S'assurer que le query client est configuré pour le bon nœud
      if (!this.walletManager || this.currentNode?.id !== node.id) {
        this.currentNode = node;
        this.walletManager = new WalletManager(this.chainId, node.rpcEndpoint);
      }

      const queryClient = await this.walletManager.getQueryClient();
      return await queryFn(queryClient);
    });
  }

  /**
   * Obtient les statistiques du réseau
   */
  getNetworkStats(): {
    currentNode: NetworkNode | null;
    networkStats: ReturnType<NetworkManager['getNetworkStats']>;
    discoveryStats: ReturnType<NodeDiscoveryService['getDiscoveryStats']>;
  } {
    return {
      currentNode: this.currentNode,
      networkStats: this.networkManager.getNetworkStats(),
      discoveryStats: this.discoveryService.getDiscoveryStats()
    };
  }

  /**
   * Change la stratégie de sélection des nœuds
   */
  setNodeSelectionStrategy(strategy: NodeSelectionStrategy): void {
    this.networkManager.setSelectionStrategy(strategy);
    console.log(`🎯 Stratégie de sélection changée: ${strategy}`);
  }

  /**
   * Ajoute un nœud personnalisé
   */
  addCustomNode(
    rpcEndpoint: string,
    restEndpoint: string,
    options: Partial<NetworkNode> = {}
  ): void {
    const customNode: NetworkNode = {
      id: `custom-${Date.now()}`,
      name: options.name || 'Custom Node',
      rpcEndpoint,
      restEndpoint,
      websocketEndpoint: rpcEndpoint.replace('http', 'ws') + '/websocket',
      region: options.region || 'custom',
      priority: options.priority || 5,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: this.chainId,
      ...options
    };

    this.networkManager.addCustomNode(customNode);
    console.log(`➕ Nœud personnalisé ajouté: ${customNode.name}`);
  }

  /**
   * Force l'utilisation d'un nœud spécifique
   */
  async forceNode(nodeId: string): Promise<boolean> {
    const stats = this.networkManager.getNetworkStats();
    const targetNode = stats.nodeStats.find(s => s.node.id === nodeId)?.node;

    if (!targetNode) {
      console.error(`❌ Nœud ${nodeId} introuvable`);
      return false;
    }

    try {
      this.currentNode = targetNode;
      this.walletManager = new WalletManager(this.chainId, targetNode.rpcEndpoint);
      
      console.log(`🎯 Nœud forcé: ${targetNode.name}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Impossible de forcer le nœud ${nodeId}:`, error);
      return false;
    }
  }

  /**
   * Redémarre la découverte de nœuds
   */
  async rediscoverNodes(): Promise<void> {
    console.log('🔄 Redémarrage de la découverte de nœuds...');
    
    const results = await this.discoveryService.discoverNodes();
    const healthyNodes = await this.discoveryService.validateDiscoveredNodes();
    
    // Nettoie les anciens nœuds découverts et ajoute les nouveaux
    healthyNodes.forEach(node => {
      this.networkManager.addCustomNode(node);
    });
    
    console.log(`✅ Redécouverte terminée: ${healthyNodes.length} nœuds sains trouvés`);
  }

  /**
   * Vérifie si le service est initialisé
   */
  isInitialized(): boolean {
    return this.walletManager !== null && this.currentNode !== null;
  }

  /**
   * Obtient le nœud actuellement utilisé
   */
  getCurrentNode(): NetworkNode | null {
    return this.currentNode;
  }

  /**
   * Obtient le gestionnaire de wallet (pour compatibilité)
   */
  getWalletManager(): WalletManager | null {
    return this.walletManager;
  }

  /**
   * Nettoyage des ressources
   */
  dispose(): void {
    this.networkManager.dispose();
    this.discoveryService.dispose();
    this.walletManager = null;
    this.currentNode = null;
    
    console.log('🧹 MultiNodeWalletService nettoyé');
  }
}