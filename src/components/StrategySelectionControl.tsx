import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Zap, Target, BarChart3, Shuffle, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Strategy {
  name: string;
  description: string;
  isActive: boolean;
  confidence: number;
  alertsToday: number;
  tradesToday: number;
  winRate: number;
  lastSignal: string;
}

interface StrategySelectionControlProps {
  className?: string;
}

const availableStrategies: Strategy[] = [
  {
    name: 'MomentumBurst',
    description: 'High-frequency momentum trading',
    isActive: true,
    confidence: 80,
    alertsToday: 12,
    tradesToday: 8,
    winRate: 72,
    lastSignal: '2 min ago'
  },
  {
    name: 'TrendRider',
    description: 'Trend following with pullbacks',
    isActive: true,
    confidence: 75,
    alertsToday: 8,
    tradesToday: 6,
    winRate: 68,
    lastSignal: '5 min ago'
  },
  {
    name: 'VolumeSurge',
    description: 'Volume-based breakout trading',
    isActive: false,
    confidence: 85,
    alertsToday: 5,
    tradesToday: 3,
    winRate: 63,
    lastSignal: '12 min ago'
  },
  {
    name: 'BreakoutHunter',
    description: 'Key level breakout strategies',
    isActive: true,
    confidence: 82,
    alertsToday: 6,
    tradesToday: 4,
    winRate: 75,
    lastSignal: '8 min ago'
  },
  {
    name: 'MeanReversal',
    description: 'Counter-trend reversal trading',
    isActive: false,
    confidence: 70,
    alertsToday: 3,
    tradesToday: 1,
    winRate: 58,
    lastSignal: '25 min ago'
  }
];

export default function StrategySelectionControl({ className = '' }: StrategySelectionControlProps) {
  const [strategies, setStrategies] = useState<Strategy[]>(availableStrategies);
  const [selectionMode, setSelectionMode] = useState<'single' | 'mixed'>('mixed');
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  const handleStrategyToggle = (strategyName: string) => {
    if (isLocked) return;

    if (selectionMode === 'single') {
      // Single mode: only one strategy can be active
      setStrategies(prev => prev.map(strategy => ({
        ...strategy,
        isActive: strategy.name === strategyName ? !strategy.isActive : false
      })));
      setSelectedStrategy(selectedStrategy === strategyName ? null : strategyName);
    } else {
      // Mixed mode: multiple strategies can be active
      setStrategies(prev => prev.map(strategy =>
        strategy.name === strategyName
          ? { ...strategy, isActive: !strategy.isActive }
          : strategy
      ));
    }
  };

  const handleModeChange = (mode: 'single' | 'mixed') => {
    if (isLocked) return;

    setSelectionMode(mode);

    if (mode === 'single') {
      // When switching to single mode, keep only the first active strategy
      const activeStrategies = strategies.filter(s => s.isActive);
      if (activeStrategies.length > 1) {
        setStrategies(prev => prev.map(strategy => ({
          ...strategy,
          isActive: strategy.name === activeStrategies[0].name
        })));
        setSelectedStrategy(activeStrategies[0].name);
      } else if (activeStrategies.length === 1) {
        setSelectedStrategy(activeStrategies[0].name);
      }
    }
  };

  const handleAutoTradingToggle = () => {
    setIsAutoTrading(!isAutoTrading);
  };

  const activeStrategies = strategies.filter(s => s.isActive);
  const totalAlerts = activeStrategies.reduce((sum, s) => sum + s.alertsToday, 0);
  const totalTrades = activeStrategies.reduce((sum, s) => sum + s.tradesToday, 0);
  const avgWinRate = activeStrategies.length > 0
    ? Math.round(activeStrategies.reduce((sum, s) => sum + s.winRate, 0) / activeStrategies.length)
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
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy Selection Control</h3>
            <p className="text-sm text-slate-400">Choose trading strategies & execution mode</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Lock/Unlock */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isLocked
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
          </button>

          {/* Auto Trading Toggle */}
          <button
            onClick={handleAutoTradingToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAutoTrading
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isAutoTrading ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoTrading ? 'Stop Auto' : 'Start Auto'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-slate-400 text-sm font-medium">Selection Mode:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleModeChange('single')}
            disabled={isLocked}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectionMode === 'single'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Single Strategy
          </button>
          <button
            onClick={() => handleModeChange('mixed')}
            disabled={isLocked}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectionMode === 'mixed'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Mixed Strategies
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Strategies</p>
              <p className="text-xl font-bold text-blue-400">{activeStrategies.length}</p>
            </div>
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Today's Alerts</p>
              <p className="text-xl font-bold text-purple-400">{totalAlerts}</p>
            </div>
            <Target className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Today's Trades</p>
              <p className="text-xl font-bold text-cyan-400">{totalTrades}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-cyan-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Win Rate</p>
              <p className="text-xl font-bold text-green-400">{avgWinRate}%</p>
            </div>
            <Shuffle className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Strategy List */}
      <div className="space-y-3">
        <h4 className="text-white font-medium mb-3">Available Strategies</h4>

        {strategies.map((strategy) => (
          <motion.div
            key={strategy.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 cursor-pointer transition-all ${
              strategy.isActive
                ? 'border-green-500/50 bg-green-500/5'
                : 'hover:bg-slate-700/50'
            } ${isLocked ? 'cursor-not-allowed' : ''}`}
            onClick={() => !isLocked && handleStrategyToggle(strategy.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Active Indicator */}
                <div className={`w-4 h-4 rounded-full border-2 ${
                  strategy.isActive
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-500'
                }`}>
                  {strategy.isActive && (
                    <div className="w-full h-full rounded-full bg-green-500 animate-pulse"></div>
                  )}
                </div>

                {/* Strategy Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h5 className="text-white font-medium">{strategy.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      strategy.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                      strategy.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {strategy.confidence}% conf
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{strategy.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-slate-400">Alerts</p>
                  <p className="text-white font-medium">{strategy.alertsToday}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Trades</p>
                  <p className="text-white font-medium">{strategy.tradesToday}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Win Rate</p>
                  <p className="text-green-400 font-medium">{strategy.winRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Last Signal</p>
                  <p className="text-cyan-400 font-medium">{strategy.lastSignal}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mode Explanation */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-medium mb-1">
              {selectionMode === 'single' ? 'Single Strategy Mode' : 'Mixed Strategy Mode'}
            </h4>
            <p className="text-blue-300 text-sm">
              {selectionMode === 'single'
                ? 'Only one strategy will be active at a time. Best for focused trading with specific market conditions.'
                : 'Multiple strategies can run simultaneously. Provides diversification but requires more monitoring.'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}