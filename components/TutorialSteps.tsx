'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CogIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: string;
  codeExample?: string;
  action?: {
    type: 'code' | 'api' | 'ui';
    label: string;
    data?: any;
  };
  completed?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'setup',
    title: 'Configuration Initiale',
    description: 'Configurez votre environnement de développement',
    content: `Avant de commencer à créer des capsules temporelles, vous devez configurer votre environnement :

**1. Installation du SDK**
\`\`\`bash
npm install @capsule/sdk
\`\`\`

**2. Configuration du Wallet**
Vous aurez besoin d'un wallet compatible Cosmos (Keplr recommandé)

**3. Variables d'Environnement**
Créez un fichier \`.env.local\` avec :`,
    codeExample: `NEXT_PUBLIC_CAPSULE_ENDPOINT=https://api.capsule.network
NEXT_PUBLIC_CHAIN_ID=capsule-1
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=votre_project_id`,
    action: {
      type: 'code',
      label: 'Tester la Configuration'
    }
  },
  {
    id: 'connect-wallet',
    title: 'Connexion du Wallet',
    description: 'Connectez votre wallet à l\'application',
    content: `La première étape pour interagir avec les capsules est de connecter votre wallet :

**Utilisation du composant WalletConnector :**
- Cliquez sur "Se connecter" dans l'interface
- Sélectionnez votre wallet (Keplr recommandé)
- Autorisez la connexion

**Vérification de la connexion :**`,
    codeExample: `import { useWallet } from '@capsule/react';

function MyComponent() {
  const { connected, address, connect } = useWallet();

  if (!connected) {
    return (
      <button onClick={connect}>
        Se connecter au Wallet
      </button>
    );
  }

  return <div>Connecté : {address}</div>;
}`,
    action: {
      type: 'ui',
      label: 'Connecter le Wallet'
    }
  },
  {
    id: 'create-first-capsule',
    title: 'Créer Votre Première Capsule',
    description: 'Créez une capsule temporelle simple',
    content: `Maintenant que votre wallet est connecté, créons votre première capsule :

**Étapes :**
1. Définissez le contenu de votre capsule
2. Choisissez une date de déverrouillage
3. Configurez les destinataires (optionnel)
4. Définissez la visibilité (publique/privée)

**Exemple pratique :**`,
    codeExample: `async function createFirstCapsule() {
  const capsuleData = {
    title: "Ma première capsule temporelle",
    content: "Ceci est un message pour moi dans le futur !",
    unlockDate: new Date('2024-12-31T23:59:59Z'),
    recipients: [], // Vide = pour moi uniquement
    isPublic: false,
    metadata: {
      category: "personnel",
      tags: ["premier", "test"]
    }
  };

  try {
    const result = await capsuleSDK.createCapsule(capsuleData);
    console.log('Capsule créée avec l\\'ID:', result.capsuleId);
    return result;
  } catch (error) {
    console.error('Erreur lors de la création:', error);
  }
}`,
    action: {
      type: 'api',
      label: 'Créer une Capsule Test',
      data: {
        endpoint: '/api/capsules/create',
        method: 'POST'
      }
    }
  },
  {
    id: 'manage-capsules',
    title: 'Gérer Vos Capsules',
    description: 'Apprenez à lister et gérer vos capsules',
    content: `Une fois vos capsules créées, vous pouvez les gérer facilement :

**Fonctionnalités disponibles :**
- Lister toutes vos capsules
- Filtrer par statut (verrouillée/déverrouillée)
- Voir les détails d'une capsule
- Modifier les métadonnées (avant déverrouillage)

**Code pour lister vos capsules :**`,
    codeExample: `async function listMyCapsules() {
  try {
    const capsules = await capsuleSDK.getCapsules({
      owner: userAddress,
      status: 'all', // 'locked', 'unlocked', 'all'
      sortBy: 'createdDate',
      order: 'desc'
    });

    capsules.forEach(capsule => {
      console.log(\`Capsule: \${capsule.title}\`);
      console.log(\`Status: \${capsule.isUnlocked ? 'Déverrouillée' : 'Verrouillée'}\`);
      console.log(\`Date de déverrouillage: \${capsule.unlockDate}\`);
      console.log('---');
    });

    return capsules;
  } catch (error) {
    console.error('Erreur:', error);
  }
}`,
    action: {
      type: 'api',
      label: 'Lister Mes Capsules',
      data: {
        endpoint: '/api/capsules',
        method: 'GET'
      }
    }
  },
  {
    id: 'unlock-capsule',
    title: 'Déverrouiller une Capsule',
    description: 'Découvrez comment déverrouiller vos capsules',
    content: `Quand le moment est venu, vous pouvez déverrouiller vos capsules :

**Conditions de déverrouillage :**
- La date de déverrouillage doit être atteinte
- Vous devez être autorisé (propriétaire ou destinataire)
- La capsule ne doit pas déjà être déverrouillée

**Processus de déverrouillage :**`,
    codeExample: `async function unlockCapsule(capsuleId) {
  try {
    // 1. Vérifier si la capsule peut être déverrouillée
    const capsule = await capsuleSDK.getCapsule(capsuleId);

    if (new Date() < new Date(capsule.unlockDate)) {
      throw new Error('La capsule n\\'est pas encore prête');
    }

    // 2. Déverrouiller la capsule
    const result = await capsuleSDK.unlockCapsule({
      capsuleId: capsuleId,
      signature: await capsuleSDK.signUnlock(capsuleId)
    });

    console.log('Contenu révélé:', result.content);
    console.log('Médias:', result.media);

    return result;
  } catch (error) {
    console.error('Erreur de déverrouillage:', error);
  }
}`,
    action: {
      type: 'api',
      label: 'Simuler Déverrouillage',
      data: {
        endpoint: '/api/capsules/:id/unlock',
        method: 'POST'
      }
    }
  },
  {
    id: 'advanced-features',
    title: 'Fonctionnalités Avancées',
    description: 'Explorez les fonctionnalités avancées des capsules',
    content: `Découvrez les fonctionnalités avancées pour des cas d'usage plus complexes :

**1. Capsules Collaboratives**
- Ajoutez plusieurs destinataires
- Déverrouillage conditionnel (signatures multiples)

**2. Capsules Programmables**
- Conditions de déverrouillage basées sur des événements
- Intégration avec des oracles

**3. Capsules Publiques**
- Visibles par tous mais déverrouillables selon les règles
- Idéal pour des événements communautaires

**Exemple de capsule collaborative :**`,
    codeExample: `async function createCollaborativeCapsule() {
  const capsuleData = {
    title: "Capsule de notre équipe",
    content: "Souvenirs de notre projet réussi !",
    unlockDate: new Date('2025-01-01T00:00:00Z'),
    recipients: [
      "cosmos1abc...", // Alice
      "cosmos1def...", // Bob
      "cosmos1ghi..."  // Charlie
    ],
    isPublic: true,
    unlockConditions: {
      type: "signature_threshold",
      threshold: 2, // 2 signatures minimum
      signers: "recipients"
    }
  };

  const result = await capsuleSDK.createCapsule(capsuleData);
  return result;
}`,
    action: {
      type: 'code',
      label: 'Explorer les Options'
    }
  }
];

