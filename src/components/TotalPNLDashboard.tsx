import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface PNLData {
  date: string;
  pnl: number;
  cumulative: number;
  trades: number;
  winRate: number;
}

interface TotalPNLDashboardProps {
  className?: string;
}

const timeframes = [
  { label: '24H', value: 24, key: '24h' },
  { label: '7D', value: 168, key: '7d' },
  { label: '15D', value: 360, key: '15d' },
  { label: '1M', value: 720, key: '1m' },
  { label: '3M', value: 2160, key: '3m' },
  { label: '6M', value: 4320, key: '6m' },
  { label: '12M', value: 8640, key: '12m' }
];

export default function TotalPNLDashboard({ className = '' }: TotalPNLDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [pnlData, setPnlData] = useState<PNLData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Generate mock PNL data based on timeframe
  useEffect(() => {
    const generatePNLData = () => {
      const timeframeConfig = timeframes.find(t => t.key === selectedTimeframe);
      if (!timeframeConfig) return;

      const hours = timeframeConfig.value;
      const dataPoints = Math.min(hours, 168); // Max 7 days of hourly data
      const interval = Math.max(1, Math.floor(hours / dataPoints));

      const data: PNLData[] = [];
      let cumulative = 50000; // Starting capital

      for (let i = dataPoints; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - (i * interval));

        const pnl = (Math.random() - 0.4) * 2000; // Random PNL between -2000 and 1600
        cumulative += pnl;

        data.push({
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: interval < 24 ? '2-digit' : undefined
          }),
          pnl: Math.round(pnl),
          cumulative: Math.round(cumulative),
          trades: Math.floor(Math.random() * 10) + 1,
          winRate: Math.round((Math.random() * 30 + 50) * 100) / 100
        });
      }

      setPnlData(data);
    };

    generatePNLData();
  }, [selectedTimeframe]);

  // Auto refresh at 8:59 AM daily
  useEffect(() => {
    const checkRefreshTime = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(8, 59, 0, 0);

      if (now >= targetTime && now.getTime() - lastRefresh.getTime() > 24 * 60 * 60 * 1000) {
        handleRefresh();
      }
    };

    const interval = setInterval(checkRefreshTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const totalPNL = pnlData.reduce((sum, day) => sum + day.pnl, 0);
  const totalTrades = pnlData.reduce((sum, day) => sum + day.trades, 0);
  const avgWinRate = pnlData.length > 0
    ? Math.round(pnlData.reduce((sum, day) => sum + day.winRate, 0) / pnlData.length * 100) / 100
    : 0;

  const currentCapital = pnlData.length > 0 ? pnlData[pnlData.length - 1].cumulative : 50000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Total PNL Dashboard</h3>
            <p className="text-sm text-slate-400">Daily refresh at 8:59 AM</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setSelectedTimeframe(tf.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === tf.key
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total PNL</p>
              <p className={`text-xl font-bold ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPNL >= 0 ? '+' : ''}₹{totalPNL.toLocaleString()}
              </p>
            </div>
            <TrendingUp className={`h-6 w-6 ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Current Capital</p>
              <p className="text-xl font-bold text-white">₹{currentCapital.toLocaleString()}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Trades</p>
              <p className="text-xl font-bold text-purple-400">{totalTrades}</p>
            </div>
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Win Rate</p>
              <p className="text-xl font-bold text-cyan-400">{avgWinRate}%</p>
            </div>
            <Target className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* PNL Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pnlData}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: string) => [
                name === 'pnl' ? `₹${value.toLocaleString()}` : `₹${value.toLocaleString()}`,
                name === 'pnl' ? 'PNL' : 'Cumulative'
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#pnlGradient)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#F59E0B"
              strokeWidth={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Last Refresh Info */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <span>Next daily refresh: 8:59 AM</span>
        </div>
      </div>
    </motion.div>
  );
}