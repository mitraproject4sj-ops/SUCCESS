import React, { useState } from 'react';
import { Settings, AlertCircle, Lock, Unlock, BarChart2, Clock, Shield } from 'lucide-react';
import { TradingControlSettings, defaultTradingSettings } from '../types/TradingControlSettings';

interface StrategyConfig {
  name: string;
  description: string;
  minConfidence: number;
  riskMultiplier: number;
}

const strategyConfigs: StrategyConfig[] = [
  {
    name: 'MomentumBurst',
    description: 'Captures explosive price movements with volume confirmation',
    minConfidence: 80,
    riskMultiplier: 1.2
  },
  {
    name: 'TrendRider',
    description: 'Follows established trends with pullback entries',
    minConfidence: 75,
    riskMultiplier: 1.0
  },
  {
    name: 'VolumeSurge',
    description: 'Identifies unusual volume spikes with price action',
    minConfidence: 85,
    riskMultiplier: 1.5
  },
  {
    name: 'BreakoutHunter',
    description: 'Trades key level breakouts with momentum',
    minConfidence: 82,
    riskMultiplier: 1.3
  }
];

export default function TradingControlPanel() {
  const [settings, setSettings] = useState<TradingControlSettings>(defaultTradingSettings);
  const [isLocked, setIsLocked] = useState(true);

  const handleSettingChange = (key: keyof TradingControlSettings, value: any) => {
    if (!isLocked) {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleStrategyToggle = (strategy: string) => {
    if (!isLocked) {
      setSettings(prev => ({
        ...prev,
        enabledStrategies: prev.enabledStrategies.includes(strategy)
          ? prev.enabledStrategies.filter(s => s !== strategy)
          : [...prev.enabledStrategies, strategy]
      }));
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Trading Control Panel</h2>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-2 rounded-lg ${isLocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
      </div>

      {/* Auto Trading Controls */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.isAutoTradingEnabled}
                onChange={(e) => handleSettingChange('isAutoTradingEnabled', e.target.checked)}
                disabled={isLocked}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-white">Enable Auto Trading</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400">Confidence Threshold</label>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.confidenceThreshold}
              onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
              disabled={isLocked}
              className="w-full"
            />
            <span className="text-cyan-400">{settings.confidenceThreshold}%</span>
          </div>

          <div>
            <label className="block text-sm text-slate-400">Max Risk Per Trade</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={settings.maxRiskPerTrade}
                onChange={(e) => handleSettingChange('maxRiskPerTrade', parseInt(e.target.value))}
                disabled={isLocked}
                className="bg-slate-700 text-white rounded p-1 w-24"
              />
              <span className="text-slate-400">₹</span>
            </div>
          </div>
        </div>

        {/* Risk Management Section */}
        <div className="border-t border-slate-700/50 pt-4">
          <h3 className="flex items-center space-x-2 mb-3 text-white">
            <Shield className="h-4 w-4 text-red-400" />
            <span>Risk Management</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400">Max Daily Risk</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={settings.maxDailyRisk}
                  onChange={(e) => handleSettingChange('maxDailyRisk', parseInt(e.target.value))}
                  disabled={isLocked}
                  className="bg-slate-700 text-white rounded p-1 w-24"
                />
                <span className="text-slate-400">₹</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400">Max Drawdown %</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={settings.maxDrawdownPercentage}
                  onChange={(e) => handleSettingChange('maxDrawdownPercentage', parseInt(e.target.value))}
                  disabled={isLocked}
                  className="bg-slate-700 text-white rounded p-1 w-24"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Controls */}
        <div className="border-t border-slate-700/50 pt-4">
          <h3 className="flex items-center space-x-2 mb-3 text-white">
            <BarChart2 className="h-4 w-4 text-yellow-400" />
            <span>Strategy Controls</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {strategyConfigs.map(strategy => (
              <div key={strategy.name} className="col-span-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enabledStrategies.includes(strategy.name)}
                    onChange={() => handleStrategyToggle(strategy.name)}
                    disabled={isLocked}
                    className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-white text-sm">{strategy.name}</span>
                    <p className="text-xs text-slate-400">{strategy.description}</p>
                    <p className="text-xs text-cyan-400">Min Confidence: {strategy.minConfidence}%</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Controls */}
        <div className="border-t border-slate-700/50 pt-4">
          <h3 className="flex items-center space-x-2 mb-3 text-white">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Trading Hours</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400">Start Time</label>
              <input
                type="time"
                value={settings.tradingHoursStart}
                onChange={(e) => handleSettingChange('tradingHoursStart', e.target.value)}
                disabled={isLocked}
                className="bg-slate-700 text-white rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">End Time</label>
              <input
                type="time"
                value={settings.tradingHoursEnd}
                onChange={(e) => handleSettingChange('tradingHoursEnd', e.target.value)}
                disabled={isLocked}
                className="bg-slate-700 text-white rounded p-1"
              />
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {settings.isAutoTradingEnabled && (
          <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Auto Trading is Enabled</span>
            </div>
            <p className="text-xs text-yellow-400/80 mt-1">
              System will auto-execute trades matching your criteria during trading hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}