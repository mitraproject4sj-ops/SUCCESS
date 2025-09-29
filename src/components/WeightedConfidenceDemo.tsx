import React, { useState, useEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';

const WeightedConfidenceDemo: React.FC = () => {
  const { state, getAISignals, getConsensusSignal } = useTradingContext();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [strategySignals, setStrategySignals] = useState<any[]>([]);
  const [consensusSignal, setConsensusSignal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const strategyWeights = {
    'Trend Rider': 0.25,
    'Momentum Burst': 0.20,
    'Mean Reversal': 0.20,
    'Breakout Hunter': 0.20,
    'Volume Surge': 0.15
  };

  const loadSignals = async () => {
    setLoading(true);
    try {
      const signals = await getAISignals(selectedSymbol);
      setStrategySignals(signals.filter(s => s.strategy !== 'Weighted Consensus'));
      
      const consensus = await getConsensusSignal(selectedSymbol);
      setConsensusSignal(consensus);
    } catch (error) {
      console.error('Error loading signals:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSignals();
  }, [selectedSymbol]);

  const calculateWeightedConfidence = () => {
    if (strategySignals.length === 0) return 0;
    
    let weightedSum = 0;
    strategySignals.forEach(signal => {
      const weight = strategyWeights[signal.strategy as keyof typeof strategyWeights] || 0;
      weightedSum += weight * signal.confidence;
    });
    
    return Math.round(weightedSum * 100) / 100;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-green-400">🎯 Weighted Confidence Formula</h3>
        <select 
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600"
        >
          {state.marketData.map(market => (
            <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
        <div className="text-sm text-blue-300 font-mono mb-2">
          Formula: (0.25 × Trend Rider + 0.20 × Momentum Burst + 0.20 × Mean Reversal + 0.20 × Breakout Hunter + 0.15 × Volume Surge)
        </div>
        <div className="text-lg font-bold text-white">
          Current Symbol: <span className="text-green-400">{selectedSymbol}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="text-gray-400">Calculating weighted confidence...</div>
        </div>
      ) : (
        <>
          {/* Individual Strategy Breakdown */}
          <div className="space-y-3 mb-6">
            <h4 className="text-lg font-semibold text-cyan-400">Individual Strategy Contributions:</h4>
            {strategySignals.map((signal, index) => {
              const weight = strategyWeights[signal.strategy as keyof typeof strategyWeights] || 0;
              const contribution = weight * signal.confidence;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-white">{signal.strategy}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      signal.direction === 'BUY' ? 'bg-green-600' : 
                      signal.direction === 'SELL' ? 'bg-red-600' : 'bg-gray-600'
                    }`}>
                      {signal.direction}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {(weight * 100).toFixed(0)}% × {signal.confidence.toFixed(1)}% = 
                      <span className="text-yellow-400 font-bold ml-1">
                        {contribution.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculation Result */}
          <div className="p-4 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">Manual Calculation:</div>
                <div className="text-sm text-gray-300">Sum of all weighted contributions</div>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {calculateWeightedConfidence().toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Consensus Signal Result */}
          {consensusSignal && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">AI Consensus Result:</div>
                  <div className="text-sm text-gray-300">Enhanced with consensus bonus</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">
                    {consensusSignal.confidence.toFixed(2)}%
                  </div>
                  <div className={`text-lg font-semibold ${
                    consensusSignal.direction === 'BUY' ? 'text-green-400' : 
                    consensusSignal.direction === 'SELL' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {consensusSignal.direction}
                  </div>
                </div>
              </div>
              
              {consensusSignal.reasoning && (
                <div className="mt-3 p-2 bg-black/30 rounded text-xs font-mono text-gray-300">
                  {consensusSignal.reasoning}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <button 
              onClick={loadSignals}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              🔄 Refresh Calculation
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WeightedConfidenceDemo;