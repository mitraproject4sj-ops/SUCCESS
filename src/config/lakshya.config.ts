export const LAKSHYA_CONFIG = {
  // System Identity
  NAME: 'LAKSHYA',
  VERSION: '1.0.0',
  GOAL: '₹10,000 Daily with Discipline',

  // Risk Management
  RISK: {
    DAILY_TARGET: 10000,
    MAX_DAILY_LOSS: 5000,
    MAX_TRADES_PER_DAY: 15,
    MIN_SUCCESS_RATE: 0.6,
    BASE_RISK_AMOUNT: 100,
    MIN_EXPECTED_RETURN: 500,
    CAPITAL_ALLOCATION: {
      TOTAL: 50000,
      MAX_PER_TRADE_PERCENT: 0.1, // 10% of total capital
      EMERGENCY_RESERVE: 5000
    }
  },

  // Trading Windows
  TRADING_WINDOWS: {
    MORNING: {
      START: '09:15',
      END: '11:30',
      RISK_MULTIPLIER: 0.7, // Conservative in morning
      MAX_TRADES: 5
    },
    MIDDAY: {
      START: '11:30',
      END: '14:30',
      RISK_MULTIPLIER: 1.0, // Full risk during peak hours
      MAX_TRADES: 7
    },
    AFTERNOON: {
      START: '14:30',
      END: '15:15',
      RISK_MULTIPLIER: 0.5, // Reduced risk near close
      MAX_TRADES: 3
    }
  },

  // Trade Execution
  EXECUTION: {
    MIN_TRADE_INTERVAL: 180000, // 3 minutes
    MAX_CONCURRENT_TRADES: 3,
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 5000 // 5 seconds
  },

  // Recovery Mode Settings
  RECOVERY: {
    ACTIVATION_THRESHOLD: -2000, // Activate after ₹2000 loss
    RISK_REDUCTION: 0.5, // 50% risk reduction
    MIN_TRADES_BEFORE_NORMAL: 3, // Successful trades needed to exit recovery
    MAX_RECOVERY_TIME: 7200000 // 2 hours max in recovery mode
  },

  // Exchange Allocation
  EXCHANGES: {
    BINANCE: {
      ALLOCATION: 30000,
      MAX_TRADES: 2
    },
    COINDCX: {
      ALLOCATION: 10000,
      MAX_TRADES: 1
    },
    DELTA: {
      ALLOCATION: 10000,
      MAX_TRADES: 1
    }
  },

  // Strategy Configuration
  STRATEGIES: {
    MOMENTUM_BURST: {
      WEIGHT: 0.25,
      MIN_CONFIDENCE: 75,
      TIMEFRAMES: ['5m', '15m']
    },
    TREND_RIDER: {
      WEIGHT: 0.2,
      MIN_CONFIDENCE: 80,
      TIMEFRAMES: ['15m', '1h']
    },
    VOLUME_SURGE: {
      WEIGHT: 0.2,
      MIN_CONFIDENCE: 75,
      TIMEFRAMES: ['5m', '15m']
    },
    BREAKOUT_HUNTER: {
      WEIGHT: 0.15,
      MIN_CONFIDENCE: 85,
      TIMEFRAMES: ['5m', '15m']
    },
    REVERSAL_CATCHER: {
      WEIGHT: 0.2,
      MIN_CONFIDENCE: 85,
      TIMEFRAMES: ['5m', '15m']
    }
  },

  // Safety Features
  SAFETY: {
    MAX_DRAWDOWN_PERCENT: 10,
    COOLDOWN_AFTER_LOSSES: 900000, // 15 minutes
    DAILY_RESTART_TIME: '09:00',
    MARKET_VOLATILITY_THRESHOLD: 2.5,
    PANIC_MODE_TRIGGERS: {
      CONSECUTIVE_LOSSES: 3,
      DRAWDOWN_AMOUNT: 3000,
      RAPID_MARKET_MOVE: 1.5
    }
  },

  // Performance Monitoring
  MONITORING: {
    UPDATE_INTERVAL: 60000, // 1 minute
    METRICS_HISTORY_DAYS: 30,
    ALERT_THRESHOLDS: {
      SUCCESS_RATE_MIN: 60,
      DRAWDOWN_WARNING: 2000,
      PROFIT_TARGET_WARNING: 8000
    }
  }
};