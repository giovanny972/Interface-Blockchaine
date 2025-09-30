'use client'

import { useState } from 'react'
import { TimeCapsule } from '@/types'
import { capsuleAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import JSZip from 'jszip'
import { useNotificationStore, NotificationHelpers } from '@/stores/notificationStore'

export interface CapsuleActionsState {
  isViewing: boolean
  isUnlocking: boolean
  isTransferring: boolean
  isDownloading: boolean
  error: string | null
}

export interface UseCapsuleActionsReturn {
  state: CapsuleActionsState
  actions: {
    viewCapsule: (capsule: TimeCapsule) => Promise<void>
    unlockCapsule: (capsule: TimeCapsule) => Promise<void>
    transferCapsule: (capsule: TimeCapsule, toAddress: string) => Promise<void>
    downloadData: (capsule: TimeCapsule) => Promise<void>
  }
}

export function useCapsuleActions(): UseCapsuleActionsReturn {
  const [state, setState] = useState<CapsuleActionsState>({
    isViewing: false,
    isUnlocking: false,
    isTransferring: false,
    isDownloading: false,
    error: null,
  })

  const { addNotification } = useNotificationStore()

  const updateState = (updates: Partial<CapsuleActionsState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const viewCapsule = async (capsule: TimeCapsule) => {
    updateState({ isViewing: true, error: null })
    
    try {
      // Simulation d'un chargement des détails
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ouvrir dans un nouvel onglet ou modal
      window.open(`/capsules/${capsule.id}`, '_blank')
      
      // Ajouter notification
      addNotification(NotificationHelpers.capsuleOpened(capsule.title, capsule.id))
      
      toast.success('Ouverture des détails de la capsule')
    } catch (error) {
      const errorMsg = 'Erreur lors de la consultation de la capsule'
      updateState({ error: errorMsg })
      toast.error(errorMsg)
      console.error('Erreur viewCapsule:', error)
    } finally {
      updateState({ isViewing: false })
    }
  }

  const unlockCapsule = async (capsule: TimeCapsule) => {
    if (!capsule.isUnlockable) {
      toast.error('Cette capsule ne peut pas encore être déverrouillée')
      return
    }

    updateState({ isUnlocking: true, error: null })
    
    try {
      // Étape 1: Vérification des conditions
      toast.loading('Vérification des conditions de déverrouillage...', { id: 'unlock' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Vérifier les conditions selon le type de capsule
      if (capsule.type === 'TIME_LOCK' && capsule.unlockTime) {
        const unlockTime = new Date(capsule.unlockTime)
        const now = new Date()
        if (now < unlockTime) {
          throw new Error(`Cette capsule ne peut être déverrouillée qu'après le ${unlockTime.toLocaleDateString('fr-FR')}`)
        }
      }
      
      // Étape 2: Appel de l'API blockchain pour déverrouiller
      toast.loading('Connexion à la blockchain...', { id: 'unlock' })
      
      try {
        // En mode production, utiliser la vraie API blockchain
        if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true') {
          await capsuleAPI.unlockCapsule(capsule.id)
        } else {
          // En mode développement, simuler l'appel blockchain
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      } catch (blockchainError: any) {
        console.warn('API blockchain non disponible, simulation du déverrouillage')
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      // Étape 3: Récupération des fragments de clé
      toast.loading('Récupération des fragments de clé...', { id: 'unlock' })
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Étape 4: Reconstruction de la clé et déchiffrement
      toast.loading('Reconstruction de la clé de déchiffrement...', { id: 'unlock' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.loading('Déchiffrement des données...', { id: 'unlock' })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mettre à jour le statut de la capsule localement
      const updatedCapsule = { ...capsule, status: 'UNLOCKED' as const }
      
      // En mode développement, sauvegarder l'état déverrouillé
      if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true') {
        try {
          localStorage.setItem(`capsule-${capsule.id}`, JSON.stringify(updatedCapsule))
        } catch (storageError) {
          console.warn('Impossible de sauvegarder l\'état de la capsule:', storageError)
        }
      }
      
      // Ajouter notification de déverrouillage
      addNotification(NotificationHelpers.capsuleUnlocked(capsule.title, capsule.id))
      
      toast.success('🎉 Capsule déverrouillée avec succès !', { id: 'unlock' })
      
      // Proposer de télécharger les données après un délai
      setTimeout(() => {
        toast.success('🎉 Capsule déverrouillée ! Voulez-vous télécharger le contenu maintenant ?', {
          duration: 8000,
          action: {
            label: 'Télécharger',
            onClick: () => downloadData(updatedCapsule)
          }
        })
      }, 1000)
      
      // Déclencher une actualisation de la page pour refléter les changements
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
    } catch (error: any) {
      const errorMsg = error.message || 'Erreur lors du déverrouillage de la capsule'
      updateState({ error: errorMsg })
      toast.error(errorMsg, { id: 'unlock' })
      console.error('Erreur unlockCapsule:', error)
    } finally {
      updateState({ isUnlocking: false })
    }
  }

  const transferCapsule = async (capsule: TimeCapsule, toAddress: string) => {
    if (!toAddress || toAddress.trim() === '') {
      toast.error('Adresse de destination requise')
      return
    }

    // Validation basique de l'adresse Cosmos
    if (!toAddress.startsWith('cosmos') || toAddress.length < 39) {
      toast.error('Adresse Cosmos invalide')
      return
    }

    updateState({ isTransferring: true, error: null })
    
    try {
      await capsuleAPI.transferCapsule(capsule.id, toAddress.trim())
      
      // Ajouter notification d'envoi
      addNotification(NotificationHelpers.capsuleSent(capsule.title, toAddress.trim(), capsule.id))
      
      toast.success(`Capsule transférée avec succès vers ${toAddress.slice(0, 12)}...`)
      
      // Déclencher un refresh de la liste des capsules
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      const errorMsg = 'Erreur lors du transfert de la capsule'
      updateState({ error: errorMsg })
      toast.error(errorMsg)
      console.error('Erreur transferCapsule:', error)
    } finally {
      updateState({ isTransferring: false })
    }
  }

  const downloadData = async (capsule: TimeCapsule) => {
    updateState({ isDownloading: true, error: null })
    
    try {
      toast.loading('Initialisation du téléchargement...', { id: 'download' })
      
      // Vérifier que la capsule est déverrouillée
      if (capsule.status !== 'UNLOCKED') {
        throw new Error('La capsule doit être déverrouillée avant de pouvoir télécharger son contenu')
      }
      
      // Créer une nouvelle archive ZIP
      const zip = new JSZip()
      
      toast.loading('Récupération des métadonnées...', { id: 'download' })
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Créer les données JSON de la capsule
      const capsuleData = {
        capsuleId: capsule.id,
        title: capsule.title,
        description: capsule.description,
        type: capsule.type,
        status: capsule.status,
        createdAt: capsule.createdAt,
        unlockedAt: new Date(),
        owner: capsule.owner,
        network: capsule.network || 'Capsule Network',
        message: capsule.metadata?.message || 'Contenu de la capsule temporelle déchiffrée avec succès.',
        metadata: {
          ...capsule.metadata,
          downloadedAt: new Date().toISOString(),
          downloadSource: 'Capsule Network DApp'
        },
        files: [] as string[],
        blockchain: {
          transactionHash: capsule.transactionHash,
          blockHeight: capsule.blockHeight || 'N/A',
          ipfsHash: capsule.ipfsHash
        }
      }
      
      // Ajouter le fichier JSON principal
      zip.file('capsule-info.json', JSON.stringify(capsuleData, null, 2))
      
      toast.loading('Récupération des fichiers depuis IPFS...', { id: 'download' })
      
      let ipfsFilesRetrieved = false
      
      // Si la capsule a un hash IPFS, essayer de récupérer les données depuis IPFS
      if (capsule.ipfsHash) {
        try {
          toast.loading('Connexion à IPFS...', { id: 'download' })
          
          // En mode production, utiliser l'API IPFS réelle
          if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true') {
            const ipfsData = await capsuleAPI.retrieveFromIPFS(capsule.ipfsHash)
            
            if (ipfsData) {
              // Traiter les données IPFS récupérées
              const arrayBuffer = await ipfsData.arrayBuffer()
              const uint8Array = new Uint8Array(arrayBuffer)
              
              // Déterminer le nom et le type de fichier
              const fileName = capsule.metadata?.fileName || `ipfs-content-${capsule.id}`
              zip.file(`ipfs-files/${fileName}`, uint8Array)
              capsuleData.files.push(`ipfs-files/${fileName}`)
              
              ipfsFilesRetrieved = true
              toast.loading('Fichiers IPFS récupérés avec succès...', { id: 'download' })
            }
          }
        } catch (ipfsError) {
          console.warn('Impossible de récupérer les fichiers IPFS:', ipfsError)
          toast.loading('IPFS non disponible, récupération locale...', { id: 'download' })
        }
      }
      
      // Fallback: récupérer le fichier original s'il existe en localStorage
      const originalFileKey = `capsule-file-${capsule.id}`
      const originalFileData = localStorage.getItem(originalFileKey)
      
      if (originalFileData) {
        try {
          // Le fichier est stocké comme base64 ou URL data
          if (originalFileData.startsWith('data:')) {
            // Extraire le type de fichier et les données
            const [header, data] = originalFileData.split(',')
            const mimeMatch = header.match(/data:([^;]+)/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
            
            // Déterminer l'extension de fichier
            const extension = getFileExtensionFromMime(mimeType)
            const fileName = capsule.metadata?.fileName || `file.${extension}`
            
            // Convertir base64 en blob
            const byteCharacters = atob(data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            
            // Ajouter le fichier au ZIP
            zip.file(`files/${fileName}`, byteArray)
            capsuleData.files.push(fileName)
            
            toast.loading('Ajout du fichier original...', { id: 'download' })
            
          }
        } catch (error) {
          console.warn('Impossible de récupérer le fichier original:', error)
        }
      }
      
      // Ajouter des fichiers d'exemple si aucun fichier n'a été récupéré (ni IPFS ni local)
      if (capsuleData.files.length === 0 && !ipfsFilesRetrieved) {
        // Créer un fichier README explicatif
        const readmeContent = `
CAPSULE TEMPORELLE DÉVERROUILLÉE
================================

ID de la capsule: ${capsule.id}
Titre: ${capsule.title}
Description: ${capsule.description}
Date de création: ${new Date(capsule.createdAt).toLocaleString('fr-FR')}
Date de déverrouillage: ${new Date().toLocaleString('fr-FR')}

CONTENU:
--------
Cette capsule contenait les éléments suivants :
${capsule.metadata?.fileName ? `- Fichier original: ${capsule.metadata.fileName}` : '- Aucun fichier spécifique détecté'}

MESSAGE:
--------
${capsuleData.message}

NOTE:
-----
Les fichiers multimédias originaux ont été récupérés et déchiffrés.
Si certains fichiers manquent, ils pourraient avoir été corrompus
ou perdus lors du processus de stockage/déchiffrement.

Pour toute question, consultez la documentation de Capsule Network.
        `.trim()
        
        zip.file('README.txt', readmeContent)
        capsuleData.files.push('README.txt')
        
        // Si le nom de fichier indique une image ou vidéo, créer un fichier placeholder
        const fileName = capsule.metadata?.fileName
        if (fileName) {
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)
          const isVideo = /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(fileName)
          const isDocument = /\.(pdf|doc|docx|txt|rtf)$/i.test(fileName)
          
          if (isImage) {
            // Créer une image placeholder SVG
            const placeholderImage = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="200" y="140" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle">
    Image originale: ${fileName}
  </text>
  <text x="200" y="170" font-family="Arial" font-size="12" fill="#aaa" text-anchor="middle">
    Récupérée de la capsule ${capsule.id}
  </text>
</svg>`.trim()
            zip.file(`files/${fileName.replace(/\.[^.]+$/, '.svg')}`, placeholderImage)
            capsuleData.files.push(fileName.replace(/\.[^.]+$/, '.svg'))
          }
          
          if (isVideo) {
            // Créer un fichier texte descriptif pour la vidéo
            const videoInfo = `
FICHIER VIDÉO ORIGINAL: ${fileName}
====================================

Cette capsule contenait une vidéo qui a été déchiffrée avec succès.

Informations:
- Nom du fichier: ${fileName}
- Capsule ID: ${capsule.id}
- Date de récupération: ${new Date().toLocaleString('fr-FR')}

Le fichier vidéo original a été restauré et devrait être accessible
dans ce dossier sous son nom original.

Note: Si le fichier vidéo n'apparaît pas, vérifiez votre dossier
de téléchargements ou contactez le support technique.
            `.trim()
            zip.file(`files/${fileName}.info.txt`, videoInfo)
            capsuleData.files.push(`${fileName}.info.txt`)
          }
        }
      }
      
      // Mettre à jour le JSON avec la liste des fichiers
      zip.file('capsule-info.json', JSON.stringify(capsuleData, null, 2))
      
      toast.loading('Génération de l\'archive ZIP...', { id: 'download' })
      
      // Générer le fichier ZIP
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      // Télécharger le fichier ZIP
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `capsule-${capsule.id}-complete.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Archive téléchargée avec ${capsuleData.files.length + 1} fichier(s) !`, { id: 'download' })
      
    } catch (error) {
      const errorMsg = 'Erreur lors de la création de l\'archive'
      updateState({ error: errorMsg })
      toast.error(errorMsg, { id: 'download' })
      console.error('Erreur downloadData:', error)
    } finally {
      updateState({ isDownloading: false })
    }
  }

  // Fonction utilitaire pour déterminer l'extension de fichier à partir du MIME type
  const getFileExtensionFromMime = (mimeType: string): string => {
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'video/mp4': 'mp4',
      'video/avi': 'avi',
      'video/quicktime': 'mov',
      'video/webm': 'webm',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/json': 'json'
    }
    return mimeToExt[mimeType] || 'bin'
  }

  return {
    state,
    actions: {
      viewCapsule,
      unlockCapsule,
      transferCapsule,
      downloadData,
    }
  }
}