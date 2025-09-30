'use client';

import React, { useState, useEffect } from 'react';
import { MultiNodeWalletService } from '@/services/network/MultiNodeWalletService';
import { NodeSelectionStrategy } from '@/services/network/NetworkManager';
import { NetworkNode } from '@/services/network/NetworkNode';
import { 
  WifiIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface NetworkStatusProps {
  walletService: MultiNodeWalletService;
  showDetails?: boolean;
  className?: string;
}

interface NetworkStats {
  currentNode: NetworkNode | null;
  networkStats: {
    totalNodes: number;
    healthyNodes: number;
    averageResponseTime: number;
    nodeStats: Array<{
      node: NetworkNode;
      usage: { requests: number; failures: number; lastUsed: Date };
      circuitState: string;
    }>;
  };
  discoveryStats: {
    totalSources: number;
    activeSources: number;
    discoveredNodes: number;
    healthyNodes: number;
    lastDiscovery: Date | null;
  };
}

export const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({
  walletService,
  showDetails = false,
  className = ''
}) => {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    updateStats();

    // Rafraîchissement automatique toutes les 10 secondes
    const interval = setInterval(updateStats, 10000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walletService]);

  const updateStats = () => {
    try {
      const stats = walletService.getNetworkStats();
      setNetworkStats(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques réseau:', error);
    }
  };

  const getStatusColor = (): string => {
    if (!networkStats) return 'text-gray-400';
    
    const { networkStats: netStats } = networkStats;
    const healthRatio = netStats.healthyNodes / netStats.totalNodes;
    
    if (healthRatio >= 0.8) return 'text-green-500';
    if (healthRatio >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (!networkStats) return <ClockIcon className="w-4 h-4" />;
    
    const { networkStats: netStats } = networkStats;
    const healthRatio = netStats.healthyNodes / netStats.totalNodes;
    
    if (healthRatio >= 0.8) return <CheckCircleIcon className="w-4 h-4" />;
    if (healthRatio >= 0.5) return <ExclamationTriangleIcon className="w-4 h-4" />;
    return <XCircleIcon className="w-4 h-4" />;
  };

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatLastSeen = (date: Date | null): string => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.round(diff / 60000)}min`;
    if (diff < 86400000) return `Il y a ${Math.round(diff / 3600000)}h`;
    return `Il y a ${Math.round(diff / 86400000)}j`;
  };

  const changeNodeStrategy = (strategy: NodeSelectionStrategy) => {
    walletService.setNodeSelectionStrategy(strategy);
    updateStats();
  };

  if (!networkStats) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ClockIcon className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-400">Chargement réseau...</span>
      </div>
    );
  }

  const { currentNode, networkStats: netStats, discoveryStats } = networkStats;

  return (
    <div className={`network-status ${className}`}>
      {/* Indicateur compact */}
      <div 
        className="flex items-center space-x-2 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <WifiIcon className={`w-3 h-3 ${getStatusColor()}`} />
          <span className={getStatusColor()}>
            {netStats.healthyNodes}/{netStats.totalNodes} nœuds
          </span>
          {currentNode && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-300">
                {currentNode.name}
              </span>
              <span className="text-gray-400">
                ({formatResponseTime(currentNode.responseTime)})
              </span>
            </>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <CogIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Détails étendus */}
      {(isExpanded || showDetails) && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          {/* Nœud actuel */}
          {currentNode && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nœud Actuel
              </h4>
              <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded border">
                <GlobeAltIcon className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{currentNode.name}</div>
                  <div className="text-xs text-gray-500">{currentNode.rpcEndpoint}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Latence</div>
                  <div className="text-sm font-mono">
                    {formatResponseTime(currentNode.responseTime)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Bloc</div>
                  <div className="text-sm font-mono">
                    #{currentNode.blockHeight.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded border">
              <div className="text-lg font-bold text-green-600">
                {netStats.healthyNodes}
              </div>
              <div className="text-xs text-gray-500">Nœuds sains</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded border">
              <div className="text-lg font-bold text-blue-600">
                {formatResponseTime(netStats.averageResponseTime)}
              </div>
              <div className="text-xs text-gray-500">Latence moyenne</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded border">
              <div className="text-lg font-bold text-purple-600">
                {discoveryStats.discoveredNodes}
              </div>
              <div className="text-xs text-gray-500">Nœuds découverts</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded border">
              <div className="text-lg font-bold text-orange-600">
                {discoveryStats.activeSources}
              </div>
              <div className="text-xs text-gray-500">Sources actives</div>
            </div>
          </div>

          {/* Liste des nœuds */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              État des Nœuds
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {netStats.nodeStats.map(({ node, usage, circuitState }) => (
                <div 
                  key={node.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      node.isHealthy && circuitState === 'CLOSED' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} />
                    <span className="font-medium truncate max-w-32">
                      {node.name}
                    </span>
                    <span className="text-gray-500">
                      ({node.region})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <div className="text-gray-400">Latence</div>
                      <div>{formatResponseTime(node.responseTime)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Req/Err</div>
                      <div>{usage.requests}/{usage.failures}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Dernière</div>
                      <div>{formatLastSeen(usage.lastUsed)}</div>
                    </div>
                    {circuitState !== 'CLOSED' && (
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {circuitState}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <select 
                className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-700"
                onChange={(e) => changeNodeStrategy(e.target.value as NodeSelectionStrategy)}
                defaultValue={NodeSelectionStrategy.PRIORITY_FIRST}
              >
                <option value={NodeSelectionStrategy.PRIORITY_FIRST}>
                  Priorité + Latence
                </option>
                <option value={NodeSelectionStrategy.LOWEST_LATENCY}>
                  Plus faible latence
                </option>
                <option value={NodeSelectionStrategy.ROUND_ROBIN}>
                  Round Robin
                </option>
                <option value={NodeSelectionStrategy.RANDOM}>
                  Aléatoire
                </option>
                <option value={NodeSelectionStrategy.GEOGRAPHIC_NEAREST}>
                  Plus proche
                </option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => walletService.rediscoverNodes()}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Redécouvrir
              </button>
              <button
                onClick={updateStats}
                className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Actualiser
              </button>
            </div>
          </div>

          {/* Dernière découverte */}
          {discoveryStats.lastDiscovery && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Dernière découverte: {formatLastSeen(discoveryStats.lastDiscovery)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};