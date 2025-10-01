import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import AIStrategyCoordinator, { TradingSignal as AITradingSignal, MarketData as AIMarketData } from '../utils/AIStrategyCoordinator';
import StrategyManager from '../utils/StrategyManager';
import ReportingIntegration from '../utils/ReportingIntegration';
import RealPriceService from '../utils/RealPriceService';
// import GoogleSheetsIntegration from '../utils/GoogleSheetsIntegration'; // Temporarily disabled due to googleapis dependency

interface Trade {
  id: string;
  symbol: string;
  entry: number;
  exit?: number;
  quantity: number;
  pnl?: number;
  strategy: string;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
  exchange: string;
  stopLoss: number;
  takeProfit: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  exchange: string;
  lastUpdate: number;
}

interface TradingSignal {
  strategy: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  price: number;
  exchange: string;
  timestamp: number;
}

interface TradingState {
  activeTrades: Trade[];
  completedTrades: Trade[];
  marketData: MarketData[];
  signals: TradingSignal[];
  aiSignals: AITradingSignal[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  backendStatus?: any;
}

type TradingAction = 
  | { type: 'UPDATE_TRADES'; payload: { activeTrades: Trade[]; completedTrades: Trade[] } }
  | { type: 'UPDATE_MARKET_DATA'; payload: MarketData[] }
  | { type: 'UPDATE_SIGNALS'; payload: TradingSignal[] }
  | { type: 'UPDATE_AI_SIGNALS'; payload: AITradingSignal[] }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MARKET_DATA'; payload: MarketData[] }
  | { type: 'SET_SIGNALS'; payload: TradingSignal[] }
  | { type: 'SET_AI_SIGNALS'; payload: AITradingSignal[] }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_BACKEND_STATUS'; payload: any };

const initialState: TradingState = {
  activeTrades: [],
  completedTrades: [],
  marketData: [],
  signals: [],
  aiSignals: [],
  isConnected: false,
  isLoading: true,
  error: null,
  lastUpdate: 0
};

const tradingReducer = (state: TradingState, action: TradingAction): TradingState => {
  switch (action.type) {
    case 'SET_MARKET_DATA': return { ...state, marketData: action.payload };
    case 'SET_SIGNALS': return { ...state, signals: action.payload };
    case 'SET_AI_SIGNALS': return { ...state, aiSignals: action.payload };
    case 'SET_CONNECTION': return { ...state, isConnected: action.payload };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_BACKEND_STATUS': return { ...state, backendStatus: action.payload };
    case 'UPDATE_TRADES': return { ...state, ...action.payload };
    case 'UPDATE_MARKET_DATA': return { ...state, marketData: action.payload, lastUpdate: Date.now() };
    case 'UPDATE_SIGNALS': return { ...state, signals: action.payload };
    case 'UPDATE_AI_SIGNALS': return { ...state, aiSignals: action.payload };
    default: return state;
  }
};

interface TradingContextType {
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
  fetchData: () => Promise<void>;
  testTelegram: () => Promise<void>;
  runStrategies: () => Promise<void>;
  getAISignals: (symbol: string) => Promise<AITradingSignal[]>;
  getConsensusSignal: (symbol: string) => Promise<AITradingSignal | null>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTradingContext must be used within a TradingProvider');
  return context;
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const aiCoordinator = AIStrategyCoordinator.getInstance();
  const strategyManager = StrategyManager.getInstance();
  const realPriceService = RealPriceService.getInstance();
  // const sheetsIntegration = GoogleSheetsIntegration.getInstance(); // Temporarily disabled due to googleapis dependency

  const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://trading-dashboard-backend-qwe4.onrender.com';

  // USD to INR conversion rate (current realistic rate)
  const USD_TO_INR = 84.25;

  // Helper function to convert USD prices to INR
  const convertToINR = (usdPrice: number): number => {
    return Math.round(usdPrice * USD_TO_INR * 100) / 100;
  };

  // Helper function to generate demo candles for AI strategies
  const generateDemoCandles = (currentPrice: number) => {
    const candles = [];
    const basePrice = currentPrice * 0.98; // Start 2% below current price
    
    for (let i = 0; i < 100; i++) {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const price = basePrice * (1 + variation + (i * 0.0002)); // Slight upward trend
      const high = price * (1 + Math.random() * 0.01);
      const low = price * (1 - Math.random() * 0.01);
      const volume = 1000000 + Math.random() * 2000000;
      
      candles.push({
        open: (price * 0.999).toString(),
        high: high.toString(),
        low: low.toString(),
        close: price.toString(),
        volume: volume.toString(),
        timestamp: Date.now() - ((100 - i) * 60000) // 1-minute intervals
      });
    }
    
    return candles;
  };

  const fetchData = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    console.log('🔄 Connecting to backend:', API_BASE);
    
    try {
      // First, check if backend is alive with a health check
      const healthCheck = await axios.get(`${API_BASE}/api/health`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Backend health check passed:', healthCheck.data);
      dispatch({ type: 'SET_CONNECTION', payload: true });
      dispatch({ type: 'SET_BACKEND_STATUS', payload: healthCheck.data });
      
      // Now fetch actual data
      const promises = [
        axios.get(`${API_BASE}/api/market-data`, { timeout: 8000 }),
        axios.get(`${API_BASE}/api/signals`, { timeout: 8000 })
      ];
      
      const results = await Promise.allSettled(promises);
      const [marketRes, signalsRes] = results;
      
      if (marketRes.status === 'fulfilled' && marketRes.value?.data) {
        console.log('📊 Market data received:', marketRes.value.data.length, 'items');
        
        // Convert USD prices to INR
        const marketDataINR = marketRes.value.data.map((item: any) => ({
          symbol: item.symbol,
          price: convertToINR(item.price), // Convert USD to INR
          change24h: item.change24h,
          volume: item.volume,
          high24h: item.high24h ? convertToINR(item.high24h) : convertToINR(item.price * 1.05),
          low24h: item.low24h ? convertToINR(item.low24h) : convertToINR(item.price * 0.95),
          exchange: item.exchange || 'Binance',
          lastUpdate: Date.now(),
          timestamp: item.timestamp || new Date().toISOString()
        }));
        
        console.log('💰 Converted to INR prices:', marketDataINR[0]?.price);
        dispatch({ type: 'SET_MARKET_DATA', payload: marketDataINR });
        
        // Log to Google Sheets
        // sheetsIntegration.updateRealPrices(); // Temporarily disabled due to googleapis dependency
      } else {
        console.log('🔄 Market data request failed, checking real price service...');
        
        // Try real price service as fallback
        const realPrices = realPriceService.getAllRealPrices();
        if (realPrices.length > 0) {
          console.log('✅ Using real prices from RealPriceService');
          const marketDataFromReal = realPrices.map(price => ({
            symbol: price.symbol,
            price: price.price, // Already in INR
            change24h: price.change24h,
            volume: price.volume,
            exchange: 'Binance',
            lastUpdate: price.lastUpdate,
            timestamp: new Date(price.lastUpdate).toISOString()
          }));
          dispatch({ type: 'SET_MARKET_DATA', payload: marketDataFromReal });
        }
      }
      
      if (signalsRes.status === 'fulfilled' && signalsRes.value?.data) {
        console.log('🎯 Signals received:', signalsRes.value.data.length, 'signals');
        
        // Convert signal prices to INR
        const signalsINR = signalsRes.value.data.map((signal: any) => ({
          ...signal,
          price: convertToINR(signal.price) // Convert signal prices to INR
        }));
        
        dispatch({ type: 'SET_SIGNALS', payload: signalsINR });
      }

      dispatch({ type: 'SET_ERROR', payload: null });
      console.log('🎉 Successfully connected to Render backend!');
      return;
      
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error.message);
      console.log('🔄 Falling back to demo data...');
      dispatch({ type: 'SET_CONNECTION', payload: false });
      
      // Log specific connection issues for debugging
      if (error.code === 'ECONNREFUSED') {
        console.error('🚨 Connection refused - Backend may be down');
      } else if (error.code === 'ENOTFOUND') {
        console.error('🚨 DNS resolution failed - Check backend URL');
      } else if (error.response?.status) {
        console.error(`🚨 HTTP ${error.response.status}: ${error.response.statusText}`);
      }
    }
    
    // Use demo data (either on error or if backend calls failed)
    console.log('Using demo data - backend not connected');
    dispatch({ type: 'SET_CONNECTION', payload: false });
    
