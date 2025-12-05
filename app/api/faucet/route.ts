import { NextRequest, NextResponse } from 'next/server'
import { SigningStargateClient } from '@cosmjs/stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'

// Configuration du faucet
const CONFIG = {
  FAUCET_MNEMONIC: process.env.FAUCET_MNEMONIC || '',
  FAUCET_AMOUNT: '5000000', // 5 CAPS en ucaps
  FAUCET_DENOM: 'ucaps',
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://141.95.160.10:26657',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-mainnet-1',
  GAS_PRICE: '0.025',
}

// Rate limiting simple (en mémoire - pour production utiliser Redis)
const requestLog = new Map<string, number>()
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 heures
const MAX_REQUESTS_PER_ADDRESS = 1

/**
 * Validation de l'adresse Cosmos
 */
function validateCosmosAddress(address: string): boolean {
  const cosmosPattern = /^cosmos[0-9a-z]{39}$/
  return cosmosPattern.test(address)
}

/**
 * Vérifier le rate limiting
 */
function checkRateLimit(address: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const lastRequest = requestLog.get(address)

  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest
    if (timeSinceLastRequest < RATE_LIMIT_WINDOW) {
      const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000 / 60 / 60) // heures
      return { allowed: false, retryAfter }
    }
  }

  return { allowed: true }
}

/**
 * POST /api/faucet
 * Envoie des tokens de test à une adresse
 */
