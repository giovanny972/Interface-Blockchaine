'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeBracketIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CodeExample {
  id: string;
  title: string;
  language: string;
  description: string;
  code: string;
  expectedOutput?: string;
}

const codeExamples: CodeExample[] = [
  {
    id: 'create-capsule',
    title: 'Créer une Capsule',
    language: 'javascript',
    description: 'Exemple pour créer une capsule temporelle avec l\'API JavaScript',
    code: `// Importer le SDK Capsule
import { CapsuleSDK } from '@capsule/sdk';

// Initialiser le client
const capsule = new CapsuleSDK({
  endpoint: 'https://api.capsule.network',
  chainId: 'capsule-1'
});

// Créer une nouvelle capsule
async function createCapsule() {
  try {
    const result = await capsule.createCapsule({
      title: "Ma première capsule",
      content: "Message secret pour l'avenir",
      unlockDate: new Date('2024-12-25T00:00:00Z'),
      recipients: ["cosmos1abc..."],
      isPublic: false
    });

    console.log('Capsule créée:', result.capsuleId);
    return result;
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter
createCapsule();`,
    expectedOutput: `{
  "success": true,
  "capsuleId": "capsule_1234567890",
  "transactionHash": "0xabc123...",
  "unlockDate": "2024-12-25T00:00:00Z"
}`
  },
  {
    id: 'list-capsules',
    title: 'Lister les Capsules',
    language: 'javascript',
    description: 'Récupérer la liste de vos capsules',
    code: `// Lister toutes vos capsules
async function listCapsules() {
  try {
    const capsules = await capsule.getCapsules({
      owner: await capsule.getAddress(),
      status: 'all' // 'locked', 'unlocked', 'all'
    });

    console.log(\`Trouvé \${capsules.length} capsules\`);

    capsules.forEach(cap => {
      console.log(\`- \${cap.title} (ID: \${cap.id})\`);
      console.log(\`  Status: \${cap.isUnlocked ? 'Déverrouillée' : 'Verrouillée'}\`);
      console.log(\`  Date: \${cap.unlockDate}\`);
    });

    return capsules;
  } catch (error) {
    console.error('Erreur:', error);
  }
}

listCapsules();`,
    expectedOutput: `Trouvé 3 capsules
- Ma première capsule (ID: capsule_1234567890)
  Status: Verrouillée
  Date: 2024-12-25T00:00:00Z
- Souvenirs d'été (ID: capsule_0987654321)
  Status: Déverrouillée
  Date: 2024-01-01T00:00:00Z`
  },
  {
    id: 'unlock-capsule',
    title: 'Déverrouiller une Capsule',
    language: 'javascript',
    description: 'Déverrouiller une capsule arrivée à échéance',
    code: `// Déverrouiller une capsule
async function unlockCapsule(capsuleId) {
  try {
    // Vérifier si la capsule peut être déverrouillée
    const capsule = await capsule.getCapsule(capsuleId);

    if (capsule.unlockDate > new Date()) {
      throw new Error('La capsule n\\'est pas encore prête à être déverrouillée');
    }

    // Déverrouiller
    const result = await capsule.unlockCapsule({
      capsuleId: capsuleId,
      signature: await capsule.signUnlock(capsuleId)
    });

    console.log('Contenu de la capsule:', result.content);
    console.log('Médias:', result.media);

    return result;
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple d'utilisation
unlockCapsule('capsule_1234567890');`,
    expectedOutput: `{
  "success": true,
  "content": "Message secret pour l'avenir",
  "media": [],
  "unlockedAt": "2024-12-25T10:30:00Z",
  "recipients": ["cosmos1abc..."]
}`
  }
];

export default function DeveloperSandbox() {
  const [selectedExample, setSelectedExample] = useState<CodeExample>(codeExamples[0]);
  const [code, setCode] = useState(selectedExample.code);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setCode(selectedExample.code);
    setOutput('');
    setExecutionStatus('idle');
  }, [selectedExample]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  }, []);

  const executeCode = useCallback(async () => {
    setIsExecuting(true);
    setOutput('Exécution du code...\n');

    // Simuler l'exécution du code
    setTimeout(() => {
      if (selectedExample.expectedOutput) {
        setOutput(selectedExample.expectedOutput);
        setExecutionStatus('success');
      } else {
        setOutput('Code exécuté avec succès\n// Aucun output attendu pour cet exemple');
        setExecutionStatus('success');
      }
      setIsExecuting(false);
    }, 2000);
  }, [selectedExample]);

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <CodeBracketIcon className="w-6 h-6 text-blue-400" />
          Sandbox Interactif
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className={`${
            executionStatus === 'success' ? 'text-green-400' :
            executionStatus === 'error' ? 'text-red-400' :
            'text-blue-400'
          }`}>
            {executionStatus === 'success' ? 'Succès' :
             executionStatus === 'error' ? 'Erreur' :
             'Prêt'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Examples Sidebar */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Exemples de Code</h4>
          {codeExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => setSelectedExample(example)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedExample.id === example.id
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{example.title}</div>
              <p className="text-xs text-gray-400 line-clamp-2">
                {example.description}
              </p>
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-400">
              {selectedExample.title} - {selectedExample.language}
            </h4>
            <button
              onClick={() => copyToClipboard(code)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Copier
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="bg-gray-750 p-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-400">Code</span>
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs rounded transition-colors"
              >
                <PlayIcon className="w-3 h-3" />
                {isExecuting ? 'Exécution...' : 'Exécuter'}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 bg-transparent p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none"
              style={{ fontFamily: 'Fira Code, Monaco, Consolas, monospace' }}
            />
          </div>

          {/* Output */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-400">Output</h4>
              {output && (
                <button
                  onClick={() => copyToClipboard(output)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copier
                </button>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 min-h-[120px]">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.pre
                    key="output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-300 text-sm font-mono whitespace-pre-wrap"
                  >
                    {output}
                  </motion.pre>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-gray-500 py-8"
                  >
                    <CodeBracketIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Cliquez sur "Exécuter" pour voir le résultat</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-300 text-sm">
              <strong>Description:</strong> {selectedExample.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}