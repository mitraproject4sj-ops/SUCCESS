import React, { useState, useEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';
import AIStrategyCoordinator from '../utils/AIStrategyCoordinator';
import StrategyManager from '../utils/StrategyManager';
import ReportingIntegration from '../utils/ReportingIntegration';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';

interface StrategyCardProps {
  strategyName: string;
  signals: any[];
  performance: any;
  isActive: boolean;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategyName, signals, performance, isActive }) => {
  const activeSignals = signals.filter(s => s.strategy === strategyName && s.direction !== 'HOLD');
  const avgConfidence = activeSignals.length > 0 ? 
    activeSignals.reduce((sum, s) => sum + s.confidence, 0) / activeSignals.length : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${isActive ? 'border-green-500' : 'border-gray-300'}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{strategyName}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Active Signals</p>
          <p className="text-2xl font-bold text-blue-600">{activeSignals.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg Confidence</p>
          <p className="text-2xl font-bold text-green-600">{avgConfidence.toFixed(1)}%</p>
        </div>
      </div>

      {performance && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className={`text-lg font-semibold ${performance.winRate > 60 ? 'text-green-600' : 'text-red-600'}`}>
              {performance.winRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total P&L</p>
            <p className={`text-lg font-semibold ${performance.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{performance.totalPnL.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {activeSignals.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Latest Signal</p>
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">{activeSignals[0].symbol}</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                activeSignals[0].direction === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activeSignals[0].direction}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Entry: ₹{activeSignals[0].entry?.toFixed(4) || 'N/A'} | 
              Confidence: {activeSignals[0].confidence.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ComprehensiveDashboard: React.FC = () => {
  const { state, fetchData, getAISignals, getConsensusSignal } = useTradingContext();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [telegramMessages, setTelegramMessages] = useState<string[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const strategyManager = StrategyManager.getInstance();
  const reportingIntegration = ReportingIntegration.getInstance();

  const strategies = [
    'Trend Rider',
    'Momentum Burst', 
    'Volume Surge',
    'Mean Reversal',
    'Breakout Hunter'
  ];

  useEffect(() => {
    const loadPerformanceData = async () => {
      const report = strategyManager.getPerformanceReport();
      setPerformanceReport(report);
    };

    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate Telegram messages for new signals
    if (state.aiSignals.length > 0) {
      const messages = state.aiSignals
        .filter(signal => signal.direction !== 'HOLD')
        .slice(0, 3) // Show only top 3
        .map(signal => reportingIntegration.createTelegramMessage(signal).message);
      
      setTelegramMessages(messages);
    }
  }, [state.aiSignals]);

  const handleGetConsensus = async () => {
    const consensus = await getConsensusSignal(selectedSymbol);
    if (consensus) {
      console.log('Consensus Signal:', consensus);
      alert(`Consensus Signal for ${selectedSymbol}: ${consensus.direction} at ${consensus.confidence.toFixed(1)}% confidence`);
    } else {
      alert('No consensus signal available');
    }
  };

  const handleExportData = () => {
    const exportData = strategyManager.exportLearningData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lakshya-strategy-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPnL = performanceReport?.totalPnL || 0;
  const dailyTarget = LAKSHYA_CONFIG.RISK.DAILY_TARGET;
  const progressPercentage = Math.min((totalPnL / dailyTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">LAKSHYA Trading Dashboard</h1>
            <p className="text-gray-600 mt-1">Advanced AI-Powered Trading Strategies</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              state.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {state.isConnected ? '🟢 Connected' : '🔴 Demo Mode'}
            </div>
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAutoMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isAutoMode ? '🤖 AUTO ON' : '👤 MANUAL'}
            </button>
          </div>
        </div>
        
        {/* Daily Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Daily Target Progress</span>
            <span className="text-sm font-medium text-gray-900">₹{totalPnL.toFixed(2)} / ₹{dailyTarget}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                totalPnL > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.abs(progressPercentage)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Target: ₹{dailyTarget}</span>
            <span className={totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Overview</h3>
          <div className="space-y-3">
            {state.marketData.slice(0, 6).map((market, index) => (
              <div key={market.symbol} className="flex justify-between items-center">
                <span className="font-medium">{market.symbol}</span>
                <div className="text-right">
                  <div className="font-semibold">₹{market.price.toFixed(4)}</div>
                  <div className={`text-sm ${market.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Signals</h3>
          <div className="space-y-3">
            {state.aiSignals.filter(s => s.direction !== 'HOLD').slice(0, 5).map((signal, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{signal.symbol}</div>
                  <div className="text-sm text-gray-600">{signal.strategy}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-sm font-medium ${
                    signal.direction === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {signal.direction}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{signal.confidence.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Telegram Alerts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {telegramMessages.length > 0 ? telegramMessages.map((message, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded text-sm border-l-4 border-blue-500">
                <pre className="whitespace-pre-wrap text-xs">{message}</pre>
              </div>
            )) : (
              <p className="text-gray-500">No alerts yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Strategy Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategyName) => (
            <StrategyCard
              key={strategyName}
              strategyName={strategyName}
              signals={state.aiSignals}
              performance={performanceReport?.strategies.get(strategyName)}
              isActive={state.aiSignals.some(s => s.strategy === strategyName && s.direction !== 'HOLD')}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Trading Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {state.marketData.map((market) => (
                <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleGetConsensus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Consensus Signal
          </button>
          
          <button
            onClick={fetchData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Refresh Data
          </button>
          
          <button
            onClick={handleExportData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Export Strategy Data
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      {performanceReport && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{performanceReport.totalTrades}</div>
              <div className="text-sm text-gray-600">Total Trades</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{performanceReport.overallWinRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${performanceReport.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{performanceReport.totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total P&L</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{strategies.length}</div>
              <div className="text-sm text-gray-600">Active Strategies</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveDashboard;