import { MemoryCache } from './MemoryCache';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';

interface TradingSignal {
  strategy: string;
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp    return {
      strategy: "Breakout Hunter",
      symbol: marketData.symbol,
      direction,
      confidence: this.validateConfidence(confidence, "Breakout Hunter"),
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `Price: ${price.toFixed(4)}, Support: ${support.toFixed(4)}, Resistance: ${resistance.toFixed(4)}`,
      volume: marketData.volume
    };
  }

  // Enhanced Weighted Consensus Confidence Calculation
  private calculateWeightedConsensusConfidence(marketData: MarketData): {
    overallConfidence: number;
    consensusDirection: 'BUY' | 'SELL' | 'HOLD';
    individualConfidences: { [key: string]: { confidence: number; direction: string } };
  } {
    // Strategy weights (must sum to 1.0)
    const strategyWeights = {
      'Trend Rider': 0.25,        // Highest weight - trend following
      'Momentum Burst': 0.20,     // Strong momentum signals
      'Mean Reversal': 0.20,      // Counter-trend opportunities
      'Breakout Hunter': 0.20,    // Trend continuation - your "Trend Hunter"
      'Volume Surge': 0.15        // Volume confirmation
    };

    // Calculate individual strategy confidences and directions
    const trendSignal = this.trendRiderStrategy(marketData);
    const momentumSignal = this.momentumBurstStrategy(marketData);
    const meanReversalSignal = this.meanReversalStrategy(marketData);
    const breakoutSignal = this.breakoutHunterStrategy(marketData);
    const volumeSignal = this.volumeSurgeStrategy(marketData);

    const strategies = {
      'Trend Rider': trendSignal,
      'Momentum Burst': momentumSignal,
      'Mean Reversal': meanReversalSignal,
      'Breakout Hunter': breakoutSignal,
      'Volume Surge': volumeSignal
    };

    // Calculate weighted confidence
    let weightedConfidence = 0;
    let buyWeight = 0;
    let sellWeight = 0;
    let holdWeight = 0;

    const individualConfidences: { [key: string]: { confidence: number; direction: string } } = {};

    for (const [strategyName, signal] of Object.entries(strategies)) {
      const weight = strategyWeights[strategyName];
      const confidence = signal.confidence;
      
      individualConfidences[strategyName] = {
        confidence: confidence,
        direction: signal.direction
      };

      // Add to weighted confidence
      weightedConfidence += weight * confidence;

      // Calculate direction weights
      if (signal.direction === 'BUY') {
        buyWeight += weight * (confidence / 100);
      } else if (signal.direction === 'SELL') {
        sellWeight += weight * (confidence / 100);
      } else {
        holdWeight += weight;
      }
    }

    // Determine consensus direction
    let consensusDirection: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (buyWeight > sellWeight && buyWeight > holdWeight && buyWeight > 0.3) {
      consensusDirection = 'BUY';
    } else if (sellWeight > buyWeight && sellWeight > holdWeight && sellWeight > 0.3) {
      consensusDirection = 'SELL';
    }

    // Apply consensus bonus/penalty
    const consensusBonus = Math.abs(buyWeight - sellWeight) * 10; // Up to 10% bonus for strong consensus
    const finalConfidence = Math.min(weightedConfidence + consensusBonus, 95);

    return {
      overallConfidence: this.validateConfidence(finalConfidence, "Weighted Consensus"),
      consensusDirection,
      individualConfidences
    };
  }reasoning: string;
  volume?: number;
}

interface CandleData {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  timestamp: number;
}

interface MarketData {
  symbol: string;
  candles: CandleData[];
  currentPrice: number;
  volume: number;
}

interface StrategyPerformance {
  strategy: string;
  totalTrades: number;
  successfulTrades: number;
  totalPnL: number;
  avgConfidence: number;
  lastUpdate: number;
  winRate: number;
  refinements: number;
}

class AIStrategyCoordinator {
  private static instance: AIStrategyCoordinator;
  private cache: MemoryCache;
  private strategyPerformance: Map<string, StrategyPerformance>;
  private refinedStrategies: Map<string, any>;

