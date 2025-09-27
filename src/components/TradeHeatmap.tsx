import React from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';

interface TradeHeatmapProps {
  data: {
    hour: number;
    day: string;
    value: number;
    trades: number;
  }[];
}

export default function TradeHeatmap({ data }: TradeHeatmapProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (value: number) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return Math.max(0.1, value / maxValue);
  };

  const getColor = (value: number) => {
    return value >= 0 
      ? `rgba(16, 185, 129, ${getIntensity(value)})`  // Green for profit
      : `rgba(239, 68, 68, ${getIntensity(Math.abs(value))})`; // Red for loss
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Trading Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1">
            <div className="h-8"></div> {/* Empty corner cell */}
            {hours.map(hour => (
              <div key={hour} className="text-center text-xs text-slate-400">
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
            
            {days.map(day => (
              <React.Fragment key={day}>
                <div className="text-sm text-slate-400 pr-2 flex items-center">{day}</div>
                {hours.map(hour => {
                  const cellData = data.find(d => d.hour === hour && d.day === day);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square rounded relative group"
                      style={{
                        backgroundColor: cellData ? getColor(cellData.value) : 'rgba(51, 65, 85, 0.3)',
                      }}
                    >
                      {cellData && (
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-slate-800 rounded-lg text-xs text-white whitespace-nowrap z-10">
                          <p>Time: {hour.toString().padStart(2, '0')}:00</p>
                          <p>Trades: {cellData.trades}</p>
                          <p>P&L: ₹{cellData.value.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-green-500/20"></div>
            <span className="text-xs text-slate-400">Low Profit</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-slate-400">High Profit</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-red-500/20"></div>
            <span className="text-xs text-slate-400">Low Loss</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-400">High Loss</span>
          </div>
        </div>
      </div>
    </div>
  );
}