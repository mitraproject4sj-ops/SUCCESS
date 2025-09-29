import AIStrategyCoordinator, { TradingSignal, MarketData, StrategyPerformance } from './AIStrategyCoordinator';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';

interface TradeResult {
  signal: TradingSignal;
  pnl: number;
  executedAt: number;
  closedAt: number;
  actualEntry: number;
  actualExit: number;
  slippage: number;
}

interface StrategyInsight {
  strategy: string;
  bestTimeFrames: string[];
  bestMarketConditions: string[];
  avgSlippage: number;
  bestPerformanceHours: number[];
  recommendations: string[];
}

class StrategyManager {
  private static instance: StrategyManager;
  private aiCoordinator: AIStrategyCoordinator;
  private tradeHistory: TradeResult[];
  private strategyInsights: Map<string, StrategyInsight>;
  private learningData: Map<string, any[]>;

  private constructor() {
    this.aiCoordinator = AIStrategyCoordinator.getInstance();
    this.tradeHistory = [];
    this.strategyInsights = new Map();
    this.learningData = new Map();
    this.initializeInsights();
  }

  static getInstance(): StrategyManager {
    if (!StrategyManager.instance) {
      StrategyManager.instance = new StrategyManager();
    }
    return StrategyManager.instance;
  }

  private initializeInsights(): void {
    const strategies = ['Trend Rider', 'Momentum Burst', 'Volume Surge', 'Mean Reversal', 'Breakout Hunter'];
    strategies.forEach(strategy => {
      this.strategyInsights.set(strategy, {
        strategy,
        bestTimeFrames: ['5m', '15m'],
        bestMarketConditions: ['trending', 'volatile'],
        avgSlippage: 0.05,
        bestPerformanceHours: [9, 10, 11, 14, 15],
        recommendations: []
      });
      this.learningData.set(strategy, []);
    });
  }

  // Record trade result for learning
  recordTradeResult(tradeResult: TradeResult): void {
    this.tradeHistory.push(tradeResult);
    
    // Update AI coordinator performance
    this.aiCoordinator.updateStrategyPerformance(tradeResult.signal, tradeResult.pnl);
    
    // Collect learning data
    const strategyData = this.learningData.get(tradeResult.signal.strategy) || [];
    strategyData.push({
      confidence: tradeResult.signal.confidence,
      pnl: tradeResult.pnl,
      marketCondition: this.analyzeMarketCondition(tradeResult),
      timeOfDay: new Date(tradeResult.executedAt).getHours(),
      slippage: tradeResult.slippage
    });
    this.learningData.set(tradeResult.signal.strategy, strategyData);
    
    // Update insights every 10 trades
    if (this.tradeHistory.length % 10 === 0) {
      this.updateStrategyInsights();
    }
  }

  private analyzeMarketCondition(tradeResult: TradeResult): string {
    // Simple market condition analysis based on price movement and volume
    const priceChange = Math.abs((tradeResult.actualExit - tradeResult.actualEntry) / tradeResult.actualEntry);
    
    if (priceChange > 0.02) return 'volatile';
    if (priceChange < 0.005) return 'sideways';
    return 'trending';
  }

  private updateStrategyInsights(): void {
    this.learningData.forEach((data, strategyName) => {
      if (data.length < 5) return; // Need minimum data points
      
      const insight = this.strategyInsights.get(strategyName);
      if (!insight) return;
      
      // Analyze best performance hours
      const hourlyPerformance = new Map<number, { total: number; count: number; avg: number }>();
      
      data.forEach(trade => {
        const hour = trade.timeOfDay;
        const existing = hourlyPerformance.get(hour) || { total: 0, count: 0, avg: 0 };
        existing.total += trade.pnl;
        existing.count += 1;
        existing.avg = existing.total / existing.count;
        hourlyPerformance.set(hour, existing);
      });
      
      // Get top performing hours
      const bestHours = Array.from(hourlyPerformance.entries())
        .filter(([, perf]) => perf.count >= 2) // Minimum 2 trades
        .sort(([, a], [, b]) => b.avg - a.avg)
        .slice(0, 5)
        .map(([hour]) => hour);
      
      insight.bestPerformanceHours = bestHours;
      
      // Analyze market conditions
      const conditionPerformance = new Map<string, number[]>();
      data.forEach(trade => {
        const condition = trade.marketCondition;
        if (!conditionPerformance.has(condition)) {
          conditionPerformance.set(condition, []);
        }
        conditionPerformance.get(condition)!.push(trade.pnl);
      });
      
      // Get best market conditions
      const bestConditions = Array.from(conditionPerformance.entries())
        .map(([condition, pnls]) => ({
          condition,
          avgPnl: pnls.reduce((a, b) => a + b, 0) / pnls.length,
          winRate: pnls.filter(p => p > 0).length / pnls.length
        }))
        .filter(c => c.winRate > 0.5)
        .sort((a, b) => b.avgPnl - a.avgPnl)
        .map(c => c.condition);
      
      insight.bestMarketConditions = bestConditions.slice(0, 3);
      
      // Calculate average slippage
      insight.avgSlippage = data.reduce((sum, trade) => sum + trade.slippage, 0) / data.length;
      
      // Generate recommendations
      insight.recommendations = this.generateRecommendations(strategyName, data, insight);
      
      this.strategyInsights.set(strategyName, insight);
    });
  }

  private generateRecommendations(strategyName: string, data: any[], insight: StrategyInsight): string[] {
    const recommendations: string[] = [];
    const winRate = data.filter(t => t.pnl > 0).length / data.length;
    
    if (winRate < 0.5) {
      recommendations.push(`⚠️ ${strategyName} win rate is below 50%. Consider increasing confidence threshold.`);
    }
    
    if (insight.avgSlippage > 0.1) {
      recommendations.push(`📉 High slippage detected (${(insight.avgSlippage * 100).toFixed(2)}%). Consider adjusting entry timing.`);
    }
    
    if (insight.bestPerformanceHours.length > 0) {
      recommendations.push(`⏰ Best performance during hours: ${insight.bestPerformanceHours.join(', ')}`);
    }
    
    if (insight.bestMarketConditions.length > 0) {
      recommendations.push(`📊 Performs best in: ${insight.bestMarketConditions.join(', ')} markets`);
    }
    
    // Confidence analysis
    const highConfTrades = data.filter(t => t.confidence > 80);
    const lowConfTrades = data.filter(t => t.confidence < 60);
    
    if (highConfTrades.length > 0) {
      const highConfWinRate = highConfTrades.filter(t => t.pnl > 0).length / highConfTrades.length;
      recommendations.push(`🎯 High confidence trades (>80%) win rate: ${(highConfWinRate * 100).toFixed(1)}%`);
    }
    
    return recommendations;
  }

  // Get enhanced signals with learning insights
  async getEnhancedSignals(marketData: MarketData): Promise<TradingSignal[]> {
    const baseSignals = await this.aiCoordinator.getAllStrategySignals(marketData);
    const currentHour = new Date().getHours();
    
    return baseSignals.map(signal => {
      const insight = this.strategyInsights.get(signal.strategy);
      if (!insight) return signal;
      
      // Adjust confidence based on insights
      let adjustedConfidence = signal.confidence;
      
      // Time-based adjustment
      if (insight.bestPerformanceHours.includes(currentHour)) {
        adjustedConfidence *= 1.1; // 10% boost for best hours
      }
      
      // Market condition adjustment (simplified)
      const currentCondition = this.getCurrentMarketCondition(marketData);
      if (insight.bestMarketConditions.includes(currentCondition)) {
        adjustedConfidence *= 1.05; // 5% boost for favorable conditions
      }
      
      // Cap at 95%
      adjustedConfidence = Math.min(adjustedConfidence, 95);
      
      return {
        ...signal,
        confidence: Math.round(adjustedConfidence * 100) / 100,
        reasoning: `${signal.reasoning} | Enhanced: Time(${currentHour}h), Condition(${currentCondition})`
      };
    });
  }

  private getCurrentMarketCondition(marketData: MarketData): string {
    // Simplified market condition analysis
    if (marketData.candles.length < 10) return 'unknown';
    
    const recentPrices = marketData.candles.slice(-10).map(c => parseFloat(c.close));
    const priceRange = Math.max(...recentPrices) - Math.min(...recentPrices);
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const volatility = priceRange / avgPrice;
    
    if (volatility > 0.02) return 'volatile';
    if (volatility < 0.005) return 'sideways';
    return 'trending';
  }

  // Get strategy performance report
  getPerformanceReport(): {
    strategies: Map<string, StrategyPerformance>;
    insights: Map<string, StrategyInsight>;
    totalTrades: number;
    totalPnL: number;
    overallWinRate: number;
  } {
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0).length;
    
    return {
      strategies: this.aiCoordinator.getStrategyPerformance(),
      insights: this.strategyInsights,
      totalTrades: this.tradeHistory.length,
      totalPnL,
      overallWinRate: this.tradeHistory.length > 0 ? (winningTrades / this.tradeHistory.length) * 100 : 0
    };
  }

  // Create refined strategy based on learning
  createRefinedStrategy(baseStrategy: string): TradingSignal | null {
    const insight = this.strategyInsights.get(baseStrategy);
    const strategyData = this.learningData.get(baseStrategy);
    
    if (!insight || !strategyData || strategyData.length < 20) {
      return null; // Need sufficient data
    }
    
    // This is where you could implement more sophisticated ML algorithms
    console.log(`🧠 Creating refined strategy based on ${baseStrategy} with ${strategyData.length} data points`);
    
    // For now, return null - this would be expanded with actual ML implementation
    return null;
  }

  // Export learning data for external analysis
  exportLearningData(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      tradeHistory: this.tradeHistory,
      insights: Object.fromEntries(this.strategyInsights),
      learningData: Object.fromEntries(this.learningData)
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

export default StrategyManager;
export type { TradeResult, StrategyInsight };