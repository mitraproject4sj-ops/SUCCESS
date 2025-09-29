import React, { useState, useEffect, useMemo } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';
import TopCoinsPanel from './TopCoinsPanel';
import ConnectionStatus from './ConnectionStatus';

// Enhanced interfaces for the new features
interface TradeOverview {
  totalCapital: number;
  wins: number;
  losses: number;
  winRate: number;
  totalTrades: number;
  netPnL: number;
  period: string;
}

interface ExchangeStats {
  exchange: string;
  wins: number;
  losses: number;
  totalTrades: number;
  winRate: number;
  pnL: number;
}

interface StrategyContribution {
  strategy: string;
  contribution: number;
  trades: number;
  winRate: number;
  pnL: number;
}

interface PnLData {
  totalCapitalAllocated: number;
  moneyAtRisk: number;
  availableCapital: number;
  utilizationRate: number;
  activeTrades: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

interface ConfidenceSettings {
  minConfidence: number;
  maxConfidence: number;
  autoTradeEnabled: boolean;
  strategyWeights: { [key: string]: boolean };
}

const ProfessionalTradingDashboard: React.FC = () => {
  const { state, fetchData, getAISignals, getConsensusSignal } = useTradingContext();
  
  // State for dashboard controls
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '12M'>('1D');
  const [confidenceSettings, setConfidenceSettings] = useState<ConfidenceSettings>({
    minConfidence: 75,
    maxConfidence: 95,
    autoTradeEnabled: false,
    strategyWeights: {
      'Trend Rider': true,
      'Momentum Burst': true,
      'Volume Surge': true,
      'Mean Reversal': true,
      'Breakout Hunter': true
    }
  });
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(['Trend Rider', 'Momentum Burst', 'Volume Surge', 'Mean Reversal', 'Breakout Hunter']);

  // Calculate trade overview data
  const tradeOverview = useMemo((): TradeOverview => {
    const trades = [...state.activeTrades, ...state.completedTrades];
    const wins = trades.filter(t => t.pnl && t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl && t.pnl < 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    return {
      totalCapital: LAKSHYA_CONFIG.RISK.CAPITAL_ALLOCATION.TOTAL,
      wins,
      losses,
      winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
      totalTrades: trades.length,
      netPnL: totalPnL,
      period: selectedPeriod
    };
  }, [state.activeTrades, state.completedTrades, selectedPeriod]);

  // Calculate dynamic PnL data
  const pnlData = useMemo((): PnLData => {
    const activeTrades = state.activeTrades;
    const moneyAtRisk = activeTrades.reduce((sum, trade) => sum + (trade.quantity * trade.entry), 0);
    const unrealizedPnL = activeTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const realizedPnL = state.completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const availableCapital = LAKSHYA_CONFIG.RISK.CAPITAL_ALLOCATION.TOTAL - moneyAtRisk;
    const utilizationRate = (moneyAtRisk / LAKSHYA_CONFIG.RISK.CAPITAL_ALLOCATION.TOTAL) * 100;

    return {
      totalCapitalAllocated: LAKSHYA_CONFIG.RISK.CAPITAL_ALLOCATION.TOTAL,
      moneyAtRisk,
      availableCapital,
      utilizationRate,
      activeTrades: activeTrades.length,
      unrealizedPnL,
      realizedPnL
    };
  }, [state.activeTrades, state.completedTrades]);

  // Calculate exchange-wise statistics
  const exchangeStats = useMemo((): ExchangeStats[] => {
    const exchanges = ['Binance', 'CoinDCX', 'Delta'];
    return exchanges.map(exchange => {
      const trades = [...state.activeTrades, ...state.completedTrades].filter(t => t.exchange === exchange);
      const wins = trades.filter(t => t.pnl && t.pnl > 0).length;
      const losses = trades.filter(t => t.pnl && t.pnl < 0).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      return {
        exchange,
        wins,
        losses,
        totalTrades: trades.length,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        pnL: totalPnL
      };
    });
  }, [state.activeTrades, state.completedTrades]);

  // Calculate strategy contribution
  const strategyContribution = useMemo((): StrategyContribution[] => {
    const strategies = ['Trend Rider', 'Momentum Burst', 'Volume Surge', 'Mean Reversal', 'Breakout Hunter'];
    return strategies.map(strategy => {
      const trades = [...state.activeTrades, ...state.completedTrades].filter(t => t.strategy === strategy);
      const wins = trades.filter(t => t.pnl && t.pnl > 0).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const totalTrades = tradeOverview.totalTrades;
      
      return {
        strategy,
        contribution: totalTrades > 0 ? (trades.length / totalTrades) * 100 : 0,
        trades: trades.length,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        pnL: totalPnL
      };
    });
  }, [state.activeTrades, state.completedTrades, tradeOverview.totalTrades]);

  const periods = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '12M', label: '12 Months' }
  ];

