'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  CloudArrowDownIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
}

interface AdoptionData {
  month: string;
  totalDownloads: number;
  activeUsers: number;
  revenue: number;
  newApps: number;
}

interface CategoryData {
  name: string;
  downloads: number;
  color: string;
}

interface AppPerformance {
  name: string;
  downloads: number;
  rating: number;
  revenue: number;
  growth: number;
}

const adoptionData: AdoptionData[] = [
  { month: 'Jan', totalDownloads: 12500, activeUsers: 8900, revenue: 45000, newApps: 15 },
  { month: 'Feb', totalDownloads: 15600, activeUsers: 11200, revenue: 52000, newApps: 18 },
  { month: 'Mar', totalDownloads: 18900, activeUsers: 13800, revenue: 61000, newApps: 22 },
  { month: 'Apr', totalDownloads: 23400, activeUsers: 16500, revenue: 73000, newApps: 27 },
  { month: 'May', totalDownloads: 28700, activeUsers: 20100, revenue: 89000, newApps: 31 },
  { month: 'Jun', totalDownloads: 34200, activeUsers: 24300, revenue: 106000, newApps: 35 },
  { month: 'Jul', totalDownloads: 41500, activeUsers: 29800, revenue: 125000, newApps: 42 },
  { month: 'Aug', totalDownloads: 48900, activeUsers: 35200, revenue: 147000, newApps: 48 },
  { month: 'Sep', totalDownloads: 56700, activeUsers: 41500, revenue: 172000, newApps: 53 },
  { month: 'Oct', totalDownloads: 65200, activeUsers: 48900, revenue: 198000, newApps: 59 },
  { month: 'Nov', totalDownloads: 74800, activeUsers: 57200, revenue: 227000, newApps: 64 }
];

const categoryData: CategoryData[] = [
  { name: 'Finance', downloads: 25600, color: '#10B981' },
  { name: 'Productivité', downloads: 18900, color: '#3B82F6' },
  { name: 'Social', downloads: 15200, color: '#8B5CF6' },
  { name: 'NFT & Art', downloads: 12800, color: '#F59E0B' },
  { name: 'Analytics', downloads: 9500, color: '#EF4444' },
  { name: 'Business', downloads: 7400, color: '#6B7280' },
  { name: 'Autres', downloads: 5600, color: '#9CA3AF' }
];

const topApps: AppPerformance[] = [
  { name: 'TimeLock Wallet Pro', downloads: 15420, rating: 4.8, revenue: 0, growth: 23 },
  { name: 'Social Memory Vault', downloads: 12350, rating: 4.4, revenue: 0, growth: 67 },
  { name: 'NFT Capsule Studio', downloads: 8930, rating: 4.9, revenue: 24990, growth: 45 },
  { name: 'Enterprise Suite', downloads: 5680, rating: 4.7, revenue: 99990, growth: 12 },
  { name: 'Analytics Pro', downloads: 3920, rating: 4.5, revenue: 19990, growth: -5 }
];

export default function MarketplaceAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'downloads' | 'users' | 'revenue'>('downloads');

  const metrics: MetricCard[] = useMemo(() => [
    {
      title: 'Total Téléchargements',
      value: '74.8K',
      change: 18.2,
      changeType: 'increase',
      icon: CloudArrowDownIcon,
      color: 'text-blue-400'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '57.2K',
      change: 12.5,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-green-400'
    },
    {
      title: 'Revenus Totaux',
      value: '$227K',
      change: 24.7,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'text-purple-400'
    },
    {
      title: 'Nouvelles Apps',
      value: '64',
      change: 8.3,
      changeType: 'increase',
      icon: SparklesIcon,
      color: 'text-orange-400'
    },
    {
      title: 'Taux de Rétention',
      value: '78.5%',
      change: 3.2,
      changeType: 'increase',
      icon: ArrowPathIcon,
      color: 'text-cyan-400'
    },
    {
      title: 'Note Moyenne',
      value: '4.6',
      change: -0.1,
      changeType: 'decrease',
      icon: HeartIcon,
      color: 'text-red-400'
    }
  ], []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  const getChartData = () => {
    switch (selectedMetric) {
      case 'users':
        return adoptionData.map(d => ({ ...d, value: d.activeUsers }));
      case 'revenue':
        return adoptionData.map(d => ({ ...d, value: d.revenue }));
      default:
        return adoptionData.map(d => ({ ...d, value: d.totalDownloads }));
    }
  };

  const getMetricName = () => {
    switch (selectedMetric) {
      case 'users': return 'Utilisateurs Actifs';
      case 'revenue': return 'Revenus';
      default: return 'Téléchargements';
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'users': return '#10B981';
      case 'revenue': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
            Analytics Marketplace
          </h2>
          <p className="text-gray-400 mt-1">Métriques d'adoption et performance de l'écosystème</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['downloads', 'users', 'revenue'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {metric === 'downloads' ? 'Télécharg.' : metric === 'users' ? 'Utilisateurs' : 'Revenus'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.changeType === 'increase' ? 'text-green-400' :
                  metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  ) : metric.changeType === 'decrease' ? (
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                  ) : null}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.title}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Évolution des {getMetricName()}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              Derniers 11 mois
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={selectedMetric === 'revenue' ? formatCurrency : formatNumber} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number) => [
                    selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    getMetricName()
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getMetricColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">
            Répartition par Catégorie
          </h3>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="downloads"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Téléchargements']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {categoryData.slice(0, 5).map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-300 text-sm">{category.name}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {formatNumber(category.downloads)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Apps */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Applications</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            Voir tout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Application</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Téléchargements</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Note</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Revenus</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Croissance</th>
              </tr>
            </thead>
            <tbody>
              {topApps.map((app, index) => (
                <tr key={app.name} className="border-b border-gray-800 last:border-b-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{app.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-300">
                    {formatNumber(app.downloads)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{app.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-300">
                    {app.revenue === 0 ? 'Gratuit' : formatCurrency(app.revenue)}
                  </td>
                  <td className="py-4">
                    <div className={`flex items-center gap-1 ${
                      app.growth > 0 ? 'text-green-400' :
                      app.growth < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {app.growth > 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : app.growth < 0 ? (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      ) : null}
                      <span>{Math.abs(app.growth)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}