/**
 * API Blockchain Simple - Lecture seule
 * Endpoints REST pour consulter l'état de la blockchain
 */

import axios from 'axios'

const BLOCKCHAIN_CONFIG = {
  REST_ENDPOINT: process.env.NEXT_PUBLIC_REST_ENDPOINT || 'http://141.95.160.10:1317',
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://141.95.160.10:26657',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-mainnet-1',
}

/**
 * Récupérer les informations du nœud blockchain
 */
export async function getNodeInfo() {
  try {
    const response = await axios.get(
      `${BLOCKCHAIN_CONFIG.REST_ENDPOINT}/cosmos/base/tendermint/v1beta1/node_info`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching node info:', error)
    throw error
  }
}

/**
 * Récupérer le dernier bloc
 */
export async function getLatestBlock() {
  try {
    const response = await axios.get(
      `${BLOCKCHAIN_CONFIG.RPC_ENDPOINT}/block`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching latest block:', error)
    throw error
  }
}

/**
 * Récupérer le solde d'une adresse
 */
export async function getBalance(address: string) {
  try {
    const response = await axios.get(
      `${BLOCKCHAIN_CONFIG.REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching balance:', error)
    throw error
  }
}

/**
 * Rechercher les transactions contenant des capsules
 */
export async function searchCapsuleTransactions(limit = 10) {
  try {
    const response = await axios.get(
      `${BLOCKCHAIN_CONFIG.RPC_ENDPOINT}/tx_search`,
      {
        params: {
          query: "tx.height>0",
          per_page: limit,
          order_by: "desc"
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error searching transactions:', error)
    throw error
  }
}

/**
 * Vérifier si la blockchain est accessible
 */
export async function healthCheck() {
  try {
    const [nodeInfo, latestBlock] = await Promise.all([
      getNodeInfo(),
      getLatestBlock()
    ])

    return {
      status: 'online',
      chainId: nodeInfo.default_node_info?.network || BLOCKCHAIN_CONFIG.CHAIN_ID,
      latestHeight: latestBlock.result?.block?.header?.height || '0',
      nodeVersion: nodeInfo.application_version?.version || 'unknown'
    }
  } catch (error) {
    return {
      status: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const blockchainAPI = {
  getNodeInfo,
  getLatestBlock,
  getBalance,
  searchCapsuleTransactions,
  healthCheck,
  config: BLOCKCHAIN_CONFIG
}
