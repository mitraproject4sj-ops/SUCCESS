export interface ExchangeSettings {
  name: string;
  allocatedCapital: number;
  enabled: boolean;
  maxOpenTrades: number;
}

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
  capitalPerTrade: number;
  maxOpenTrades: number;
  
  // Exchange Settings
  exchanges: ExchangeSettings[];
  
  // Trading Mode
  spotTradingOnly: boolean;
  
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
  maxRiskPerTrade: 100, // 10% of per trade capital
  maxDailyRisk: 500,    // 1% of total capital
  maxDrawdownPercentage: 5,
  totalCapital: 50000,  // Total trading capital
  capitalPerTrade: 1000, // Fixed capital per trade
  maxOpenTrades: 3,     // Conservative limit for open trades
  
  exchanges: [
    {
      name: 'Binance',
      allocatedCapital: 30000,
      enabled: true,
      maxOpenTrades: 2
    },
    {
      name: 'CoinDCX',
      allocatedCapital: 10000,
      enabled: true,
      maxOpenTrades: 1
    },
    {
      name: 'Delta Exchange',
      allocatedCapital: 10000,
      enabled: true,
      maxOpenTrades: 1
    }
  ],
  spotTradingOnly: true,
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