interface TutorialStepsProps {
  onStepComplete?: (stepId: string) => void;
  onTutorialComplete?: () => void;
}

export default function TutorialSteps({ onStepComplete, onTutorialComplete }: TutorialStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepAction = useCallback(async (step: TutorialStep) => {
    // Simuler l'action
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Marquer l'étape comme complétée
    setCompletedSteps(prev => new Set([...prev, step.id]));
    onStepComplete?.(step.id);

    // Si c'est la dernière étape, marquer le tutoriel comme terminé
    if (currentStep === tutorialSteps.length - 1) {
      onTutorialComplete?.();
    }
  }, [currentStep, onStepComplete, onTutorialComplete]);

  const goToNextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const getStepIcon = (step: TutorialStep, index: number) => {
    if (completedSteps.has(step.id)) {
      return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
    }
    if (index === currentStep) {
      return <PlayCircleIcon className="w-6 h-6 text-blue-400" />;
    }

    // Icons based on step type
    switch (step.id) {
      case 'setup': return <CogIcon className="w-6 h-6 text-gray-400" />;
      case 'connect-wallet': return <RocketLaunchIcon className="w-6 h-6 text-gray-400" />;
      case 'create-first-capsule': return <DocumentTextIcon className="w-6 h-6 text-gray-400" />;
      default: return <CodeBracketIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Tutoriel Interactif</h3>
          <p className="text-gray-400 text-sm">
            Étape {currentStep + 1} sur {tutorialSteps.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Progression</div>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tutorialSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-fit ${
              index === currentStep
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : completedSteps.has(step.id)
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {getStepIcon(step, index)}
            <span className="whitespace-nowrap">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Step Header */}
          <div>
            <h4 className="text-2xl font-bold text-white mb-2">
              {currentTutorialStep.title}
            </h4>
            <p className="text-gray-400">
              {currentTutorialStep.description}
            </p>
          </div>

          {/* Step Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 whitespace-pre-line">
              {currentTutorialStep.content}
            </div>
          </div>

          {/* Code Example */}
          {currentTutorialStep.codeExample && (
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="bg-gray-750 p-3 border-b border-gray-700">
                <span className="text-sm text-gray-400">Code Example</span>
              </div>
              <pre className="p-4 text-gray-300 text-sm overflow-x-auto">
                <code>{currentTutorialStep.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Action Button */}
          {currentTutorialStep.action && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleStepAction(currentTutorialStep)}
                disabled={completedSteps.has(currentTutorialStep.id)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 text-white font-semibold rounded-lg transition-colors"
              >
                {completedSteps.has(currentTutorialStep.id) ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Complété
                  </>
                ) : (
                  <>
                    <PlayCircleIcon className="w-5 h-5" />
                    {currentTutorialStep.action.label}
                  </>
                )}
              </button>

              {completedSteps.has(currentTutorialStep.id) && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-400 text-sm font-medium"
                >
                  ✅ Étape terminée avec succès !
                </motion.span>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Précédent
        </button>

        <div className="text-sm text-gray-400">
          {completedSteps.size} / {tutorialSteps.length} étapes complétées
        </div>

        <button
          onClick={goToNextStep}
          disabled={currentStep === tutorialSteps.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
        >
          Suivant
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}