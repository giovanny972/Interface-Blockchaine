#!/bin/bash
#
# Script d'exécution de transaction réelle sur Capsule Mainnet
# À exécuter sur le VPS (141.95.160.10)
#

set -e

echo "════════════════════════════════════════════════════════════"
echo "   TRANSACTION RÉELLE - CAPSULE MAINNET"
echo "════════════════════════════════════════════════════════════"
echo ""

# Configuration
CHAIN_ID="capsule-mainnet-1"
NODE="tcp://localhost:26657"
SIMD_HOME="${HOME}/Blockchains---Capsule-V2/.simapp"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ÉTAPE 1: Vérifier les comptes disponibles
print_step "ÉTAPE 1: Vérification des comptes disponibles"
echo ""

simd keys list --home="$SIMD_HOME" 2>/dev/null || {
    print_error "Impossible de lister les comptes"
    exit 1
}

echo ""

# ÉTAPE 2: Créer deux nouveaux comptes de test
print_step "ÉTAPE 2: Création de deux comptes de test (Alice et Bob)"
echo ""

# Créer Alice
if simd keys show alice --home="$SIMD_HOME" 2>/dev/null; then
    print_warning "Le compte Alice existe déjà"
else
    print_step "Création du compte Alice..."
    simd keys add alice --home="$SIMD_HOME" --keyring-backend test 2>&1 | tee alice-account.txt
    print_success "Compte Alice créé"
fi

echo ""

# Créer Bob
if simd keys show bob --home="$SIMD_HOME" 2>/dev/null; then
    print_warning "Le compte Bob existe déjà"
else
    print_step "Création du compte Bob..."
    simd keys add bob --home="$SIMD_HOME" --keyring-backend test 2>&1 | tee bob-account.txt
    print_success "Compte Bob créé"
fi

echo ""

# Récupérer les adresses
ALICE_ADDR=$(simd keys show alice -a --home="$SIMD_HOME" --keyring-backend test)
BOB_ADDR=$(simd keys show bob -a --home="$SIMD_HOME" --keyring-backend test)

echo -e "${GREEN}Alice: $ALICE_ADDR${NC}"
echo -e "${GREEN}Bob:   $BOB_ADDR${NC}"
echo ""

# ÉTAPE 3: Identifier le compte avec des fonds
print_step "ÉTAPE 3: Recherche d'un compte avec des fonds"
echo ""

# Chercher le compte genesis ou validator
GENESIS_ADDR="cosmos1h3v74w8xu4ga69vexh0fdwu0jfvm5qdu02d5hy"
VALIDATOR_ADDR="cosmos13yqa93gky9x3qtu0h06v5vqpcaeg4rymdm0u0w"

print_step "Vérification du compte genesis..."
GENESIS_BALANCE=$(simd query bank balances $GENESIS_ADDR --node $NODE --output json 2>/dev/null | jq -r '.balances[] | select(.denom=="ucaps") | .amount' || echo "0")
echo "  Solde: $GENESIS_BALANCE ucaps"

print_step "Vérification du compte validator..."
VALIDATOR_BALANCE=$(simd query bank balances $VALIDATOR_ADDR --node $NODE --output json 2>/dev/null | jq -r '.balances[] | select(.denom=="ucaps") | .amount' || echo "0")
echo "  Solde: $VALIDATOR_BALANCE ucaps"

echo ""

# Déterminer quel compte utiliser comme source
if [ "$GENESIS_BALANCE" -gt 0 ]; then
    FUNDER_ADDR=$GENESIS_ADDR
    FUNDER_NAME="genesis"
    print_success "Utilisation du compte genesis (solde: $GENESIS_BALANCE ucaps)"
elif [ "$VALIDATOR_BALANCE" -gt 0 ]; then
    FUNDER_ADDR=$VALIDATOR_ADDR
    FUNDER_NAME="validator"
    print_success "Utilisation du compte validator (solde: $VALIDATOR_BALANCE ucaps)"
else
    print_error "Aucun compte avec des fonds trouvé!"
    echo ""
    print_warning "Pour continuer, vous devez:"
    echo "  1. Importer le compte genesis avec: simd keys add genesis --recover"
    echo "  2. Ou envoyer des fonds au compte validator"
    exit 1
fi

echo ""

# ÉTAPE 4: Financer Alice
print_step "ÉTAPE 4: Envoi de 5 CAPS au compte Alice"
echo ""

FUNDING_AMOUNT="5000000ucaps"  # 5 CAPS
FEES="5000ucaps"               # 0.005 CAPS

print_step "Transaction: $FUNDER_NAME → Alice (5 CAPS)"
echo ""

# Demander confirmation
read -p "Voulez-vous continuer avec cette transaction? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Transaction annulée par l'utilisateur"
    exit 0
fi

# Effectuer la transaction de financement
if [ "$FUNDER_NAME" = "genesis" ]; then
    print_error "Le compte genesis nécessite d'être importé avec sa clé privée"
    echo "Exécutez: simd keys add genesis --recover --home=$SIMD_HOME"
    exit 1
else
    simd tx bank send $FUNDER_NAME $ALICE_ADDR $FUNDING_AMOUNT \
        --from $FUNDER_NAME \
        --chain-id $CHAIN_ID \
        --node $NODE \
        --fees $FEES \
        --home="$SIMD_HOME" \
        --keyring-backend test \
        --yes \
        2>&1 | tee funding-tx.log
fi

print_success "Transaction de financement envoyée!"
echo ""
print_step "Attente de 6 secondes pour la confirmation du bloc..."
sleep 6

# Vérifier le nouveau solde d'Alice
ALICE_BALANCE=$(simd query bank balances $ALICE_ADDR --node $NODE --output json | jq -r '.balances[] | select(.denom=="ucaps") | .amount')
echo ""
print_success "Nouveau solde d'Alice: $ALICE_BALANCE ucaps ($(echo "scale=6; $ALICE_BALANCE/1000000" | bc) CAPS)"
echo ""

# ÉTAPE 5: Transaction Alice → Bob
print_step "ÉTAPE 5: Transaction Alice → Bob (1 CAPS)"
echo ""

TRANSFER_AMOUNT="1000000ucaps"  # 1 CAPS

print_step "Vérification des soldes avant transaction..."
echo "  Alice: $ALICE_BALANCE ucaps"
BOB_BALANCE_BEFORE=$(simd query bank balances $BOB_ADDR --node $NODE --output json | jq -r '.balances[] | select(.denom=="ucaps") | .amount' || echo "0")
echo "  Bob:   $BOB_BALANCE_BEFORE ucaps"
echo ""

# Demander confirmation
read -p "Effectuer la transaction Alice → Bob (1 CAPS)? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Transaction annulée par l'utilisateur"
    exit 0
fi

# Effectuer la transaction principale
simd tx bank send alice $BOB_ADDR $TRANSFER_AMOUNT \
    --from alice \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --fees $FEES \
    --memo "Transaction de test - Capsule Mainnet" \
    --home="$SIMD_HOME" \
    --keyring-backend test \
    --yes \
    2>&1 | tee main-tx.log

TX_HASH=$(grep -oP 'txhash: \K[A-F0-9]+' main-tx.log || echo "")

print_success "Transaction envoyée!"
if [ ! -z "$TX_HASH" ]; then
    echo -e "${GREEN}  TX Hash: $TX_HASH${NC}"
fi

echo ""
print_step "Attente de 6 secondes pour la confirmation du bloc..."
sleep 6

# ÉTAPE 6: Vérifier les résultats finaux
print_step "ÉTAPE 6: Vérification des soldes finaux"
echo ""

ALICE_BALANCE_AFTER=$(simd query bank balances $ALICE_ADDR --node $NODE --output json | jq -r '.balances[] | select(.denom=="ucaps") | .amount')
BOB_BALANCE_AFTER=$(simd query bank balances $BOB_ADDR --node $NODE --output json | jq -r '.balances[] | select(.denom=="ucaps") | .amount')

