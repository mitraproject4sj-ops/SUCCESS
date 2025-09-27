import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, Target, RefreshCw, Play, Pause, Calendar, Filter, Search, Settings, Bell, User } from 'lucide-react';
import TradingControlPanel from './TradingControlPanel';

// Enhanced Trading Dashboard Component
export default function TradingDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLiveTrading, setIsLiveTrading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Effect to update PNL data based on selected timeframe
  useEffect(() => {
    // Function to generate PNL data for different timeframes
    const generatePnlData = (days: number) => {
      const data = [];
      const now = new Date();
      const baseCapital = 50000;
      let runningCapital = baseCapital;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const pnl = Math.random() > 0.4 
          ? Math.round(Math.random() * 3000) 
          : -Math.round(Math.random() * 2000);
        
        runningCapital += pnl;
        
        data.push({
          date: date.toISOString().split('T')[0],
          pnl: pnl,
          trades: Math.round(Math.random() * 20) + 5,
          winRate: Math.round(Math.random() * 30) + 50,
          capital: runningCapital
        });
      }
      return data;
    };

    // Map timeframe to number of days
    const timeframeDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365
    }[selectedTimeframe] || 7;

    // Update PNL data based on selected timeframe
    const newPnlData = generatePnlData(timeframeDays);
    setDailyPnlData(newPnlData);
  }, [selectedTimeframe]);

  // Mock data for comprehensive dashboard
  const [marketData] = useState([
    { symbol: 'BTCUSDT', price: 43250, change24h: -2.45, volume: 125000000, high24h: 44200, low24h: 42100, marketCap: '₹196827.9B', signal: 'BEARISH' },
    { symbol: 'ETHUSDT', price: 2650, change24h: 3.28, volume: 85000000, high24h: 2720, low24h: 2580, marketCap: '₹45895.6B', signal: 'BULLISH' },
    { symbol: 'BNBUSDT', price: 312.45, change24h: 1.87, volume: 15000000, high24h: 325, low24h: 305, marketCap: '₹10816.9B', signal: 'BULLISH' },
    { symbol: 'XRPUSDT', price: 0.61, change24h: -1.62, volume: 5000000, high24h: 0.65, low24h: 0.59, marketCap: '₹15581.1B', signal: 'BEARISH' },
    { symbol: 'SOLUSDT', price: 98.73, change24h: 4.25, volume: 25000000, high24h: 102.5, low24h: 94.8, marketCap: '₹10531.2B', signal: 'BULLISH' },
    { symbol: 'ADAUSDT', price: 0.52, change24h: -0.85, volume: 8000000, high24h: 0.55, low24h: 0.51, marketCap: '₹3036.9B', signal: 'BEARISH' }
  ]);

  // Daily PNL Data
  const [dailyPnlData, setDailyPnlData] = useState([
    { date: '2025-01-15', pnl: 2580, trades: 15, winRate: 73, capital: 50000 },
    { date: '2025-01-16', pnl: -1200, trades: 12, winRate: 42, capital: 52580 },
    { date: '2025-01-17', pnl: 3400, trades: 18, winRate: 78, capital: 51380 },
    { date: '2025-01-18', pnl: 1850, trades: 14, winRate: 64, capital: 54780 },
    { date: '2025-01-19', pnl: -800, trades: 10, winRate: 40, capital: 56630 },
    { date: '2025-01-20', pnl: 4200, trades: 22, winRate: 82, capital: 55830 },
    { date: '2025-01-21', pnl: 2100, trades: 16, winRate: 69, capital: 60030 }
  ]);

  // Active Trades Data with Risk
  const [activeTrades] = useState([
    { symbol: 'BTCUSDT', entryPrice: 43250, stopLoss: 42800, quantity: 0.5, riskAmount: 225 },
    { symbol: 'ETHUSDT', entryPrice: 2650, stopLoss: 2620, quantity: 2, riskAmount: 60 },
    { symbol: 'BNBUSDT', entryPrice: 312.45, stopLoss: 308, quantity: 5, riskAmount: 122.25 }
  ]);

  // Calculate Active Capital (Money at Risk)
  const calculateActiveCapital = () => {
    return activeTrades.reduce((total, trade) => total + trade.riskAmount, 0);
  };

  // Capital Utilization Data with new Active Capital calculation
  const [capitalData, setCapitalData] = useState(() => {
    const baseData = [
      { time: '09:00', totalCapital: 60000 },
      { time: '10:00', totalCapital: 60000 },
      { time: '11:00', totalCapital: 60000 },
      { time: '12:00', totalCapital: 60000 },
      { time: '13:00', totalCapital: 60000 },
      { time: '14:00', totalCapital: 60000 },
      { time: '15:00', totalCapital: 60000 }
    ];
    
    const activeCapital = calculateActiveCapital();
    return baseData.map(data => ({
      ...data,
      activeCapital,
      utilization: Math.round((activeCapital / data.totalCapital) * 100)
    }));
  });

  // Exchange-wise Performance
  const [exchangeData] = useState([
    { exchange: 'Binance', profit: 8450, trades: 45, winRate: 67, color: '#f59e0b' },
    { exchange: 'Bybit', profit: 5200, trades: 28, winRate: 71, color: '#10b981' },
    { exchange: 'OKX', profit: -1200, trades: 15, winRate: 40, color: '#ef4444' },
    { exchange: 'Kucoin', profit: 3100, trades: 22, winRate: 64, color: '#8b5cf6' }
  ]);

  // Strategy Performance
  const [strategyPerformance] = useState([
    { strategy: 'MomentumBurst', signals: 145, profit: 6780, winRate: 72, avgProfit: 46.7 },
    { strategy: 'TrendRider', signals: 98, profit: 4520, winRate: 68, avgProfit: 46.1 },
    { strategy: 'VolumeSurge', signals: 76, profit: 2890, winRate: 63, avgProfit: 38.0 },
    { strategy: 'MeanReversal', signals: 65, profit: 1850, winRate: 58, avgProfit: 28.5 },
    { strategy: 'BreakoutHunter', signals: 52, profit: 3200, winRate: 75, avgProfit: 61.5 }
  ]);

  // Recent Trading Activity
  const [recentTrades] = useState([
    { symbol: 'BTCUSDT', strategy: 'MomentumBurst', direction: 'BUY', entry: 43250, exit: 43780, pnl: 530, time: '14:35' },
    { symbol: 'ETHUSDT', strategy: 'TrendRider', direction: 'SELL', entry: 2650, exit: 2598, pnl: 520, time: '14:22' },
    { symbol: 'BNBUSDT', strategy: 'VolumeSurge', direction: 'BUY', entry: 312, exit: 318, pnl: 600, time: '14:18' },
    { symbol: 'XRPUSDT', strategy: 'BreakoutHunter', direction: 'SELL', entry: 0.615, exit: 0.608, pnl: -70, time: '14:15' },
    { symbol: 'SOLUSDT', strategy: 'MomentumBurst', direction: 'BUY', entry: 98.5, exit: 101.2, pnl: 270, time: '14:08' }
  ]);

  const totalPnL = dailyPnlData.reduce((sum, day) => sum + day.pnl, 0);
  const totalTrades = dailyPnlData.reduce((sum, day) => sum + day.trades, 0);
  const avgWinRate = Math.round(dailyPnlData.reduce((sum, day) => sum + day.winRate, 0) / dailyPnlData.length);
  const currentCapital = dailyPnlData[dailyPnlData.length - 1].capital;
  const activeCapital = capitalData[capitalData.length - 1].activeCapital;

  const filteredMarketData = marketData.filter(coin => 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cyan-400">Mitra Signals</h1>
                <p className="text-xs text-slate-400">Advanced Trading Analytics</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live Trading</span>
            </div>
            <span className="text-slate-300 text-sm">Last Update: {new Date().toLocaleTimeString()}</span>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total P&L (7d)</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{totalPnL.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Capital (Risk)</p>
                <p className="text-2xl font-bold text-cyan-400">₹{calculateActiveCapital().toLocaleString()}</p>
                <div className="mt-2 text-xs text-slate-400">
                  <p>Active Trades: {activeTrades.length}</p>
                  <p>Avg Risk/Trade: ₹{(calculateActiveCapital() / activeTrades.length || 0).toFixed(2)}</p>
                </div>
                <p className="text-xs text-slate-400">of ₹{currentCapital.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Trades</p>
                <p className="text-2xl font-bold text-white">{totalTrades}</p>
                <p className="text-xs text-green-400">{avgWinRate}% Win Rate</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Status</p>
                <p className="text-2xl font-bold text-green-400">Online</p>
                <button 
                  onClick={() => setIsLiveTrading(!isLiveTrading)} 
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs mt-1 ${isLiveTrading ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                >
                  {isLiveTrading ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isLiveTrading ? 'Live' : 'Paper'}</span>
                </button>
              </div>
              <Zap className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Trading Control Panel */}
        <div className="mb-6">
          <TradingControlPanel />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily PNL Chart */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Daily P&L Curve</h3>
              <select 
                className="bg-slate-700 text-white text-sm rounded-lg px-2 py-1"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">3 Months</option>
                <option value="365d">12 Months</option>
              </select>
              <div className="ml-4 px-2 py-1 bg-blue-500/20 rounded-lg text-xs text-blue-400">
                <span>Risk/Trade: ₹{(calculateActiveCapital() / activeTrades.length || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyPnlData}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      if (selectedTimeframe === '1d') {
                        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      } else if (selectedTimeframe === '365d') {
                        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      } else {
                        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                      }
                    }} 
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                    formatter={(value, name) => [`₹${value}`, 'P&L']}
                  />
                  <Area type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} fill="url(#pnlGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Capital Utilization */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Capital Utilization</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capitalData}>
                  <defs>
                    <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                    formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'activeCapital' ? 'Active Capital' : 'Total Capital']}
                  />
                  <Area type="monotone" dataKey="activeCapital" stroke="#3b82f6" strokeWidth={2} fill="url(#capitalGradient)" />
                  <Line type="monotone" dataKey="totalCapital" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exchange Performance */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Exchange Performance</h3>
            <div className="space-y-3">
              {exchangeData.map((exchange, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: exchange.color }} />
                    <div>
                      <p className="text-white font-medium text-sm">{exchange.exchange}</p>
                      <p className="text-slate-400 text-xs">{exchange.trades} trades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${exchange.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{exchange.profit.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-xs">{exchange.winRate}% win</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Data and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Market Data */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Live Market Data</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {filteredMarketData.map((coin, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {coin.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{coin.symbol}</p>
                        <p className="text-slate-400 text-xs">Vol: ₹{(coin.volume / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      coin.signal === 'BULLISH' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {coin.signal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">₹{coin.price.toFixed(2)}</span>
                    <div className={`flex items-center space-x-1 ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="text-xs font-medium">{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Performance */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {strategyPerformance.map((strategy, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{strategy.strategy}</span>
                    <span className={`font-bold ${strategy.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{strategy.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-slate-400">Signals: </span><span className="text-white">{strategy.signals}</span></div>
                    <div><span className="text-slate-400">Win Rate: </span><span className="text-white">{strategy.winRate}%</span></div>
                    <div><span className="text-slate-400">Avg: </span><span className="text-white">₹{strategy.avgProfit}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trading Activity */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Trading Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Time</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Symbol</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Strategy</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Direction</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Entry</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Exit</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, index) => (
                  <tr key={index} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-3 text-slate-300">{trade.time}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {trade.symbol.substring(0, 2)}
                        </div>
                        <span className="text-white font-medium">{trade.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-blue-600 rounded-full text-xs text-white">
                        {trade.strategy}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trade.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">₹{trade.entry}</td>
                    <td className="py-3 px-3 text-white">₹{trade.exit}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}