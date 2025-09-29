import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrategyData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
  avgProfit: number;
  color: string;
  alerts: number;
}

interface StrategyContributionProps {
  className?: string;
}

const timeframes = [
  { label: '24H', value: 24, key: '24h' },
  { label: '7D', value: 168, key: '7d' },
  { label: '15D', value: 360, key: '15d' },
  { label: '1M', value: 720, key: '1m' },
  { label: '3M', value: 2160, key: '3m' },
  { label: '6M', value: 4320, key: '6m' },
  { label: '12M', value: 8640, key: '12m' }
];

export default function StrategyContribution({ className = '' }: StrategyContributionProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [viewMode, setViewMode] = useState<'bar' | 'line' | 'pie'>('bar');
  const [strategyData, setStrategyData] = useState<StrategyData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock strategy data
  useEffect(() => {
    const generateStrategyData = () => {
      const strategies = [
        { name: 'MomentumBurst', basePNL: 8500, baseTrades: 45, baseWinRate: 72, color: '#10B981' },
        { name: 'TrendRider', basePNL: 6200, baseTrades: 38, baseWinRate: 68, color: '#3B82F6' },
        { name: 'VolumeSurge', basePNL: 4800, baseTrades: 29, baseWinRate: 63, color: '#F59E0B' },
        { name: 'BreakoutHunter', basePNL: 7100, baseTrades: 41, baseWinRate: 75, color: '#8B5CF6' },
        { name: 'MeanReversal', basePNL: 3200, baseTrades: 25, baseWinRate: 58, color: '#EF4444' }
      ];

      const data = strategies.map(strategy => {
        const pnlMultiplier = 0.8 + Math.random() * 0.4; // 0.8-1.2
        const tradesMultiplier = 0.9 + Math.random() * 0.2; // 0.9-1.1

        return {
          name: strategy.name,
          pnl: Math.round(strategy.basePNL * pnlMultiplier),
          trades: Math.round(strategy.baseTrades * tradesMultiplier),
          winRate: Math.round(strategy.baseWinRate + (Math.random() - 0.5) * 10),
          avgProfit: Math.round((strategy.basePNL * pnlMultiplier) / (strategy.baseTrades * tradesMultiplier)),
          color: strategy.color,
          alerts: Math.round(strategy.baseTrades * tradesMultiplier * 1.2)
        };
      });

      setStrategyData(data);
    };

    generateStrategyData();
  }, [selectedTimeframe]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const totalPNL = strategyData.reduce((sum, strategy) => sum + strategy.pnl, 0);
  const totalTrades = strategyData.reduce((sum, strategy) => sum + strategy.trades, 0);
  const avgWinRate = strategyData.length > 0
    ? Math.round(strategyData.reduce((sum, strategy) => sum + strategy.winRate, 0) / strategyData.length)
    : 0;

  const bestStrategy = strategyData.reduce((best, current) =>
    current.pnl > best.pnl ? current : best,
    strategyData[0] || { name: 'N/A', pnl: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy-wise Contribution</h3>
            <p className="text-sm text-slate-400">Real-time & historical performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'bar' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'line' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'pie' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pie
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
            {timeframes.slice(0, 4).map((tf) => (
              <button
                key={tf.key}
                onClick={() => setSelectedTimeframe(tf.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === tf.key
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Strategy PNL</p>
              <p className={`text-xl font-bold ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPNL >= 0 ? '+' : ''}₹{totalPNL.toLocaleString()}
              </p>
            </div>
            <TrendingUp className={`h-6 w-6 ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Trades</p>
              <p className="text-xl font-bold text-blue-400">{totalTrades}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Win Rate</p>
              <p className="text-xl font-bold text-cyan-400">{avgWinRate}%</p>
            </div>
            <PieChartIcon className="h-6 w-6 text-cyan-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Best Strategy</p>
              <p className="text-lg font-bold text-purple-400">{bestStrategy.name}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bar' && (
            <BarChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  name === 'pnl' ? `₹${value.toLocaleString()}` : value,
                  name === 'pnl' ? 'PNL' : name
                ]}
              />
              <Bar dataKey="pnl" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}

          {viewMode === 'line' && (
            <LineChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'PNL']}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          )}

          {viewMode === 'pie' && (
            <PieChart>
              <Pie
                data={strategyData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="pnl"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {strategyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'PNL']}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Strategy Details Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 text-slate-400 font-medium">Strategy</th>
              <th className="text-right py-2 text-slate-400 font-medium">PNL</th>
              <th className="text-right py-2 text-slate-400 font-medium">Trades</th>
              <th className="text-right py-2 text-slate-400 font-medium">Win Rate</th>
              <th className="text-right py-2 text-slate-400 font-medium">Avg Profit</th>
              <th className="text-right py-2 text-slate-400 font-medium">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {strategyData.map((strategy, index) => (
              <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: strategy.color }}
                    ></div>
                    <span className="text-white font-medium">{strategy.name}</span>
                  </div>
                </td>
                <td className="text-right py-3">
                  <span className={`font-medium ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toLocaleString()}
                  </span>
                </td>
                <td className="text-right py-3">
                  <span className="text-white">{strategy.trades}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-cyan-400">{strategy.winRate}%</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-purple-400">₹{strategy.avgProfit}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-orange-400">{strategy.alerts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}