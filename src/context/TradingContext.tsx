import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

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
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}

type TradingAction = 
  | { type: 'UPDATE_TRADES'; payload: { activeTrades: Trade[]; completedTrades: Trade[] } }
  | { type: 'UPDATE_MARKET_DATA'; payload: MarketData[] }
  | { type: 'UPDATE_SIGNALS'; payload: TradingSignal[] }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TradingState = {
  activeTrades: [],
  completedTrades: [],
  marketData: [],
  signals: [],
  isConnected: false,
  isLoading: true,
  error: null,
  lastUpdate: 0
};

const tradingReducer = (state: TradingState, action: TradingAction): TradingState => {
  switch (action.type) {
    case 'SET_MARKET_DATA': return { ...state, marketData: action.payload };
    case 'SET_SIGNALS': return { ...state, signals: action.payload };
    case 'SET_CONNECTION': return { ...state, isConnected: action.payload };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_BACKEND_STATUS': return { ...state, backendStatus: action.payload };
    default: return state;
  }
};

interface TradingContextType {
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
  fetchData: () => Promise<void>;
  testTelegram: () => Promise<void>;
  runStrategies: () => Promise<void>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTradingContext must be used within a TradingProvider');
  return context;
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  // Your backend URL - UPDATE THIS TO MATCH YOUR DEPLOYED BACKEND
  const API_BASE = 'https://your-backend-url.onrender.com'; // Replace with your actual backend URL

  const fetchData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Try to connect to your backend
      const [statusRes, marketRes, signalsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/status`),
        axios.get(`${API_BASE}/api/market-data`),
        axios.get(`${API_BASE}/api/signals`)
      ]);

      if (statusRes.status === 'fulfilled') {
        dispatch({ type: 'SET_BACKEND_STATUS', payload: statusRes.value.data });
        dispatch({ type: 'SET_CONNECTION', payload: true });
      }

      if (marketRes.status === 'fulfilled') {
        dispatch({ type: 'SET_MARKET_DATA', payload: marketRes.value.data });
      }

      if (signalsRes.status === 'fulfilled') {
        dispatch({ type: 'SET_SIGNALS', payload: signalsRes.value.data });
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.log('Using demo data - backend not connected');
      dispatch({ type: 'SET_CONNECTION', payload: false });
      
      // Use demo data when backend is not available
      const demoMarketData = [
        { symbol: 'BTCUSDT', price: 43250.45, change24h: -2.34, volume: 125000000, high24h: 44200, low24h: 42100, timestamp: new Date().toLocaleString() },
        { symbol: 'ETHUSDT', price: 2650.30, change24h: 3.28, volume: 85000000, high24h: 2720, low24h: 2580, timestamp: new Date().toLocaleString() },
        { symbol: 'BNBUSDT', price: 312.45, change24h: 1.87, volume: 15000000, high24h: 325, low24h: 305, timestamp: new Date().toLocaleString() },
        { symbol: 'ADAUSDT', price: 0.485, change24h: -1.25, volume: 45000000, high24h: 0.495, low24h: 0.475, timestamp: new Date().toLocaleString() },
        { symbol: 'XRPUSDT', price: 0.625, change24h: 4.52, volume: 95000000, high24h: 0.645, low24h: 0.605, timestamp: new Date().toLocaleString() },
        { symbol: 'SOLUSDT', price: 98.75, change24h: -0.85, volume: 35000000, high24h: 102.30, low24h: 95.20, timestamp: new Date().toLocaleString() }
      ];

      const demoSignals = [
        { strategy: 'Trend Rider', symbol: 'BTCUSDT', direction: 'BUY' as const, entry: '43250.00', stopLoss: '41930.00', takeProfit: '45412.50', confidence: '78.5', volume: '1250000', timestamp: new Date().toLocaleString() },
        { strategy: 'Momentum Burst', symbol: 'ETHUSDT', direction: 'SELL' as const, entry: '2650.00', stopLoss: '2782.50', takeProfit: '2438.00', confidence: '65.2', volume: '890000', timestamp: new Date().toLocaleString() },
        { strategy: 'Volume Surge', symbol: 'BNBUSDT', direction: 'BUY' as const, entry: '312.45', stopLoss: '299.54', takeProfit: '331.19', confidence: '72.8', volume: '567000', timestamp: new Date().toLocaleString() }
      ];

      dispatch({ type: 'SET_MARKET_DATA', payload: demoMarketData });
      dispatch({ type: 'SET_SIGNALS', payload: demoSignals });
      dispatch({ type: 'SET_ERROR', payload: 'Using demo data - connect backend for live data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const testTelegram = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/test-telegram`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to send test message');
    }
  };

  const runStrategies = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/run-strategies`);
      await fetchData(); // Refresh data after running strategies
      return response.data;
    } catch (error) {
      throw new Error('Failed to run strategies');
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
    runStrategies
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
};
