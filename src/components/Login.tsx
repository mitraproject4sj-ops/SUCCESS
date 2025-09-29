import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

interface User { id: string; name: string; email: string; avatar?: string; }
interface LoginProps { onLogin: (user: User) => void; }

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const user: User = { id: '1', name: 'Trading Expert', email: formData.email || 'trader@example.com' };
    setIsLoading(false);
    onLogin(user);
  };

  const handleDemoLogin = () => {
    const demoUser: User = { id: 'demo', name: 'Demo Trader', email: 'demo@tradingbot.com' };
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="inline-flex items-center space-x-2 mb-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">LAKSHYA BOT</h1>
              </div>
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Access your trading dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit" 
              disabled={isLoading} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">Or try our demo</p>
              <motion.button 
                type="button" 
                onClick={handleDemoLogin} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Demo Dashboard
              </motion.button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium text-sm">Secure & Encrypted</span>
            </div>
            <p className="text-gray-300 text-xs mt-1">Your data is protected with bank-grade security</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
