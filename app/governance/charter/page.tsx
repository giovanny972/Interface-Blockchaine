'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  DocumentTextIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ScaleIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ArrowPathIcon,
  UserGroupIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

// Sections de la charte
const CHARTER_SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction & Vision',
    icon: LightBulbIcon,
    content: `
## Vision du Réseau Sirius

Sirius Network est une blockchain dédiée à la préservation et au transfert sécurisé de données dans le temps.
Notre gouvernance vise à garantir :

- **Neutralité** : Le réseau reste ouvert et accessible à tous sans discrimination
- **Sécurité** : Les décisions priorisent toujours la sécurité des capsules et des fonds des utilisateurs
- **Décentralisation** : Aucune entité unique ne peut contrôler le réseau
- **Innovation responsable** : Nous encourageons l'innovation tout en préservant la stabilité

## Principes Fondamentaux

1. **1 Token Staké = 1 Voix** : Le pouvoir de vote est proportionnel aux tokens stakés
2. **Transparence totale** : Toutes les propositions et votes sont publics on-chain
3. **Délégation flexible** : Les délégateurs peuvent override le vote de leur validateur
4. **Processus ouvert** : Tout détenteur de tokens peut soumettre une proposition
    `,
    subsections: []
  },
  {
    id: 'parameters',
    title: '2. Paramètres de Gouvernance',
    icon: BeakerIcon,
    content: `
## Paramètres Actuels du Module x/gov

Les paramètres suivants régissent le fonctionnement de la gouvernance sur Sirius Network.
    `,
    subsections: [
      {
        id: 'deposit-params',
        title: '2.1 Paramètres de Dépôt',
        content: `
### Dépôt Minimum (min_deposit)
- **Valeur actuelle** : 500 CAPS (500,000,000 ucaps)
- **Justification** : Équilibre entre accessibilité et prévention du spam
- **Équivalent estimé** : ~200-500 USD au lancement

### Période de Dépôt Maximum (max_deposit_period)
- **Valeur actuelle** : 7 jours (604,800 secondes)
- **Justification** : Temps suffisant pour mobiliser la communauté
- **Comportement** : Si le dépôt minimum n'est pas atteint, la proposition est automatiquement rejetée

### Mécanisme de Dépôt
1. Un proposeur soumet une proposition avec un dépôt initial (peut être partiel)
2. D'autres utilisateurs peuvent contribuer au dépôt
3. Si le minimum est atteint → passage en période de vote
4. Si le minimum n'est pas atteint dans le délai → rejet et perte du dépôt
5. Si la proposition passe ou échoue normalement → le dépôt est retourné
6. Si la proposition est vetoed (>33.4% NoWithVeto) → le dépôt est brûlé
        `
      },
      {
        id: 'voting-params',
        title: '2.2 Paramètres de Vote',
        content: `
### Période de Vote (voting_period)
- **Valeur actuelle** : 5 jours (432,000 secondes)
- **Justification** :
  - Assez long pour permettre la participation internationale
  - Plus court que l'unbonding period (14 jours) pour éviter les attaques
  - Balance entre réactivité et délibération

### Types de Vote Disponibles

1. **YES (Oui)**
   - En faveur de la proposition
   - Compte dans le threshold

2. **NO (Non)**
   - Contre la proposition, mais pas malveillante
   - Compte dans le threshold
   - Le dépôt est retourné

3. **NO_WITH_VETO (Non avec Veto)**
   - Contre ET considère la proposition comme malveillante/spam
   - Si >33.4% de veto → le dépôt est brûlé
   - Mécanisme de protection contre les propositions abusives

4. **ABSTAIN (Abstention)**
   - Participe au quorum mais pas au threshold
   - Utile pour les validateurs voulant laisser leurs délégateurs décider

### Vote Pondéré
Les utilisateurs peuvent répartir leur vote entre plusieurs options (ex: 50% YES, 30% NO, 20% ABSTAIN)
        `
      },
      {
        id: 'tally-params',
        title: '2.3 Paramètres de Décompte (Tally)',
        content: `
### Quorum
- **Valeur actuelle** : 33.4% (0.334)
- **Signification** : Minimum 33.4% du pouvoir de vote total doit participer
- **Justification** : Empêche qu'une minorité décide pour tout le réseau
- **Calcul** : (Total Votes) / (Total Voting Power) ≥ 33.4%

### Threshold (Seuil d'Acceptation)
- **Valeur actuelle** : 50% (0.500)
- **Signification** : Minimum 50% de YES (hors ABSTAIN) pour passer
- **Justification** : Majorité simple
- **Calcul** : YES / (YES + NO + NO_WITH_VETO) ≥ 50%

### Veto Threshold
- **Valeur actuelle** : 33.4% (0.334)
- **Signification** : Si ≥33.4% de NO_WITH_VETO, la proposition est vetoed
- **Justification** : Permet à une minorité de bloquer les propositions malveillantes
- **Conséquence** : Dépôt brûlé si veto atteint

### Conditions pour qu'une Proposition Passe

Une proposition est **ACCEPTÉE** si et seulement si :

1. ✅ **Quorum atteint** : Participation ≥ 33.4%
2. ✅ **Veto non atteint** : NO_WITH_VETO < 33.4%
3. ✅ **Threshold atteint** : YES ≥ 50% (hors ABSTAIN)

Si une seule condition échoue → REJETÉE
        `
      }
    ]
  },
  {
    id: 'proposal-types',
    title: '3. Types de Propositions',
    icon: DocumentTextIcon,
    content: `
## Types de Propositions Disponibles

Sirius Network supporte plusieurs types de propositions, chacune avec des cas d'usage spécifiques.
    `,
    subsections: [
      {
        id: 'text-proposal',
        title: '3.1 Proposition de Signal (Text)',
        content: `
### Description
Proposition non-exécutable servant de signal politique pour la communauté.

### Cas d'Usage
- Exprimer un consensus communautaire sur une direction
- Tester l'opinion avant une proposition exécutable
- Documenter une décision stratégique

### Exemple
"La communauté Sirius Network supporte-t-elle le développement d'un SDK mobile ?"

### Particularités
- Aucune exécution automatique
- Sert uniquement d'indicateur
- Utile pour les décisions non-techniques
        `
      },
      {
        id: 'parameter-change',
        title: '3.2 Proposition de Changement de Paramètres',
        content: `
### Description
Modifie les paramètres d'un ou plusieurs modules de la blockchain.

### Modules Concernés
- **x/staking** : unbonding_time, max_validators, etc.
- **x/slashing** : slash_fraction, downtime_jail_duration, etc.
- **x/mint** : inflation, blocks_per_year, etc.
- **x/gov** : min_deposit, voting_period, quorum, etc.
- **x/distribution** : community_tax, base_proposer_reward, etc.
- **x/ibc** : paramètres IBC/ICS

### Exemple
Augmenter la période de vote de 5 à 7 jours :
\`\`\`json
{
  "subspace": "gov",
  "key": "votingparams",
  "value": {"voting_period": "604800s"}
}
\`\`\`

### ⚠️ Risques
- Peut avoir un impact majeur sur la sécurité
- Changements irréversibles (nécessite une nouvelle prop pour revenir)
- Doit être testé sur testnet d'abord

### Plages Recommandées
Chaque paramètre a une plage sûre documentée dans la section 7.
        `
      },
      {
        id: 'software-upgrade',
        title: '3.3 Proposition de Mise à Jour Logicielle',
        content: `
### Description
Planifie une mise à jour coordonnée du binaire de la blockchain.

### Processus
1. **Développement & Tests** : Nouvelle version testée sur testnet
2. **Proposition on-chain** : Spécifie le height d'activation
3. **Vote** : La communauté approuve ou rejette
4. **Coordination** : Les validateurs se préparent
5. **Upgrade automatique** : À hauteur spécifiée, les nœuds s'arrêtent
6. **Redémarrage** : Les validateurs redémarrent avec le nouveau binaire

### Informations Requises
- **Nom** : Version de l'upgrade (ex: "v2.0.0")
- **Height** : Hauteur de bloc pour l'activation
- **Info** : URL vers les binaires, checksums, instructions
- **Changelog** : Description des changements

### Sécurité
- Hash SHA256 des binaires fourni
- Instructions de rollback documentées
- Coordination sur Discord/Telegram avec les validateurs

### Annulation
Une proposition CancelSoftwareUpgrade peut annuler un upgrade planifié.
        `
      },
      {
        id: 'community-pool-spend',
        title: '3.4 Proposition de Dépense du Pool Communautaire',
        content: `
### Description
Débloque des fonds du Community Pool vers une adresse spécifique.

### Community Pool
- Alimenté par une taxe sur les récompenses de staking (community_tax)
- Taux actuel : 2% des récompenses
- Solde actuel : ~12,500,000 CAPS

### Cas d'Usage
- **Grants de développement** : Financer des features, SDK, outils
- **Marketing & Écosystème** : Événements, partenariats, éducation
- **Infrastructure** : Explorateurs, RPC publics, indexeurs
- **Recherche** : Audits de sécurité, R&D cryptographique
- **Communauté** : Programmes d'ambassadeurs, hackathons

### Exigences pour un Grant
1. **Roadmap détaillée** avec milestones
2. **Budget justifié** par livrable
3. **KPIs mesurables** (métriques de succès)
4. **Reporting régulier** (hebdo/mensuel)
5. **Livrables open-source** (si applicable)
6. **Profil de l'équipe** avec références

### Montants Typiques
- Petit grant : 1,000 - 5,000 CAPS
- Grant moyen : 5,000 - 25,000 CAPS
- Grand grant : 25,000 - 100,000 CAPS
- Grant exceptionnel : > 100,000 CAPS (nécessite justification forte)

### Déblocage
- Paiement unique ou par milestones
- Si milestones : reporting obligatoire entre chaque paiement
        `
      },
      {
        id: 'client-update',
        title: '3.5 Proposition de Mise à Jour Client IBC',
        content: `
### Description
Met à jour un client IBC (Inter-Blockchain Communication).

### Cas d'Usage
- Récupération après misbehaviour d'une chain connectée
- Migration d'une chain IBC
- Correction d'un client gelé

### Détails Techniques
- Spécifie le client_id à mettre à jour
- Fournit le nouveau client state
- Nécessite une coordination avec la chain distante

### Sécurité
- Type de proposition sensible (peut affecter les bridges)
- Doit être proposé par l'équipe core ou des experts IBC
- Audit recommandé avant soumission
        `
      }
    ]
  },
  {
    id: 'process',
    title: '4. Processus de Proposition',
    icon: ArrowPathIcon,
    content: `
## Cycle de Vie d'une Proposition

Le processus standard pour soumettre et faire passer une proposition.
    `,
    subsections: [
      {
        id: 'off-chain',
        title: '4.1 Phase Hors-Chaîne (Recommandée)',
        content: `
### Étape 1 : Discussion Communautaire
- **Forum** : Poster sur le forum officiel (Commonwealth/Discourse)
- **Discord/Telegram** : Discuter avec la communauté
- **RFC (Request for Comment)** : Rédiger un document formel

### Étape 2 : Rédaction Formelle
Utiliser le template standard :

\`\`\`markdown
# Titre de la Proposition

## Contexte
Pourquoi cette proposition est nécessaire ?

## Motivation
Quel problème résout-elle ? Quel bénéfice apporte-t-elle ?

## Spécification Technique
Détails techniques précis (paramètres, code, etc.)

## Impact
- Sur la sécurité
- Sur les performances
- Sur la tokenomics
- Sur l'UX

## Plan d'Implémentation
- Timeline
- Responsables
- Tests effectués

## Alternatives Considérées
Autres approches et pourquoi elles ont été écartées

## Risques & Mitigations
Risques identifiés et comment les gérer
\`\`\`

### Étape 3 : Signal Hors-Chaîne (Optionnel)
- Poll communautaire sur Discord/Twitter
- Gauge l'intérêt avant de déposer on-chain

### Étape 4 : Revue par les Pairs
- Demander review aux validateurs
- Demander review à l'équipe core (si technique)
- Itérer sur les retours
        `
      },
      {
        id: 'on-chain',
        title: '4.2 Phase On-Chain',
        content: `
### Étape 1 : Soumission
\`\`\`bash
# Exemple de commande
simd tx gov submit-proposal \
  --title="Titre" \
  --summary="Résumé court" \
  --metadata="URL vers description complète" \
  --deposit="250000000ucaps" \
  --from=mon-wallet
\`\`\`

### Étape 2 : Période de Dépôt (max 7 jours)
- Proposeur + communauté contribuent au dépôt
- Objectif : atteindre 500 CAPS
- Si atteint → passe en période de vote
- Si non atteint → proposition rejetée

### Étape 3 : Période de Vote (5 jours)
- Tous les stakeholders peuvent voter
- Les validateurs votent avec le poids de leurs délégations
- Les délégateurs peuvent override le vote de leur validateur
- Le dernier vote compte (on peut changer d'avis)

### Étape 4 : Décompte Final
À la fin de la période de vote :
1. Calcul du quorum
2. Vérification du veto
3. Calcul du threshold
4. Si toutes conditions OK → **PASSED**
5. Sinon → **REJECTED**

### Étape 5 : Exécution (si acceptée)
- Les messages de la proposition sont exécutés automatiquement
- Pour SoftwareUpgrade : activation planifiée
- Pour CommunityPoolSpend : transfert des fonds
        `
      }
    ]
  },
  {
    id: 'roles',
    title: '5. Rôles & Responsabilités',
    icon: UserGroupIcon,
    content: `
## Acteurs de la Gouvernance
    `,
    subsections: [
      {
        id: 'validators',
        title: '5.1 Validateurs',
        content: `
### Responsabilités
- **Voter** sur toutes les propositions (recommandé)
- **Analyser** les propositions techniques
- **Communiquer** leur position à leurs délégateurs
- **Coordonner** pour les upgrades
- **Maintenir** leur infrastructure à jour

### Pouvoir de Vote
- Vote avec le poids de tous leurs tokens délégués
- Ex: Validateur avec 1M CAPS délégués = 1M de pouvoir de vote

### Bonnes Pratiques
- Publier un "governance guide" expliquant leur philosophie de vote
- Voter dans les 48h suivant le début de la période de vote
- Expliquer leurs votes sur le forum
- Ne pas s'abstenir systématiquement
        `
      },
      {
        id: 'delegators',
        title: '5.2 Délégateurs',
        content: `
### Droits
- **Override** : Peuvent voter différemment de leur validateur
- **Rédélégation** : Peuvent changer de validateur si désaccord systématique
- **Proposition** : Peuvent soumettre des propositions

### Responsabilités
- S'informer sur les propositions
- Voter selon leur conviction
- Choisir des validateurs alignés avec leurs valeurs

### Mécanisme d'Override
1. Par défaut, le validateur vote pour tous ses délégateurs
2. Si un délégateur vote individuellement, son vote override celui du validateur
3. Seul le pouvoir de vote du délégateur est concerné
        `
      },
      {
        id: 'core-team',
        title: '5.3 Équipe Core',
        content: `
### Rôle
- Proposer les mises à jour techniques
- Fournir expertise sur les propositions complexes
- Maintenir la documentation
- Coordonner les upgrades

### Limites
- **N'a pas de pouvoir spécial** : soumis au même processus de gouvernance
- **Pas de véto hors-chaîne** : tout passe par vote on-chain
- **Transparence totale** : code open-source, propositions publiques
        `
      },
      {
        id: 'community',
        title: '5.4 Communauté',
        content: `
### Rôle
- Discuter des propositions sur le forum
- Alerter sur les risques identifiés
- Proposer des améliorations
- Créer du contenu éducatif

### Outils
- Forum officiel
- Discord/Telegram
- Twitter
- Dashboards de gouvernance (Mintscan, etc.)
        `
      }
    ]
  },
  {
    id: 'security',
    title: '6. Sécurité & Risques',
    icon: ShieldCheckIcon,
    content: `
## Mesures de Sécurité
    `,
    subsections: [
      {
        id: 'risks',
        title: '6.1 Risques Identifiés',
        content: `
### Capture de Gouvernance
**Risque** : Un whale détient >33.4% et peut tout bloquer (veto) ou >50% et peut tout passer

**Mitigation** :
- Distribution initiale large du token
- Encouragement de la délégation communautaire
- Surveillance on-chain de la concentration
- Community delegations pour les petits validateurs

### Spam de Propositions
**Risque** : Flooding de propositions inutiles

**Mitigation** :
- min_deposit de 500 CAPS (coût réel)
- Dépôt brûlé si veto
- Modération sociale (veto sur spam)

### Propositions Malveillantes
**Risque** : ParameterChange qui détruit le réseau (ex: inflation à 1000%)

**Mitigation** :
- Documentation des plages sûres pour chaque paramètre
- Revue systématique par core team + validateurs
- Tests obligatoires sur testnet
- Mécanisme de veto (33.4%)

### Attaque de Vote
**Risque** : Acheter des tokens juste pour un vote puis unstake

**Mitigation** :
- voting_period (5j) < unbonding_time (14j)
- Les tokens en unbonding ne peuvent pas voter
- Coût élevé d'acquisition temporaire
        `
      },
      {
        id: 'best-practices',
        title: '6.2 Bonnes Pratiques',
        content: `
### Pour les Propositions Critiques
1. **Testnet d'abord** : Tester sur testnet pendant ≥1 semaine
2. **Audit** : Faire auditer par un tiers (si param sensible)
3. **Rollback plan** : Documenter comment revenir en arrière
4. **Coordination** : Sync avec validateurs majeurs avant proposition

### Pour les Votes
1. **Lire la proposition complète** (pas juste le titre)
2. **Vérifier la discussion off-chain** (forum, Discord)
3. **Consulter les experts** si doute sur aspect technique
4. **Voter selon conviction** (pas selon "qui a proposé")

### Pour les Upgrades
1. **Binaire disponible ≥48h avant** le height
2. **Checksums publiés** et vérifiés par multiples parties
3. **Instructions claires** pour les validateurs
4. **Communication** sur tous les canaux (Discord, Telegram, Twitter)
5. **Dry run** sur testnet avec même height
        `
      }
    ]
  },
  {
    id: 'parameter-ranges',
    title: '7. Plages Sûres des Paramètres',
    icon: ChartBarIcon,
    content: `
## Guide des Paramètres avec Plages Recommandées

Documentation technique pour les propositions de changement de paramètres.
    `,
    subsections: [
      {
        id: 'gov-params-ranges',
        title: '7.1 Paramètres x/gov',
        content: `
| Paramètre | Actuel | Min Sûr | Max Sûr | Impact |
|-----------|--------|---------|---------|--------|
| min_deposit | 500 CAPS | 100 CAPS | 2000 CAPS | Anti-spam |
| max_deposit_period | 7j | 2j | 14j | Mobilisation |
| voting_period | 5j | 2j | 10j | Participation |
| quorum | 33.4% | 25% | 50% | Légitimité |
| threshold | 50% | 50% | 66.7% | Consensus |
| veto_threshold | 33.4% | 25% | 40% | Protection |

### Recommandations
- Ne JAMAIS mettre voting_period > unbonding_time
- Ne JAMAIS mettre min_deposit à 0 (spam)
- Quorum trop haut = propositions jamais atteintes
- Quorum trop bas = minorité décide
        `
      },
      {
        id: 'staking-params-ranges',
        title: '7.2 Paramètres x/staking',
        content: `
| Paramètre | Actuel | Min Sûr | Max Sûr | Impact |
|-----------|--------|---------|---------|--------|
| unbonding_time | 14j | 7j | 21j | Sécurité économique |
| max_validators | 100 | 50 | 200 | Décentralisation |
| max_entries | 7 | 5 | 10 | UX unbonding |
| historical_entries | 10000 | 1000 | 50000 | Requêtes historiques |

### ⚠️ Critiques
- **unbonding_time** : Trop court = attaques easier, trop long = liquidité bloquée
- **max_validators** : Trop peu = centralisation, trop = performance impact
        `
      },
      {
        id: 'slashing-params-ranges',
        title: '7.3 Paramètres x/slashing',
        content: `
| Paramètre | Actuel | Min Sûr | Max Sûr | Impact |
|-----------|--------|---------|---------|--------|
| signed_blocks_window | 10000 | 5000 | 20000 | Détection downtime |
| min_signed_per_window | 50% | 40% | 70% | Tolérance downtime |
| downtime_jail_duration | 10min | 5min | 1h | Punition |
| slash_fraction_double_sign | 5% | 3% | 10% | Punition double-sign |
| slash_fraction_downtime | 0.01% | 0% | 0.1% | Punition downtime |

### ⚠️ Très Sensible
Ces paramètres affectent directement les validateurs.
Changements trop agressifs = validateurs quittent le réseau.
        `
      }
    ]
  },
  {
    id: 'amendments',
    title: '8. Amendements & Évolution',
    icon: AcademicCapIcon,
    content: `
## Modification de cette Charte

### Processus
Cette charte peut être amendée par :
1. Une **TextProposal** signalant le consensus pour l'amendement
2. Mise à jour de ce document dans la documentation officielle
3. Publication de la nouvelle version avec changelog

### Versioning
- **Version actuelle** : 1.0.0
- **Date** : Décembre 2024
- **Dernière modification** : Lancement initial

### Changelog
- **v1.0.0** (Déc 2024) : Charte initiale au lancement du mainnet

## Contact & Support

### Ressources
- **Forum** : forum.sirius.network
- **Discord** : discord.gg/sirius
- **Documentation** : docs.sirius.network
- **GitHub** : github.com/sirius-network

### Proposer un Amendement
Pour proposer une modification de cette charte, suivre le processus standard
de TextProposal en spécifiant clairement les sections à modifier.
    `
  }
]

