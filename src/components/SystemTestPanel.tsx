import React, { useState, useEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';
import RealPriceService from '../utils/RealPriceService';
import GoogleSheetsIntegration from '../utils/GoogleSheetsIntegration';

interface SystemStatus {
  backend: 'connected' | 'disconnected' | 'testing';
  realPrices: 'connected' | 'disconnected' | 'testing';
  googleSheets: 'connected' | 'disconnected' | 'testing';
}

const SystemTestPanel: React.FC = () => {
  const { state, fetchData } = useTradingContext();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: 'testing',
    realPrices: 'testing',
    googleSheets: 'testing'
  });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const realPriceService = RealPriceService.getInstance();
  const sheetsIntegration = GoogleSheetsIntegration.getInstance();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    addTestResult('🔄 Testing backend connection...');
    try {
      await fetchData();
      if (state.isConnected) {
        setSystemStatus(prev => ({ ...prev, backend: 'connected' }));
        addTestResult('✅ Backend: Connected and working');
      } else {
        setSystemStatus(prev => ({ ...prev, backend: 'disconnected' }));
        addTestResult('❌ Backend: Failed to connect');
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, backend: 'disconnected' }));
      addTestResult(`❌ Backend error: ${error}`);
    }
  };

  const testRealPrices = async () => {
    addTestResult('🔄 Testing real price APIs...');
    try {
      // Test Binance API directly
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      const data = await response.json();
      
      if (data.lastPrice) {
        const btcPrice = parseFloat(data.lastPrice);
        const btcINR = btcPrice * 84.25;
        
        setSystemStatus(prev => ({ ...prev, realPrices: 'connected' }));
        addTestResult(`✅ Real Prices: BTC $${btcPrice} = ₹${btcINR.toLocaleString('en-IN')}`);
        
        // Test RealPriceService
        const connectionStatus = realPriceService.getConnectionStatus();
        addTestResult(`📊 Price Service Status: ${connectionStatus}`);
        
        const allPrices = realPriceService.getAllRealPrices();
        addTestResult(`📈 Cached Prices: ${allPrices.length} symbols`);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, realPrices: 'disconnected' }));
      addTestResult(`❌ Real Prices error: ${error}`);
    }
  };

  const testGoogleSheets = async () => {
    addTestResult('🔄 Testing Google Sheets integration...');
    try {
      // Test with sample data
      const sampleTrade = {
        timestamp: new Date().toISOString(),
        strategy: 'Test Strategy',
        symbol: 'BTCUSDT',
        direction: 'BUY' as const,
        entryPrice: 114000,
        stopLoss: 112000,
        takeProfit: 118000,
        confidence: 85,
        volume: 0.01,
        reasoning: 'System test trade',
        status: 'ACTIVE' as const
      };

      const success = await sheetsIntegration.logTrade(sampleTrade);
      
      if (success) {
        setSystemStatus(prev => ({ ...prev, googleSheets: 'connected' }));
        addTestResult('✅ Google Sheets: Test trade logged successfully');
      } else {
        setSystemStatus(prev => ({ ...prev, googleSheets: 'disconnected' }));
        addTestResult('❌ Google Sheets: Failed to log test trade');
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, googleSheets: 'disconnected' }));
      addTestResult(`❌ Google Sheets error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    addTestResult('🚀 Starting LAKSHYA system tests...');
    
    await testBackendConnection();
    await testRealPrices();
    await testGoogleSheets();
    
    addTestResult('🎯 All tests completed!');
    setIsRunningTests(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runAllTests();
  }, []);

  return (
    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">🔧 LAKSHYA System Test Panel</h2>
        <button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isRunningTests ? '🔄 Testing...' : '🧪 Run Tests'}
        </button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon(systemStatus.backend)}</span>
            <div>
              <h3 className="font-medium text-white">Backend API</h3>
              <p className={`text-sm ${getStatusColor(systemStatus.backend)}`}>
                {systemStatus.backend.charAt(0).toUpperCase() + systemStatus.backend.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon(systemStatus.realPrices)}</span>
            <div>
              <h3 className="font-medium text-white">Real Prices</h3>
              <p className={`text-sm ${getStatusColor(systemStatus.realPrices)}`}>
                {systemStatus.realPrices.charAt(0).toUpperCase() + systemStatus.realPrices.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon(systemStatus.googleSheets)}</span>
            <div>
              <h3 className="font-medium text-white">Google Sheets</h3>
              <p className={`text-sm ${getStatusColor(systemStatus.googleSheets)}`}>
                {systemStatus.googleSheets.charAt(0).toUpperCase() + systemStatus.googleSheets.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-slate-900/50 rounded-lg p-4">
        <h3 className="font-medium text-white mb-3">📋 Test Results</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-sm">No test results yet...</p>
          ) : (
            testResults.map((result, index) => (
              <p key={index} className="text-sm text-gray-300 font-mono">
                {result}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={testBackendConnection}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
        >
          Test Backend
        </button>
        <button
          onClick={testRealPrices}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          Test Prices
        </button>
        <button
          onClick={testGoogleSheets}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
        >
          Test Sheets
        </button>
        <button
          onClick={() => setTestResults([])}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Clear Logs
        </button>
      </div>

      {/* Real-time Status Info */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Last Update: {new Date(state.lastUpdate).toLocaleTimeString()}</p>
        <p>Market Data Points: {state.marketData.length}</p>
        <p>Active Signals: {state.signals.length}</p>
        <p>Connection: {state.isConnected ? 'Live' : 'Demo Mode'}</p>
      </div>
    </div>
  );
};

export default SystemTestPanel;