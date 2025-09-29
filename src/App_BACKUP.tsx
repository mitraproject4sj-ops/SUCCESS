import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedTradingDashboard from './components/AdvancedTradingDashboard';
import Dashboard from './components/Dashboard';
import ComprehensiveDashboard from './components/ComprehensiveDashboard';
import ProfessionalTradingDashboard from './components/ProfessionalTradingDashboard';
import Login from './components/Login';
import Header from './components/Header';
import MonitoringDashboard from './components/MonitoringDashboard';
import TroubleshootingPanel from './components/TroubleshootingPanel';
// import AccessControl from './components/AccessControl'; // Temporarily disabled
import { TradingProvider } from './context/TradingContext';
import AutoTroubleshooter from './utils/AutoTroubleshooter';

interface User { 
  id: string; 
  name: string; 
  email: string; 
  avatar?: string; 
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(true); // Temporarily bypass access control
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already unlocked
    const unlocked = localStorage.getItem('lakshya_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    
    const storedAuth = localStorage.getItem('trading_auth');
    const storedUser = localStorage.getItem('trading_user');
    
    if (storedAuth === 'true' && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('trading_auth');
        localStorage.removeItem('trading_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('lakshya_unlocked', 'true');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('trading_auth', 'true');
    localStorage.setItem('trading_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsUnlocked(false);
    localStorage.removeItem('trading_auth');
    localStorage.removeItem('trading_user');
    localStorage.removeItem('lakshya_unlocked');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading LAKSHYA...</div>
      </div>
    );
  }

  // Show access control first - TEMPORARILY DISABLED
  // if (!isUnlocked) {
  //   return <AccessControl onUnlock={handleUnlock} />;
  // }

  return (
    <TradingProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Login onLogin={handleLogin} />
              </motion.div>
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Header user={user} onLogout={handleLogout} />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<ProfessionalTradingDashboard />} />
                    <Route path="/comprehensive" element={<ComprehensiveDashboard />} />
                    <Route path="/advanced" element={<AdvancedTradingDashboard />} />
                    <Route path="/monitoring" element={<MonitoringDashboard />} />
                    <Route path="/troubleshooting" element={<TroubleshootingPanel />} />
                    <Route path="/basic" element={<Dashboard />} />
                  </Routes>
                </main>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Router>
    </TradingProvider>
  );
}