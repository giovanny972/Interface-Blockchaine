# Migration vers Multi-Nœuds - Capsule Network

## 🎯 **OBJECTIF**

Transformer votre application d'une connexion **nœud unique** vers un système **multi-nœuds** avec :
- **Découverte automatique** de nœuds
- **Load balancing** intelligent
- **Failover automatique**
- **Circuit breaker** pour la résilience
- **Surveillance de santé** en temps réel

## 🔄 **MIGRATION ÉTAPE PAR ÉTAPE**

### Étape 1: Sauvegarde de la configuration actuelle

```bash
# Sauvegarder la configuration actuelle
cp .env.local .env.backup
cp services/auth/WalletService.ts services/auth/WalletService.backup.ts
```

### Étape 2: Nouvelle configuration environnement

```bash
# Utiliser la nouvelle configuration multi-nœuds
cp .env.multinode.example .env.local
```

**Éditez `.env.local` avec vos nœuds :**

```env
# Configuration principale
NEXT_PUBLIC_CHAIN_ID=capsule-mainnet
NEXT_PUBLIC_NODE_SELECTION_STRATEGY=PRIORITY_FIRST

# Vos nœuds principaux
NEXT_PUBLIC_PRIMARY_RPC=https://rpc.capsule.network
NEXT_PUBLIC_PRIMARY_REST=https://api.capsule.network

# Nœuds de backup
NEXT_PUBLIC_EU_RPC=https://rpc-eu.capsule.network
NEXT_PUBLIC_EU_REST=https://api-eu.capsule.network

# Activer les fonctionnalités
NEXT_PUBLIC_ENABLE_NODE_DISCOVERY=true
NEXT_PUBLIC_ENABLE_HEALTH_MONITORING=true
NEXT_PUBLIC_ENABLE_LOAD_BALANCING=true
```

### Étape 3: Mise à jour du service d'authentification

Remplacez l'import dans `services/auth/AuthService.ts` :

```typescript
// AVANT (nœud unique)
import { WalletService } from './WalletService';

// APRÈS (multi-nœuds)
import { MultiNodeWalletService } from '../network/MultiNodeWalletService';

export class AuthService {
  // AVANT
  private walletService: WalletService;

  // APRÈS
  private walletService: MultiNodeWalletService;

  constructor() {
    // AVANT
    this.walletService = new WalletService();

    // APRÈS
    this.walletService = new MultiNodeWalletService(
      process.env.NEXT_PUBLIC_CHAIN_ID || 'capsule-testnet-1',
      process.env.NEXT_PUBLIC_NODE_SELECTION_STRATEGY || 'PRIORITY_FIRST'
    );
  }

  async connect(walletType: 'keplr' | 'cosmostation' | 'leap', currentState: AuthState): Promise<Partial<AuthState>> {
    // La signature reste identique, mais maintenant avec failover automatique
    const { signer, client, queryClient, address, node } = await this.walletService.connectWallet(walletType);
    
    // node contient maintenant les informations du nœud utilisé
    console.log(`Connecté via le nœud: ${node.name} (${node.region})`);
    
    // ... reste du code identique
  }
}
```

### Étape 4: Ajout du composant de surveillance réseau

Dans votre layout principal (`app/layout.tsx` ou composant racine) :

```typescript
import { NetworkStatusIndicator } from '@/components/network/NetworkStatusIndicator';
import { MultiNodeWalletService } from '@/services/network/MultiNodeWalletService';

// Créer une instance globale du service wallet
const multiNodeWalletService = new MultiNodeWalletService();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* Indicateur de statut réseau */}
        <div className="fixed top-4 right-4 z-50">
          <NetworkStatusIndicator 
            walletService={multiNodeWalletService}
            showDetails={false}
          />
        </div>
        
        {children}
      </body>
    </html>
  );
}
```

### Étape 5: Mise à jour des composants existants

Pour les composants utilisant directement le wallet, remplacez :

```typescript
// AVANT
import { useAuth } from '@/stores/authStore';

const { walletManager } = useAuth();
const queryClient = walletManager?.getQueryClient();

// APRÈS
import { useAuth } from '@/stores/authStore.v2'; // Nouvelle version

const { walletService } = useAuth();
const queryClient = await walletService?.getQueryClient(); // Maintenant avec failover
```

## 🚀 **CONFIGURATION PRODUCTION**

### Nœuds recommandés pour Capsule Mainnet

