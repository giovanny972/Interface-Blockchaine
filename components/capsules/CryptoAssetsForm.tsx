'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CryptoAsset } from '@/types'
import { useAuth } from '@/stores/authStore'
import { 
  PlusIcon, 
  XMarkIcon, 
  CurrencyDollarIcon,
  BanknotesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { CustomSelect } from '@/components/ui/CustomSelect'
import toast from 'react-hot-toast'

interface CryptoAssetsFormProps {
  assets: CryptoAsset[]
  onChange: (assets: CryptoAsset[]) => void
  disabled?: boolean
}

// Liste des cryptomonnaies supportées sur Cosmos
const SUPPORTED_ASSETS = [
  {
    denom: 'ucosm',
    displayName: 'Cosmos Hub',
    symbol: 'ATOM',
    decimals: 6,
    logo: '⚛️'
  },
  {
    denom: 'uosmo',
    displayName: 'Osmosis',
    symbol: 'OSMO',
    decimals: 6,
    logo: '🧪'
  },
  {
    denom: 'ujuno',
    displayName: 'Juno Network',
    symbol: 'JUNO',
    decimals: 6,
    logo: '🪐'
  },
  {
    denom: 'ustars',
    displayName: 'Stargaze',
    symbol: 'STARS',
    decimals: 6,
    logo: '🌟'
  },
  {
    denom: 'uakt',
    displayName: 'Akash Network',
    symbol: 'AKT',
    decimals: 6,
    logo: '☁️'
  },
  {
    denom: 'uregen',
    displayName: 'Regen Network',
    symbol: 'REGEN',
    decimals: 6,
    logo: '🌱'
  },
  {
    denom: 'udsm',
    displayName: 'Desmos',
    symbol: 'DSM',
    decimals: 6,
    logo: '💬'
  },
  {
    denom: 'uscrt',
    displayName: 'Secret Network',
    symbol: 'SCRT',
    decimals: 6,
    logo: '🔐'
  }
]

export function CryptoAssetsForm({ assets, onChange, disabled = false }: CryptoAssetsFormProps) {
  const { user, balance } = useAuth()
  const [userBalances, setUserBalances] = useState<Record<string, string>>({})
  const [isAddingAsset, setIsAddingAsset] = useState(false)

  // Simuler la récupération des balances utilisateur
  useEffect(() => {
    if (user?.address) {
      // En mode développement, simuler quelques balances
      const mockBalances = {
        'ucosm': '5000000', // 5 ATOM
        'uosmo': '12000000', // 12 OSMO
        'ujuno': '8000000', // 8 JUNO
        'ustars': '15000000', // 15 STARS
        'uakt': '3000000', // 3 AKT
      }
      setUserBalances(mockBalances)
    }
  }, [user?.address])

  const addAsset = () => {
    setIsAddingAsset(true)
  }

  const saveNewAsset = (selectedAsset: any, amount: string) => {
    if (!selectedAsset || !amount || parseFloat(amount) <= 0) {
      toast.error('Veuillez sélectionner un asset et entrer un montant valide')
      return
    }

    // Convertir le montant en micro-unités
    const microAmount = (parseFloat(amount) * Math.pow(10, selectedAsset.decimals)).toString()
    
    // Vérifier si l'utilisateur a assez de fonds
    const userBalance = userBalances[selectedAsset.denom] || '0'
    if (parseFloat(microAmount) > parseFloat(userBalance)) {
      toast.error(`Solde insuffisant. Disponible: ${formatAmount(userBalance, selectedAsset.decimals)} ${selectedAsset.symbol}`)
      return
    }

    // Vérifier si l'asset n'est pas déjà ajouté
    if (assets.some(asset => asset.denom === selectedAsset.denom)) {
      toast.error('Cette cryptomonnaie est déjà ajoutée')
      return
    }

    const newAsset: CryptoAsset = {
      denom: selectedAsset.denom,
      amount: microAmount,
      displayName: selectedAsset.displayName,
      symbol: selectedAsset.symbol,
      decimals: selectedAsset.decimals,
      logo: selectedAsset.logo
    }

    onChange([...assets, newAsset])
    setIsAddingAsset(false)
    toast.success(`${amount} ${selectedAsset.symbol} ajouté à la capsule`)
  }

  const removeAsset = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index)
    onChange(newAssets)
    toast.success('Cryptomonnaie retirée de la capsule')
  }

  const formatAmount = (amount: string, decimals: number): string => {
    return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 4)
  }

  const getTotalValue = (): string => {
    // Calculer la valeur totale approximative (simulation)
    let total = 0
    assets.forEach(asset => {
      const amount = parseFloat(formatAmount(asset.amount, asset.decimals))
      // Prix simulés (en USD)
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
      total += amount * (prices[asset.symbol] || 1)
    })
    return total.toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="w-6 h-6 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Cryptomonnaies à stocker</h3>
        </div>
        
        {assets.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-dark-400">Valeur estimée</p>
            <p className="text-lg font-bold text-green-400">${getTotalValue()} USD</p>
          </div>
        )}
      </div>

      <div className="bg-dark-800/30 border border-dark-600 rounded-xl p-4">
        <div className="flex items-start space-x-3 mb-4">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-dark-300">
            <p className="mb-2">
              Vous pouvez stocker des cryptomonnaies dans votre capsule temporelle. 
              Elles seront verrouillées jusqu'au déverrouillage de la capsule.
            </p>
            <p className="text-xs text-dark-400">
              ⚠️ Les cryptomonnaies ajoutées seront transférées depuis votre wallet et ne pourront 
              pas être récupérées avant le déverrouillage de la capsule.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des assets ajoutés */}
      <AnimatePresence>
        {assets.map((asset, index) => (
          <motion.div
            key={`${asset.denom}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-dark-800/50 border border-dark-600 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-lg">{asset.logo}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white flex items-center space-x-2">
                    <span>{formatAmount(asset.amount, asset.decimals)} {asset.symbol}</span>
                    <span className="text-xs text-dark-400">({asset.displayName})</span>
                  </h4>
                  <p className="text-sm text-dark-400">
                    Valeur estimée: $
                    {(parseFloat(formatAmount(asset.amount, asset.decimals)) * 
                      ({ 'ATOM': 12.50, 'OSMO': 0.85, 'JUNO': 3.20, 'STARS': 0.12, 'AKT': 2.80, 'REGEN': 0.45, 'DSM': 0.15, 'SCRT': 1.20 }[asset.symbol] || 1)
                    ).toFixed(2)} USD
                  </p>
                </div>
              </div>
              
              <motion.button
                type="button"
                onClick={() => removeAsset(index)}
                disabled={disabled}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Formulaire d'ajout d'asset */}
      <AnimatePresence>
        {isAddingAsset && (
          <AddAssetForm
            supportedAssets={SUPPORTED_ASSETS}
            userBalances={userBalances}
            onSave={saveNewAsset}
            onCancel={() => setIsAddingAsset(false)}
          />
        )}
      </AnimatePresence>

      {/* Bouton d'ajout */}
      {!isAddingAsset && (
        <motion.button
          type="button"
          onClick={addAsset}
          disabled={disabled}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 hover:border-primary-500/50 hover:text-primary-400 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="w-5 h-5" />
          <span>Ajouter une cryptomonnaie</span>
        </motion.button>
      )}
    </div>
  )
}

interface AddAssetFormProps {
  supportedAssets: any[]
  userBalances: Record<string, string>
  onSave: (asset: any, amount: string) => void
  onCancel: () => void
}

function AddAssetForm({ supportedAssets, userBalances, onSave, onCancel }: AddAssetFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [amount, setAmount] = useState('')

  const formatAmount = (amount: string, decimals: number): string => {
    return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 4)
  }

  const assetOptions = supportedAssets.map(asset => ({
    value: asset.denom,
    label: `${asset.displayName} (${asset.symbol})`,
    icon: asset.logo,
    color: undefined
  }))

  const selectedAssetData = supportedAssets.find(asset => asset.denom === selectedAsset)
  const maxAmount = selectedAssetData && userBalances[selectedAssetData.denom] 
    ? formatAmount(userBalances[selectedAssetData.denom], selectedAssetData.decimals)
    : '0'

  const setMaxAmount = () => {
    if (selectedAssetData && userBalances[selectedAssetData.denom]) {
      setAmount(maxAmount)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-dark-800/50 border border-dark-600 rounded-xl p-6 space-y-4"
    >
      <h4 className="font-semibold text-white flex items-center space-x-2">
        <BanknotesIcon className="w-5 h-5 text-primary-400" />
        <span>Ajouter une cryptomonnaie</span>
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Cryptomonnaie
          </label>
          <CustomSelect
            options={assetOptions}
            value={selectedAsset || ''}
            onChange={setSelectedAsset}
            placeholder="Sélectionner une cryptomonnaie"
          />
        </div>

        {selectedAssetData && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-dark-300">
                Montant ({selectedAssetData.symbol})
              </label>
              <div className="text-xs text-dark-400">
                Disponible: {maxAmount} {selectedAssetData.symbol}
                <button
                  type="button"
                  onClick={setMaxAmount}
                  className="ml-2 text-primary-400 hover:text-primary-300"
                >
                  Max
                </button>
              </div>
            </div>
            
            <input
              type="number"
              step="0.000001"
              min="0"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`0.00 ${selectedAssetData.symbol}`}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
            
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-2 text-sm text-dark-400">
                Valeur estimée: $
                {(parseFloat(amount) * 
                  ({ 'ATOM': 12.50, 'OSMO': 0.85, 'JUNO': 3.20, 'STARS': 0.12, 'AKT': 2.80, 'REGEN': 0.45, 'DSM': 0.15, 'SCRT': 1.20 }[selectedAssetData.symbol] || 1)
                ).toFixed(2)} USD
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 pt-4 border-t border-dark-700">
        <motion.button
          type="button"
          onClick={() => onSave(selectedAssetData, amount)}
          disabled={!selectedAssetData || !amount || parseFloat(amount) <= 0}
          className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ajouter
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Annuler
        </motion.button>
      </div>
    </motion.div>
  )
}