export async function POST(request: NextRequest) {
  console.log('🚰 Faucet: Nouvelle demande reçue')

  try {
    // 1. Parser le body
    const body = await request.json()
    const { address } = body

    console.log('📍 Adresse demandée:', address)

    // 2. Validation de l'adresse
    if (!address || typeof address !== 'string') {
      console.error('❌ Adresse manquante')
      return NextResponse.json(
        { error: 'Adresse requise' },
        { status: 400 }
      )
    }

    if (!validateCosmosAddress(address)) {
      console.error('❌ Adresse invalide:', address)
      return NextResponse.json(
        { error: 'Adresse Cosmos invalide. Format attendu: cosmos...' },
        { status: 400 }
      )
    }

    // 3. Rate limiting
    const rateLimit = checkRateLimit(address)
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit dépassé pour ${address}`)
      return NextResponse.json(
        {
          error: `Vous avez déjà reçu des tokens. Réessayez dans ${rateLimit.retryAfter} heure(s).`,
          retryAfter: rateLimit.retryAfter
        },
        { status: 429 }
      )
    }

    // 4. Vérifier que le mnemonic du faucet est configuré
    if (!CONFIG.FAUCET_MNEMONIC) {
      console.error('❌ FAUCET_MNEMONIC non configuré')
      return NextResponse.json(
        { error: 'Faucet non configuré. Contactez l\'administrateur.' },
        { status: 503 }
      )
    }

    console.log('🔑 Création du wallet faucet...')

    // 5. Créer le wallet faucet
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      CONFIG.FAUCET_MNEMONIC,
      { prefix: 'cosmos' }
    )

    const accounts = await wallet.getAccounts()
    const faucetAddress = accounts[0].address

    console.log('💼 Adresse faucet:', faucetAddress)
    console.log('🌐 Connexion au RPC:', CONFIG.RPC_ENDPOINT)

    // 6. Connexion au RPC
    const client = await SigningStargateClient.connectWithSigner(
      CONFIG.RPC_ENDPOINT,
      wallet,
      {
        gasPrice: {
          denom: CONFIG.FAUCET_DENOM,
          amount: CONFIG.GAS_PRICE
        }
      }
    )

    console.log('✅ Connecté au RPC')

    // 7. Vérifier le solde du faucet
    console.log('💰 Vérification du solde du faucet...')
    const faucetBalance = await client.getBalance(faucetAddress, CONFIG.FAUCET_DENOM)
    const faucetBalanceAmount = parseInt(faucetBalance.amount)

    console.log(`💵 Solde faucet: ${faucetBalanceAmount} ${CONFIG.FAUCET_DENOM} (${(faucetBalanceAmount / 1_000_000).toFixed(2)} CAPS)`)

    if (faucetBalanceAmount < parseInt(CONFIG.FAUCET_AMOUNT)) {
      console.error('❌ Faucet vide!')
      return NextResponse.json(
        {
          error: 'Le faucet est vide. Contactez l\'administrateur pour le recharger.',
          faucetBalance: `${(faucetBalanceAmount / 1_000_000).toFixed(2)} CAPS`
        },
        { status: 503 }
      )
    }

    // 8. Vérifier si l'adresse destinataire a déjà des fonds
    console.log('🔍 Vérification du solde du destinataire...')
    try {
      const recipientBalance = await client.getBalance(address, CONFIG.FAUCET_DENOM)
      const recipientAmount = parseInt(recipientBalance.amount || '0')

      if (recipientAmount > 0) {
        console.warn(`⚠️ Le compte a déjà ${recipientAmount} ${CONFIG.FAUCET_DENOM}`)
        return NextResponse.json(
          {
            error: 'Ce compte possède déjà des tokens.',
            currentBalance: `${(recipientAmount / 1_000_000).toFixed(2)} CAPS`
          },
          { status: 400 }
        )
      }
    } catch (err) {
      // Le compte n'existe pas encore, c'est normal pour un nouveau compte
      console.log('ℹ️ Nouveau compte (inexistant on-chain)')
    }

    console.log('💸 Envoi des tokens...')

    // 9. Envoyer les tokens
    const result = await client.sendTokens(
      faucetAddress,
      address,
      [{ denom: CONFIG.FAUCET_DENOM, amount: CONFIG.FAUCET_AMOUNT }],
      {
        amount: [{ denom: CONFIG.FAUCET_DENOM, amount: '5000' }],
        gas: '200000'
      },
      'Faucet: Tokens de bienvenue pour Capsule Network 🎉'
    )

    console.log('✅ Transaction réussie!')
    console.log('📝 TX Hash:', result.transactionHash)
    console.log('📦 Block Height:', result.height)

    // 10. Enregistrer la demande pour le rate limiting
    requestLog.set(address, Date.now())

    // 11. Nettoyer les anciennes entrées du rate limiting (simple cleanup)
    const now = Date.now()
    for (const [addr, timestamp] of requestLog.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW) {
        requestLog.delete(addr)
      }
    }

    // 12. Réponse de succès
    return NextResponse.json({
      success: true,
      amount: '5 CAPS',
      amountRaw: CONFIG.FAUCET_AMOUNT,
      denom: CONFIG.FAUCET_DENOM,
      txHash: result.transactionHash,
      height: result.height,
      explorerUrl: `https://explorer.capsule.network/tx/${result.transactionHash}`,
      message: 'Tokens envoyés avec succès! Ils apparaîtront dans votre compte dans quelques secondes.'
    })

  } catch (error: any) {
    console.error('❌ Erreur faucet:', error)

    // Log détaillé pour debug
    if (error.message) console.error('Message:', error.message)
    if (error.stack) console.error('Stack:', error.stack)

    return NextResponse.json(
      {
        error: error.message || 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/faucet
 * Retourne les informations du faucet
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier si le faucet est configuré
    if (!CONFIG.FAUCET_MNEMONIC) {
      return NextResponse.json({
        configured: false,
        message: 'Faucet non configuré'
      })
    }

    // Créer le wallet pour obtenir l'adresse
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      CONFIG.FAUCET_MNEMONIC,
      { prefix: 'cosmos' }
    )

    const accounts = await wallet.getAccounts()
    const faucetAddress = accounts[0].address

    // Connexion au RPC pour vérifier le solde
    const client = await SigningStargateClient.connectWithSigner(
      CONFIG.RPC_ENDPOINT,
      wallet
    )

    const balance = await client.getBalance(faucetAddress, CONFIG.FAUCET_DENOM)
    const balanceAmount = parseInt(balance.amount)

    return NextResponse.json({
      configured: true,
      address: faucetAddress,
      balance: `${(balanceAmount / 1_000_000).toFixed(2)} CAPS`,
      balanceRaw: balance.amount,
      denom: CONFIG.FAUCET_DENOM,
      amountPerRequest: `${parseInt(CONFIG.FAUCET_AMOUNT) / 1_000_000} CAPS`,
      remainingRequests: Math.floor(balanceAmount / parseInt(CONFIG.FAUCET_AMOUNT)),
      rateLimitHours: RATE_LIMIT_WINDOW / 1000 / 60 / 60,
    })

  } catch (error: any) {
    console.error('Erreur GET faucet:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
