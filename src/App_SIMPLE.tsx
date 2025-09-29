import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center items-center mb-8">
          <span className="text-6xl mr-4">🇮🇳</span>
          <div>
            <h1 className="text-6xl font-bold text-white mb-4">LAKSHYA</h1>
            <p className="text-2xl text-gray-300">Indian Trading Dashboard</p>
          </div>
          <span className="text-6xl ml-4">🇮🇳</span>
        </div>
        
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600 shadow-2xl max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Dashboard Loading...</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <div className="text-green-400 text-2xl font-bold">₹36,45,280</div>
              <div className="text-green-300 text-sm">Bitcoin (BTC)</div>
              <div className="text-green-400 text-xs">+2.34% ↗️</div>
            </div>
            
            <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4">
              <div className="text-blue-400 text-2xl font-bold">₹2,24,567</div>
              <div className="text-blue-300 text-sm">Ethereum (ETH)</div>
              <div className="text-red-400 text-xs">-1.23% ↘️</div>
            </div>
            
            <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4">
              <div className="text-purple-400 text-2xl font-bold">₹26,789</div>
              <div className="text-purple-300 text-sm">Binance (BNB)</div>
              <div className="text-green-400 text-xs">+3.67% ↗️</div>
            </div>
            
            <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-4">
              <div className="text-orange-400 text-2xl font-bold">₹41.50</div>
              <div className="text-orange-300 text-sm">Cardano (ADA)</div>
              <div className="text-green-400 text-xs">+5.21% ↗️</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
              🔔 Notifications (3)
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold">
              ⚙️ Settings
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
              📊 Full Dashboard
            </button>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <span className="text-2xl mr-2">🇮🇳</span>
              <p className="text-sm text-green-400 font-medium">
                Concept and Designed by: <span className="font-bold text-white">SHAILENDRA JAISWAL</span>
              </p>
              <span className="text-2xl ml-2">🇮🇳</span>
            </div>
            
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
              <span>🛡️ Secure Access</span>
              <span>•</span>
              <span>⚡ Real-time Data</span>
              <span>•</span>
              <span>🤖 AI Powered</span>
              <span>•</span>
              <span>🇮🇳 Made in India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;