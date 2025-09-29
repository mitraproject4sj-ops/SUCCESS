import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActiveTrade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  riskAmount: number;
  stopLoss: number;
  takeProfit: number;
}

interface DynamicPNLProps {
  className?: string;
}

export default function DynamicPNL({ className = '' }: DynamicPNLProps) {
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [unrealizedPNL, setUnrealizedPNL] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const generateActiveTrades = () => {
      const mockTrades: ActiveTrade[] = [
        {
          id: '1',
          symbol: 'BTCUSDT',
          direction: 'BUY',
          entryPrice: 43250,
          quantity: 0.5,
          currentPrice: 43420,
          pnl: 85,
          pnlPercentage: 0.39,
          riskAmount: 225,
          stopLoss: 42800,
          takeProfit: 44500
        },
        {
          id: '2',
          symbol: 'ETHUSDT',
          direction: 'SELL',
          entryPrice: 2650,
          quantity: 2,
          currentPrice: 2620,
          pnl: 60,
          pnlPercentage: 1.13,
          riskAmount: 120,
          stopLoss: 2750,
          takeProfit: 2550
        },
        {
          id: '3',
          symbol: 'BNBUSDT',
          direction: 'BUY',
          entryPrice: 312.45,
          quantity: 5,
          currentPrice: 315.20,
          pnl: 13.75,
          pnlPercentage: 0.88,
          riskAmount: 122.25,
          stopLoss: 308,
          takeProfit: 331
        }
      ];

      // Add some random movement
      const updatedTrades = mockTrades.map(trade => {
        const priceChange = (Math.random() - 0.5) * 20; // ±10
        const newPrice = trade.currentPrice + priceChange;
        const newPNL = (newPrice - trade.entryPrice) * trade.quantity * (trade.direction === 'BUY' ? 1 : -1);
        const newPNLPercentage = ((newPrice - trade.entryPrice) / trade.entryPrice) * 100 * (trade.direction === 'BUY' ? 1 : -1);

        return {
          ...trade,
          currentPrice: newPrice,
          pnl: newPNL,
          pnlPercentage: newPNLPercentage
        };
      });

      setActiveTrades(updatedTrades);

      const totalRisk = updatedTrades.reduce((sum, trade) => sum + trade.riskAmount, 0);
      const totalPNL = updatedTrades.reduce((sum, trade) => sum + trade.pnl, 0);

      setTotalAtRisk(totalRisk);
      setUnrealizedPNL(totalPNL);
    };

    generateActiveTrades();

    // Update every 3 seconds
    const interval = setInterval(generateActiveTrades, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseTrade = (tradeId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setActiveTrades(prev => prev.filter(trade => trade.id !== tradeId));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Dynamic PNL</h3>
            <p className="text-sm text-slate-400">Capital at Risk & Unrealized P&L</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-white">₹{totalAtRisk.toLocaleString()}</p>
          <p className="text-sm text-slate-400">Total at Risk</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Trades</p>
              <p className="text-xl font-bold text-blue-400">{activeTrades.length}</p>
            </div>
            <Activity className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Unrealized P&L</p>
              <p className={`text-xl font-bold ${unrealizedPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedPNL >= 0 ? '+' : ''}₹{unrealizedPNL.toFixed(2)}
              </p>
            </div>
            {unrealizedPNL >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Risk %</p>
              <p className="text-xl font-bold text-orange-400">
                {((totalAtRisk / 50000) * 100).toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Active Trades List */}
      <div className="space-y-3">
        <h4 className="text-white font-medium mb-3">Active Positions</h4>

        {activeTrades.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">No active trades</p>
          </div>
        ) : (
          activeTrades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Trade Direction Indicator */}
                  <div className={`w-3 h-3 rounded-full ${
                    trade.direction === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>

                  {/* Symbol & Direction */}
                  <div>
                    <p className="font-medium text-white">{trade.symbol}</p>
                    <p className="text-sm text-slate-400">{trade.direction}</p>
                  </div>

                  {/* Entry & Current Price */}
                  <div className="text-sm">
                    <p className="text-slate-400">Entry: ₹{trade.entryPrice.toLocaleString()}</p>
                    <p className="text-white">Current: ₹{trade.currentPrice.toFixed(2)}</p>
                  </div>

                  {/* Quantity */}
                  <div className="text-sm">
                    <p className="text-slate-400">Qty</p>
                    <p className="text-white">{trade.quantity}</p>
                  </div>
                </div>

                {/* P&L & Risk */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                    </p>
                    <p className={`text-sm ${trade.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p className="text-slate-400">Risk</p>
                    <p className="text-orange-400">₹{trade.riskAmount.toFixed(2)}</p>
                  </div>

                  {/* Close Trade Button */}
                  <button
                    onClick={() => handleCloseTrade(trade.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Stop Loss & Take Profit Levels */}
              <div className="flex items-center space-x-6 mt-3 pt-3 border-t border-slate-600/30">
                <div className="text-sm">
                  <span className="text-slate-400">SL: </span>
                  <span className="text-red-400">₹{trade.stopLoss.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">TP: </span>
                  <span className="text-green-400">₹{trade.takeProfit.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}