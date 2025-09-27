export interface TradingControlSettings {
  // Auto Trading Controls
  isAutoTradingEnabled: boolean;
  confidenceThreshold: number;
  
  // Risk Management
  maxRiskPerTrade: number;
  maxDailyRisk: number;
  maxDrawdownPercentage: number;
  
  // Capital Controls
  totalCapital: number;
  maxCapitalPerTrade: number;
  maxOpenTrades: number;
  
  // Strategy Controls
  enabledStrategies: string[];
  minimumVolume: number;
  
  // Time Controls
  tradingHoursStart: string;
  tradingHoursEnd: string;
  maxTradesPerHour: number;
}

export const defaultTradingSettings: TradingControlSettings = {
  isAutoTradingEnabled: false,
  confidenceThreshold: 75,
  maxRiskPerTrade: 1000,
  maxDailyRisk: 5000,
  maxDrawdownPercentage: 5,
  totalCapital: 100000,
  maxCapitalPerTrade: 10000,
  maxOpenTrades: 5,
  enabledStrategies: ['MomentumBurst', 'TrendRider', 'VolumeSurge'],
  minimumVolume: 1000000,
  tradingHoursStart: '09:15',
  tradingHoursEnd: '15:30',
  maxTradesPerHour: 3
};