// Composant pour afficher une section
function Section({ section, level = 0 }: { section: any, level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 1)

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-dark-800 hover:bg-dark-750 rounded-lg transition-colors border border-dark-700"
      >
        <div className="flex items-center space-x-3">
          {section.icon && <section.icon className="w-5 h-5 text-primary-400" />}
          <h3 className={`font-semibold text-white ${level === 0 ? 'text-lg' : 'text-base'}`}>
            {section.title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 text-dark-400" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-dark-400" />
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-2 pl-4 border-l-2 border-dark-700"
        >
          {section.content && (
            <div className="prose prose-invert prose-sm max-w-none p-4 bg-dark-850 rounded-lg mb-4">
              <div
                className="text-dark-300"
                dangerouslySetInnerHTML={{
                  __html: section.content
                    .split('\n')
                    .map((line: string) => {
                      // Titres
                      if (line.startsWith('###')) return `<h4 class="text-white font-semibold mt-4 mb-2">${line.replace('###', '').trim()}</h4>`
                      if (line.startsWith('##')) return `<h3 class="text-white font-bold text-lg mt-6 mb-3">${line.replace('##', '').trim()}</h3>`

                      // Listes
                      if (line.trim().startsWith('- ')) {
                        return `<li class="ml-4">${line.replace(/^- /, '').trim()}</li>`
                      }
                      if (line.match(/^\d+\./)) {
                        return `<li class="ml-4 list-decimal">${line.replace(/^\d+\. /, '').trim()}</li>`
                      }

                      // Code blocks
                      if (line.startsWith('```')) return line

                      // Gras
                      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')

                      // Paragraphes
                      if (line.trim()) return `<p class="mb-2">${line}</p>`
                      return '<br />'
                    })
                    .join('')
                }}
              />
            </div>
          )}

          {section.subsections && section.subsections.map((subsection: any) => (
            <div key={subsection.id} className="ml-4 mb-4">
              <Section section={subsection} level={level + 1} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function GovernanceCharterPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/20 backdrop-blur-md border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gradient hidden sm:block">Sirius Network</span>
              </Link>
              <div className="h-6 w-px bg-dark-600 hidden sm:block" />
              <Link href="/governance" className="text-dark-400 hover:text-white transition-colors">
                <ScaleIcon className="w-5 h-5 inline mr-2" />
                Gouvernance
              </Link>
              <div className="h-6 w-px bg-dark-600 hidden sm:block" />
              <h1 className="text-lg font-semibold text-white flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-400" />
                Charte
              </h1>
            </div>

            <Link href="/governance" className="btn-secondary text-sm">
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="card bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border-primary-500/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Charte de Gouvernance Sirius Network
                </h1>
                <p className="text-dark-300 mb-4">
                  Document officiel définissant les règles, paramètres et processus de gouvernance
                  du réseau Sirius. Cette charte sert de référence pour toutes les décisions on-chain.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-400">Version 1.0.0</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-400">Décembre 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table des matières */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Table des Matières</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHARTER_SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-3 p-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors border border-dark-700 hover:border-primary-500/50"
              >
                {section.icon && <section.icon className="w-5 h-5 text-primary-400 flex-shrink-0" />}
                <span className="text-dark-300 hover:text-white text-sm">
                  {section.title}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {CHARTER_SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Section section={section} />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 card bg-dark-850 text-center"
        >
          <p className="text-dark-400 text-sm mb-4">
            Cette charte est un document vivant qui évolue avec le réseau.
          </p>
          <Link href="/governance" className="btn-primary">
            <ScaleIcon className="w-5 h-5 mr-2" />
            Voir les propositions actives
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
