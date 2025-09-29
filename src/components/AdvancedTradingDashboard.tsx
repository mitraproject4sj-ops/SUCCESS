import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, Target, RefreshCw, Play, Pause, Calendar, Filter, Search, Settings, Bell, User, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TradingControlPanel from './TradingControlPanel';
import PerformanceMetrics from './PerformanceMetrics';
import TradeHeatmap from './TradeHeatmap';
import TotalPNLDashboard from './TotalPNLDashboard';
import DynamicPNL from './DynamicPNL';
import StrategyContribution from './StrategyContribution';
import ExchangePNL from './ExchangePNL';
import StrategyConfidenceControl from './StrategyConfidenceControl';
import StrategySelectionControl from './StrategySelectionControl';
import StrategyComparisonPanel from './StrategyComparisonPanel';
import { exportToCSV } from '../utils/exportData';
import { calculateAdvancedMetrics } from '../utils/advancedMetrics';
import { useTradingContext } from '../context/TradingContext';

// Enhanced Trading Dashboard Component
export default function AdvancedTradingDashboard() {
  const { state, fetchData } = useTradingContext();
  const { marketData, signals, isConnected, isLoading, error } = state;

  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLiveTrading, setIsLiveTrading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Transform market data for heatmap
  const heatmapData = marketData.flatMap(coin =>
    Array.from({ length: 7 }, (_, dayIndex) =>
      Array.from({ length: 24 }, (_, hour) => ({
        hour,
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex],
        value: Math.random() * coin.volume * 0.01, // Mock trading volume for heatmap
        trades: Math.floor(Math.random() * 50) + 10
      }))
    ).flat()
  ).slice(0, 168); // Limit to 7 days * 24 hours

  // Calculate derived data from real signals
  const strategyCounts = signals.reduce((acc, signal) => {
    acc[signal.strategy] = (acc[signal.strategy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSignals = signals.length;
  const highConfidenceSignals = signals.filter(s => s.confidence >= 70).length;
  const buySignals = signals.filter(s => s.direction === 'BUY').length;
  const sellSignals = signals.filter(s => s.direction === 'SELL').length;

  // Generate strategy performance data from signals
  const strategyPerformance = Object.entries(strategyCounts).map(([strategy, count]) => ({
    name: strategy,
    value: count * Math.random() * 1000 + 1000, // Mock profit calculation
    percentage: Math.round((count / totalSignals) * 100),
    color: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'][Math.floor(Math.random() * 5)]
  }));

  // Generate price chart data
  const [priceChartData, setPriceChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock price chart data based on market data
    const chartData = [];
    const now = Date.now();
    const basePrice = marketData.length > 0 ? marketData[0].price : 43250;

    for (let i = 24; i >= 0; i--) {
      const variance = Math.sin(i * 0.3) * 800 + Math.random() * 400;
      chartData.push({
        time: new Date(now - i * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + variance,
        volume: 50000 + Math.random() * 30000
      });
    }
    setPriceChartData(chartData);
  }, [marketData]);

  // Filter market data based on search
  const filteredMarketData = marketData.filter(coin =>
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Trading Data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-6">
      {/* Connection Status Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-center space-x-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Demo Mode Active</p>
            <p className="text-yellow-300 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">LAKSHYA Trading Dashboard</h1>
              <p className="text-sm text-slate-400">Real-time market analytics & signals</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-3">
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {isConnected ? 'Live Data' : 'Demo Mode'}
            </span>
          </div>

          {/* Live Trading Toggle */}
          <button
            onClick={() => setIsLiveTrading(!isLiveTrading)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLiveTrading
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isLiveTrading ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isLiveTrading ? 'Stop Trading' : 'Start Trading'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Market Data</p>
              <p className="text-2xl font-bold text-white">{marketData.length}</p>
              <p className="text-sm text-blue-400">Active symbols</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Trading Signals</p>
              <p className="text-2xl font-bold text-white">{totalSignals}</p>
              <p className="text-sm text-purple-400">Active strategies</p>
            </div>
            <Zap className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">High Confidence</p>
              <p className="text-2xl font-bold text-white">{highConfidenceSignals}</p>
              <p className="text-sm text-green-400">≥70% confidence</p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">System Status</p>
              <p className="text-2xl font-bold text-green-400">Online</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLiveTrading ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-xs text-slate-400">{isLiveTrading ? 'Live' : 'Paper'}</span>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">BTC/USDT Price Chart</h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  ${marketData.find(m => m.symbol === 'BTCUSDT')?.price.toFixed(2) || '43,250.00'}
                </span>
                <RefreshCw
                  className="h-5 w-5 text-slate-400 cursor-pointer hover:text-white transition-colors"
                  onClick={fetchData}
                />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Market Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Market Overview</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400 font-medium">Symbol</th>
                    <th className="text-right py-2 text-slate-400 font-medium">Price</th>
                    <th className="text-right py-2 text-slate-400 font-medium">24h Change</th>
                    <th className="text-right py-2 text-slate-400 font-medium">Volume</th>
                    <th className="text-center py-2 text-slate-400 font-medium">Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarketData.slice(0, 10).map((coin, index) => {
                    const coinSignals = signals.filter(s => s.symbol === coin.symbol);
                    return (
                      <tr key={coin.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {coin.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{coin.symbol}</p>
                              <p className="text-xs text-slate-400">Crypto</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3">
                          <p className="font-medium text-white">${coin.price.toFixed(2)}</p>
                        </td>
                        <td className="text-right py-3">
                          <span className={`font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right py-3">
                          <p className="font-medium text-white">{(coin.volume / 1000000).toFixed(1)}M</p>
                        </td>
                        <td className="text-center py-3">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            {coinSignals.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Signals & Analytics */}
        <div className="space-y-6">
          {/* Trading Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Trading Signals</h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  {buySignals} BUY
                </span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                  {sellSignals} SELL
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {signals.slice(0, 8).map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      signal.direction === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-white text-sm">{signal.symbol}</p>
                      <p className="text-xs text-slate-400">{signal.strategy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      signal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {signal.direction}
                    </p>
                    <p className="text-xs text-slate-400">{signal.confidence}%</p>
                  </div>
                </div>
              ))}
              {signals.length === 0 && (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No active signals</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Strategy Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance</h3>
            <div className="space-y-3">
              {strategyPerformance.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: strategy.color }}
                    ></div>
                    <span className="text-white text-sm font-medium">{strategy.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">₹{strategy.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{strategy.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - All New Components */}
      <div className="mt-6 space-y-6">
        {/* Total PNL Dashboard */}
        <TotalPNLDashboard />

        {/* Dynamic PNL and Strategy Contribution */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DynamicPNL />
          <StrategyContribution />
        </div>

        {/* Exchange PNL */}
        <ExchangePNL />

        {/* Strategy Controls */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <StrategyConfidenceControl />
          <StrategySelectionControl />
        </div>

        {/* Strategy Comparison Panel */}
        <StrategyComparisonPanel />

        {/* Original Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingControlPanel />
          <TradeHeatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}