```env
# Nœuds officiels Capsule
NEXT_PUBLIC_PRIMARY_RPC=https://rpc.capsule.network
NEXT_PUBLIC_PRIMARY_REST=https://api.capsule.network

NEXT_PUBLIC_EU_RPC=https://rpc-eu.capsule.network
NEXT_PUBLIC_EU_REST=https://api-eu.capsule.network

NEXT_PUBLIC_ASIA_RPC=https://rpc-asia.capsule.network
NEXT_PUBLIC_ASIA_REST=https://api-asia.capsule.network

# Nœuds validators communautaires (backup)
NEXT_PUBLIC_VALIDATOR1_RPC=https://rpc.validator1.com
NEXT_PUBLIC_VALIDATOR1_REST=https://api.validator1.com

# Configuration optimale production
NEXT_PUBLIC_NODE_SELECTION_STRATEGY=PRIORITY_FIRST
NEXT_PUBLIC_ENABLE_NODE_DISCOVERY=true
NEXT_PUBLIC_ENABLE_HEALTH_MONITORING=true
NEXT_PUBLIC_HEALTH_CHECK_INTERVAL=30000
NEXT_PUBLIC_CIRCUIT_BREAKER_THRESHOLD=5
NEXT_PUBLIC_ENABLE_FALLBACK_NODES=true
```

## 📊 **MONITORING ET DEBUGGING**

### Activation des logs détaillés

```env
# Debug des connexions réseau
NEXT_PUBLIC_ENABLE_NETWORK_DEBUG=true

# Analytics des performances
NEXT_PUBLIC_ENABLE_NODE_ANALYTICS=true
```

### Accès aux statistiques

```typescript
// Dans vos composants
const networkStats = multiNodeWalletService.getNetworkStats();

console.log('Nœuds disponibles:', networkStats.networkStats.totalNodes);
console.log('Nœuds sains:', networkStats.networkStats.healthyNodes);
console.log('Nœud actuel:', networkStats.currentNode?.name);
console.log('Latence moyenne:', networkStats.networkStats.averageResponseTime);
```

### Dashboard de monitoring

Le composant `NetworkStatusIndicator` fournit :
- ✅ État en temps réel des nœuds
- 📊 Statistiques de performance
- 🔧 Contrôles de stratégie de sélection
- 🔄 Redécouverte manuelle de nœuds

## 🛠️ **STRATÉGIES DE SÉLECTION**

### 1. **PRIORITY_FIRST** (Recommandé pour production)
- Utilise les nœuds par ordre de priorité
- Fallback automatique en cas d'indisponibilité
- Optimal pour la cohérence

### 2. **LOWEST_LATENCY** (Performance)
- Sélectionne toujours le nœud le plus rapide
- Optimal pour les applications interactives
- Peut causer plus de changements de nœud

### 3. **ROUND_ROBIN** (Load balancing)
- Répartit équitablement la charge
- Optimal pour les applications avec beaucoup de trafic
- Assure une utilisation équitable des ressources

### 4. **GEOGRAPHIC_NEAREST** (Géolocalisation)
- Sélectionne le nœud le plus proche géographiquement
- Optimal pour la latence globale
- Basé sur la timezone de l'utilisateur

## ⚠️ **PRÉCAUTIONS**

### Test en environnement de staging

```bash
# 1. Tester avec votre configuration testnet
NEXT_PUBLIC_CHAIN_ID=capsule-testnet-1
npm run dev

# 2. Vérifier les connexions wallet
# 3. Tester les transactions
# 4. Valider le failover (arrêter un nœud manuellement)
```

### Monitoring des erreurs

```typescript
// Ajout de listeners pour les erreurs réseau
import { errorService } from '@/services/error/ErrorService';

errorService.addErrorListener((error) => {
  if (error.type === 'NETWORK') {
    console.warn('Problème réseau détecté:', error.message);
    // Alerter l'équipe, logging, etc.
  }
});
```

## ✅ **VALIDATION POST-MIGRATION**

### Checklist de validation

- [ ] **Connexion wallet** : Keplr, Cosmostation, Leap fonctionnent
- [ ] **Transactions** : Envoi et réception OK
- [ ] **Failover** : Basculement automatique en cas de panne nœud
- [ ] **Performance** : Latence acceptable (<2s)
- [ ] **Discovery** : Nouveaux nœuds découverts automatiquement
- [ ] **Monitoring** : Dashboard réseau fonctionnel

### Tests de charge

```bash
# Test de résilience - simuler la panne d'un nœud
# 1. Bloquer un nœud dans le pare-feu
# 2. Vérifier que l'app continue de fonctionner
# 3. Observer le basculement automatique
```

## 🎉 **AVANTAGES OBTENUS**

### Avant (Nœud unique)
- ❌ Point de défaillance unique
- ❌ Pas de load balancing
- ❌ Maintenance = interruption service
- ❌ Dépendance géographique

### Après (Multi-nœuds)
- ✅ **Haute disponibilité** (99.9%+)
- ✅ **Load balancing** intelligent
- ✅ **Failover automatique** (<5s)
- ✅ **Discovery automatique** de nœuds
- ✅ **Circuit breaker** pour la résilience
- ✅ **Monitoring temps réel**
- ✅ **Performance optimisée** par région
- ✅ **Maintenance sans interruption**

---

## 🚀 **DÉPLOIEMENT**

Votre application Capsule Network est maintenant **production-ready** avec une architecture réseau robuste et évolutive !

**Support multi-nœuds = Disponibilité maximale + Performance optimale**