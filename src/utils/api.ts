import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trading_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('trading_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// WebSocket connection handler
export const createWebSocket = () => {
  const ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket Connected');
    // Send authentication if needed
    const token = localStorage.getItem('trading_auth_token');
    if (token) {
      ws.send(JSON.stringify({ type: 'auth', token }));
    }
  };

  return ws;
};

// API endpoints
export const endpoints = {
  // Market Data
  getMarketData: () => api.get('/api/market-data'),
  getSymbolData: (symbol: string) => api.get(`/api/market-data/${symbol}`),
  
  // Trading
  executeTrade: (data: any) => api.post('/api/trades', data),
  cancelTrade: (id: string) => api.delete(`/api/trades/${id}`),
  getActiveTrades: () => api.get('/api/trades/active'),
  
  // Strategies
  getStrategies: () => api.get('/api/strategies'),
  runStrategy: (id: string) => api.post(`/api/strategies/${id}/run`),
  
  // Performance
  getDailyPerformance: () => api.get('/api/performance/daily'),
  getStrategyPerformance: () => api.get('/api/performance/strategies'),
  
  // Exchange Status
  getExchangeStatus: () => api.get('/api/exchanges/status'),
  
  // System
  getSystemStatus: () => api.get('/api/system/status'),
  testTelegram: () => api.post('/api/system/test-telegram'),
  
  // Authentication
  login: (credentials: any) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: () => api.post('/api/auth/refresh')
};

export default api;