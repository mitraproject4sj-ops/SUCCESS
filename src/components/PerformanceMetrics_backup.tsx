import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, Zap, Target } from 'lucide-react';
import { exportToCSV } from '../utils/exportData';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  metric?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, metric, onClick, isSelected }) => (
  <div 
    className={`bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 ${
      onClick ? 'cursor-pointer hover:bg-slate-800/60 transition-colors' : ''
    } ${isSelected ? 'ring-2 ring-cyan-500/50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
        {icon}
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
    <h3 className="text-slate-400 text-sm mt-3">{title}</h3>
    <div className="flex items-baseline mt-1">
      <p className="text-xl font-semibold text-white">{value}</p>
      {metric && <span className="text-slate-400 text-sm ml-1">{metric}</span>}
    </div>
  </div>
);

import { PerformanceData } from '../utils/timeSeriesData';

interface PerformanceMetricsProps {
  currentData: PerformanceData;
  historicalData: PerformanceData[];
  onTimeframeChange: (hours: number) => void;
}

export default function PerformanceMetrics({ currentData, historicalData, onTimeframeChange }: PerformanceMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const calculateChange = (metric: keyof PerformanceData) => {
    if (historicalData.length < 2) return 0;
    const previous = historicalData[historicalData.length - 2][metric];
    const current = historicalData[historicalData.length - 1][metric];
    if (typeof previous === 'number' && typeof current === 'number') {
      return Number(((current - previous) / previous * 100).toFixed(1));
    }
    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Performance Metrics (24h)</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => exportToCSV(historicalData, 'trading_performance')}
            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm flex items-center space-x-2 hover:bg-cyan-500/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>Export Data</span>
          </button>
          <div className="flex items-center space-x-2">
            <select 
              className="bg-slate-700 text-white text-sm rounded-lg px-2 py-1"
              onChange={(e) => onTimeframeChange(Number(e.target.value))}
            >
              <option value="24">Last 24 Hours</option>
              <option value="48">Last 48 Hours</option>
              <option value="72">Last 72 Hours</option>
              <option value="168">Last 7 Days</option>
              <option value="360">Last 15 Days</option>
              <option value="720">Last 30 Days</option>
              <option value="2160">Last Quarter</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Win Rate"
          value={`${currentData.winRate}%`}
          change={calculateChange('winRate')}
          icon={<Target className="h-5 w-5 text-cyan-400" />}
          onClick={() => setSelectedMetric('winRate')}
          isSelected={selectedMetric === 'winRate'}
        />
        <MetricCard
          title="Avg Trade Time"
          value={currentData.avgTradeTime || 'N/A'}
          change={calculateChange('avgTradeTime')}
          icon={<Clock className="h-5 w-5 text-cyan-400" />}
          metric="min"
        />
        <MetricCard
          title="Profit Factor"
          value={currentData.profitFactor?.toFixed(2) || 'N/A'}
          change={calculateChange('profitFactor')}
          icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}
        />
        <MetricCard
          title="Sharpe Ratio"
          value={currentData.sharpeRatio?.toFixed(2) || 'N/A'}
          change={calculateChange('sharpeRatio')}
          icon={<Activity className="h-5 w-5 text-cyan-400" />}
        />
        <MetricCard
          title="Best Strategy"
          value={currentData.bestStrategy || 'N/A'}
          change={calculateChange('bestStrategy')}
          icon={<Zap className="h-5 w-5 text-cyan-400" />}
        />
        <MetricCard
          title="Best Exchange"
          value={currentData.bestExchange || 'N/A'}
          change={calculateChange('bestExchange')}
          icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}
        />
      </div>
    </div>
  );
}