    // Generate realistic demo trade data
    const demoActiveTrades: Trade[] = [
      {
        id: 'T001',
        symbol: 'BTCUSDT',
        entry: 43200.00,
        quantity: 0.23,
        strategy: 'Trend Rider',
        timestamp: Date.now() - 3600000, // 1 hour ago
        status: 'OPEN',
        exchange: 'Binance',
        stopLoss: 42336.00, // 2% stop loss
        takeProfit: 44928.00, // 4% take profit
        pnl: 11.60 // Current unrealized P&L
      },
      {
        id: 'T002', 
        symbol: 'ETHUSDT',
        entry: 2640.00,
        quantity: 1.89,
        strategy: 'Momentum Burst',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        status: 'OPEN',
        exchange: 'Binance',
        stopLoss: 2587.20,
        takeProfit: 2745.60,
        pnl: 19.47
      },
      {
        id: 'T003',
        symbol: 'ADAUSDT',
        entry: 0.482,
        quantity: 2070,
        strategy: 'Volume Surge',
        timestamp: Date.now() - 900000, // 15 minutes ago
        status: 'OPEN',
        exchange: 'CoinDCX',
        stopLoss: 0.472,
        takeProfit: 0.501,
        pnl: 6.21
      }
    ];

    const demoCompletedTrades: Trade[] = [
      {
        id: 'T101',
        symbol: 'BTCUSDT',
        entry: 42800.00,
        exit: 43712.00,
        quantity: 0.117,
        strategy: 'Trend Rider',
        timestamp: Date.now() - 7200000, // 2 hours ago
        status: 'CLOSED',
        exchange: 'Binance',
        stopLoss: 41944.00,
        takeProfit: 44512.00,
        pnl: 106.70
      },
      {
        id: 'T102',
        symbol: 'ETHUSDT',
        entry: 2680.00,
        exit: 2625.20,
        quantity: 0.75,
        strategy: 'Mean Reversal',
        timestamp: Date.now() - 5400000, // 1.5 hours ago
        status: 'CLOSED',
        exchange: 'Binance',
        stopLoss: 2626.40,
        takeProfit: 2787.20,
        pnl: -41.10
      },
      {
        id: 'T103',
        symbol: 'BNBUSDT',
        entry: 310.50,
        exit: 315.28,
        quantity: 1.61,
        strategy: 'Breakout Hunter',
        timestamp: Date.now() - 3600000,
        status: 'CLOSED',
        exchange: 'Binance',
        stopLoss: 304.29,
        takeProfit: 322.92,
        pnl: 77.00
      },
      {
        id: 'T104',
        symbol: 'XRPUSDT',
        entry: 0.618,
        exit: 0.627,
        quantity: 1620,
        strategy: 'Volume Surge',
        timestamp: Date.now() - 4200000,
        status: 'CLOSED',
        exchange: 'CoinDCX',
        stopLoss: 0.605,
        takeProfit: 0.643,
        pnl: 14.58
      },
      {
        id: 'T105',
        symbol: 'SOLUSDT',
        entry: 99.20,
        exit: 97.02,
        quantity: 5.04,
        strategy: 'Momentum Burst',
        timestamp: Date.now() - 6000000,
        status: 'CLOSED',
        exchange: 'Delta',
        stopLoss: 97.21,
        takeProfit: 103.17,
        pnl: -109.87
      }
    ];

    // Dispatch trade data
    dispatch({ 
      type: 'UPDATE_TRADES', 
      payload: { 
        activeTrades: demoActiveTrades, 
        completedTrades: demoCompletedTrades 
      } 
    });
    
    // Use proper demo data that matches interfaces
    const demoMarketData: MarketData[] = [
      { symbol: 'BTCUSDT', price: 43250.45, change24h: -2.34, volume: 125000000, exchange: 'Binance', lastUpdate: Date.now() },
      { symbol: 'ETHUSDT', price: 2650.30, change24h: 3.28, volume: 85000000, exchange: 'Binance', lastUpdate: Date.now() },
      { symbol: 'BNBUSDT', price: 312.45, change24h: 1.87, volume: 15000000, exchange: 'Binance', lastUpdate: Date.now() },
      { symbol: 'ADAUSDT', price: 0.485, change24h: -1.25, volume: 45000000, exchange: 'CoinDCX', lastUpdate: Date.now() },
      { symbol: 'XRPUSDT', price: 0.625, change24h: 4.52, volume: 95000000, exchange: 'CoinDCX', lastUpdate: Date.now() },
      { symbol: 'SOLUSDT', price: 98.75, change24h: -0.85, volume: 35000000, exchange: 'Delta', lastUpdate: Date.now() }
    ];

