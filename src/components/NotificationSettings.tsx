import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, TrendingUp, Settings, User, Shield, Palette, Database } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { state } = useTradingContext();
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Strategy Signal Generated',
      message: 'Trend Rider strategy generated BUY signal for BTCUSDT at 78.5% confidence',
      time: '2 minutes ago',
      isRead: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Volume Detected',
      message: 'Volume Surge detected on ETHUSDT - 250% above average volume',
      time: '5 minutes ago',
      isRead: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Backend Connected',
      message: 'Successfully connected to Render backend - Live data streaming',
      time: '10 minutes ago',
      isRead: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Risk Limit Approached',
      message: 'Daily risk limit at 85% - Consider reducing position sizes',
      time: '15 minutes ago',
      isRead: true
    }
  ];

  const [settings, setSettings] = useState({
    telegram: {
      enabled: true,
      signals: true,
      alerts: true,
      reports: false
    },
    email: {
      enabled: false,
      dailyReports: true,
      criticalAlerts: true
    },
    display: {
      theme: 'dark',
      refreshRate: 30,
      showConfidence: true,
      compactMode: false
    },
    trading: {
      autoTrade: false,
      minConfidence: 75,
      maxRisk: 2,
      stopLoss: true
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-800 shadow-xl border-l border-gray-600"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'notifications' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    Mark all read
                  </button>
                </div>
                
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      notification.isRead 
                        ? 'bg-gray-700/50 border-gray-600' 
                        : 'bg-blue-900/20 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Settings</h3>
                
                {/* Telegram Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h4 className="text-md font-medium text-white">Telegram Notifications</h4>
                  </div>
                  
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Enable Telegram</span>
                      <button
                        onClick={() => handleSettingChange('telegram', 'enabled', !settings.telegram.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.telegram.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.telegram.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Trading Signals</span>
                      <button
                        onClick={() => handleSettingChange('telegram', 'signals', !settings.telegram.signals)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.telegram.signals ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.telegram.signals ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Risk Alerts</span>
                      <button
                        onClick={() => handleSettingChange('telegram', 'alerts', !settings.telegram.alerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.telegram.alerts ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.telegram.alerts ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h4 className="text-md font-medium text-white">Display Settings</h4>
                  </div>
                  
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Refresh Rate (seconds)</span>
                      <select
                        value={settings.display.refreshRate}
                        onChange={(e) => handleSettingChange('display', 'refreshRate', parseInt(e.target.value))}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                      >
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Show Confidence Scores</span>
                      <button
                        onClick={() => handleSettingChange('display', 'showConfidence', !settings.display.showConfidence)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.display.showConfidence ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.display.showConfidence ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trading Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h4 className="text-md font-medium text-white">Trading Settings</h4>
                  </div>
                  
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Auto Trading</span>
                      <button
                        onClick={() => handleSettingChange('trading', 'autoTrade', !settings.trading.autoTrade)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.trading.autoTrade ? 'bg-red-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.trading.autoTrade ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Min Confidence (%)</span>
                      <input
                        type="number"
                        value={settings.trading.minConfidence}
                        onChange={(e) => handleSettingChange('trading', 'minConfidence', parseInt(e.target.value))}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm w-16"
                        min="50"
                        max="95"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationSettings;