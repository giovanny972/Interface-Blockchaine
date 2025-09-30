'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuth } from '@/stores/authStore'
import { capsuleAPI } from '@/lib/api'
import StarryBackground from '@/components/StarryBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  CubeIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CapsuleOpenPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, address } = useAuth()
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)

  const capsuleId = params.id as string

  // Récupérer les données de la capsule
  const { data: capsule, isLoading } = useQuery(
    ['capsule', capsuleId],
    () => capsuleAPI.getCapsule(capsuleId),
    {
      enabled: !!capsuleId,
      retry: 1,
      onError: (error) => {
        console.error('Erreur chargement capsule:', error)
        toast.error('Impossible de charger la capsule')
      }
    }
  )

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect')
    }
  }, [isAuthenticated, router])

  // Vérifier si la capsule peut être déverrouillée
  const canUnlock = capsule && (
    capsule.isUnlockable ||
    capsule.status === 'UNLOCKED' ||
    capsule.owner === address
  )

  // Fonction pour déverrouiller la capsule
  const handleUnlock = async () => {
    if (!canUnlock) {
      toast.error('Cette capsule ne peut pas encore être déverrouillée')
      return
    }

    setIsUnlocking(true)

    try {
      // Simulation d'un processus de déverrouillage
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsUnlocked(true)
      toast.success('Capsule déverrouillée avec succès !')
    } catch (error) {
      toast.error('Erreur lors du déverrouillage')
    } finally {
      setIsUnlocking(false)
    }
  }

  // Fonction pour télécharger un fichier
  const handleDownload = (content: any) => {
    // Simulation du téléchargement
    toast.success(`Téléchargement de ${content.name} démarré`)
  }

  // Fonction pour prévisualiser le contenu
  const handlePreview = (content: any) => {
    setSelectedContent(content)
  }

  // Icône selon le type de fichier
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
      case 'jpg':
      case 'png':
      case 'gif':
        return PhotoIcon
      case 'video':
      case 'mp4':
      case 'avi':
        return VideoCameraIcon
      case 'audio':
      case 'mp3':
      case 'wav':
        return MusicalNoteIcon
      default:
        return DocumentIcon
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CubeIcon className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-lg">Chargement de la capsule...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Capsule introuvable</h1>
            <p className="text-dark-400 mb-6">
              Cette capsule n'existe pas ou vous n'avez pas l'autorisation de la voir.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour au dashboard
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative">
        <StarryBackground />
        
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-glass border-b border-dark-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Retour
                </button>
                
                <div className="flex items-center gap-3">
                  <CubeIcon className="w-6 h-6 text-primary-500" />
                  <span className="font-semibold text-white">Capsule #{capsule.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <LockOpenIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className="text-sm text-dark-300">
                    {isUnlocked ? 'Déverrouillée' : 'Verrouillée'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CapsuleViewer
              capsule={capsule}
              isUnlocked={isUnlocked}
              isUnlocking={isUnlocking}
              canUnlock={canUnlock}
              onUnlock={handleUnlock}
              onDownload={handleDownload}
              onPreview={handlePreview}
              getFileIcon={getFileIcon}
            />
          </div>
        </div>

        {/* Modal de prévisualisation */}
        <AnimatePresence>
          {selectedContent && (
            <ContentPreviewModal
              content={selectedContent}
              onClose={() => setSelectedContent(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

// Composant pour afficher la capsule
function CapsuleViewer({ 
  capsule, 
  isUnlocked, 
  isUnlocking, 
  canUnlock, 
  onUnlock, 
  onDownload, 
  onPreview, 
  getFileIcon 
}: any) {
  // Contenu mock pour la démonstration
  const mockContent = [
    {
      id: '1',
      name: 'Message_personnel.txt',
      type: 'text',
      size: '2.3 KB',
      content: 'Cher futur moi, j\'espère que tu es heureux et que tu as réalisé tes rêves...'
    },
    {
      id: '2', 
      name: 'Photo_souvenir.jpg',
      type: 'image',
      size: '1.2 MB',
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...'
    },
    {
      id: '3',
      name: 'Playlist_nostalgie.mp3',
      type: 'audio', 
      size: '5.8 MB',
      content: 'audio-data'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Informations de la capsule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{capsule.title}</h1>
            <p className="text-dark-400">{capsule.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-dark-400 mb-1">
              <UserIcon className="w-4 h-4" />
              <span>Créée par {capsule.owner === capsule.recipient ? 'vous' : 'un utilisateur'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(capsule.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Statut et déverrouillage */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <LockOpenIcon className="w-6 h-6 text-green-400" />
            ) : (
              <LockClosedIcon className="w-6 h-6 text-yellow-400" />
            )}
            <div>
              <p className="font-semibold text-white">
                {isUnlocked ? 'Capsule déverrouillée' : 'Capsule verrouillée'}
              </p>
              <p className="text-sm text-dark-400">
                {isUnlocked 
                  ? 'Vous pouvez maintenant accéder au contenu'
                  : capsule.unlockTime 
                    ? `Déverrouillage prévu le ${new Date(capsule.unlockTime).toLocaleDateString('fr-FR')}`
                    : 'Déverrouillage manuel requis'
                }
              </p>
            </div>
          </div>

          {!isUnlocked && canUnlock && (
            <Link href={`/capsule/${capsule.id}/unlock`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2"
              >
                <KeyIcon className="w-5 h-5" />
                Déverrouillage Quantique
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Contenu de la capsule */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-white">Contenu de la capsule</h2>
            </div>

            <div className="grid gap-4">
              {mockContent.map((item, index) => {
                const Icon = getFileIcon(item.type)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-dark-400">{item.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPreview(item)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                        title="Prévisualiser"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDownload(item)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modal de prévisualisation du contenu
function ContentPreviewModal({ content, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-900 rounded-2xl border border-dark-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h3 className="text-xl font-semibold text-white">{content.name}</h3>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {content.type === 'text' && (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-dark-200 font-mono text-sm leading-relaxed">
                {content.content}
              </pre>
            </div>
          )}
          
          {content.type === 'image' && (
            <div className="text-center">
              <div className="w-full h-64 bg-dark-800 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-16 h-16 text-dark-600" />
                <span className="ml-4 text-dark-400">Aperçu de l'image</span>
              </div>
            </div>
          )}
          
          {content.type === 'audio' && (
            <div className="text-center">
              <div className="w-full h-32 bg-dark-800 rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-12 h-12 text-dark-600" />
                <span className="ml-4 text-dark-400">Lecteur audio</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}