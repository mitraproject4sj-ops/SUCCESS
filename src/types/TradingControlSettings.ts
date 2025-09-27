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
  
  // Trade Duration Controls
  maxTradeDuration: number; // in minutes
  autoExitEnabled: boolean;
  
  // Intraday Controls
  resetPositionsDaily: boolean;
  maxDailyTrades: number;
  maxSimultaneousTrades: number;
  
  // Exit Conditions
  takeProfitPercentage: number;
  stopLossPercentage: number;
  trailingStopEnabled: boolean;
  trailingStopDistance: number;
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
  maxTradeDuration: 60, // 60 minutes max trade duration
  autoExitEnabled: true,
  resetPositionsDaily: true,
  maxDailyTrades: 25,
  maxSimultaneousTrades: 3,
  takeProfitPercentage: 2.5,
  stopLossPercentage: 1.5,
  trailingStopEnabled: true,
  trailingStopDistance: 0.5
};