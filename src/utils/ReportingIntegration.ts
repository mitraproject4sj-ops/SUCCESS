import { TradingSignal } from './AIStrategyCoordinator';

interface TelegramMessage {
  message: string;
}

interface GoogleSheetsRow {
  values: (string | number)[];
}

class ReportingIntegration {
  private static instance: ReportingIntegration;

  private constructor() {}

  static getInstance(): ReportingIntegration {
    if (!ReportingIntegration.instance) {
      ReportingIntegration.instance = new ReportingIntegration();
    }
    return ReportingIntegration.instance;
  }

  // Unified Telegram Message (for all strategies)
  createTelegramMessage(signal: TradingSignal): TelegramMessage {
    const directionEmoji = signal.direction === 'BUY' ? '🟢' : signal.direction === 'SELL' ? '🔴' : '⭕';
    const confidenceEmoji = signal.confidence > 85 ? '🔥' : signal.confidence > 70 ? '⚡' : '📊';
    
    return {
      message: `${confidenceEmoji} *${signal.strategy} Signal* ${directionEmoji}\n\n` +
               `🪙 *Symbol:* ${signal.symbol}\n` +
               `📈 *Direction:* ${signal.direction}\n` +
               `🎯 *Entry:* ₹${signal.entry.toFixed(4)}\n` +
               `⛔ *Stop Loss:* ₹${signal.stopLoss.toFixed(4)}\n` +
               `🏆 *Take Profit:* ₹${signal.takeProfit.toFixed(4)}\n` +
               `${confidenceEmoji} *Confidence:* ${signal.confidence.toFixed(2)}%\n` +
               `💰 *Volume:* ${signal.volume ? this.formatVolume(signal.volume) : 'N/A'}\n` +
               `🕒 *Time:* ${new Date(signal.timestamp).toLocaleTimeString('en-IN')}\n` +
               `📝 *Reasoning:* ${signal.reasoning}\n\n` +
               `💡 *Risk-Reward:* 1:2 ratio\n` +
               `⚖️ *Risk:* ${((signal.entry - signal.stopLoss) / signal.entry * 100).toFixed(2)}%\n` +
               `🎯 *Reward:* ${((signal.takeProfit - signal.entry) / signal.entry * 100).toFixed(2)}%`
    };
  }

  // Google Sheets Row (for all strategies)
  createGoogleSheetsRow(signal: TradingSignal): GoogleSheetsRow {
    return {
      values: [
        new Date(signal.timestamp).toLocaleString('en-IN'),
        signal.strategy,
        signal.symbol,
        signal.direction,
        signal.entry,
        signal.stopLoss,
        signal.takeProfit,
        signal.confidence,
        signal.volume || 0,
        signal.reasoning,
        `${((signal.entry - signal.stopLoss) / signal.entry * 100).toFixed(2)}%`, // Risk %
        `${((signal.takeProfit - signal.entry) / signal.entry * 100).toFixed(2)}%`, // Reward %
        '1:2' // Risk-Reward Ratio
      ]
    };
  }

  // Batch process multiple signals for Telegram
  createBatchTelegramMessage(signals: TradingSignal[]): TelegramMessage {
    if (signals.length === 0) {
      return {
        message: '📊 *LAKSHYA Trading Update*\n\n🔍 No trading signals at the moment.\n\n⏱️ Next scan in 5 minutes...'
      };
    }

    const buySignals = signals.filter(s => s.direction === 'BUY');
    const sellSignals = signals.filter(s => s.direction === 'SELL');
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    let message = `📊 *LAKSHYA Multi-Strategy Alert* 🚀\n\n`;
    message += `📈 *Market Summary:*\n`;
    message += `• ${buySignals.length} BUY signals 🟢\n`;
    message += `• ${sellSignals.length} SELL signals 🔴\n`;
    message += `• Average Confidence: ${avgConfidence.toFixed(1)}%\n`;
    message += `• Strategies Active: ${signals.length}\n\n`;

    // Top 3 highest confidence signals
    const topSignals = signals
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    message += `🏆 *Top Signals:*\n`;
    topSignals.forEach((signal, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      message += `${emoji} *${signal.strategy}* - ${signal.symbol}\n`;
      message += `   📊 ${signal.direction} at ₹${signal.entry.toFixed(4)} (${signal.confidence.toFixed(1)}%)\n`;
    });

    message += `\n🕒 *Generated:* ${new Date().toLocaleTimeString('en-IN')}`;
    message += `\n💡 *Next Update:* 5 minutes`;

    return { message };
  }

  // Create Excel export format
  createExcelData(signals: TradingSignal[]): (string | number)[][] {
    const headers = [
      'Timestamp',
      'Strategy',
      'Symbol', 
      'Direction',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'Confidence (%)',
      'Volume',
      'Reasoning',
      'Risk %',
      'Reward %',
      'R:R Ratio',
      'Status'
    ];

    const data: (string | number)[][] = [headers];
    
    signals.forEach(signal => {
      const row = this.createGoogleSheetsRow(signal);
      data.push([...row.values, 'Active']);
    });

    return data;
  }

  // Format volume for readability
  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toFixed(0);
  }

  // Create performance summary message
  createPerformanceSummary(performanceData: any): TelegramMessage {
    const { totalTrades, totalPnL, overallWinRate, strategies } = performanceData;
    
    let message = `📊 *LAKSHYA Performance Report* 📈\n\n`;
    message += `💰 *Total P&L:* ₹${totalPnL.toFixed(2)}\n`;
    message += `📊 *Total Trades:* ${totalTrades}\n`;
    message += `🎯 *Win Rate:* ${overallWinRate.toFixed(1)}%\n`;
    message += `📅 *Report Date:* ${new Date().toLocaleDateString('en-IN')}\n\n`;

    message += `🏆 *Strategy Performance:*\n`;
    
    Array.from(strategies.entries()).forEach(([strategyName, perf]: [string, any]) => {
      const emoji = perf.winRate > 70 ? '🔥' : perf.winRate > 50 ? '✅' : '⚠️';
      message += `${emoji} *${strategyName}:*\n`;
      message += `   • Win Rate: ${perf.winRate.toFixed(1)}%\n`;
      message += `   • P&L: ₹${perf.totalPnL.toFixed(2)}\n`;
      message += `   • Trades: ${perf.totalTrades}\n`;
    });

    const bestStrategy = Array.from(strategies.entries())
      .sort(([,a], [,b]) => b.winRate - a.winRate)[0];
    
    if (bestStrategy) {
      message += `\n🥇 *Best Performer:* ${bestStrategy[0]} (${bestStrategy[1].winRate.toFixed(1)}% win rate)`;
    }

    return { message };
  }

  // Create risk alert message
  createRiskAlert(alertType: string, data: any): TelegramMessage {
    let message = `🚨 *LAKSHYA Risk Alert* 🚨\n\n`;
    
    switch (alertType) {
      case 'DAILY_LOSS_LIMIT':
        message += `⚠️ *Daily Loss Limit Reached*\n`;
        message += `💸 Current Loss: ₹${data.currentLoss}\n`;
        message += `🛑 Limit: ₹${data.limit}\n`;
        message += `🔄 Recovery Mode: ${data.recoveryMode ? 'ACTIVE' : 'INACTIVE'}\n`;
        break;
      
      case 'CONSECUTIVE_LOSSES':
        message += `📉 *Consecutive Losses Alert*\n`;
        message += `🔴 Losses in a row: ${data.consecutiveLosses}\n`;
        message += `⏸️ Cooldown activated: ${data.cooldownMinutes} minutes\n`;
        break;
      
      case 'HIGH_VOLATILITY':
        message += `⚡ *High Market Volatility*\n`;
        message += `📊 Volatility: ${data.volatility}%\n`;
        message += `🎯 Reducing position sizes by 50%\n`;
        break;
    }
    
    message += `\n🕒 *Time:* ${new Date().toLocaleTimeString('en-IN')}`;
    message += `\n💡 *Action:* System adjustments applied automatically`;
    
    return { message };
  }
}

export default ReportingIntegration;
export type { TelegramMessage, GoogleSheetsRow };