export interface AdvancedMetrics {
  maxDrawdown: number;
  recoveryFactor: number;
  calmarRatio: number;
  expectancy: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export const calculateAdvancedMetrics = (trades: any[]): AdvancedMetrics => {
  let peak = 0;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  let equity = 0;
  let wins = 0;
  let losses = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let currentConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let largestWin = 0;
  let largestLoss = 0;

  trades.forEach(trade => {
    const pnl = trade.value;
    equity += pnl;

    if (equity > peak) {
      peak = equity;
      currentDrawdown = 0;
    } else {
      currentDrawdown = peak - equity;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    }

    if (pnl > 0) {
      wins++;
      totalWins += pnl;
      currentConsecutiveWins++;
      currentConsecutiveLosses = 0;
      if (pnl > largestWin) largestWin = pnl;
    } else if (pnl < 0) {
      losses++;
      totalLosses += Math.abs(pnl);
      currentConsecutiveLosses++;
      currentConsecutiveWins = 0;
      if (Math.abs(pnl) > largestLoss) largestLoss = Math.abs(pnl);
    }

    maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
    maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
  });

  const averageWin = wins > 0 ? totalWins / wins : 0;
  const averageLoss = losses > 0 ? totalLosses / losses : 0;
  const winRate = trades.length > 0 ? wins / trades.length : 0;
  const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);
  const annualReturn = equity; // Simplified annual return
  const calmarRatio = maxDrawdown > 0 ? annualReturn / maxDrawdown : 0;
  const recoveryFactor = maxDrawdown > 0 ? Math.abs(equity) / maxDrawdown : 0;

  return {
    maxDrawdown,
    recoveryFactor,
    calmarRatio,
    expectancy,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses
  };
};