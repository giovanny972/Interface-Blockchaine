// Logique de création de capsule optimisée pour la production
import { blockchainClient } from './blockchain'
import { capsuleAPI } from './api'
import { CreateCapsuleForm } from '@/types'
import toast from 'react-hot-toast'

export interface CreateCapsuleParams {
  data: CreateCapsuleForm
  selectedFile: File
  userAddress?: string
}

export interface CreateCapsuleResult {
  success: boolean
  capsuleId?: string
  txHash?: string
  error?: string
  isLocal?: boolean
}

export async function createCapsuleProduction(params: CreateCapsuleParams): Promise<CreateCapsuleResult> {
  const { data, selectedFile, userAddress } = params
  
  try {
    let fileData: string = ''
    let ipfsHash: string | undefined = undefined
    
    // 1. Traitement du fichier selon sa taille
    if (selectedFile.size < 1024 * 1024) { // < 1MB
      // Petit fichier: convertir en base64 pour stockage blockchain
      const arrayBuffer = await selectedFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      fileData = btoa(String.fromCharCode(...uint8Array))
      console.log('Fichier encodé en base64 pour blockchain')
    } else {
      // Gros fichier: upload vers IPFS d'abord
      try {
        const uploadResult = await capsuleAPI.uploadToIPFS(selectedFile, {
          title: data.title,
          description: data.description,
          capsuleType: data.type
        })
        ipfsHash = uploadResult.hash
        fileData = ipfsHash // Stocker le hash IPFS comme données
        toast.success('Fichier uploadé sur IPFS: ' + ipfsHash)
      } catch (error) {
        console.warn('Upload IPFS échoué, encodage en base64:', error)
        // Fallback: encoder en base64 quand même
        const arrayBuffer = await selectedFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        fileData = btoa(String.fromCharCode(...uint8Array))
      }
    }

    // 2. Déterminer le mode de fonctionnement
    const isProductionMode = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true'
    
    if (isProductionMode && blockchainClient.isConnected()) {
      // MODE PRODUCTION: Utiliser le vrai module timecapsule
      console.log('Mode production: création via blockchain')
      
      const result = await blockchainClient.createCapsule({
        recipient: data.recipient || blockchainClient.getAddress()!,
        capsuleType: data.type,
        title: data.title,
        description: data.description || '',
        data: fileData,
        unlockTime: data.unlockTime ? new Date(data.unlockTime) : undefined,
        metadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size.toString(),
          mimeType: selectedFile.type,
          ipfsHash: ipfsHash,
          createdWith: 'capsule-web-interface-v1.0.0',
          isPublic: data.isPublic || false
        },
        threshold: data.threshold || 1,
        totalShares: data.totalShares || 1,
        isPublic: data.isPublic || false
      })
      
      console.log('Transaction blockchain réussie:', result)
      
      return {
        success: true,
        txHash: result.txhash,
        capsuleId: extractCapsuleIdFromTx(result), // À implémenter
        isLocal: false
      }
      
    } else {
      // MODE DÉVELOPPEMENT: Stockage local
      console.log('Mode développement: stockage local')
      
      const capsuleId = Date.now().toString()
      const capsuleData = {
        id: capsuleId,
        title: data.title,
        description: data.description,
        type: data.type,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        unlockTime: data.unlockTime,
        createdAt: new Date(),
        txHash: 'local-' + capsuleId,
        isPublic: data.isPublic || false,
        ipfsHash: ipfsHash,
        recipient: data.recipient || userAddress,
        threshold: data.threshold || 1,
        totalShares: data.totalShares || 1
      }
      
      // Sauvegarder les métadonnées
      localStorage.setItem(`capsule-${capsuleId}`, JSON.stringify(capsuleData))
      
      // Sauvegarder le fichier pour récupération locale
      if (!ipfsHash) { // Seulement si pas sur IPFS
        try {
          const reader = new FileReader()
          reader.onload = () => {
            if (reader.result) {
              localStorage.setItem(`capsule-file-${capsuleId}`, reader.result as string)
              console.log('Fichier sauvegardé localement pour la capsule:', capsuleId)
            }
          }
          reader.readAsDataURL(selectedFile)
        } catch (error) {
          console.warn('Impossible de sauvegarder le fichier localement:', error)
        }
      }
      
      console.log('Métadonnées sauvées en mode développement:', capsuleData)
      
      return {
        success: true,
        capsuleId: capsuleId,
        txHash: capsuleData.txHash,
        isLocal: true
      }
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la création de la capsule:', error)
    return {
      success: false,
      error: error.message || 'Erreur inconnue lors de la création'
    }
  }
}

// Fonction utilitaire pour extraire l'ID de capsule depuis la transaction
function extractCapsuleIdFromTx(txResult: any): string {
  try {
    // Chercher l'événement de création de capsule dans les événements de transaction
    if (txResult.events && Array.isArray(txResult.events)) {
      for (const event of txResult.events) {
        if (event.type === 'capsule.Created' || event.type === 'cosmos.timecapsule.v1.CapsuleCreated') {
          // Chercher l'attribut capsule_id dans les attributs de l'événement
          if (event.attributes && Array.isArray(event.attributes)) {
            for (const attr of event.attributes) {
              if (attr.key === 'capsule_id' || attr.key === 'id') {
                return attr.value
              }
            }
          }
        }
      }
    }

    // Fallback: chercher dans rawLog si disponible
    if (txResult.rawLog) {
      const match = txResult.rawLog.match(/"capsule_id":"([^"]+)"/i) || 
                   txResult.rawLog.match(/"id":"([^"]+)"/i)
      if (match) {
        return match[1]
      }
    }

    console.warn('Impossible d\'extraire l\'ID de capsule des événements de transaction, utilisation d\'un ID temporaire')
    return `${txResult.txhash}-${Date.now()}`
  } catch (error) {
    console.error('Erreur lors de l\'extraction de l\'ID de capsule:', error)
    return `fallback-${Date.now()}`
  }
}

// Fonction pour vérifier si on peut utiliser le mode production
export function canUseProductionMode(): boolean {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true' && blockchainClient.isConnected()
}

// Fonction pour obtenir le status du système
export function getSystemStatus() {
  return {
    developmentMode: process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true',
    blockchainConnected: blockchainClient.isConnected(),
    userAddress: blockchainClient.getAddress(),
    canCreateCapsules: true // Toujours possible en local
  }
}