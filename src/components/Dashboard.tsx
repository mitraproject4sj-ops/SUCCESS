import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, Target, 
  RefreshCw, Play, Pause, AlertCircle, CheckCircle, Clock, Wifi, WifiOff 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTradingContext } from '../context/TradingContext';
import TopCoinsPanel from './TopCoinsPanel';

export default function Dashboard() {
  const { state, fetchData } = useTradingContext();
  const { marketData, signals, isConnected, isLoading, error } = state;
  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [isLiveTrading] = useState(false);

  useEffect(() => {
    // Generate mock price chart data
    const chartData = [];
    const now = Date.now();
    const basePrice = 43250;
    
    for (let i = 24; i >= 0; i--) {
      const variance = Math.sin(i * 0.3) * 800 + Math.random() * 400;
      chartData.push({
        time: new Date(now - i * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + variance,
        volume: 50000 + Math.random() * 30000
      });
    }
    setPriceChartData(chartData);
  }, []);

  const strategyCounts = signals.reduce((acc, signal) => {
    acc[signal.strategy] = (acc[signal.strategy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSignals = signals.length;
  const highConfidenceSignals = signals.filter(s => parseFloat(s.confidence) >= 70).length;
  const buySignals = signals.filter(s => s.direction === 'BUY').length;
  const sellSignals = signals.filter(s => s.direction === 'SELL').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Trading Data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div>
            <p className="text-yellow-400 font-medium">Demo Mode Active</p>
            <p className="text-yellow-300 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Market Data Points</p>
              <p className="text-2xl font-bold text-white">{marketData.length}</p>
              <p className="text-sm text-blue-400">Live symbols</p>
            </div>
            <div className="flex items-center">
              {isConnected ? <Wifi className="h-8 w-8 text-green-400" /> : <WifiOff className="h-8 w-8 text-yellow-400" />}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Trading Signals</p>
              <p className="text-2xl font-bold text-white">{totalSignals}</p>
              <p className="text-sm text-purple-400">Active strategies</p>
            </div>
            <Zap className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">High Confidence</p>
              <p className="text-2xl font-bold text-white">{highConfidenceSignals}</p>
              <p className="text-sm text-green-400">≥70% confidence</p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">System Status</p>
              <p className="text-2xl font-bold text-green-400">{isConnected ? 'Online' : 'Demo'}</p>
              <div className="flex items-center space-x-2">
                <button className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isLiveTrading ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {isLiveTrading ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isLiveTrading ? 'Live' : 'Paper'}</span>
                </button>
              </div>
            </div>
            <Activity className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">BTC/USDT Price Chart</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                ${marketData.find(m => m.symbol === 'BTCUSDT')?.price.toFixed(2) || '43,250.00'}
              </span>
              <RefreshCw 
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
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
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }} />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#priceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Strategy Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance</h3>
          <div className="space-y-4">
            {Object.keys(strategyCounts).length > 0 ? (
              Object.entries(strategyCounts).map(([strategy, count]) => (
                <div key={strategy} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{strategy}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{count}</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / Math.max(...Object.values(strategyCounts))) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <BarChart3 className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No strategy data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Market Data & Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Market Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Last Updated:</span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {marketData.map((coin) => (
              <div key={coin.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {coin.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{coin.symbol}</p>
                    <p className="text-gray-400 text-sm">${coin.price.toFixed(coin.price < 1 ? 4 : 2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%</span>
                  </div>
                  <p className="text-gray-400 text-xs">Vol: ${(coin.volume / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trading Signals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Trading Signals</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Buy: {buySignals}</span>
              <span className="text-gray-500">|</span>
              <span className="text-sm text-gray-400">Sell: {sellSignals}</span>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {signals.map((signal, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-600 rounded-full text-xs text-white font-medium">
                      {signal.strategy}
                    </span>
                    <span className="text-white font-medium">{signal.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      signal.direction === 'BUY' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {signal.direction}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      parseFloat(signal.confidence) >= 70 ? 'bg-green-500' :
                      parseFloat(signal.confidence) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div><span className="text-gray-400">Entry: </span><span className="text-white">${signal.entry}</span></div>
                  <div><span className="text-gray-400">Confidence: </span><span className="text-white">{signal.confidence}%</span></div>
                  <div><span className="text-gray-400">Stop Loss: </span><span className="text-red-400">${signal.stopLoss}</span></div>
                  <div><span className="text-gray-400">Take Profit: </span><span className="text-green-400">${signal.takeProfit}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{signal.timestamp}</span>
                  <span className="text-xs text-gray-400">Vol: {parseInt(signal.volume).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {signals.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No signals available</p>
                <p className="text-sm">Strategies are analyzing market conditions</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Backend Status */}
      {backendStatus && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Backend Status</h3>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm">Connected</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Market Data</span>
                <span className="text-white font-bold">{backendStatus.marketDataCount}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Signals</span>
                <span className="text-white font-bold">{backendStatus.lastSignals}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Services</span>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full ${backendStatus.services?.telegram ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${backendStatus.services?.websocket ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Last Update: {backendStatus.timestamp}</p>
            <p>Status: {backendStatus.status}</p>
          </div>
        </motion.div>
      )}
      
      {/* Top 10 Cryptocurrencies Panel */}
      <div className="mt-8">
        <TopCoinsPanel />
      </div>
    </div>
  );
}
