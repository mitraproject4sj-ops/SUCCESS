import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExchangeData {
  exchange: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
  color: string;
  fees: number;
  avgTradeSize: number;
}

interface ExchangePNLProps {
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

export default function ExchangePNL({ className = '' }: ExchangePNLProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [viewMode, setViewMode] = useState<'bar' | 'line' | 'area'>('bar');
  const [exchangeData, setExchangeData] = useState<ExchangeData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock exchange data
  useEffect(() => {
    const generateExchangeData = () => {
      const exchanges = [
        { name: 'Binance', basePNL: 12500, baseTrades: 85, baseWinRate: 72, color: '#F59E0B' },
        { name: 'CoinDCX', basePNL: 8200, baseTrades: 62, baseWinRate: 68, color: '#10B981' },
        { name: 'Delta Exchange', basePNL: 6100, baseTrades: 45, baseWinRate: 64, color: '#3B82F6' },
        { name: 'Bybit', basePNL: 4800, baseTrades: 38, baseWinRate: 71, color: '#8B5CF6' },
        { name: 'OKX', basePNL: -2100, baseTrades: 28, baseWinRate: 43, color: '#EF4444' }
      ];

      const data = exchanges.map(exchange => {
        const pnlMultiplier = 0.7 + Math.random() * 0.6; // 0.7-1.3
        const tradesMultiplier = 0.8 + Math.random() * 0.4; // 0.8-1.2

        return {
          exchange: exchange.name,
          pnl: Math.round(exchange.basePNL * pnlMultiplier),
          trades: Math.round(exchange.baseTrades * tradesMultiplier),
          winRate: Math.round(exchange.baseWinRate + (Math.random() - 0.5) * 8),
          volume: Math.round((exchange.baseTrades * tradesMultiplier) * (1000 + Math.random() * 9000)),
          color: exchange.color,
          fees: Math.round((exchange.baseTrades * tradesMultiplier) * 0.1 * (0.05 + Math.random() * 0.05) * 100) / 100,
          avgTradeSize: Math.round(1000 + Math.random() * 4000)
        };
      });

      setExchangeData(data);
    };

    generateExchangeData();
  }, [selectedTimeframe]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const totalPNL = exchangeData.reduce((sum, exchange) => sum + exchange.pnl, 0);
  const totalTrades = exchangeData.reduce((sum, exchange) => sum + exchange.trades, 0);
  const totalVolume = exchangeData.reduce((sum, exchange) => sum + exchange.volume, 0);
  const totalFees = exchangeData.reduce((sum, exchange) => sum + exchange.fees, 0);

  const bestExchange = exchangeData.reduce((best, current) =>
    current.pnl > best.pnl ? current : best,
    exchangeData[0] || { exchange: 'N/A', pnl: 0 }
  );

  const profitableExchanges = exchangeData.filter(ex => ex.pnl > 0).length;
  const avgWinRate = exchangeData.length > 0
    ? Math.round(exchangeData.reduce((sum, ex) => sum + ex.winRate, 0) / exchangeData.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Exchange-wise PNL</h3>
            <p className="text-sm text-slate-400">Performance across exchanges</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'bar' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'line' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'area' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Area
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
              <p className="text-slate-400 text-sm">Total Exchange PNL</p>
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
              <p className="text-slate-400 text-sm">Total Volume</p>
              <p className="text-xl font-bold text-purple-400">₹{(totalVolume / 100000).toFixed(1)}L</p>
            </div>
            <BarChart3 className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Profitable Exchanges</p>
              <p className="text-xl font-bold text-green-400">{profitableExchanges}/{exchangeData.length}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Fees</p>
              <p className="text-xl font-bold text-red-400">-₹{totalFees.toFixed(2)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-red-400" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bar' && (
            <BarChart data={exchangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="exchange" stroke="#9CA3AF" fontSize={12} />
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
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {exchangeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}

          {viewMode === 'line' && (
            <LineChart data={exchangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="exchange" stroke="#9CA3AF" fontSize={12} />
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

          {viewMode === 'area' && (
            <AreaChart data={exchangeData}>
              <defs>
                <linearGradient id="exchangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="exchange" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'PNL']}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#exchangeGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Exchange Details Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 text-slate-400 font-medium">Exchange</th>
              <th className="text-right py-2 text-slate-400 font-medium">PNL</th>
              <th className="text-right py-2 text-slate-400 font-medium">Trades</th>
              <th className="text-right py-2 text-slate-400 font-medium">Win Rate</th>
              <th className="text-right py-2 text-slate-400 font-medium">Volume</th>
              <th className="text-right py-2 text-slate-400 font-medium">Fees</th>
              <th className="text-right py-2 text-slate-400 font-medium">Avg Trade</th>
            </tr>
          </thead>
          <tbody>
            {exchangeData.map((exchange, index) => (
              <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: exchange.color }}
                    ></div>
                    <span className="text-white font-medium">{exchange.exchange}</span>
                  </div>
                </td>
                <td className="text-right py-3">
                  <span className={`font-medium ${exchange.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {exchange.pnl >= 0 ? '+' : ''}₹{exchange.pnl.toLocaleString()}
                  </span>
                </td>
                <td className="text-right py-3">
                  <span className="text-white">{exchange.trades}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-cyan-400">{exchange.winRate}%</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-purple-400">₹{exchange.volume.toLocaleString()}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-red-400">-₹{exchange.fees.toFixed(2)}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-orange-400">₹{exchange.avgTradeSize}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}