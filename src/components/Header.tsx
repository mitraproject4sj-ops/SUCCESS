import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Settings, Bell, User, LogOut, TrendingUp } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';

interface User { id: string; name: string; email: string; avatar?: string; }
interface HeaderProps { user: User | null; onLogout: () => void; }

export default function Header({ user, onLogout }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { state, testTelegram, runStrategies } = useTradingContext();

  const handleTestTelegram = async () => {
    try {
      await testTelegram();
      alert('Test message sent to Telegram!');
    } catch (error) {
      alert('Failed to send test message. Check your backend configuration.');
    }
  };

  const handleRunStrategies = async () => {
    try {
      await runStrategies();
      alert('Strategies executed! Check Telegram for signals.');
    } catch (error) {
      alert('Failed to run strategies. Check your backend.');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TradingBot Pro</h1>
              <p className="text-xs text-blue-400">Live Trading Dashboard</p>
            </div>
          </motion.div>

          {/* Center - Status */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              state.isConnected ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                state.isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                state.isConnected ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {state.isConnected ? 'Live Data' : 'Demo Mode'}
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleTestTelegram}
              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
            >
              Test Telegram
            </button>
            
            <button
              onClick={handleRunStrategies}
              className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors"
            >
              Run Strategies
            </button>
          </div>

          {/* Right - Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-white cursor-pointer hover:text-blue-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {state.signals.length}
              </span>
            </div>

            <Settings className="h-5 w-5 text-white cursor-pointer hover:text-blue-400" />

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-white text-sm font-medium">{user?.name || 'User'}</span>
              </button>

              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl z-50"
                >
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-semibold">{user?.name}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setIsProfileOpen(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors flex items-center space-x-3 text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
