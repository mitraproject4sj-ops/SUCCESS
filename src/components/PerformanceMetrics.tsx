import React from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, Zap, Target } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  metric?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, metric }) => (
  <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
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

interface PerformanceMetricsProps {
  data: {
    winRate: number;
    avgTradeTime: number;
    profitFactor: number;
    sharpeRatio: number;
    bestStrategy: string;
    bestExchange: string;
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Win Rate"
        value={`${data.winRate}%`}
        change={2.5}
        icon={<Target className="h-5 w-5 text-cyan-400" />}
      />
      <MetricCard
        title="Avg Trade Time"
        value={data.avgTradeTime}
        change={-1.2}
        icon={<Clock className="h-5 w-5 text-cyan-400" />}
        metric="min"
      />
      <MetricCard
        title="Profit Factor"
        value={data.profitFactor.toFixed(2)}
        change={3.8}
        icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}
      />
      <MetricCard
        title="Sharpe Ratio"
        value={data.sharpeRatio.toFixed(2)}
        change={1.5}
        icon={<Activity className="h-5 w-5 text-cyan-400" />}
      />
      <MetricCard
        title="Best Strategy"
        value={data.bestStrategy}
        change={4.2}
        icon={<Zap className="h-5 w-5 text-cyan-400" />}
      />
      <MetricCard
        title="Best Exchange"
        value={data.bestExchange}
        change={2.8}
        icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}
      />
    </div>
  );
}