'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  ArrowRightIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface TrendingApp {
  id: string;
  name: string;
  category: string;
  growthRate: number;
  weeklyDownloads: number;
  description: string;
  tags: string[];
  icon: string;
}

interface PersonalizedRecommendation {
  id: string;
  name: string;
  reason: string;
  matchScore: number;
  category: string;
  icon: string;
  description: string;
}

interface AppInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'insight' | 'tip' | 'update';
  timestamp: string;
  relevantApps: string[];
}

const trendingApps: TrendingApp[] = [
  {
    id: 'ai-capsule-assistant',
    name: 'AI Capsule Assistant',
    category: 'AI & Automation',
    growthRate: 245,
    weeklyDownloads: 3420,
    description: 'Assistant IA pour optimiser vos stratégies de capsules temporelles',
    tags: ['ai', 'automation', 'optimization'],
    icon: '🤖'
  },
  {
    id: 'defi-yield-locker',
    name: 'DeFi Yield Locker',
    category: 'Finance',
    growthRate: 189,
    weeklyDownloads: 2890,
    description: 'Verrouillez vos rendements DeFi avec des conditions temporelles',
    tags: ['defi', 'yield', 'finance'],
    icon: '💰'
  },
  {
    id: 'social-memory-vault',
    name: 'Social Memory Vault',
    category: 'Social',
    growthRate: 167,
    weeklyDownloads: 5240,
    description: 'Partagez des souvenirs avec déverrouillage programmé en famille',
    tags: ['social', 'family', 'memories'],
    icon: '👨‍👩‍👧‍👦'
  }
];

const personalizedRecommendations: PersonalizedRecommendation[] = [
  {
    id: 'smart-backup-pro',
    name: 'Smart Backup Pro',
    reason: 'Basé sur votre utilisation fréquente de capsules importantes',
    matchScore: 94,
    category: 'Productivity',
    icon: '☁️',
    description: 'Sauvegarde intelligente avec ML pour vos capsules critiques'
  },
  {
    id: 'crypto-estate-planner',
    name: 'Crypto Estate Planner',
    reason: 'Complète vos capsules de sécurité existantes',
    matchScore: 87,
    category: 'Finance',
    icon: '🏛️',
    description: 'Planification successorale automatisée pour crypto-actifs'
  },
  {
    id: 'time-release-nft',
    name: 'Time-Release NFT Creator',
    reason: 'Correspond à votre intérêt pour les capsules créatives',
    matchScore: 82,
    category: 'NFT',
    icon: '🎨',
    description: 'Créez des NFT avec révélation programmée dans le temps'
  }
];

const appInsights: AppInsight[] = [
  {
    id: 'trend-1',
    title: 'Les applications IA dominent les téléchargements',
    description: 'Les applications utilisant l\'IA pour optimiser les capsules ont vu une croissance de 300% ce mois-ci',
    type: 'trend',
    timestamp: '2024-11-15T10:30:00Z',
    relevantApps: ['ai-capsule-assistant', 'smart-backup-pro']
  },
  {
    id: 'insight-1',
    title: 'Les capsules collaboratives en hausse',
    description: 'Les utilisateurs créent 40% plus de capsules partagées avec les nouvelles apps sociales',
    type: 'insight',
    timestamp: '2024-11-14T15:45:00Z',
    relevantApps: ['social-memory-vault']
  },
  {
    id: 'tip-1',
    title: 'Conseil: Diversifiez vos types de capsules',
    description: 'Les utilisateurs avec 3+ types d\'applications installées ont 60% plus d\'engagement',
    type: 'tip',
    timestamp: '2024-11-13T09:15:00Z',
    relevantApps: []
  }
];

export default function AppDiscovery() {
  const [activeTab, setActiveTab] = useState<'trending' | 'personalized' | 'insights'>('trending');
  const [likedApps, setLikedApps] = useState<Set<string>>(new Set());
  const [viewedInsights, setViewedInsights] = useState<Set<string>>(new Set());

  const toggleLike = (appId: string) => {
    setLikedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const markInsightAsViewed = (insightId: string) => {
    setViewedInsights(prev => new Set([...prev, insightId]));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return ArrowTrendingUpIcon;
      case 'insight': return LightBulbIcon;
      case 'tip': return SparklesIcon;
      case 'update': return RocketLaunchIcon;
      default: return SparklesIcon;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-green-400 bg-green-500/20';
      case 'insight': return 'text-blue-400 bg-blue-500/20';
      case 'tip': return 'text-purple-400 bg-purple-500/20';
      case 'update': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-400" />
          Découverte d'Applications
        </h3>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Tendances
          </button>
          <button
            onClick={() => setActiveTab('personalized')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'personalized'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pour Vous
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Trending Apps */}
        {activeTab === 'trending' && (
          <motion.div
            key="trending"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Applications en forte croissance cette semaine</span>
            </div>

            {trendingApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      {app.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">#{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{app.name}</h4>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md">
                        +{app.growthRate}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{app.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-3 h-3" />
                        {app.weeklyDownloads.toLocaleString()} cette semaine
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-700 rounded">
                        {app.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(app.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {likedApps.has(app.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-400" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    <EyeIcon className="w-4 h-4" />
                    Voir
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Personalized Recommendations */}
        {activeTab === 'personalized' && (
          <motion.div
            key="personalized"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <UserGroupIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Recommandées spécialement pour vous</span>
            </div>

            {personalizedRecommendations.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                      {app.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{app.name}</h4>
                      <span className="text-xs text-gray-400">{app.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">{app.matchScore}% match</div>
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${app.matchScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-2">{app.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <LightBulbIcon className="w-3 h-3" />
                    <span>{app.reason}</span>
                  </div>

                  <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    Installer
                    <ArrowRightIcon className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* App Insights */}
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <LightBulbIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Tendances et insights du marketplace</span>
            </div>

            {appInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const colorClasses = getInsightColor(insight.type);
              const isViewed = viewedInsights.has(insight.id);

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 bg-gray-800 rounded-lg border transition-colors cursor-pointer ${
                    isViewed ? 'border-gray-700' : 'border-blue-500/50 bg-blue-500/5'
                  }`}
                  onClick={() => markInsightAsViewed(insight.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          {!isViewed && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(insight.timestamp).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">{insight.description}</p>

                      {insight.relevantApps.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Apps associées:</span>
                          <div className="flex gap-1">
                            {insight.relevantApps.map((appId) => (
                              <span
                                key={appId}
                                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md hover:bg-gray-600 cursor-pointer transition-colors"
                              >
                                {appId.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}