'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, DocumentTextIcon, CodeBracketIcon, BeakerIcon } from '@heroicons/react/24/outline';
import DeveloperSandbox from '@/components/DeveloperSandbox';
import TutorialSteps from '@/components/TutorialSteps';

interface APIEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  example: any;
}

const apiEndpoints: APIEndpoint[] = [
  {
    name: "Créer Capsule",
    method: "POST",
    path: "/api/capsules/create",
    description: "Créer une nouvelle capsule temporelle",
    example: {
      title: "Ma première capsule",
      content: "Contenu secret",
      unlockDate: "2024-12-25T00:00:00Z",
      recipients: ["cosmos1..."],
      isPublic: false
    }
  },
  {
    name: "Lister Capsules",
    method: "GET",
    path: "/api/capsules",
    description: "Récupérer la liste des capsules",
    example: {}
  },
  {
    name: "Déverrouiller Capsule",
    method: "POST",
    path: "/api/capsules/{id}/unlock",
    description: "Déverrouiller une capsule arrivée à échéance",
    example: {
      signature: "0x..."
    }
  }
];

export default function PlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiEndpoints[0]);
  const [requestBody, setRequestBody] = useState(JSON.stringify(selectedEndpoint.example, null, 2));
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEndpointChange = useCallback((endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(JSON.stringify(endpoint.example, null, 2));
    setResponse('');
  }, []);

  const executeRequest = useCallback(async () => {
    setLoading(true);
    setResponse('');

    try {
      const config: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
        config.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, config);
      const data = await res.json();

      setResponse(JSON.stringify({
        status: res.status,
        statusText: res.statusText,
        data
      }, null, 2));
    } catch (error: any) {
      setResponse(JSON.stringify({
        error: error.message
      }, null, 2));
    } finally {
      setLoading(false);
    }
  }, [selectedEndpoint, requestBody]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BeakerIcon className="w-10 h-10 text-blue-400" />
            Capsule Playground
          </h1>
          <p className="text-gray-400 text-lg">
            Interface de test interactive pour l'API Capsule
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CodeBracketIcon className="w-5 h-5" />
              Endpoints API
            </h2>
            <div className="space-y-2">
              {apiEndpoints.map((endpoint) => (
                <button
                  key={endpoint.name}
                  onClick={() => handleEndpointChange(endpoint)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEndpoint.name === endpoint.name
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-semibold">{endpoint.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono">
                    {endpoint.path}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Request */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Request
            </h2>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Endpoint:</div>
              <div className="bg-gray-800 p-3 rounded-lg font-mono text-sm">
                <span className={`px-2 py-1 rounded text-xs mr-2 ${
                  selectedEndpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                  selectedEndpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-gray-300">{selectedEndpoint.path}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Description:</div>
              <p className="text-gray-300 text-sm">{selectedEndpoint.description}</p>
            </div>

            {selectedEndpoint.method !== 'GET' && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Body (JSON):</div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 font-mono text-sm"
                  placeholder="JSON request body..."
                />
              </div>
            )}

            <button
              onClick={executeRequest}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              {loading ? 'Exécution...' : 'Exécuter'}
            </button>
          </div>

          {/* Response */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Response</h2>

            <div className="bg-gray-800 rounded-lg p-4 min-h-[400px]">
              {response ? (
                <pre className="text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap">
                  {response}
                </pre>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <BeakerIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Exécutez une requête pour voir la réponse</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Sandbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Sandbox de Développement</h3>
          <DeveloperSandbox />
        </motion.div>

        {/* Interactive Tutorials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Tutoriels Intégrés</h3>
          <TutorialSteps />
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Guide de Démarrage Rapide</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h4 className="text-lg font-semibold text-white">Testez l'API</h4>
              <p className="text-gray-400">Utilisez l'interface de test pour comprendre les endpoints disponibles.</p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h4 className="text-lg font-semibold text-white">Explorez le Code</h4>
              <p className="text-gray-400">Utilisez le sandbox pour tester du code JavaScript en temps réel.</p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h4 className="text-lg font-semibold text-white">Suivez les Tutoriels</h4>
              <p className="text-gray-400">Apprenez étape par étape avec nos tutoriels interactifs intégrés.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}