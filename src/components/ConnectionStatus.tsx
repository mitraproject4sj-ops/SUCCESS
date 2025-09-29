import React, { useState, useEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { state, fetchData, testTelegram, runStrategies } = useTradingContext();
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<Date | null>(null);

  const backendUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://trading-dashboard-backend-qwe4.onrender.com';

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setLastConnectionAttempt(new Date());
    
    try {
      await fetchData();
    } catch (error) {
      console.error('Retry connection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      const result = await testTelegram();
      alert(`Telegram test successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      alert(`Telegram test failed: ${error.message}`);
    }
  };

  const handleRunStrategies = async () => {
    try {
      const result = await runStrategies();
      alert(`Strategies executed: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      alert(`Strategy execution failed: ${error.message}`);
    }
  };

  const getStatusColor = () => {
    if (isRetrying) return 'bg-yellow-500';
    return state.isConnected ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (isRetrying) return 'Connecting...';
    return state.isConnected ? 'Connected to Render' : 'Using Demo Mode';
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Backend Connection</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isRetrying ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm text-gray-300">{getStatusText()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">Backend URL</div>
          <div className="text-xs text-blue-400 font-mono break-all">{backendUrl}</div>
        </div>

        {lastConnectionAttempt && (
          <div className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Last Attempt</div>
            <div className="text-xs text-gray-300">{lastConnectionAttempt.toLocaleString()}</div>
          </div>
        )}

        {state.backendStatus && (
          <div className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Backend Status</div>
            <div className="text-xs text-green-400">
              Service: {state.backendStatus.service || 'Unknown'} | 
              Version: {state.backendStatus.version || 'Unknown'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={handleRetryConnection}
            disabled={isRetrying}
            className={`w-full py-2 px-4 rounded font-medium transition-colors ${
              isRetrying 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRetrying ? 'Connecting...' : 'Retry Connection'}
          </button>

          {state.isConnected && (
            <>
              <button
                onClick={handleTestTelegram}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                Test Telegram
              </button>
              <button
                onClick={handleRunStrategies}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
              >
                Run Strategies
              </button>
            </>
          )}
        </div>

        {!state.isConnected && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded p-3">
            <div className="text-yellow-400 text-sm font-medium mb-1">⚠️ Demo Mode Active</div>
            <div className="text-yellow-300 text-xs">
              Using simulated data. Check your Render backend status and environment variables.
            </div>
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/30 border border-red-600 rounded p-3">
            <div className="text-red-400 text-sm font-medium mb-1">❌ Connection Error</div>
            <div className="text-red-300 text-xs break-words">{state.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;