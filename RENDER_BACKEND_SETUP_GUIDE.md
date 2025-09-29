# 🚀 LAKSHYA RENDER BACKEND SETUP GUIDE

## 🎯 **Real Price Integration for Indian Trading Dashboard**

### **Current Status:**
- ✅ Frontend: Complete with INR conversion
- ❌ Backend: Needs Render deployment for real data
- 🔄 Status: Using demo data (₹36,42,750 for BTC etc.)

---

## 📋 **Step-by-Step Render Backend Setup**

### **1. Create Backend Repository** 📁
```bash
# Create new repository for backend
mkdir lakshya-backend
cd lakshya-backend
npm init -y
```

### **2. Install Required Dependencies** 📦
```bash
npm install express cors dotenv axios node-cron
npm install ws ccxt telegram-bot-api
npm install --save-dev nodemon
```

### **3. Create Backend Server** 🖥️
**File: `server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// USD to INR conversion rate (you can make this dynamic)
const USD_TO_INR = 84.25;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LAKSHYA Backend',
    version: '1.0.0'
  });
});

// Get real market data from Binance API
app.get('/api/market-data', async (req, res) => {
  try {
    // Top 10 cryptocurrencies
    const symbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
      'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT'
    ];

    const marketData = [];

    for (const symbol of symbols) {
      try {
        // Get 24hr ticker statistics from Binance
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
        );

        const data = response.data;
        const priceUSD = parseFloat(data.lastPrice);
        const priceINR = priceUSD * USD_TO_INR;
        const change24h = parseFloat(data.priceChangePercent);

        marketData.push({
          symbol: symbol.replace('USDT', ''),
          price: priceINR,
          change24h: change24h,
          volume: parseFloat(data.volume),
          high24h: parseFloat(data.highPrice) * USD_TO_INR,
          low24h: parseFloat(data.lowPrice) * USD_TO_INR,
          exchange: 'Binance',
          lastUpdate: Date.now(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
      }
    }

    res.json(marketData);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get trading signals (AI strategies)
app.get('/api/signals', async (req, res) => {
  try {
    // This would contain your AI strategy logic
    // For now, returning sample signals
    const signals = [
      {
        strategy: 'Trend Rider',
        symbol: 'BTC',
        direction: 'BUY',
        confidence: 78.5,
        price: 36.42 * 100000, // ₹36,42,000
        exchange: 'Binance',
        timestamp: Date.now()
      },
      {
        strategy: 'Volume Surge',
        symbol: 'ETH',
        direction: 'SELL',
        confidence: 65.2,
        price: 2.23 * 100000, // ₹2,23,000
        exchange: 'Binance',
        timestamp: Date.now()
      }
    ];

    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// Test Telegram integration
app.post('/api/test-telegram', (req, res) => {
  // Add your Telegram bot logic here
  res.json({ message: 'Telegram test sent successfully!' });
});

// Run AI strategies
app.post('/api/run-strategies', (req, res) => {
  // Add your AI strategy execution logic here
  res.json({ message: 'Strategies executed successfully!' });
});

app.listen(PORT, () => {
  console.log(`🚀 LAKSHYA Backend running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
```

### **4. Create Package.json Scripts** 📝
```json
{
  "name": "lakshya-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "axios": "^1.4.0",
    "node-cron": "^3.0.2"
  }
}
```

---

## 🌐 **Render Deployment Steps**

### **1. Connect GitHub to Render** 🔗
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your backend repository

### **2. Configure Render Settings** ⚙️
```
Name: lakshya-backend
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free (for testing)
```

### **3. Set Environment Variables** 🔧
```
NODE_ENV=production
PORT=10000
USD_TO_INR_RATE=84.25
```

### **4. Deploy and Get URL** 🚀
- Render will give you URL like: `https://lakshya-backend-xyz.onrender.com`
- Test: `https://your-url.onrender.com/api/health`

---

## 🔄 **Update Frontend to Use Real Data**

### **1. Update Environment Variables** 📝
**Create `.env` file in frontend:**
```env
REACT_APP_API_URL=https://your-render-backend.onrender.com
REACT_APP_BACKEND_URL=https://your-render-backend.onrender.com
```

### **2. Frontend Will Automatically Connect** ✅
Your `TradingContext.tsx` already has the logic:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 
                 process.env.REACT_APP_BACKEND_URL || 
                 'https://trading-dashboard-backend-qwe4.onrender.com';
```

---

## 🎯 **Expected Real Data Results**

### **Live Prices (Example):**
```
Bitcoin (BTC): ₹36,45,280.50 (+1.23%) ← Real Binance price
Ethereum (ETH): ₹2,24,567.25 (-0.89%) ← Real Binance price
Binance Coin (BNB): ₹26,789.75 (+2.34%) ← Real Binance price
```

### **Connection Status Changes:**
- ❌ Current: "🔄 Demo Mode"
- ✅ After Setup: "✅ Connected to Render"

---

## 🚨 **Troubleshooting Common Issues**

### **1. Google Pending Issue:**
```bash
# This happens when Render is setting up
# Wait 5-10 minutes for deployment to complete
# Check Render dashboard for build logs
```

### **2. CORS Errors:**
```javascript
// Make sure backend has cors middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.com'],
  credentials: true
}));
```

### **3. Rate Limiting:**
```javascript
// Binance API allows 1200 requests per minute
// Add rate limiting to avoid bans
```

---

## 📞 **Quick Setup Commands**

```bash
# 1. Create backend folder
mkdir lakshya-backend && cd lakshya-backend

# 2. Initialize and install
npm init -y
npm install express cors dotenv axios

# 3. Create server.js (copy code above)
# 4. Push to GitHub
# 5. Deploy on Render
# 6. Update frontend .env file
# 7. Restart frontend: npm start
```

---

## 🎉 **Final Result**

### **Before (Demo):**
```
🔄 Demo Mode | ₹36,42,750.00 (Fixed demo price)
```

### **After (Live):**
```
✅ Live Data | ₹36,45,280.50 (Real Binance price, updates every 30s)
```

**भाई, यह complete setup guide है! Follow करिए और आपको real prices मिल जाएंगे! 🚀🇮🇳**