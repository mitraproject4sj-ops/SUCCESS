# LAKSHYA Trading Dashboard - AI Agent Guidelines

## 🏗️ System Architecture

**LAKSHYA** is a React/TypeScript AI-powered trading dashboard with real-time market data processing. The system follows a layered architecture:

- **Frontend Layer**: React components with TypeScript, using Context + useReducer for state management
- **Business Logic Layer**: Utility classes in `src/utils/` handling AI strategies, risk management, and data processing
- **Data Layer**: Memory caching, time-series data management, and external API integrations
- **Integration Layer**: Exchange APIs (Binance, CoinDCX), Telegram bot, Google Sheets reporting

## 🔑 Critical Patterns & Conventions

### State Management
```typescript
// Use TradingContext for global trading state
const { state, dispatch } = useTradingContext();

// Dispatch actions for state updates
dispatch({ type: 'UPDATE_MARKET_DATA', payload: marketData });

// Access state in components
const { marketData, signals, isConnected } = state;
```

### Service Layer Pattern
```typescript
// Singleton pattern for core services
class AIStrategyCoordinator {
  private static instance: AIStrategyCoordinator;
  
  static getInstance(): AIStrategyCoordinator {
    if (!AIStrategyCoordinator.instance) {
      AIStrategyCoordinator.instance = new AIStrategyCoordinator();
    }
    return AIStrategyCoordinator.instance;
  }
}
```

### API Integration with Fallback
```typescript
// Always implement fallback to demo data when backend unavailable
try {
  const response = await axios.get(`${API_BASE}/api/market-data`);
  dispatch({ type: 'UPDATE_MARKET_DATA', payload: response.data });
} catch (error) {
  console.warn('Backend unavailable, using demo data');
  dispatch({ type: 'UPDATE_MARKET_DATA', payload: DEMO_DATA });
}
```

### Configuration-Driven Development
```typescript
// Use lakshya.config.ts for all system constants
import { LAKSHYA_CONFIG } from '../config/lakshya.config';

const maxTrades = LAKSHYA_CONFIG.RISK.MAX_TRADES_PER_DAY;
const riskMultiplier = LAKSHYA_CONFIG.TRADING_WINDOWS.MORNING.RISK_MULTIPLIER;
```

## 🚀 Essential Workflows

### Development Setup
```bash
npm install
npm start  # Runs on localhost:3000
```

### Build & Deploy
```bash
# Production build (skip type checking for deployment)
SKIP_PREFLIGHT_CHECK=true npm run build

# Multi-platform deployment
npm run deploy  # Builds and runs health checks
```

### Health Checks & Troubleshooting
```bash
# Run health checks
npm run health

# Auto-troubleshooter performs these checks:
# - Network connectivity to backend
# - WebSocket connection stability  
# - Memory usage monitoring
# - API endpoint availability
```

## 📁 Key File Structure

```
src/
├── components/           # React components (PascalCase)
│   ├── Dashboard.tsx            # Main dashboard
│   ├── AdvancedTradingDashboard.tsx  # Trading interface
│   └── MonitoringDashboard.tsx       # System monitoring
├── utils/               # Business logic (camelCase)
│   ├── AIStrategyCoordinator.ts     # AI trading signals
│   ├── RecoveryManager.ts           # Loss recovery system
│   ├── RiskManager.ts               # Position sizing
│   └── MarketDataSync.ts            # Real-time data
├── context/
│   └── TradingContext.tsx           # Global state management
├── config/
│   └── lakshya.config.ts            # System configuration
└── types/
    └── TradingControlSettings.ts    # TypeScript definitions
```

## 🔧 Component Integration Patterns

### Real-time Data Flow
```typescript
// Components subscribe to TradingContext for live updates
useEffect(() => {
  const interval = setInterval(() => {
    fetchData(); // Updates market data, signals, trades
  }, 5000); // 5-second updates
  
  return () => clearInterval(interval);
}, []);
```

### Error Boundaries
```typescript
// Always wrap components with error boundaries
// Fallback to demo mode when backend unavailable
if (!isConnected) {
  return <DemoDashboard marketData={DEMO_DATA} />;
}
```

### Authentication State
```typescript
// Store auth in localStorage with 'trading_auth' and 'trading_user' keys
const handleLogin = (userData: User) => {
  localStorage.setItem('trading_auth', 'true');
  localStorage.setItem('trading_user', JSON.stringify(userData));
};
```

## 🎯 Trading-Specific Patterns

### Signal Processing
```typescript
// Signals include confidence scores and strategy metadata
interface TradingSignal {
  strategy: string;      // 'MomentumBurst', 'TrendRider', etc.
  symbol: string;        // Trading pair
  direction: 'BUY' | 'SELL';
  confidence: number;    // 0-100, only act on >85 in recovery mode
  price: number;
  exchange: string;
}
```

### Risk Management Integration
```typescript
// Always check risk limits before trade execution
const riskCheck = await RiskManager.getInstance().assessTrade(trade);
if (!riskCheck.approved) {
  throw new Error(`Risk check failed: ${riskCheck.reason}`);
}
```

### Recovery Mode Logic
```typescript
// System enters recovery mode on losses > threshold
if (currentLoss > LAKSHYA_CONFIG.RISK.MAX_DAILY_LOSS) {
  RecoveryManager.getInstance().activateRecoveryMode(currentLoss);
  // Reduces position sizes, filters to high-confidence strategies only
}
```

## 🔄 External Integrations

### Backend API Endpoints
- `/api/status` - System status
- `/api/market-data` - Live market data  
- `/api/signals` - Trading signals
- `/api/test-telegram` - Telegram integration test
- `/api/run-strategies` - Execute trading strategies

### WebSocket Connections
```typescript
// Real-time market data via WebSocket
const ws = new WebSocket('wss://your-backend-url.onrender.com');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  dispatch({ type: 'UPDATE_MARKET_DATA', payload: data });
};
```

## ⚡ Performance Considerations

### Memory Management
```typescript
// Use MemoryCache for expensive computations
const cache = new MemoryCache(50); // 50MB limit
const cached = cache.get(cacheKey);
if (cached) return cached;
```

### Rate Limiting
```typescript
// Implement rate limiting for API calls
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 60   // 60 requests per minute
});
```

## 🧪 Testing & Validation

### Health Check Pattern
```typescript
// Components should validate backend connectivity
const { isConnected } = useTradingContext();
if (!isConnected) {
  return <ConnectionError message="Backend unavailable" />;
}
```

### Demo Mode Fallback
```typescript
// Always provide demo data when backend fails
const DEMO_DATA = [
  { symbol: 'BTCUSDT', price: 45000, change24h: 2.5 },
  // ... more demo data
];
```

## 🚨 Common Pitfalls to Avoid

1. **Don't hardcode API URLs** - Use environment variables or config
2. **Always implement error boundaries** - Never let one component crash the whole app  
3. **Check connection status** - Backend may be unavailable, always have fallbacks
4. **Respect rate limits** - Exchange APIs have strict rate limiting
5. **Validate signal confidence** - Only execute high-confidence signals (>85% in recovery mode)
6. **Use TypeScript interfaces** - All data structures should be typed
7. **Follow singleton pattern** - Core services should be singletons for consistency</content>
<parameter name="filePath">d:\SUCCESS\.github\copilot-instructions.md