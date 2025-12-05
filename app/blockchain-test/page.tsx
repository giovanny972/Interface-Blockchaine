'use client'

import { useState, useEffect } from 'react'
import { blockchainAPI } from '@/lib/blockchain-api-simple'
import Navigation from '@/components/Navigation'

interface HealthStatus {
  status: string
  chainId?: string
  latestHeight?: string
  nodeVersion?: string
  error?: string
}

export default function BlockchainTestPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [nodeInfo, setNodeInfo] = useState<any>(null)
  const [latestBlock, setLatestBlock] = useState<any>(null)
  const [transactions, setTransactions] = useState<any>(null)

  useEffect(() => {
    loadBlockchainData()
  }, [])

  async function loadBlockchainData() {
    setLoading(true)
    try {
      const [healthData, nodeData, blockData, txData] = await Promise.all([
        blockchainAPI.healthCheck(),
        blockchainAPI.getNodeInfo(),
        blockchainAPI.getLatestBlock(),
        blockchainAPI.searchCapsuleTransactions(5)
      ])

      setHealth(healthData)
      setNodeInfo(nodeData)
      setLatestBlock(blockData)
      setTransactions(txData)
    } catch (error) {
      console.error('Error loading blockchain data:', error)
      setHealth({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">
          🧪 Test de Connexion Blockchain
        </h1>

        {/* Health Check */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">État de la Blockchain</h2>
          {loading ? (
            <div className="text-dark-300">Chargement...</div>
          ) : health ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-dark-300">Statut:</span>
                <span className={`font-semibold ${health.status === 'online' ? 'text-success-400' : 'text-danger-400'}`}>
                  {health.status}
                </span>
              </div>
              {health.chainId && (
                <div className="flex items-center space-x-2">
                  <span className="text-dark-300">Chain ID:</span>
                  <span className="text-white font-mono">{health.chainId}</span>
                </div>
              )}
              {health.latestHeight && (
                <div className="flex items-center space-x-2">
                  <span className="text-dark-300">Dernier Bloc:</span>
                  <span className="text-white font-mono">{health.latestHeight}</span>
                </div>
              )}
              {health.nodeVersion && (
                <div className="flex items-center space-x-2">
                  <span className="text-dark-300">Version:</span>
                  <span className="text-white font-mono">{health.nodeVersion}</span>
                </div>
              )}
              {health.error && (
                <div className="text-danger-400 mt-2">
                  Erreur: {health.error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-danger-400">Aucune donnée disponible</div>
          )}
        </div>

        {/* Node Info */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Informations du Nœud</h2>
          {nodeInfo ? (
            <pre className="bg-dark-900 p-4 rounded-lg overflow-x-auto text-sm text-dark-200">
              {JSON.stringify(nodeInfo, null, 2)}
            </pre>
          ) : (
            <div className="text-dark-300">Chargement...</div>
          )}
        </div>

        {/* Latest Block */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Dernier Bloc</h2>
          {latestBlock ? (
            <pre className="bg-dark-900 p-4 rounded-lg overflow-x-auto text-sm text-dark-200">
              {JSON.stringify(latestBlock, null, 2)}
            </pre>
          ) : (
            <div className="text-dark-300">Chargement...</div>
          )}
        </div>

        {/* Transactions */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Transactions Récentes
            <span className="text-sm text-dark-400 ml-2">
              (Total: {transactions?.result?.total_count || '0'})
            </span>
          </h2>
          {transactions ? (
            <pre className="bg-dark-900 p-4 rounded-lg overflow-x-auto text-sm text-dark-200">
              {JSON.stringify(transactions, null, 2)}
            </pre>
          ) : (
            <div className="text-dark-300">Chargement...</div>
          )}
        </div>

        {/* Config */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-dark-300">REST:</span>
              <span className="text-primary-400">{blockchainAPI.config.REST_ENDPOINT}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-dark-300">RPC:</span>
              <span className="text-primary-400">{blockchainAPI.config.RPC_ENDPOINT}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-dark-300">Chain ID:</span>
              <span className="text-primary-400">{blockchainAPI.config.CHAIN_ID}</span>
            </div>
          </div>
        </div>

        {/* Reload Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadBlockchainData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Chargement...' : 'Recharger les Données'}
          </button>
        </div>
      </div>
    </div>
  )
}