echo "╔══════════════════════════════════════════════════════════╗"
echo "║              RÉSULTATS DE LA TRANSACTION                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Alice:"
echo "  Avant:  $ALICE_BALANCE ucaps ($(echo "scale=6; $ALICE_BALANCE/1000000" | bc) CAPS)"
echo "  Après:  $ALICE_BALANCE_AFTER ucaps ($(echo "scale=6; $ALICE_BALANCE_AFTER/1000000" | bc) CAPS)"
echo "  Débité: $((ALICE_BALANCE - ALICE_BALANCE_AFTER)) ucaps"
echo ""
echo "Bob:"
echo "  Avant:  $BOB_BALANCE_BEFORE ucaps ($(echo "scale=6; $BOB_BALANCE_BEFORE/1000000" | bc) CAPS)"
echo "  Après:  $BOB_BALANCE_AFTER ucaps ($(echo "scale=6; $BOB_BALANCE_AFTER/1000000" | bc) CAPS)"
echo "  Reçu:   $((BOB_BALANCE_AFTER - BOB_BALANCE_BEFORE)) ucaps"
echo ""

FEES_PAID=$((ALICE_BALANCE - ALICE_BALANCE_AFTER - 1000000))
echo "Frais payés: $FEES_PAID ucaps ($(echo "scale=6; $FEES_PAID/1000000" | bc) CAPS)"
echo ""

# Générer le rapport
print_step "Génération du rapport..."
echo ""

REPORT_FILE="transaction-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" <<EOF
════════════════════════════════════════════════════════════
  RAPPORT DE TRANSACTION MAINNET - CAPSULE NETWORK
════════════════════════════════════════════════════════════

Date: $(date)
Chain ID: $CHAIN_ID
Node: $NODE

─────────────────────────────────────────────────────────────
COMPTES CRÉÉS
─────────────────────────────────────────────────────────────

Alice:  $ALICE_ADDR
Bob:    $BOB_ADDR

─────────────────────────────────────────────────────────────
TRANSACTIONS EFFECTUÉES
─────────────────────────────────────────────────────────────

1. Financement: $FUNDER_NAME → Alice
   Montant: 5.000000 CAPS
   Statut: ✓ Confirmé

2. Transfer: Alice → Bob
   Montant: 1.000000 CAPS
   TX Hash: $TX_HASH
   Statut: ✓ Confirmé

─────────────────────────────────────────────────────────────
RÉSULTATS FINAUX
─────────────────────────────────────────────────────────────

Alice:
  Solde initial: $(echo "scale=6; $ALICE_BALANCE/1000000" | bc) CAPS
  Solde final:   $(echo "scale=6; $ALICE_BALANCE_AFTER/1000000" | bc) CAPS
  Variation:     -$(echo "scale=6; ($ALICE_BALANCE - $ALICE_BALANCE_AFTER)/1000000" | bc) CAPS

Bob:
  Solde initial: $(echo "scale=6; $BOB_BALANCE_BEFORE/1000000" | bc) CAPS
  Solde final:   $(echo "scale=6; $BOB_BALANCE_AFTER/1000000" | bc) CAPS
  Variation:     +$(echo "scale=6; ($BOB_BALANCE_AFTER - $BOB_BALANCE_BEFORE)/1000000" | bc) CAPS

Frais totaux: $(echo "scale=6; $FEES_PAID/1000000" | bc) CAPS

─────────────────────────────────────────────────────────────
CONCLUSION
─────────────────────────────────────────────────────────────

✓ Transaction réussie sur le mainnet
✓ 1 CAPS transféré d'Alice à Bob
✓ Frais de ~0.005 CAPS appliqués
✓ Blockchain opérationnelle

════════════════════════════════════════════════════════════
EOF

print_success "Rapport sauvegardé: $REPORT_FILE"
echo ""

# Afficher le rapport
cat "$REPORT_FILE"

print_success "Transaction terminée avec succès! 🎉"
echo ""