    const demoSignals: TradingSignal[] = [
      { strategy: 'Trend Rider', symbol: 'BTCUSDT', direction: 'BUY', confidence: 72.5, price: 43250.00, exchange: 'Binance', timestamp: Date.now() },
      { strategy: 'Momentum Burst', symbol: 'ETHUSDT', direction: 'SELL', confidence: 45.2, price: 2650.00, exchange: 'Binance', timestamp: Date.now() },
      { strategy: 'Volume Surge', symbol: 'BNBUSDT', direction: 'BUY', confidence: 68.8, price: 312.45, exchange: 'Binance', timestamp: Date.now() },
      { strategy: 'Mean Reversal', symbol: 'BTCUSDT', direction: 'SELL', confidence: 55.3, price: 43250.00, exchange: 'Binance', timestamp: Date.now() },
      { strategy: 'Breakout Hunter', symbol: 'ETHUSDT', direction: 'BUY', confidence: 81.7, price: 2650.00, exchange: 'Binance', timestamp: Date.now() },
      { strategy: 'Weighted Consensus', symbol: 'BTCUSDT', direction: 'BUY', confidence: 67.4, price: 43250.00, exchange: 'Binance', timestamp: Date.now() }
    ];

    // Generate AI signals using the new weighted consensus strategy coordinator
    const aiSignals: AITradingSignal[] = [];
    for (const marketData of demoMarketData.slice(0, 3)) {
      try {
        const aiMarketData: AIMarketData = {
          symbol: marketData.symbol,
          candles: generateDemoCandles(marketData.price),
          currentPrice: marketData.price,
          volume: marketData.volume
        };
        
        // Use the enhanced weighted consensus system
        const aiCoordinator = AIStrategyCoordinator.getInstance();
        const signals = await aiCoordinator.getAllStrategySignals(aiMarketData);
        aiSignals.push(...signals);
      } catch (error) {
        console.error('Error generating AI signals:', error);
      }
    }

    dispatch({ type: 'SET_MARKET_DATA', payload: demoMarketData });
    dispatch({ type: 'SET_SIGNALS', payload: demoSignals });
    dispatch({ type: 'SET_AI_SIGNALS', payload: aiSignals });
    dispatch({ type: 'SET_ERROR', payload: 'Using demo data - connect backend for live data' });
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const testTelegram = async () => {
    console.log('📱 Testing Telegram connection to:', `${API_BASE}/api/test-telegram`);
    try {
      const response = await axios.post(`${API_BASE}/api/test-telegram`, {}, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Telegram test successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Telegram test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to send test message: ${error.message}`);
    }
  };

  const runStrategies = async () => {
    console.log('🤖 Running strategies on:', `${API_BASE}/api/run-strategies`);
    try {
      const response = await axios.post(`${API_BASE}/api/run-strategies`, {}, {
        timeout: 15000, // Longer timeout for strategy execution
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Strategies executed successfully:', response.data);
      await fetchData(); // Refresh data after running strategies
      return response.data;
    } catch (error: any) {
      console.error('❌ Strategy execution failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to run strategies: ${error.message}`);
    }
  };

  const getAISignals = async (symbol: string): Promise<AITradingSignal[]> => {
    try {
      const marketData = state.marketData.find(m => m.symbol === symbol);
      if (!marketData) return [];
      
      const aiMarketData: AIMarketData = {
        symbol: marketData.symbol,
        candles: generateDemoCandles(marketData.price),
        currentPrice: marketData.price,
        volume: marketData.volume
      };
      
      // Use the new enhanced weighted consensus system
      const aiCoordinator = AIStrategyCoordinator.getInstance();
      return await aiCoordinator.getAllStrategySignals(aiMarketData);
    } catch (error) {
      console.error('Error getting AI signals:', error);
      return [];
    }
  };

  const getConsensusSignal = async (symbol: string): Promise<AITradingSignal | null> => {
    try {
      const marketData = state.marketData.find(m => m.symbol === symbol);
      if (!marketData) return null;
      
      const aiMarketData: AIMarketData = {
        symbol: marketData.symbol,
        candles: generateDemoCandles(marketData.price),
        currentPrice: marketData.price,
        volume: marketData.volume
      };
      
      // Use the new weighted consensus signal
      const aiCoordinator = AIStrategyCoordinator.getInstance();
      return await aiCoordinator.getWeightedConsensusSignal(aiMarketData);
    } catch (error) {
      console.error('Error getting consensus signal:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
    
    // Update data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const value: TradingContextType = {
    state,
    dispatch,
    fetchData,
    testTelegram,
    runStrategies,
    getAISignals,
    getConsensusSignal
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
};