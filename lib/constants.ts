// Configuration du token natif de la blockchain Capsule
export const TOKEN_CONFIG = {
  // Token Principal - TimeLoke (MTQ initiales pour Martinique)
  SYMBOL: 'MTQ',
  NAME: 'TimeLoke',
  DENOM: 'mtq',
  DECIMALS: 6,
  
  // Informations sur la blockchain
  CHAIN_NAME: 'Capsule Network',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1',
  
  // Endpoints
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://localhost:26657',
  API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:1317',
  
  // Métadonnées du token
  DESCRIPTION: 'TimeLoke - Token natif de la blockchain Capsule Network. MTQ en référence à la Martinique',
  LOGO: '/tokens/mtq-logo.svg',
  
  // Frais par défaut
  DEFAULT_GAS: '200000',
  DEFAULT_FEE: '5000',
  
  // Formatage
  DISPLAY_PRECISION: 2
}

// Types de capsules supportés
export const CAPSULE_TYPES = {
  VAULT: 'Coffre-fort',
  TIME_LOCK: 'Verrouillage temporel', 
  CONDITIONAL: 'Conditionnel',
  MULTI_SIG: 'Multi-signatures',
  DEAD_MANS_SWITCH: "Dead Man's Switch"
} as const

// Configuration du réseau Cosmos
export const COSMOS_CONFIG = {
  FEATURES: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
  BIP44: {
    coinType: 118
  },
  STAKE_CURRENCY: {
    coinDenom: TOKEN_CONFIG.SYMBOL,
    coinMinimalDenom: TOKEN_CONFIG.DENOM,
    coinDecimals: TOKEN_CONFIG.DECIMALS,
    coinGeckoId: 'timeloke'
  }
}

// Utilitaires pour le token MTQ
export const MTQ_UTILS = {
  // Convertir de micro-MTQ vers MTQ
  fromMicroMTQ: (amount: string): number => {
    return parseFloat(amount) / Math.pow(10, TOKEN_CONFIG.DECIMALS)
  },
  
  // Convertir de MTQ vers micro-MTQ 
  toMicroMTQ: (amount: number): string => {
    return Math.floor(amount * Math.pow(10, TOKEN_CONFIG.DECIMALS)).toString()
  },
  
  // Formater l'affichage
  formatBalance: (amount: string, showSymbol: boolean = true): string => {
    const mtqAmount = MTQ_UTILS.fromMicroMTQ(amount)
    const formatted = mtqAmount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: TOKEN_CONFIG.DISPLAY_PRECISION
    })
    return showSymbol ? `${formatted} ${TOKEN_CONFIG.SYMBOL}` : formatted
  },
  
  // Valider un montant MTQ
  isValidAmount: (amount: string): boolean => {
    const num = parseFloat(amount)
    return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER
  }
}

// Messages et textes relatifs à la Martinique
export const MARTINIQUE_REFERENCES = {
  WELCOME_MESSAGES: [
    "Bienvenue dans les eaux cristallines de Capsule Network! 🏝️",
    "Comme la beauté de Fort-de-France, vos données sont précieuses 🌺", 
    "Protégé par la force des alizés numériques 🌊",
    "Vos capsules, aussi sûres que les trésors des Caraïbes 🏴‍☠️"
  ],
  
  SUCCESS_MESSAGES: [
    "Succès! Aussi radieux qu'un coucher de soleil martiniquais ✨",
    "Parfait! Vos données naviguent en sécurité 🛥️",
    "Excellent! Comme une brise tropicale rafraîchissante 🌴"
  ],
  
  LOADING_MESSAGES: [
    "Navigation entre les îles numériques...",
    "Recherche dans les profondeurs des Caraïbes...",
    "Synchronisation avec les alizés cosmiques..."
  ]
}

export default TOKEN_CONFIG