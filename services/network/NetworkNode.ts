/**
 * Représentation d'un nœud du réseau blockchain
 */
export interface NetworkNode {
  id: string;
  name: string;
  rpcEndpoint: string;
  restEndpoint: string;
  websocketEndpoint?: string;
  region: string;
  priority: number; // 1 = haute priorité, 10 = basse priorité
  isHealthy: boolean;
  lastHealthCheck: Date | null;
  responseTime: number; // en millisecondes
  blockHeight: number;
  chainId: string;
  version?: string;
  isValidator?: boolean;
}

/**
 * Statut de santé d'un nœud
 */
export interface NodeHealthStatus {
  isOnline: boolean;
  responseTime: number;
  blockHeight: number;
  isSynced: boolean;
  lastError?: string;
  timestamp: Date;
}

/**
 * Configuration des nœuds par environnement
 */
export const NETWORK_NODES: Record<string, NetworkNode[]> = {
  // Configuration pour le mainnet
  'capsule-mainnet': [
    {
      id: 'mainnet-primary',
      name: 'Capsule Mainnet Primary',
      rpcEndpoint: 'https://rpc.capsule.network',
      restEndpoint: 'https://api.capsule.network',
      websocketEndpoint: 'wss://rpc.capsule.network/websocket',
      region: 'us-east',
      priority: 1,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-mainnet'
    },
    {
      id: 'mainnet-eu',
      name: 'Capsule Europe Node',
      rpcEndpoint: 'https://rpc-eu.capsule.network',
      restEndpoint: 'https://api-eu.capsule.network',
      websocketEndpoint: 'wss://rpc-eu.capsule.network/websocket',
      region: 'eu-west',
      priority: 2,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-mainnet'
    },
    {
      id: 'mainnet-asia',
      name: 'Capsule Asia Node',
      rpcEndpoint: 'https://rpc-asia.capsule.network',
      restEndpoint: 'https://api-asia.capsule.network',
      websocketEndpoint: 'wss://rpc-asia.capsule.network/websocket',
      region: 'asia-east',
      priority: 3,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-mainnet'
    },
    // Nœuds de backup communautaires
    {
      id: 'community-1',
      name: 'Community Node 1',
      rpcEndpoint: 'https://rpc1.capsule-validators.com',
      restEndpoint: 'https://api1.capsule-validators.com',
      region: 'us-west',
      priority: 4,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-mainnet'
    }
  ],

  // Configuration pour le testnet
  'capsule-testnet-1': [
    {
      id: 'testnet-primary',
      name: 'Capsule Testnet Primary',
      rpcEndpoint: 'https://rpc-testnet.capsule.network',
      restEndpoint: 'https://api-testnet.capsule.network',
      websocketEndpoint: 'wss://rpc-testnet.capsule.network/websocket',
      region: 'us-east',
      priority: 1,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-testnet-1'
    },
    {
      id: 'testnet-backup',
      name: 'Capsule Testnet Backup',
      rpcEndpoint: 'https://rpc2-testnet.capsule.network',
      restEndpoint: 'https://api2-testnet.capsule.network',
      region: 'eu-west',
      priority: 2,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-testnet-1'
    },
    // Nœud local pour développement
    {
      id: 'local-dev',
      name: 'Local Development Node',
      rpcEndpoint: 'http://localhost:26657',
      restEndpoint: 'http://localhost:1317',
      websocketEndpoint: 'ws://localhost:26657/websocket',
      region: 'local',
      priority: 10, // Basse priorité pour éviter l'utilisation en prod
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-testnet-1'
    }
  ],

  // Configuration pour développement local
  'capsule-devnet': [
    {
      id: 'devnet-local',
      name: 'Local Devnet Node',
      rpcEndpoint: 'http://localhost:26657',
      restEndpoint: 'http://localhost:1317',
      websocketEndpoint: 'ws://localhost:26657/websocket',
      region: 'local',
      priority: 1,
      isHealthy: true,
      lastHealthCheck: null,
      responseTime: 0,
      blockHeight: 0,
      chainId: 'capsule-devnet'
    }
  ]
};

/**
 * Nœuds publics de fallback (RPC publics Cosmos)
 */
export const FALLBACK_NODES: NetworkNode[] = [
  {
    id: 'cosmos-hub-fallback',
    name: 'Cosmos Hub Public RPC',
    rpcEndpoint: 'https://rpc-cosmoshub.keplr.app',
    restEndpoint: 'https://lcd-cosmoshub.keplr.app',
    region: 'global',
    priority: 9,
    isHealthy: true,
    lastHealthCheck: null,
    responseTime: 0,
    blockHeight: 0,
    chainId: 'cosmoshub-4' // Utilisé seulement pour tests de connectivité
  }
];

/**
 * Utilitaires pour la gestion des nœuds
 */
export class NodeUtils {
  /**
   * Obtient les nœuds pour un chain ID donné
   */
  static getNodesForChain(chainId: string): NetworkNode[] {
    return NETWORK_NODES[chainId] || [];
  }

  /**
   * Filtre les nœuds sains et les trie par priorité
   */
  static getHealthyNodes(nodes: NetworkNode[]): NetworkNode[] {
    return nodes
      .filter(node => node.isHealthy)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Obtient le meilleur nœud disponible
   */
  static getBestNode(nodes: NetworkNode[]): NetworkNode | null {
    const healthyNodes = this.getHealthyNodes(nodes);
    return healthyNodes[0] || null;
  }

  /**
   * Obtient les nœuds par région
   */
  static getNodesByRegion(nodes: NetworkNode[], region: string): NetworkNode[] {
    return nodes.filter(node => node.region === region);
  }

  /**
   * Clone un nœud avec de nouvelles propriétés
   */
  static updateNode(node: NetworkNode, updates: Partial<NetworkNode>): NetworkNode {
    return { ...node, ...updates };
  }

  /**
   * Vérifie si un nœud est local
   */
  static isLocalNode(node: NetworkNode): boolean {
    return node.rpcEndpoint.includes('localhost') || 
           node.rpcEndpoint.includes('127.0.0.1') ||
           node.region === 'local';
  }

  /**
   * Génère une configuration de nœud personnalisée
   */
  static createCustomNode(
    rpcEndpoint: string,
    restEndpoint: string,
    chainId: string,
    options: Partial<NetworkNode> = {}
  ): NetworkNode {
    return {
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
      chainId,
      ...options
    };
  }
}