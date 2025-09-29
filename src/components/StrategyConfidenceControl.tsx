import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, TrendingDown, Target, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrategyConfig {
  name: string;
  description: string;
  minConfidence: number;
  maxConfidence: number;
  currentConfidence: number;
  isEnabled: boolean;
  alertsGenerated: number;
  tradesExecuted: number;
  winRate: number;
  avgProfit: number;
}

interface StrategyConfidenceControlProps {
  className?: string;
}

const defaultStrategies: StrategyConfig[] = [
  {
    name: 'MomentumBurst',
    description: 'Captures explosive price movements with volume confirmation',
    minConfidence: 60,
    maxConfidence: 95,
    currentConfidence: 80,
    isEnabled: true,
    alertsGenerated: 145,
    tradesExecuted: 89,
    winRate: 72,
    avgProfit: 245
  },
  {
    name: 'TrendRider',
    description: 'Follows established trends with pullback entries',
    minConfidence: 55,
    maxConfidence: 90,
    currentConfidence: 75,
    isEnabled: true,
    alertsGenerated: 98,
    tradesExecuted: 67,
    winRate: 68,
    avgProfit: 189
  },
  {
    name: 'VolumeSurge',
    description: 'Identifies unusual volume spikes with price action',
    minConfidence: 65,
    maxConfidence: 95,
    currentConfidence: 85,
    isEnabled: true,
    alertsGenerated: 76,
    tradesExecuted: 48,
    winRate: 63,
    avgProfit: 312
  },
  {
    name: 'BreakoutHunter',
    description: 'Trades key level breakouts with momentum',
    minConfidence: 70,
    maxConfidence: 95,
    currentConfidence: 82,
    isEnabled: true,
    alertsGenerated: 52,
    tradesExecuted: 39,
    winRate: 75,
    avgProfit: 456
  },
  {
    name: 'MeanReversal',
    description: 'Trades against extreme moves expecting reversal',
    minConfidence: 50,
    maxConfidence: 85,
    currentConfidence: 70,
    isEnabled: false,
    alertsGenerated: 34,
    tradesExecuted: 18,
    winRate: 58,
    avgProfit: 134
  }
];

export default function StrategyConfidenceControl({ className = '' }: StrategyConfidenceControlProps) {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(defaultStrategies);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleConfidenceChange = (strategyName: string, newConfidence: number) => {
    setStrategies(prev => prev.map(strategy =>
      strategy.name === strategyName
        ? { ...strategy, currentConfidence: newConfidence }
        : strategy
    ));
    setHasUnsavedChanges(true);
  };

  const handleStrategyToggle = (strategyName: string) => {
    setStrategies(prev => prev.map(strategy =>
      strategy.name === strategyName
        ? { ...strategy, isEnabled: !strategy.isEnabled }
        : strategy
    ));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setStrategies(defaultStrategies);
    setHasUnsavedChanges(true);
  };

  const enabledStrategies = strategies.filter(s => s.isEnabled);
  const totalAlerts = enabledStrategies.reduce((sum, s) => sum + s.alertsGenerated, 0);
  const totalTrades = enabledStrategies.reduce((sum, s) => sum + s.tradesExecuted, 0);
  const avgWinRate = enabledStrategies.length > 0
    ? Math.round(enabledStrategies.reduce((sum, s) => sum + s.winRate, 0) / enabledStrategies.length)
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
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy Confidence Control</h3>
            <p className="text-sm text-slate-400">Adjust confidence levels for auto-trading</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Unsaved changes</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm transition-colors"
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Strategies</p>
              <p className="text-xl font-bold text-blue-400">{enabledStrategies.length}</p>
            </div>
            <Settings className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Alerts</p>
              <p className="text-xl font-bold text-purple-400">{totalAlerts}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Trades Executed</p>
              <p className="text-xl font-bold text-cyan-400">{totalTrades}</p>
            </div>
            <Target className="h-6 w-6 text-cyan-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Win Rate</p>
              <p className="text-xl font-bold text-green-400">{avgWinRate}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Strategy Controls */}
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <motion.div
            key={strategy.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 ${
              !strategy.isEnabled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStrategyToggle(strategy.name)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    strategy.isEnabled ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      strategy.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div>
                  <h4 className="text-white font-medium">{strategy.name}</h4>
                  <p className="text-slate-400 text-sm">{strategy.description}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white font-bold text-lg">{strategy.currentConfidence}%</p>
                <p className="text-slate-400 text-sm">Confidence</p>
              </div>
            </div>

            {/* Confidence Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Min: {strategy.minConfidence}%</span>
                <span className="text-slate-400 text-sm">Max: {strategy.maxConfidence}%</span>
              </div>
              <input
                type="range"
                min={strategy.minConfidence}
                max={strategy.maxConfidence}
                value={strategy.currentConfidence}
                onChange={(e) => handleConfidenceChange(strategy.name, parseInt(e.target.value))}
                disabled={!strategy.isEnabled}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            {/* Strategy Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-600/30">
              <div className="text-center">
                <p className="text-slate-400 text-xs">Alerts</p>
                <p className="text-white font-medium">{strategy.alertsGenerated}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">Trades</p>
                <p className="text-white font-medium">{strategy.tradesExecuted}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">Win Rate</p>
                <p className="text-green-400 font-medium">{strategy.winRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">Avg Profit</p>
                <p className="text-purple-400 font-medium">₹{strategy.avgProfit}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Warning Message */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Auto-Trading Notice</h4>
            <p className="text-yellow-300 text-sm">
              Changes to confidence levels will affect which signals trigger automatic trades.
              Lower confidence = more trades but higher risk. Higher confidence = fewer trades but better quality.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}