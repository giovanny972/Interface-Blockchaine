'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { capsuleAPI } from '@/lib/api'
import {
  ServerIcon,
  GlobeAltIcon,
  ClockIcon,
  SignalIcon,
  CpuChipIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { NetworkStats } from '@/types'

interface NetworkStatusProps {
  className?: string
}

export default function NetworkStatus({ className = '' }: NetworkStatusProps) {
  const { data: networkStats, isLoading, error, refetch } = useQuery(
    ['networkStats'],
    () => capsuleAPI.getNetworkStats(),
    {
      refetchInterval: 30000, // Actualiser toutes les 30 secondes
      refetchOnWindowFocus: true,
      retry: 1, // Réduire le nombre de tentatives
      staleTime: 10000, // Considérer les données comme fraîches pendant 10s
      cacheTime: 30000, // Cache pendant 30s
      onError: (error) => {
        console.warn('Erreur lors de la récupération des stats réseau (fallback vers données simulées):', error)
      }
    }
  )

  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'healthy':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          icon: CheckCircleIcon,
          text: 'Sain'
        }
      case 'degraded':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          icon: ExclamationTriangleIcon,
          text: 'Dégradé'
        }
      case 'down':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          icon: XCircleIcon,
          text: 'Hors ligne'
        }
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          icon: ExclamationTriangleIcon,
          text: 'Inconnu'
        }
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className={`bg-dark-800/50 rounded-2xl p-6 border border-dark-600/50 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ServerIcon className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <h3 className="font-semibold text-white">État du Réseau</h3>
          </div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`network-skeleton-${index}`} className="bg-dark-700/50 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-dark-600 rounded mb-2" />
              <div className="h-6 bg-dark-600 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !networkStats) {
    return (
      <div className={`bg-dark-800/50 rounded-2xl p-6 border border-red-500/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-white">État du Réseau</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Réessayer
          </button>
        </div>
        <p className="text-red-400 text-sm">Impossible de récupérer les données réseau</p>
      </div>
    )
  }

  const healthStatus = getHealthStatus(networkStats.networkHealth)
  const HealthIcon = healthStatus.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dark-800/50 rounded-2xl p-6 border border-dark-600/50 hover:border-dark-500/50 transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ServerIcon className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white">État du Réseau</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`p-1 ${healthStatus.bgColor} rounded-lg`}>
            <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
          </div>
          <span className={`text-sm font-medium ${healthStatus.color}`}>
            {healthStatus.text}
          </span>
        </div>
      </div>

      {/* Network Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hauteur de bloc */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CpuChipIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-dark-400 font-medium">Hauteur de Bloc</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatNumber(networkStats.blockHeight)}
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <SignalIcon className="w-4 h-4 text-green-400" />
            <span className="text-xs text-dark-400 font-medium">Total TX</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatNumber(networkStats.totalTransactions)}
          </div>
        </div>

        {/* Temps de Bloc Moyen */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-dark-400 font-medium">Temps de Bloc</span>
          </div>
          <div className="text-lg font-bold text-white">
            {networkStats.averageBlockTime.toFixed(1)}s
          </div>
        </div>

        {/* Nœuds Connectés */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <GlobeAltIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-dark-400 font-medium">Nœuds</span>
          </div>
          <div className="text-lg font-bold text-white">
            {networkStats.connectedNodes}
          </div>
        </div>

        {/* IPFS Nodes */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CloudIcon className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-dark-400 font-medium">IPFS</span>
          </div>
          <div className="text-lg font-bold text-white">
            {networkStats.ipfsNodes}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              networkStats.networkHealth === 'healthy' ? 'bg-green-400' : 
              networkStats.networkHealth === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-dark-400 font-medium">Statut</span>
          </div>
          <div className={`text-sm font-medium ${healthStatus.color}`}>
            En ligne
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center mt-4 pt-4 border-t border-dark-700">
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
          <span>Actualisation automatique • 30s</span>
        </div>
      </div>
    </motion.div>
  )
}