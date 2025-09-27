export interface AdvancedMetrics {
  maxDrawdown: number;
  winRate: number;
  avgProfit: number;
  totalTrades: number;
}

export const calculateAdvancedMetrics = (trades: any[]): AdvancedMetrics => {
  let peak = 0;
  let maxDrawdown = 0;
  let equity = 0;
  let wins = 0;
  let totalProfit = 0;

  trades.forEach(trade => {
    const pnl = trade.value;
    equity += pnl;

    if (equity > peak) {
      peak = equity;
    } else {
      const currentDrawdown = peak - equity;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    }

    if (pnl > 0) {
      wins++;
      totalProfit += pnl;
    }
  });

  return {
    maxDrawdown,
    winRate: (wins / trades.length) * 100,
    avgProfit: totalProfit / trades.length,
    totalTrades: trades.length
  };
};