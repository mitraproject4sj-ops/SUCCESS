import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, BarChart3, Calendar, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrategyComparison {
  name: string;
  alerts: number;
  trades: number;
  winRate: number;
  avgProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalReturn: number;
  color: string;
}

interface StrategyComparisonPanelProps {
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

export default function StrategyComparisonPanel({ className = '' }: StrategyComparisonPanelProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [viewMode, setViewMode] = useState<'alerts-winrate' | 'performance' | 'efficiency'>('alerts-winrate');
  const [strategyData, setStrategyData] = useState<StrategyComparison[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock strategy comparison data
  useEffect(() => {
    const generateStrategyData = () => {
      const strategies = [
        { name: 'MomentumBurst', baseAlerts: 145, baseTrades: 89, baseWinRate: 72, color: '#10B981' },
        { name: 'TrendRider', baseAlerts: 98, baseTrades: 67, baseWinRate: 68, color: '#3B82F6' },
        { name: 'VolumeSurge', baseAlerts: 76, baseTrades: 48, baseWinRate: 63, color: '#F59E0B' },
        { name: 'BreakoutHunter', baseAlerts: 52, baseTrades: 39, baseWinRate: 75, color: '#8B5CF6' },
        { name: 'MeanReversal', baseAlerts: 34, baseTrades: 18, baseWinRate: 58, color: '#EF4444' }
      ];

      const data = strategies.map(strategy => {
        const alertsMultiplier = 0.8 + Math.random() * 0.4;
        const tradesMultiplier = 0.85 + Math.random() * 0.3;
        const winRateVariation = (Math.random() - 0.5) * 8;

        return {
          name: strategy.name,
          alerts: Math.round(strategy.baseAlerts * alertsMultiplier),
          trades: Math.round(strategy.baseTrades * tradesMultiplier),
          winRate: Math.round(strategy.baseWinRate + winRateVariation),
          avgProfit: Math.round((200 + Math.random() * 400) * (strategy.baseWinRate / 70)),
          maxDrawdown: Math.round(5 + Math.random() * 15),
          sharpeRatio: Math.round((1.2 + Math.random() * 1.8) * 100) / 100,
          totalReturn: Math.round((strategy.baseTrades * tradesMultiplier) * (200 + Math.random() * 400) * (strategy.baseWinRate / 100)),
          color: strategy.color
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

  // Prepare data for different chart views
  const alertsWinRateData = strategyData.map(strategy => ({
    name: strategy.name,
    alerts: strategy.alerts,
    winRate: strategy.winRate,
    efficiency: Math.round((strategy.trades / strategy.alerts) * 100),
    color: strategy.color
  }));

  const performanceData = strategyData.map(strategy => ({
    name: strategy.name,
    totalReturn: strategy.totalReturn,
    avgProfit: strategy.avgProfit,
    sharpeRatio: strategy.sharpeRatio,
    maxDrawdown: strategy.maxDrawdown,
    color: strategy.color
  }));

  const efficiencyData = strategyData.map(strategy => ({
    name: strategy.name,
    alertsToTradesRatio: Math.round((strategy.trades / strategy.alerts) * 100),
    winRate: strategy.winRate,
    profitFactor: Math.round((strategy.winRate / (100 - strategy.winRate)) * 100) / 100,
    color: strategy.color
  }));

  const bestStrategy = strategyData.reduce((best, current) =>
    current.totalReturn > best.totalReturn ? current : best,
    strategyData[0] || { name: 'N/A', totalReturn: 0 }
  );

  const highestWinRate = strategyData.reduce((best, current) =>
    current.winRate > best.winRate ? current : best,
    strategyData[0] || { name: 'N/A', winRate: 0 }
  );

  const mostEfficient = strategyData.reduce((best, current) =>
    (current.trades / current.alerts) > (best.trades / best.alerts) ? current : best,
    strategyData[0] || { name: 'N/A', trades: 0, alerts: 1 }
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
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy Comparison Panel</h3>
            <p className="text-sm text-slate-400">Alerts vs Win Rate & Performance Analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('alerts-winrate')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'alerts-winrate' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alerts vs Win Rate
            </button>
            <button
              onClick={() => setViewMode('performance')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'performance' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setViewMode('efficiency')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'efficiency' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Efficiency
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

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Best Performer</p>
              <p className="text-lg font-bold text-green-400">{bestStrategy.name}</p>
              <p className="text-sm text-slate-400">₹{bestStrategy.totalReturn.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Highest Win Rate</p>
              <p className="text-lg font-bold text-blue-400">{highestWinRate.name}</p>
              <p className="text-sm text-slate-400">{highestWinRate.winRate}%</p>
            </div>
            <Target className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Most Efficient</p>
              <p className="text-lg font-bold text-purple-400">{mostEfficient.name}</p>
              <p className="text-sm text-slate-400">{Math.round((mostEfficient.trades / mostEfficient.alerts) * 100)}% conversion</p>
            </div>
            <Zap className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'alerts-winrate' && (
            <ComposedChart data={alertsWinRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  name === 'alerts' ? value : `${value}%`,
                  name === 'alerts' ? 'Alerts' : name === 'winRate' ? 'Win Rate' : 'Efficiency'
                ]}
              />
              <Bar yAxisId="left" dataKey="alerts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} />
            </ComposedChart>
          )}

          {viewMode === 'performance' && (
            <BarChart data={performanceData}>
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
                  name === 'totalReturn' ? `₹${value.toLocaleString()}` :
                  name === 'avgProfit' ? `₹${value}` :
                  name === 'sharpeRatio' ? value :
                  `-${value}%`,
                  name === 'totalReturn' ? 'Total Return' :
                  name === 'avgProfit' ? 'Avg Profit' :
                  name === 'sharpeRatio' ? 'Sharpe Ratio' :
                  'Max Drawdown'
                ]}
              />
              <Bar dataKey="totalReturn" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgProfit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}

          {viewMode === 'efficiency' && (
            <ScatterChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="alertsToTradesRatio" name="Alerts to Trades Ratio" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="winRate" name="Win Rate" stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  name === 'alertsToTradesRatio' ? `${value}%` : `${value}%`,
                  name === 'alertsToTradesRatio' ? 'Conversion Rate' : 'Win Rate'
                ]}
                labelFormatter={(label) => `Strategy: ${efficiencyData.find(d => d.alertsToTradesRatio === label)?.name}`}
              />
              <Scatter dataKey="winRate" fill="#8B5CF6" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Strategy Details Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 text-slate-400 font-medium">Strategy</th>
              <th className="text-right py-2 text-slate-400 font-medium">Alerts</th>
              <th className="text-right py-2 text-slate-400 font-medium">Trades</th>
              <th className="text-right py-2 text-slate-400 font-medium">Win Rate</th>
              <th className="text-right py-2 text-slate-400 font-medium">Avg Profit</th>
              <th className="text-right py-2 text-slate-400 font-medium">Total Return</th>
              <th className="text-right py-2 text-slate-400 font-medium">Efficiency</th>
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
                  <span className="text-blue-400">{strategy.alerts}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-purple-400">{strategy.trades}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-green-400">{strategy.winRate}%</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-cyan-400">₹{strategy.avgProfit}</span>
                </td>
                <td className="text-right py-3">
                  <span className={`font-medium ${strategy.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{strategy.totalReturn.toLocaleString()}
                  </span>
                </td>
                <td className="text-right py-3">
                  <span className="text-orange-400">{Math.round((strategy.trades / strategy.alerts) * 100)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}