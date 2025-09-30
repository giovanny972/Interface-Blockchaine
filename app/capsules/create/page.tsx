'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth, useTransaction } from '@/stores/authStore'
import { CreateCapsuleForm, CapsuleType } from '@/types'
import { useForm } from 'react-hook-form'
import { capsuleAPI } from '@/lib/api'
import { blockchainClient } from '@/lib/blockchain'
import {
  CubeIcon,
  ShieldCheckIcon,
  ClockIcon,
  KeyIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  UsersIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useNotificationStore, NotificationHelpers } from '@/stores/notificationStore'
import { CryptoAssetsForm } from '@/components/capsules/CryptoAssetsForm'

export default function CreateCapsulePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { sendTransaction, wallet } = useTransaction()
  const { addNotification } = useNotificationStore()
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [cryptoAssets, setCryptoAssets] = useState<any[]>([])
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateCapsuleForm>({
    defaultValues: {
      type: CapsuleType.TIME_LOCK,
      threshold: 3,
      totalShares: 5,
      isPublic: false,
      cryptoAssets: []
    }
  })

  const selectedType = watch('type')
  const threshold = watch('threshold')

  // Fonction pour calculer la valeur totale des cryptoassets
  const calculateTotalCryptoValue = (assets: any[]): number => {
    const prices: Record<string, number> = {
      'ATOM': 12.50,
      'OSMO': 0.85,
      'JUNO': 3.20,
      'STARS': 0.12,
      'AKT': 2.80,
      'REGEN': 0.45,
      'DSM': 0.15,
      'SCRT': 1.20
    }
    
    return assets.reduce((total, asset) => {
      const amount = parseFloat(asset.amount) / Math.pow(10, asset.decimals)
      const price = prices[asset.symbol] || 1
      return total + (amount * price)
    }, 0)
  } 
  const totalShares = watch('totalShares')

  if (!isAuthenticated) {
    router.push('/auth/connect')
    return null
  }

  const capsuleTypes = [
    {
      type: CapsuleType.SAFE,
      name: 'Coffre-Fort',
      description: 'Accès immédiat par le propriétaire uniquement',
      icon: ShieldCheckIcon,
      color: 'text-success-500',
      bgColor: 'bg-success-500/10 border-success-500/20',
      useCases: ['Documents personnels', 'Mots de passe', 'Clés privées']
    },
    {
      type: CapsuleType.TIME_LOCK,
      name: 'Verrouillage Temporel',
      description: 'Ouverture programmée à une date précise',
      icon: ClockIcon,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10 border-primary-500/20',
      useCases: ['Messages du futur', 'Testaments', 'Surprises d\'anniversaire']
    },
    {
      type: CapsuleType.CONDITIONAL,
      name: 'Conditionnel',
      description: 'Déclenchement selon des conditions externes',
      icon: KeyIcon,
      color: 'text-warning-500',
      bgColor: 'bg-warning-500/10 border-warning-500/20',
      useCases: ['Contrats intelligents', 'Conditions de marché', 'Événements externes']
    },
    {
      type: CapsuleType.MULTI_SIG,
      name: 'Multi-Signatures',
      description: 'Nécessite plusieurs signatures pour ouvrir',
      icon: UserGroupIcon,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-500/10 border-secondary-500/20',
      useCases: ['Décisions collectives', 'Fonds d\'équipe', 'Gouvernance']
    },
    {
      type: CapsuleType.DEAD_MANS_SWITCH,
      name: 'Dead Man\'s Switch',
      description: 'Ouverture automatique sans activité',
      icon: HeartIcon,
      color: 'text-danger-500',
      bgColor: 'bg-danger-500/10 border-danger-500/20',
      useCases: ['Succession d\'urgence', 'Backup de sécurité', 'Plans d\'urgence']
    }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier la taille (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Le fichier ne peut pas dépasser 100MB')
        return
      }
      setSelectedFile(file)
      toast.success('Fichier sélectionné')
    }
  }

  const onSubmit = async (data: CreateCapsuleForm) => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    // Ajouter les cryptoassets au formulaire
    data.cryptoAssets = cryptoAssets

    setIsCreating(true)
    
    try {
      // 1. Upload du fichier si nécessaire
      let fileData: ArrayBuffer | null = null
      
      if (selectedFile.size < 1024 * 1024) {
        // Petit fichier: convertir en bytes pour stockage blockchain
        fileData = await selectedFile.arrayBuffer()
      } else {
        // Gros fichier: upload vers IPFS d'abord
        const uploadResult = await capsuleAPI.uploadToIPFS(selectedFile, {
          title: data.title,
          description: data.description,
          capsuleType: data.type
        })
        
        toast.success('Fichier uploadé sur IPFS')
      }

      // 2. Préparer les messages de transaction pour la blockchain
      const messages = []
      
      // Message principal de création de capsule
      console.log('Simulation de création de capsule:', {
        title: data.title,
        type: data.type,
        file: selectedFile.name,
        size: selectedFile.size,
        cryptoAssets: cryptoAssets.length > 0 ? cryptoAssets : 'aucune'
      })

      // Si des cryptoassets sont ajoutés, créer les transactions de transfert
      if (cryptoAssets.length > 0) {
        toast.loading('Préparation des transferts de cryptomonnaies...', { id: 'crypto-transfer' })
        
        for (const asset of cryptoAssets) {
          const transferMsg = {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
              fromAddress: '', // Sera rempli par le wallet
              toAddress: 'cosmos1capsule_vault_address', // Adresse de la capsule/vault (à remplacer)
              amount: [{ denom: asset.denom, amount: asset.amount }]
            }
          }
          messages.push(transferMsg)
        }
        
        toast.success(`${cryptoAssets.length} cryptomonnaie(s) préparée(s) pour le transfert`, { id: 'crypto-transfer' })
      }

      // Message symbolique de création de capsule (en attendant l'implémentation du module)
      const capsuleMsg = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: '', // Sera rempli par le wallet
          toAddress: data.recipient || 'cosmos1u6mq76z7qtkpqd0y8whjjfe6epqxsp3a4dujxz',
          amount: [{ denom: 'stake', amount: '1' }] // Transaction symbolique
        }
      }
      messages.push(capsuleMsg)

      // 3. Envoyer les transactions
      const transactionMemo = cryptoAssets.length > 0 
        ? `Création capsule: ${data.title} avec ${cryptoAssets.length} cryptomonnaie(s)`
        : `Création capsule: ${data.title}`
      
      const result = await sendTransaction(
        messages,
        transactionMemo
      )

      // 4. Stocker les métadonnées et le fichier localement en attendant l'implémentation
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
        txHash: result.transactionHash,
        isPublic: data.isPublic || false,
        cryptoAssets: cryptoAssets,
        totalCryptoValue: cryptoAssets.length > 0 ? calculateTotalCryptoValue(cryptoAssets) : 0
      }
      
      // Sauvegarder les métadonnées
      localStorage.setItem(`capsule-${capsuleId}`, JSON.stringify(capsuleData))
      
      // Sauvegarder le fichier en base64 pour pouvoir le récupérer lors du déverrouillage
      try {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            localStorage.setItem(`capsule-file-${capsuleId}`, reader.result as string)
            console.log('Fichier sauvegardé pour la capsule:', capsuleId)
          }
        }
        reader.readAsDataURL(selectedFile)
      } catch (error) {
        console.warn('Impossible de sauvegarder le fichier:', error)
      }
      
      console.log('Métadonnées sauvées localement:', capsuleData)

      // Ajouter notification de création
      const notificationMessage = cryptoAssets.length > 0 
        ? `La capsule "${data.title}" a été créée avec ${cryptoAssets.length} cryptomonnaie(s) stockée(s)`
        : `La capsule "${data.title}" a été créée avec succès`
      
      addNotification(NotificationHelpers.success('Capsule créée', notificationMessage))

      const successMessage = cryptoAssets.length > 0 
        ? `Capsule créée avec ${cryptoAssets.length} cryptomonnaie(s) stockée(s) !`
        : 'Capsule créée avec succès !'
      
      toast.success(successMessage)
      
      // Rediriger vers le dashboard après un délai
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      toast.error(error.message || 'Erreur lors de la création de la capsule')
    } finally {
      setIsCreating(false)
    }
  }

  const nextStep = () => setStep(Math.min(step + 1, 4))
  const prevStep = () => setStep(Math.max(step - 1, 1))

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">Créer une Capsule Temporelle</h1>
          </motion.div>
          
          {/* Progress bar */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  stepNum <= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-700 text-dark-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all ${
                    stepNum < step ? 'bg-primary-600' : 'bg-dark-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <p className="text-dark-300">
            {step === 1 && 'Choisissez le type de capsule adapté à votre besoin'}
            {step === 2 && 'Configurez les paramètres de votre capsule'}
            {step === 3 && 'Ajoutez votre contenu et cryptomonnaies à protéger'}
            {step === 4 && 'Vérifiez et confirmez la création'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            {/* Étape 1: Sélection du type */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Type de Capsule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capsuleTypes.map((capsuleType) => (
                    <motion.label
                      key={capsuleType.type}
                      className={`cursor-pointer transition-all ${
                        selectedType === capsuleType.type
                          ? `${capsuleType.bgColor} border-2`
                          : 'bg-dark-800 border border-dark-600 hover:border-dark-500'
                      } rounded-lg p-6`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        value={capsuleType.type}
                        {...register('type', { required: true })}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-4">
                        <capsuleType.icon className={`w-8 h-8 ${capsuleType.color} flex-shrink-0`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-2">
                            {capsuleType.name}
                          </h3>
                          <p className="text-sm text-dark-300 mb-3">
                            {capsuleType.description}
                          </p>
                          <div className="space-y-1">
                            {capsuleType.useCases.map((useCase, index) => (
                              <div key={index} className="text-xs text-dark-400 flex items-center">
                                <div className="w-1 h-1 bg-current rounded-full mr-2" />
                                {useCase}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 2: Configuration */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Titre de la capsule *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Le titre est requis' })}
                      className="input-field"
                      placeholder="Ex: Message pour mon futur moi"
                    />
                    {errors.title && (
                      <p className="text-danger-400 text-xs mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Destinataire (optionnel)
                    </label>
                    <input
                      type="text"
                      {...register('recipient')}
                      className="input-field"
                      placeholder="cosmos1..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input-field"
                    placeholder="Décrivez le contenu ou le but de cette capsule..."
                  />
                </div>

                {/* Visibilité */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-3">
                    Visibilité de la capsule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        !watch('isPublic') 
                          ? 'border-primary-500 bg-primary-500/10' 
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        {...register('isPublic')}
                        value="false"
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
                        <div>
                          <div className="font-medium text-white">Privée</div>
                          <div className="text-sm text-dark-400">Seul vous pouvez voir cette capsule</div>
                        </div>
                      </div>
                    </motion.label>

                    <motion.label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        watch('isPublic') 
                          ? 'border-primary-500 bg-primary-500/10' 
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        {...register('isPublic')}
                        value="true"
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <UsersIcon className="w-6 h-6 text-green-500" />
                        <div>
                          <div className="font-medium text-white">Publique</div>
                          <div className="text-sm text-dark-400">Visible dans l'explorateur public</div>
                        </div>
                      </div>
                    </motion.label>
                  </div>
                  
                  {watch('isPublic') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg"
                    >
                      <div className="flex items-start space-x-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-300">
                          <p className="font-medium mb-1">Capsule publique</p>
                          <p>Cette capsule sera visible par tous les utilisateurs dans l'explorateur public. Le contenu reste chiffré jusqu'au déverrouillage.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Configuration spécifique au type */}
                {selectedType === CapsuleType.TIME_LOCK && (
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Date et heure d'ouverture *
                    </label>
                    <input
                      type="datetime-local"
                      {...register('unlockTime', { required: 'La date d\'ouverture est requise' })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="input-field"
                    />
                    {errors.unlockTime && (
                      <p className="text-danger-400 text-xs mt-1">{errors.unlockTime.message}</p>
                    )}
                  </div>
                )}

                {(selectedType === CapsuleType.MULTI_SIG || selectedType === CapsuleType.CONDITIONAL) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Seuil requis
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={totalShares}
                        {...register('threshold', { 
                          required: true,
                          min: 1,
                          max: totalShares 
                        })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Total des parts
                      </label>
                      <input
                        type="number"
                        min={threshold}
                        max="10"
                        {...register('totalShares', { 
                          required: true,
                          min: threshold,
                          max: 10 
                        })}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Étape 3: Upload de fichier */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Contenu de la Capsule
                </h2>
                
                <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <DocumentArrowUpIcon className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                    {selectedFile ? (
                      <div>
                        <p className="text-lg font-medium text-white mb-2">
                          {selectedFile.name}
                        </p>
                        <p className="text-dark-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <p className="text-primary-400 text-sm mt-2">
                          Cliquez pour changer de fichier
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-white mb-2">
                          Glissez-déposez votre fichier ici
                        </p>
                        <p className="text-dark-400">
                          ou cliquez pour sélectionner
                        </p>
                        <p className="text-xs text-dark-500 mt-2">
                          Taille maximale: 100MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Section cryptomonnaies dans l'étape 3 */}
                <div className="mt-8">
                  <CryptoAssetsForm
                    assets={cryptoAssets}
                    onChange={setCryptoAssets}
                    disabled={isCreating}
                  />
                </div>

                {selectedFile && (
                  <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <InformationCircleIcon className="w-5 h-5 text-primary-400" />
                      <span className="font-medium text-primary-400">Informations de stockage</span>
                    </div>
                    <p className="text-sm text-dark-300">
                      {selectedFile.size < 1024 * 1024 
                        ? '📦 Ce fichier sera stocké directement sur la blockchain pour un accès ultra-rapide'
                        : '🌐 Ce fichier sera stocké sur IPFS pour optimiser les coûts et performances'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Étape 4: Récapitulatif et confirmation */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Récapitulatif
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2">Type de capsule</h3>
                        <p className="text-dark-300">
                          {capsuleTypes.find(t => t.type === selectedType)?.name}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-2">Titre</h3>
                        <p className="text-dark-300">{watch('title')}</p>
                      </div>
                      {watch('description') && (
                        <div>
                          <h3 className="font-medium text-white mb-2">Description</h3>
                          <p className="text-dark-300">{watch('description')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {selectedFile && (
                        <div>
                          <h3 className="font-medium text-white mb-2">Fichier</h3>
                          <p className="text-dark-300">{selectedFile.name}</p>
                          <p className="text-sm text-dark-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                      {watch('unlockTime') && (
                        <div>
                          <h3 className="font-medium text-white mb-2">Ouverture programmée</h3>
                          <p className="text-dark-300">
                            {new Date(watch('unlockTime')!).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Récapitulatif des cryptomonnaies */}
                  {cryptoAssets.length > 0 && (
                    <div className="bg-dark-800/30 border border-dark-600 rounded-xl p-6">
                      <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-primary-400" />
                        <span>Cryptomonnaies stockées</span>
                      </h3>
                      <div className="space-y-3">
                        {cryptoAssets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{asset.logo}</span>
                              <div>
                                <p className="font-medium text-white">
                                  {(parseFloat(asset.amount) / Math.pow(10, asset.decimals)).toFixed(asset.decimals === 6 ? 2 : 4)} {asset.symbol}
                                </p>
                                <p className="text-sm text-dark-400">{asset.displayName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-medium">
                                ${(parseFloat(asset.amount) / Math.pow(10, asset.decimals) * 
                                  ({ 'ATOM': 12.50, 'OSMO': 0.85, 'JUNO': 3.20, 'STARS': 0.12, 'AKT': 2.80, 'REGEN': 0.45, 'DSM': 0.15, 'SCRT': 1.20 }[asset.symbol] || 1)
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-dark-600 pt-3 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">Valeur totale estimée:</span>
                            <span className="font-bold text-green-400 text-lg">
                              ${calculateTotalCryptoValue(cryptoAssets).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <InformationCircleIcon className="w-5 h-5 text-warning-400" />
                      <span className="font-medium text-warning-400">Important</span>
                    </div>
                    <ul className="text-sm text-dark-300 space-y-1">
                      <li>• Vos données seront chiffrées avec AES-256-GCM</li>
                      <li>• Les clés seront distribuées aux masternodes du réseau</li>
                      <li>• Cette opération nécessitera des frais de transaction</li>
                      <li>• Une fois créée, la capsule ne peut plus être modifiée</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !selectedType) ||
                    (step === 2 && (!watch('title') || (selectedType === CapsuleType.TIME_LOCK && !watch('unlockTime')))) ||
                    (step === 3 && !selectedFile)
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="spinner mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer la Capsule'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}