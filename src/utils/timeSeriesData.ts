export interface TimeSeriesData {
  timestamp: number;
  value: number;
  trades: number;
}

export interface PerformanceData {
  winRate: number;
  avgTradeTime: number;
  profitFactor: number;
  sharpeRatio: number;
  bestStrategy: string;
  bestExchange: string;
  timestamp: number;
}

export const generateTimeSeriesData = (hours: number): TimeSeriesData[] => {
  const now = Date.now();
  const data: TimeSeriesData[] = [];
  
  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: now - (i * 3600000), // milliseconds per hour
      value: Math.random() > 0.6 ? Math.random() * 1000 : -Math.random() * 500,
      trades: Math.floor(Math.random() * 10)
    });
  }
  
  return data;
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};