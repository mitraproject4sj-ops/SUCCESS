interface TradeAllocation {
  capital: number;
  riskAmount: number;
  maxLoss: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  expectedReturn: number;
}

interface DailyTarget {
  targetAmount: number;
  achievedAmount: number;
  remainingAmount: number;
  trades: number;
  successRate: number;
}

class RiskManager {
  private static instance: RiskManager;
  private dailyTarget: number = 10000; // Target ₹10,000 per day
  private maxDailyLoss: number = 5000; // Maximum daily loss limit
  private maxTradesPerDay: number = 15; // Limit trades to prevent overtrading
  private minTradeSuccess: number = 0.6; // Minimum 60% success rate required

  private totalCapital: number = 50000; // Total capital ₹50,000
  private usedCapital: number = 0;
  private dailyPnL: number = 0;
  private todayTrades: number = 0;
  private successfulTrades: number = 0;

  private constructor() {
    this.resetDailyStats(); // Reset stats at market open
  }

  static getInstance(): RiskManager {
    if (!RiskManager.instance) {
      RiskManager.instance = new RiskManager();
    }
    return RiskManager.instance;
  }

  private resetDailyStats() {
    const now = new Date();
    const marketOpen = new Date();
    marketOpen.setHours(9, 15, 0, 0);

    if (now >= marketOpen) {
      this.dailyPnL = 0;
      this.todayTrades = 0;
      this.successfulTrades = 0;
      this.usedCapital = 0;
    }
  }

  calculateTradeAllocation(
    price: number,
    confidence: number,
    volatility: number
  ): TradeAllocation | null {
    // Don't trade if daily loss limit reached or too many trades
    if (this.dailyPnL <= -this.maxDailyLoss || this.todayTrades >= this.maxTradesPerDay) {
      return null;
    }

    // Don't trade if success rate drops below minimum
    const currentSuccessRate = this.todayTrades > 0 ? 
      this.successfulTrades / this.todayTrades : 1;
    if (this.todayTrades > 5 && currentSuccessRate < this.minTradeSuccess) {
      return null;
    }

    // Calculate position size based on confidence and volatility
    const baseRisk = 100; // Base risk amount ₹100
    const riskMultiplier = (confidence / 100) * (1 - volatility);
    const riskAmount = baseRisk * riskMultiplier;

    // Calculate stop loss and take profit
    const stopLossPercent = volatility * 1.5;
    const takeProfitPercent = volatility * 2.5;

    const stopLoss = price * (1 - stopLossPercent);
    const takeProfit = price * (1 + takeProfitPercent);

    // Calculate quantity based on risk
    const riskPerUnit = price - stopLoss;
    const quantity = Math.floor(riskAmount / riskPerUnit);

    // Calculate expected return
    const expectedReturn = (takeProfit - price) * quantity;

    // Verify if trade meets minimum return requirement
    const minimumReturn = 500; // Minimum ₹500 expected return
    if (expectedReturn < minimumReturn) {
      return null;
    }

    // Verify if we have enough capital
    const requiredCapital = price * quantity;
    if (this.usedCapital + requiredCapital > this.totalCapital) {
      return null;
    }

    return {
      capital: requiredCapital,
      riskAmount,
      maxLoss: riskAmount,
      entryPrice: price,
      stopLoss,
      takeProfit,
      quantity,
      expectedReturn
    };
  }

  async updateTradeResult(pnl: number) {
    this.dailyPnL += pnl;
    this.todayTrades++;
    if (pnl > 0) {
      this.successfulTrades++;
    }
  }

  getDailyStats(): DailyTarget {
    return {
      targetAmount: this.dailyTarget,
      achievedAmount: this.dailyPnL,
      remainingAmount: Math.max(0, this.dailyTarget - this.dailyPnL),
      trades: this.todayTrades,
      successRate: this.todayTrades > 0 ? 
        (this.successfulTrades / this.todayTrades) * 100 : 0
    };
  }

  getTradeRecommendations(): string[] {
    const stats = this.getDailyStats();
    const recommendations: string[] = [];

    if (stats.trades === 0) {
      recommendations.push("Start with smaller position sizes early in the day");
    }

    if (stats.successRate < 50) {
      recommendations.push("Consider taking a break and reviewing strategy");
    }

    if (stats.achievedAmount >= this.dailyTarget) {
      recommendations.push("Daily target achieved. Consider stopping for the day");
    }

    if (stats.trades > 10 && stats.achievedAmount < 0) {
      recommendations.push("Experiencing drawdown. Reduce position sizes");
    }

    return recommendations;
  }
}