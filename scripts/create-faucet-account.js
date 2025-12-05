/**
 * Script pour créer un compte faucet et le financer
 * Usage: node scripts/create-faucet-account.js
 */

const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { StargateClient } = require('@cosmjs/stargate');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  chainId: 'capsule-mainnet-1',
  rpcEndpoint: 'http://141.95.160.10:26657',
  restEndpoint: 'http://141.95.160.10:1317',
  prefix: 'cosmos',
  denom: 'ucaps',
};

// Couleurs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.blue);
  console.log('='.repeat(70) + '\n');
}

async function main() {
  console.clear();

  log('\n╔══════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
  log('║          CRÉATION DU COMPTE FAUCET - CAPSULE NETWORK            ║', colors.bright + colors.cyan);
  log('╚══════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);

  section('ÉTAPE 1: Génération du Compte Faucet');

  log('🔑 Génération d\'un nouveau wallet HD (24 mots)...', colors.cyan);

  // Générer un nouveau wallet avec 24 mots
  const wallet = await DirectSecp256k1HdWallet.generate(24, { prefix: CONFIG.prefix });

  // Obtenir le mnemonic
  const mnemonic = wallet.mnemonic;

  // Obtenir l'adresse
  const accounts = await wallet.getAccounts();
  const faucetAddress = accounts[0].address;

  log(`✅ Wallet généré avec succès!`, colors.green);
  console.log('');
  log('📝 Mnemonic (24 mots) - GARDEZ-LE EN SÉCURITÉ:', colors.yellow);
  console.log('');
  log(`   ${mnemonic}`, colors.bright + colors.yellow);
  console.log('');
  log(`💼 Adresse du faucet:`, colors.cyan);
  log(`   ${faucetAddress}`, colors.bright + colors.cyan);
  console.log('');

  section('ÉTAPE 2: Vérification du Compte');

  log('🔍 Connexion au RPC pour vérifier le compte...', colors.cyan);

  const client = await StargateClient.connect(CONFIG.rpcEndpoint);

  try {
    const account = await client.getAccount(faucetAddress);
    if (account) {
      log('✅ Le compte existe déjà dans la blockchain', colors.green);
      console.log(`   Account Number: ${account.accountNumber}`);
      console.log(`   Sequence: ${account.sequence}`);
    }
  } catch (err) {
    log('ℹ️  Le compte n\'existe pas encore dans la blockchain', colors.yellow);
    log('   → Il sera créé lors du premier envoi de tokens', colors.yellow);
  }

  // Vérifier le solde
  const balance = await client.getBalance(faucetAddress, CONFIG.denom);
  const balanceAmount = parseInt(balance.amount || '0');

  log(`💰 Solde actuel:`, colors.cyan);
  if (balanceAmount > 0) {
    log(`   ${(balanceAmount / 1_000_000).toFixed(6)} CAPS`, colors.green);
  } else {
    log(`   0 CAPS (compte vide)`, colors.yellow);
  }

  client.disconnect();

  section('ÉTAPE 3: Configuration de l\'Environnement');

  log('📄 Sauvegarde des informations dans .env.local...', colors.cyan);

  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  // Lire le fichier .env.local existant s'il existe
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    log('ℹ️  Fichier .env.local existant trouvé', colors.yellow);
  } else {
    log('ℹ️  Création d\'un nouveau fichier .env.local', colors.yellow);
  }

  // Vérifier si FAUCET_MNEMONIC existe déjà
  if (envContent.includes('FAUCET_MNEMONIC=')) {
    log('⚠️  FAUCET_MNEMONIC existe déjà dans .env.local', colors.yellow);
    log('   Pour le remplacer, modifiez manuellement le fichier.', colors.yellow);
  } else {
    // Ajouter le mnemonic
    envContent += '\n# Faucet Configuration\n';
    envContent += `FAUCET_MNEMONIC="${mnemonic}"\n`;
    envContent += `FAUCET_ADDRESS="${faucetAddress}"\n`;

    fs.writeFileSync(envPath, envContent);
    log('✅ Configuration sauvegardée dans .env.local', colors.green);
  }

  section('ÉTAPE 4: Instructions de Financement');

  log('💡 Pour financer le compte faucet, deux options:', colors.cyan);
  console.log('');

  log('Option 1: Depuis le compte genesis (SI VOUS AVEZ ACCÈS)', colors.bright);
  console.log('');
  console.log('   # Sur le VPS ou localement avec simd');
  console.log('   simd tx bank send \\');
  console.log('     <genesis-address> \\');
  log(`     ${faucetAddress} \\`, colors.yellow);
  console.log('     100000000ucaps \\');
  console.log('     --fees 5000ucaps \\');
  log(`     --chain-id ${CONFIG.chainId} \\`, colors.yellow);
  log(`     --node ${CONFIG.rpcEndpoint} \\`, colors.yellow);
  console.log('     --from genesis');
  console.log('');
  log('   Cela enverra 100 CAPS au faucet (20 demandes)', colors.cyan);
  console.log('');

  log('Option 2: Transaction manuelle via script Node.js', colors.bright);
  console.log('');
  console.log('   Utilisez le script fund-faucet.js (à créer) avec accès');
  console.log('   au compte genesis');
  console.log('');

  section('ÉTAPE 5: Vérification Post-Financement');

  log('Après avoir financé le compte, vérifiez avec:', colors.cyan);
  console.log('');
  console.log('   # Via REST API');
  log(`   curl ${CONFIG.restEndpoint}/cosmos/bank/v1beta1/balances/${faucetAddress}`, colors.yellow);
  console.log('');
  console.log('   # Via RPC');
  log(`   curl ${CONFIG.rpcEndpoint}/abci_query?path="/store/bank/key"`, colors.yellow);
  console.log('');

  section('RÉSUMÉ ET SÉCURITÉ');

  log('📋 Informations du Faucet:', colors.bright + colors.blue);
  console.log('');
  console.log(`   Adresse:  ${faucetAddress}`);
  console.log(`   Mnemonic: ${mnemonic.substring(0, 30)}...`);
  console.log(`   Fichier:  .env.local`);
  console.log('');

  log('🔒 Conseils de Sécurité:', colors.red);
  console.log('');
  console.log('   1. ⚠️  Ne JAMAIS commit .env.local dans Git');
  console.log('   2. ⚠️  Gardez le mnemonic en lieu sûr (backup)');
  console.log('   3. ⚠️  Limitez les fonds du faucet (max 100-200 CAPS)');
  console.log('   4. ⚠️  Surveillez les demandes suspectes');
  console.log('   5. ⚠️  En production, utilisez un système plus robuste');
  console.log('');

  log('✅ Configuration du faucet terminée!', colors.green);
  console.log('');
  log('🚀 Prochaines étapes:', colors.cyan);
  console.log('');
  console.log('   1. Financer le compte faucet (voir Option 1 ci-dessus)');
  console.log('   2. Vérifier le solde');
  console.log('   3. Tester l\'API: POST /api/faucet');
  console.log('   4. Intégrer le FaucetButton dans le dashboard');
  console.log('');

  // Sauvegarder aussi dans un fichier JSON pour référence
  const faucetInfoPath = path.join(process.cwd(), 'faucet-info.json');
  const faucetInfo = {
    address: faucetAddress,
    mnemonic: mnemonic,
    createdAt: new Date().toISOString(),
    chainId: CONFIG.chainId,
    rpcEndpoint: CONFIG.rpcEndpoint,
    denom: CONFIG.denom,
  };

  fs.writeFileSync(faucetInfoPath, JSON.stringify(faucetInfo, null, 2));
  log(`📄 Informations sauvegardées dans: faucet-info.json`, colors.green);
  log(`⚠️  ATTENTION: Supprimez ce fichier après avoir noté le mnemonic!`, colors.red);

  console.log('');
}

if (require.main === module) {
  main().catch(err => {
    log(`\n❌ Erreur: ${err.message}`, colors.red);
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
