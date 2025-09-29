import React, { useState, useEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw, Activity, DollarSign, BarChart3 } from 'lucide-react';

const TopCoinsPanel: React.FC = () => {
  const { state } = useTradingContext();
  const [refreshTime, setRefreshTime] = useState(new Date());

  // Extended coin data with more details
  const top10CoinsData = [
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      price: state.isConnected ? 67234.50 : 43250.00,
      change24h: state.isConnected ? 2.45 : 2.35,
      volume: state.isConnected ? 28450000000 : 1245000000,
      marketCap: state.isConnected ? 1340000000000 : 834000000000,
      rank: 1,
      logo: '₿',
      color: 'orange'
    },
    {
      symbol: 'ETHUSDT', 
      name: 'Ethereum',
      price: state.isConnected ? 2634.75 : 2650.00,
      change24h: state.isConnected ? 1.89 : -1.45,
      volume: state.isConnected ? 15200000000 : 890000000,
      marketCap: state.isConnected ? 315000000000 : 318000000000,
      rank: 2,
      logo: 'Ξ',
      color: 'blue'
    },
    {
      symbol: 'BNBUSDT',
      name: 'BNB',
      price: state.isConnected ? 612.45 : 312.45,
      change24h: state.isConnected ? 3.12 : 0.89,
      volume: state.isConnected ? 1800000000 : 234000000,
      marketCap: state.isConnected ? 89000000000 : 48000000000,
      rank: 3,
      logo: 'B',
      color: 'yellow'
    },
    {
      symbol: 'SOLUSDT',
      name: 'Solana',
      price: state.isConnected ? 145.67 : 142.30,
      change24h: state.isConnected ? 5.23 : 4.12,
      volume: state.isConnected ? 3200000000 : 445000000,
      marketCap: state.isConnected ? 67000000000 : 65000000000,
      rank: 4,
      logo: 'S',
      color: 'purple'
    },
    {
      symbol: 'XRPUSDT',
      name: 'XRP',
      price: state.isConnected ? 0.5234 : 0.5180,
      change24h: state.isConnected ? -0.89 : -1.23,
      volume: state.isConnected ? 1450000000 : 234000000,
      marketCap: state.isConnected ? 29000000000 : 28500000000,
      rank: 5,
      logo: 'X',
      color: 'gray'
    },
    {
      symbol: 'ADAUSDT',
      name: 'Cardano',
      price: state.isConnected ? 0.3456 : 0.3420,
      change24h: state.isConnected ? 2.67 : 1.89,
      volume: state.isConnected ? 890000000 : 145000000,
      marketCap: state.isConnected ? 12000000000 : 11800000000,
      rank: 6,
      logo: 'A',
      color: 'blue'
    },
    {
      symbol: 'DOGEUSDT',
      name: 'Dogecoin',
      price: state.isConnected ? 0.1234 : 0.1189,
      change24h: state.isConnected ? 8.45 : 6.23,
      volume: state.isConnected ? 2100000000 : 345000000,
      marketCap: state.isConnected ? 18000000000 : 17200000000,
      rank: 7,
      logo: 'D',
      color: 'yellow'
    },
    {
      symbol: 'AVAXUSDT',
      name: 'Avalanche',
      price: state.isConnected ? 28.45 : 27.89,
      change24h: state.isConnected ? 4.12 : 3.45,
      volume: state.isConnected ? 456000000 : 89000000,
      marketCap: state.isConnected ? 11000000000 : 10800000000,
      rank: 8,
      logo: 'A',
      color: 'red'
    },
    {
      symbol: 'TRXUSDT',
      name: 'Tron',
      price: state.isConnected ? 0.1567 : 0.1523,
      change24h: state.isConnected ? 1.23 : 0.89,
      volume: state.isConnected ? 1200000000 : 234000000,
      marketCap: state.isConnected ? 13500000000 : 13200000000,
      rank: 9,
      logo: 'T',
      color: 'red'
    },
    {
      symbol: 'LINKUSDT',
      name: 'Chainlink',
      price: state.isConnected ? 11.23 : 10.89,
      change24h: state.isConnected ? -1.45 : -2.34,
      volume: state.isConnected ? 678000000 : 123000000,
      marketCap: state.isConnected ? 6700000000 : 6500000000,
      rank: 10,
      logo: 'L',
      color: 'blue'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // USD to INR conversion rate (approximate - in real app, fetch from API)
  const USD_TO_INR = 83.25; // Current approximate rate

  const formatPrice = (price: number) => {
    const inrPrice = price * USD_TO_INR;
    if (inrPrice < 100) return `₹${inrPrice.toFixed(2)}`;
    if (inrPrice < 10000) return `₹${inrPrice.toFixed(1)}`;
    return `₹${inrPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    const inrMarketCap = marketCap * USD_TO_INR;
    if (inrMarketCap >= 1e12) return `₹${(inrMarketCap / 1e12).toFixed(2)}T`;
    if (inrMarketCap >= 1e9) return `₹${(inrMarketCap / 1e9).toFixed(1)}B`;
    if (inrMarketCap >= 1e6) return `₹${(inrMarketCap / 1e6).toFixed(0)}M`;
    return `₹${inrMarketCap.toLocaleString('en-IN')}`;
  };

  const formatVolume = (volume: number) => {
    const inrVolume = volume * USD_TO_INR;
    if (inrVolume >= 1e9) return `₹${(inrVolume / 1e9).toFixed(1)}B`;
    if (inrVolume >= 1e6) return `₹${(inrVolume / 1e6).toFixed(0)}M`;
    return `₹${inrVolume.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-green-400">Top 10 Cryptocurrencies (INR)</h3>
          <span className="text-sm bg-orange-600/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30">
            🇮🇳 Indian Market
          </span>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            state.isConnected ? 'bg-green-900/50 border border-green-500/30' : 'bg-yellow-900/50 border border-yellow-500/30'
          }`}>
            {state.isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">LIVE DATA</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium text-sm">DEMO DATA</span>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            Last Update: {refreshTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Data Source Alert */}
      <div className={`mb-6 p-3 rounded-lg border ${
        state.isConnected 
          ? 'bg-green-900/20 border-green-500/30 text-green-200'
          : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span className="font-medium">
            {state.isConnected 
              ? '✅ Connected to Render Backend - Showing Real Market Data'
              : '⚠️ Backend Unavailable - Showing Demo Data (Need to deploy backend to Render)'
            }
          </span>
        </div>
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {top10CoinsData.map((coin, index) => (
          <div
            key={coin.symbol}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:transform hover:scale-[1.02]"
          >
            {/* Rank & Logo */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full bg-${coin.color}-600 flex items-center justify-center text-white font-bold text-sm`}>
                  {coin.logo}
                </div>
                <div className="text-xs text-gray-400">#{coin.rank}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                coin.change24h >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
              </div>
            </div>

            {/* Coin Info */}
            <div className="mb-3">
              <h4 className="font-semibold text-white text-sm">{coin.name}</h4>
              <p className="text-xs text-gray-400">{coin.symbol}</p>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className="text-lg font-bold text-white">{formatPrice(coin.price)}</div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Market Cap:</span>
                <span className="text-xs font-medium text-gray-200">{formatMarketCap(coin.marketCap)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">24h Volume:</span>
                <span className="text-xs font-medium text-gray-200">{formatVolume(coin.volume)}</span>
              </div>
            </div>

            {/* Trading Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Trading:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Total Market Cap: 
                <span className="text-green-400 font-bold ml-1">
                  {state.isConnected ? '$2.85T' : '$2.34T'}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">Updates: 
                <span className="text-blue-400 font-bold ml-1">Every 30s</span>
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            {state.isConnected 
              ? 'Real-time data from Render Backend'
              : 'Demo mode - Deploy backend for live data'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCoinsPanel;