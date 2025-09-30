'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  TagIcon,
  UsersIcon,
  CloudArrowDownIcon,
  ChartBarIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import AppDiscovery from '@/components/AppDiscovery';
import MarketplaceAnalytics from '@/components/MarketplaceAnalytics';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  price: number;
  isPremium: boolean;
  developer: string;
  version: string;
  lastUpdated: string;
  tags: string[];
  icon: string;
  screenshots: string[];
  features: string[];
  compatibility: string[];
}

const marketplaceApps: MarketplaceApp[] = [
  {
    id: 'time-lock-wallet',
    name: 'TimeLock Wallet Pro',
    description: 'Gestionnaire de portefeuille avancé avec verrouillage temporel et fonctionnalités DeFi intégrées',
    category: 'Finance',
    rating: 4.8,
    downloads: 15420,
    price: 0,
    isPremium: false,
    developer: 'Capsule Core Team',
    version: '2.1.0',
    lastUpdated: '2024-11-15',
    tags: ['wallet', 'defi', 'security', 'timelock'],
    icon: '🔐',
    screenshots: [],
    features: ['Multi-signature support', 'Time-locked transactions', 'DeFi integration', 'Advanced analytics'],
    compatibility: ['Web', 'Mobile', 'Desktop']
  },
  {
    id: 'capsule-backup',
    name: 'Capsule Backup Manager',
    description: 'Solution de sauvegarde automatisée pour vos capsules temporelles les plus importantes',
    category: 'Productivity',
    rating: 4.6,
    downloads: 8930,
    price: 9.99,
    isPremium: true,
    developer: 'DataGuard Solutions',
    version: '1.5.2',
    lastUpdated: '2024-11-10',
    tags: ['backup', 'automation', 'security', 'cloud'],
    icon: '☁️',
    screenshots: [],
    features: ['Automated backups', 'Encryption', 'Multi-cloud support', 'Restore wizard'],
    compatibility: ['Web', 'Desktop']
  },
  {
    id: 'nft-capsule',
    name: 'NFT Capsule Studio',
    description: 'Créez et gérez des NFT avec programmation temporelle pour des révélations spectaculaires',
    category: 'NFT',
    rating: 4.9,
    downloads: 12350,
    price: 24.99,
    isPremium: true,
    developer: 'ArtTech Labs',
    version: '3.0.1',
    lastUpdated: '2024-11-12',
    tags: ['nft', 'art', 'timed-reveal', 'marketplace'],
    icon: '🎨',
    screenshots: [],
    features: ['NFT minting', 'Timed reveals', 'Marketplace integration', 'Royalty management'],
    compatibility: ['Web', 'Mobile']
  },
  {
    id: 'business-suite',
    name: 'Enterprise Capsule Suite',
    description: 'Suite complète pour entreprises avec gestion de documents légaux et conformité',
    category: 'Business',
    rating: 4.7,
    downloads: 5680,
    price: 99.99,
    isPremium: true,
    developer: 'CorporaTech',
    version: '4.2.0',
    lastUpdated: '2024-11-08',
    tags: ['enterprise', 'legal', 'compliance', 'workflow'],
    icon: '🏢',
    screenshots: [],
    features: ['Document management', 'Compliance tracking', 'Team collaboration', 'Audit trails'],
    compatibility: ['Web', 'Desktop']
  },
  {
    id: 'social-capsules',
    name: 'Social Capsule Network',
    description: 'Réseau social basé sur les capsules temporelles pour partager des souvenirs futurs',
    category: 'Social',
    rating: 4.4,
    downloads: 23450,
    price: 0,
    isPremium: false,
    developer: 'Future Memories Inc',
    version: '1.8.5',
    lastUpdated: '2024-11-14',
    tags: ['social', 'memories', 'sharing', 'community'],
    icon: '👥',
    screenshots: [],
    features: ['Social sharing', 'Community groups', 'Memory timelines', 'Privacy controls'],
    compatibility: ['Web', 'Mobile']
  },
  {
    id: 'analytics-pro',
    name: 'Capsule Analytics Pro',
    description: 'Analytics avancées et insights pour optimiser vos stratégies de capsules temporelles',
    category: 'Analytics',
    rating: 4.5,
    downloads: 3920,
    price: 19.99,
    isPremium: true,
    developer: 'DataInsight Corp',
    version: '2.3.1',
    lastUpdated: '2024-11-06',
    tags: ['analytics', 'insights', 'data', 'optimization'],
    icon: '📊',
    screenshots: [],
    features: ['Advanced analytics', 'Custom reports', 'Trend analysis', 'API integration'],
    compatibility: ['Web', 'Desktop']
  }
];

const categories = [
  { id: 'all', name: 'Toutes', icon: CubeIcon },
  { id: 'Finance', name: 'Finance', icon: BoltIcon },
  { id: 'Productivity', name: 'Productivité', icon: ChartBarIcon },
  { id: 'NFT', name: 'NFT & Art', icon: StarIcon },
  { id: 'Business', name: 'Business', icon: ShieldCheckIcon },
  { id: 'Social', name: 'Social', icon: UsersIcon },
  { id: 'Analytics', name: 'Analytics', icon: ArrowTrendingUpIcon }
];

const sortOptions = [
  { id: 'popular', name: 'Plus populaires' },
  { id: 'recent', name: 'Plus récents' },
  { id: 'rating', name: 'Mieux notés' },
  { id: 'downloads', name: 'Plus téléchargés' },
  { id: 'price-low', name: 'Prix croissant' },
  { id: 'price-high', name: 'Prix décroissant' }
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'discover' | 'analytics'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredAndSortedApps = useMemo(() => {
    let filtered = marketplaceApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesPremium = !showPremiumOnly || app.isPremium;

      return matchesSearch && matchesCategory && matchesPremium;
    });

    // Sort apps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default: // popular
          return b.downloads - a.downloads;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, showPremiumOnly]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div key={i}>
        {i < Math.floor(rating) ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>
    ));
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <PuzzlePieceIcon className="w-10 h-10 text-blue-400" />
            Marketplace Capsule
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez et installez des applications pour étendre les fonctionnalités de votre écosystème Capsule
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center mt-6">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Parcourir
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discover'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Découverte
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'browse' && (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CubeIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{marketplaceApps.length}</div>
                    <div className="text-gray-400 text-sm">Applications</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CloudArrowDownIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {formatDownloads(marketplaceApps.reduce((sum, app) => sum + app.downloads, 0))}
                    </div>
                    <div className="text-gray-400 text-sm">Téléchargements</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">1.2K</div>
                    <div className="text-gray-400 text-sm">Développeurs</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FireIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4.7</div>
                    <div className="text-gray-400 text-sm">Note moyenne</div>
                  </div>
                </div>
              </div>
            </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des applications..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort and Premium Filter */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showPremiumOnly
                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <StarIcon className="w-4 h-4" />
                <span className="text-sm">Premium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedApps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* App Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {app.name}
                      {app.isPremium && (
                        <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">{app.developer}</p>
                  </div>
                </div>
                <div className="text-right">
                  {app.price === 0 ? (
                    <span className="text-green-400 font-semibold">Gratuit</span>
                  ) : (
                    <span className="text-white font-semibold">${app.price}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {app.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {app.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
                {app.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                    +{app.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(app.rating)}
                  <span className="text-gray-400 text-sm ml-1">({app.rating})</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-1">
                    <CloudArrowDownIcon className="w-4 h-4" />
                    {formatDownloads(app.downloads)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  {app.price === 0 ? 'Installer' : 'Acheter'}
                </button>
                <button className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                  Détails
                </button>
              </div>
            </motion.div>
          ))}
        </div>

            {/* No Results */}
            {filteredAndSortedApps.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucune application trouvée</h3>
                <p className="text-gray-400">
                  Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
                </p>
              </div>
            )}
          </>
        )}

        {/* Discovery Tab */}
        {activeTab === 'discover' && (
          <AppDiscovery />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <MarketplaceAnalytics />
        )}
      </motion.div>
    </div>
  );
}