  private constructor() {
    this.cache = new MemoryCache(50); // 50MB cache limit
    this.strategyPerformance = new Map();
    this.refinedStrategies = new Map();
    this.initializeStrategyTracking();
  }

  static getInstance(): AIStrategyCoordinator {
    if (!AIStrategyCoordinator.instance) {
      AIStrategyCoordinator.instance = new AIStrategyCoordinator();
    }
    return AIStrategyCoordinator.instance;
  }

  private initializeStrategyTracking(): void {
    const strategies = ['Trend Rider', 'Momentum Burst', 'Volume Surge', 'Mean Reversal', 'Breakout Hunter'];
    strategies.forEach(strategy => {
      this.strategyPerformance.set(strategy, {
        strategy,
        totalTrades: 0,
        successfulTrades: 0,
        totalPnL: 0,
        avgConfidence: 0,
        lastUpdate: Date.now(),
        winRate: 0,
        refinements: 0
      });
    });
  }

  // Technical Analysis Helper Functions
  private EMA(values: number[], period: number): number[] {
    const k = 2 / (period + 1);
    let ema = [values[0]];
    for (let i = 1; i < values.length; i++) {
      ema.push(values[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  }

  private RSI(values: number[], period: number = 14): number {
    if (values.length < period + 1) return 50; // Default neutral RSI
    
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      let diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    let rs = gains / (losses || 1);
    return 100 - (100 / (1 + rs));
  }

  private SMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1];
    return values.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calculateStopLoss(entry: number, direction: 'BUY' | 'SELL', atr: number = 0): number {
    const riskPercent = 0.02; // 2% stop loss
    if (direction === 'BUY') {
      return entry * (1 - riskPercent);
    } else {
      return entry * (1 + riskPercent);
    }
  }

  private calculateTakeProfit(entry: number, direction: 'BUY' | 'SELL'): number {
    const rewardPercent = 0.04; // 4% take profit (2:1 risk-reward)
    if (direction === 'BUY') {
      return entry * (1 + rewardPercent);
    } else {
      return entry * (1 - rewardPercent);
    }
  }

  // Strategy 1: Trend Rider (EMA Crossover)
  private trendRiderStrategy(marketData: MarketData): TradingSignal {
    const closes = marketData.candles.map(c => parseFloat(c.close));
    if (closes.length < 50) {
      return this.createHoldSignal('Trend Rider', marketData, 'Insufficient data');
    }

    const ema20 = this.EMA(closes, 20);
    const ema50 = this.EMA(closes, 50);

    let direction: 'BUY' | 'SELL' | 'HOLD' = "HOLD";
    if (ema20[ema20.length - 1] > ema50[ema50.length - 1]) direction = "BUY";
    else if (ema20[ema20.length - 1] < ema50[ema50.length - 1]) direction = "SELL";

    // Fixed: Proper confidence calculation with cap at 95% and minimum 10%
    const confidenceRaw = Math.abs((ema20[ema20.length - 1] - ema50[ema50.length - 1]) / ema50[ema50.length - 1]) * 100;
    const confidence = Math.max(Math.min(confidenceRaw, 95), 10);

    const entry = marketData.currentPrice;
    const stopLoss = direction !== 'HOLD' ? this.calculateStopLoss(entry, direction) : entry;
    const takeProfit = direction !== 'HOLD' ? this.calculateTakeProfit(entry, direction) : entry;

    return {
      strategy: "Trend Rider",
      symbol: marketData.symbol,
      direction,
      confidence: this.validateConfidence(confidence, "Trend Rider"),
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `EMA20: ${ema20[ema20.length - 1].toFixed(4)}, EMA50: ${ema50[ema50.length - 1].toFixed(4)}`,
      volume: marketData.volume
    };
  }

  // Strategy 2: Momentum Burst (RSI + Strong Move)
  private momentumBurstStrategy(marketData: MarketData): TradingSignal {
    const closes = marketData.candles.map(c => parseFloat(c.close));
    if (closes.length < 15) {
      return this.createHoldSignal('Momentum Burst', marketData, 'Insufficient data');
    }

    const rsi = this.RSI(closes);

    let direction: 'BUY' | 'SELL' | 'HOLD' = "HOLD";
    if (rsi > 70) direction = "SELL";
    else if (rsi < 30) direction = "BUY";

    // Fixed: Proper confidence calculation with cap at 95% and minimum 10%
    const confidenceRaw = Math.abs(rsi - 50) / 50 * 100;
    const confidence = Math.max(Math.min(confidenceRaw, 95), 10);

    const entry = marketData.currentPrice;
    const stopLoss = direction !== 'HOLD' ? this.calculateStopLoss(entry, direction) : entry;
    const takeProfit = direction !== 'HOLD' ? this.calculateTakeProfit(entry, direction) : entry;

    return {
      strategy: "Momentum Burst",
      symbol: marketData.symbol,
      direction,
      confidence: this.validateConfidence(confidence, "Momentum Burst"),
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `RSI: ${rsi.toFixed(2)} - ${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}`,
      volume: marketData.volume
    };
  }

  // Strategy 3: Volume Surge
  private volumeSurgeStrategy(marketData: MarketData): TradingSignal {
    const volumes = marketData.candles.map(c => parseFloat(c.volume));
    const closes = marketData.candles.map(c => parseFloat(c.close));
    
    if (volumes.length < 20) {
      return this.createHoldSignal('Volume Surge', marketData, 'Insufficient data');
    }

    const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const lastVol = volumes[volumes.length - 1];
    let direction: 'BUY' | 'SELL' | 'HOLD' = "HOLD";

    if (lastVol > 1.5 * avgVol) {
      direction = closes[closes.length - 1] > closes[closes.length - 2] ? "BUY" : "SELL";
    }

    // Fixed: Better confidence calculation for volume surge
    const volumeRatio = lastVol / avgVol;
    let confidenceRaw = 0;
    
    if (volumeRatio >= 1.5) {
      // Scale from 50% at 1.5x volume to 95% at 3x volume or higher
      confidenceRaw = Math.min(50 + ((volumeRatio - 1.5) / 1.5) * 45, 95);
    } else {
      // Low confidence for low volume
      confidenceRaw = Math.min(volumeRatio * 30, 40);
    }
    
    const confidence = Math.max(confidenceRaw, 10); // Minimum 10% confidence

    const entry = marketData.currentPrice;
    const stopLoss = direction !== 'HOLD' ? this.calculateStopLoss(entry, direction) : entry;
    const takeProfit = direction !== 'HOLD' ? this.calculateTakeProfit(entry, direction) : entry;

    return {
      strategy: "Volume Surge",
      symbol: marketData.symbol,
      direction,
      confidence: this.validateConfidence(confidence, "Volume Surge"),
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `Volume: ${lastVol.toFixed(0)} vs Avg: ${avgVol.toFixed(0)} (${((lastVol/avgVol) * 100).toFixed(1)}%)`,
      volume: lastVol
    };
  }

  // Strategy 4: Mean Reversal
  private meanReversalStrategy(marketData: MarketData): TradingSignal {
    const closes = marketData.candles.map(c => parseFloat(c.close));
    if (closes.length < 20) {
      return this.createHoldSignal('Mean Reversal', marketData, 'Insufficient data');
    }

    const sma20 = this.SMA(closes, 20);
    const price = closes[closes.length - 1];

    let direction: 'BUY' | 'SELL' | 'HOLD' = "HOLD";
    if (price > sma20 * 1.02) direction = "SELL";   // Overbought
    else if (price < sma20 * 0.98) direction = "BUY"; // Oversold

    // Fixed: Proper confidence calculation with cap at 95% and minimum 10%
    const confidenceRaw = Math.abs((price - sma20) / sma20) * 100;
    const confidence = Math.max(Math.min(confidenceRaw, 95), 10);

    const entry = marketData.currentPrice;
    const stopLoss = direction !== 'HOLD' ? this.calculateStopLoss(entry, direction) : entry;
    const takeProfit = direction !== 'HOLD' ? this.calculateTakeProfit(entry, direction) : entry;

    return {
      strategy: "Mean Reversal",
      symbol: marketData.symbol,
      direction,
      confidence: this.validateConfidence(confidence, "Mean Reversal"),
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `Price: ${price.toFixed(4)} vs SMA20: ${sma20.toFixed(4)} (${((price/sma20 - 1) * 100).toFixed(2)}%)`,
      volume: marketData.volume
    };
  }

  // Strategy 5: Breakout Hunter
  private breakoutHunterStrategy(marketData: MarketData): TradingSignal {
    const closes = marketData.candles.map(c => parseFloat(c.close));
    const highs = marketData.candles.map(c => parseFloat(c.high));
    const lows = marketData.candles.map(c => parseFloat(c.low));

    if (closes.length < 20) {
      return this.createHoldSignal('Breakout Hunter', marketData, 'Insufficient data');
    }

    const resistance = Math.max(...highs.slice(-20));
    const support = Math.min(...lows.slice(-20));
    const price = closes[closes.length - 1];

    let direction: 'BUY' | 'SELL' | 'HOLD' = "HOLD";
    if (price > resistance) direction = "BUY";
    else if (price < support) direction = "SELL";

    // Fixed: Proper confidence calculation with cap at 95% and minimum 10%
    // Using distance from center of channel as confidence
    const channelCenter = (resistance + support) / 2;
    const channelWidth = resistance - support;
    const confidenceRaw = Math.abs(price - channelCenter) / (channelWidth / 2) * 100;
    const confidence = Math.max(Math.min(confidenceRaw, 95), 10);

    const entry = marketData.currentPrice;
    const stopLoss = direction !== 'HOLD' ? this.calculateStopLoss(entry, direction) : entry;
    const takeProfit = direction !== 'HOLD' ? this.calculateTakeProfit(entry, direction) : entry;

    return {
      strategy: "Breakout Hunter",
      symbol: marketData.symbol,
      direction,
      confidence: Math.round(confidence * 100) / 100,
      entry,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      reasoning: `Price: ${price.toFixed(4)}, Support: ${support.toFixed(4)}, Resistance: ${resistance.toFixed(4)}`,
      volume: marketData.volume
    };
  }

  private createHoldSignal(strategy: string, marketData: MarketData, reason: string): TradingSignal {
    return {
      strategy,
      symbol: marketData.symbol,
      direction: 'HOLD',
      confidence: 0,
      entry: marketData.currentPrice,
      stopLoss: marketData.currentPrice,
      takeProfit: marketData.currentPrice,
      timestamp: new Date().toISOString(),
      reasoning: reason,
      volume: marketData.volume
    };
  }

  // Utility method to validate and normalize confidence values
  private validateConfidence(confidence: number, strategyName: string): number {
    if (isNaN(confidence) || !isFinite(confidence)) {
      console.warn(`${strategyName}: Invalid confidence value, setting to 0`);
      return 0;
    }
    
    if (confidence < 0) {
      console.warn(`${strategyName}: Negative confidence (${confidence}), setting to 0`);
      return 0;
    }
    
    if (confidence > 100) {
      console.warn(`${strategyName}: Confidence over 100% (${confidence}), capping to 95%`);
      return 95;
    }
    
    // Round to 2 decimal places
    return Math.round(confidence * 100) / 100;
  }

  // Main method to get all strategy signals
  async getAllStrategySignals(marketData: MarketData): Promise<TradingSignal[]> {
    const cacheKey = `${marketData.symbol}_${Date.now()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const signals: TradingSignal[] = [];

    try {
      // Run all 5 strategies
      signals.push(this.trendRiderStrategy(marketData));
      signals.push(this.momentumBurstStrategy(marketData));
      signals.push(this.volumeSurgeStrategy(marketData));
      signals.push(this.meanReversalStrategy(marketData));
      signals.push(this.breakoutHunterStrategy(marketData));

      // Filter based on configuration thresholds
      const filteredSignals = signals.filter(signal => {
        const strategyConfig = this.getStrategyConfig(signal.strategy);
        return signal.confidence >= strategyConfig.minConfidence;
      });

      this.cache.set(cacheKey, filteredSignals);
      return filteredSignals;
    } catch (error) {
      console.error('Error getting strategy signals:', error);
      return [];
    }
  }

  private getStrategyConfig(strategyName: string): { weight: number; minConfidence: number; timeframes: string[] } {
    const configMap: { [key: string]: any } = {
      'Trend Rider': LAKSHYA_CONFIG.STRATEGIES.TREND_RIDER,
      'Momentum Burst': LAKSHYA_CONFIG.STRATEGIES.MOMENTUM_BURST,
      'Volume Surge': LAKSHYA_CONFIG.STRATEGIES.VOLUME_SURGE,
      'Mean Reversal': LAKSHYA_CONFIG.STRATEGIES.REVERSAL_CATCHER,
      'Breakout Hunter': LAKSHYA_CONFIG.STRATEGIES.BREAKOUT_HUNTER
    };
    
    return configMap[strategyName] || { weight: 0.2, minConfidence: 75, timeframes: ['5m', '15m'] };
  }

  // Strategy Manager - Refine and learn from trades
  updateStrategyPerformance(signal: TradingSignal, pnl: number): void {
    const performance = this.strategyPerformance.get(signal.strategy);
    if (!performance) return;

    performance.totalTrades++;
    performance.totalPnL += pnl;
    if (pnl > 0) performance.successfulTrades++;
    performance.winRate = (performance.successfulTrades / performance.totalTrades) * 100;
    performance.lastUpdate = Date.now();

    // Auto-refine strategy based on performance
    if (performance.totalTrades >= 10 && performance.winRate < 50) {
      this.refineStrategy(signal.strategy);
    }

    this.strategyPerformance.set(signal.strategy, performance);
  }

  private refineStrategy(strategyName: string): void {
    const performance = this.strategyPerformance.get(strategyName);
    if (!performance) return;

    performance.refinements++;
    
    // Implement refinement logic based on poor performance
    console.log(`🔧 Refining strategy: ${strategyName} - Win Rate: ${performance.winRate.toFixed(1)}%`);
    
    // This is where you could implement machine learning or adaptive parameters
    // For now, we'll adjust confidence thresholds
    const currentConfig = this.getStrategyConfig(strategyName);
    const refinedConfig = {
      ...currentConfig,
      minConfidence: Math.min(currentConfig.minConfidence + 5, 95) // Increase threshold for poor performers
    };
    
    this.refinedStrategies.set(strategyName, refinedConfig);
  }

  getStrategyPerformance(): Map<string, StrategyPerformance> {
    return this.strategyPerformance;
  }

  // Consensus signal with weighted confidence
  async getConsensusSignal(marketData: MarketData): Promise<TradingSignal | null> {
    const signals = await this.getAllStrategySignals(marketData);
    
    if (signals.length === 0) return null;

    // Filter out HOLD signals
    const actionableSignals = signals.filter(s => s.direction !== 'HOLD');
    
    if (actionableSignals.length === 0) return null;

    // Calculate weighted consensus
    let buyWeight = 0, sellWeight = 0;
    let totalConfidence = 0;

    actionableSignals.forEach(signal => {
      const config = this.getStrategyConfig(signal.strategy);
      const weightedConfidence = signal.confidence * config.weight;
      
      if (signal.direction === 'BUY') {
        buyWeight += weightedConfidence;
      } else if (signal.direction === 'SELL') {
        sellWeight += weightedConfidence;
      }
      
      totalConfidence += weightedConfidence;
    });

    const consensusDirection = buyWeight > sellWeight ? 'BUY' : 'SELL';
    const consensusConfidence = Math.max(buyWeight, sellWeight);

    // Only return signal if consensus confidence is above threshold
    if (consensusConfidence < 60) return null;

    const bestSignal = actionableSignals.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return {
      ...bestSignal,
      strategy: 'Consensus',
      direction: consensusDirection,
      confidence: Math.round(consensusConfidence * 100) / 100,
      reasoning: `Consensus from ${actionableSignals.length} strategies: ${actionableSignals.map(s => `${s.strategy}(${s.confidence.toFixed(1)}%)`).join(', ')}`
    };
  }
}

export default AIStrategyCoordinator;
export type { TradingSignal, MarketData, CandleData, StrategyPerformance };