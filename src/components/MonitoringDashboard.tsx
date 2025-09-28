import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';

interface MetricData {
  timestamp: string;
  value: number;
  type: string;
}

interface SystemStatus {
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: 0,
    memory: 0,
    responseTime: 0,
    errorRate: 0,
    uptime: 0
  });

  useEffect(() => {
    // Fetch metrics periodically
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    // Fetch system status
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('/api/system/status');
        const data = await response.json();
        setSystemStatus(data);
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    fetchMetrics();
    fetchSystemStatus();

    const metricsInterval = setInterval(fetchMetrics, 60000); // Every minute
    const statusInterval = setInterval(fetchSystemStatus, 30000); // Every 30 seconds

    return () => {
      clearInterval(metricsInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-blue-400">CPU Usage</h3>
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{systemStatus.cpu}%</p>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-green-400">Memory</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{systemStatus.memory}%</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-yellow-400">Response Time</h3>
            <Zap className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{systemStatus.responseTime}ms</p>
        </div>

        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 p-4 rounded-lg border border-red-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-red-400">Error Rate</h3>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{systemStatus.errorRate}%</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.filter(m => m.type === 'responseTime')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="url(#responseTimeGradient)"
                />
                <defs>
                  <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Error Rate</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.filter(m => m.type === 'errorRate')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">CPU Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.filter(m => m.type === 'cpu')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  fill="url(#cpuGradient)"
                />
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Memory Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.filter(m => m.type === 'memory')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400">Uptime</p>
            <p className="text-xl font-semibold text-white">{formatUptime(systemStatus.uptime)}</p>
          </div>
          {/* Add more system info cards as needed */}
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;