  const handleConfidenceChange = (setting: keyof ConfidenceSettings, value: any) => {
    setConfidenceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleStrategyToggle = (strategy: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  // Auto-refresh at 8:59 AM daily
  useEffect(() => {
    const now = new Date();
    const target = new Date();
    target.setHours(8, 59, 0, 0);
    
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }
    
    const timeUntilRefresh = target.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      fetchData();
      // Set up daily interval
      setInterval(fetchData, 24 * 60 * 60 * 1000);
    }, timeUntilRefresh);
    
    return () => clearTimeout(timeout);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header with Professional Styling */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6 border border-blue-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">LAKSHYA Professional Trading 🇮🇳</h1>
            <p className="text-blue-200">Advanced AI-Powered Indian Trading System</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg ${state.isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
              {state.isConnected ? '🟢 Live' : '🔴 Demo'}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Last Update</div>
              <div className="font-semibold">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row - Trade Overview & Dynamic PnL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* 1. Trade Overview Box */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-400">Trade Overview</h3>
            <div className="flex space-x-2">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedPeriod === period.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">₹{tradeOverview.totalCapital.toLocaleString()}</div>
              <div className="text-gray-300">Total Capital</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{tradeOverview.winRate.toFixed(1)}%</div>
              <div className="text-gray-300">Win Rate</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{tradeOverview.wins}</div>
              <div className="text-gray-300">Wins</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{tradeOverview.losses}</div>
              <div className="text-gray-300">Losses</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Net P&L ({selectedPeriod})</span>
              <span className={`text-xl font-bold ${tradeOverview.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{tradeOverview.netPnL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Dynamic PnL Box */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-green-400 mb-4">Dynamic P&L Monitor</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Total Capital Allocated</span>
              <span className="text-lg font-bold text-blue-400">₹{pnlData.totalCapitalAllocated.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Money at Risk (Live)</span>
              <span className="text-lg font-bold text-yellow-400">₹{pnlData.moneyAtRisk.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Available Capital</span>
              <span className="text-lg font-bold text-green-400">₹{pnlData.availableCapital.toFixed(2)}</span>
            </div>
            
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Capital Utilization</span>
                <span className="text-sm font-medium">{pnlData.utilizationRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(pnlData.utilizationRate, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className={`text-xl font-bold ${pnlData.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{pnlData.unrealizedPnL.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Unrealized P&L</div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className={`text-xl font-bold ${pnlData.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{pnlData.realizedPnL.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Realized P&L</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row - Strategy Performance Chart & Exchange Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* 3. Strategy Performance Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Strategy Contribution</h3>
          
          <div className="space-y-4">
            {strategyContribution.map((strategy, index) => (
              <div key={strategy.strategy} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-300">{strategy.strategy}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">{strategy.contribution.toFixed(1)}%</span>
                    <div className={`text-sm font-medium ${strategy.pnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{strategy.pnL.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-yellow-500' : 
                      index === 3 ? 'bg-purple-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(strategy.contribution, 5)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Trades: {strategy.trades}</span>
                  <span>Win Rate: {strategy.winRate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Exchange-wise Win/Loss */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-orange-400 mb-4">Exchange Performance</h3>
          
          <div className="space-y-4">
            {exchangeStats.map((exchange) => (
              <div key={exchange.exchange} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-lg text-white">{exchange.exchange}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    exchange.winRate >= 60 ? 'bg-green-600' : 
                    exchange.winRate >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {exchange.winRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-400">{exchange.wins}</div>
                    <div className="text-xs text-gray-400">Wins</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400">{exchange.losses}</div>
                    <div className="text-xs text-gray-400">Losses</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-400">{exchange.totalTrades}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <span className={`text-lg font-bold ${exchange.pnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{exchange.pnL.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">P&L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Confidence Settings & Strategy Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5. Confidence Settings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Confidence Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Confidence for Auto Trade
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={confidenceSettings.minConfidence}
                  onChange={(e) => handleConfidenceChange('minConfidence', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center font-bold text-blue-400">
                  {confidenceSettings.minConfidence}%
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Confidence Limit
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="80"
                  max="100"
                  value={confidenceSettings.maxConfidence}
                  onChange={(e) => handleConfidenceChange('maxConfidence', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center font-bold text-green-400">
                  {confidenceSettings.maxConfidence}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-300">Enable Auto Trading</span>
              <button
                onClick={() => handleConfidenceChange('autoTradeEnabled', !confidenceSettings.autoTradeEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  confidenceSettings.autoTradeEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    confidenceSettings.autoTradeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="text-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Apply Settings
              </button>
            </div>
          </div>
        </div>

        {/* 6. Strategy Selection */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Strategy Selection</h3>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-3">
              Select strategies for active trading (individual or combination)
            </div>
            
            {strategyContribution.map((strategy) => (
              <div key={strategy.strategy} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedStrategies.includes(strategy.strategy)}
                    onChange={() => handleStrategyToggle(strategy.strategy)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-300">{strategy.strategy}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-400">{strategy.winRate.toFixed(1)}%</div>
                  <div className={`text-xs ${strategy.pnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{strategy.pnL.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-600">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedStrategies(['Trend Rider', 'Momentum Burst', 'Volume Surge', 'Mean Reversal', 'Breakout Hunter'])}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm transition-colors"
                >
                  Select All
                </button>
                <button 
                  onClick={() => setSelectedStrategies([])}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="mt-3 text-center text-sm text-gray-400">
                {selectedStrategies.length} of 5 strategies selected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status Row */}
      <div className="grid grid-cols-1 gap-6">
        <ConnectionStatus />
      </div>

      {/* New Bottom Row - Top 10 Cryptocurrency Cards */}
      <div className="mt-6">
        <TopCoinsPanel />
      </div>
      
      {/* Indian Designer Credit */}
      <div className="mt-6 text-center">
        <div className="flex justify-center items-center space-x-2">
          <span className="text-xl">🇮🇳</span>
          <p className="text-sm font-semibold text-orange-400">
            Concept and Designed by: SHAILENDRA JAISWAL
          </p>
          <span className="text-xl">🇮🇳</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTradingDashboard;