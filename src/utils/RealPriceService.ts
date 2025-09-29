import axios from 'axios';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  lastUpdate: number;
}

class RealPriceService {
  private static instance: RealPriceService;
  private priceCache: Map<string, CryptoPrice> = new Map();
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds
  private readonly USD_TO_INR = 84.25; // Current rate

  static getInstance(): RealPriceService {
    if (!RealPriceService.instance) {
      RealPriceService.instance = new RealPriceService();
    }
    return RealPriceService.instance;
  }

  private constructor() {
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates() {
    setInterval(() => {
      this.fetchAllPrices();
    }, this.UPDATE_INTERVAL);
    
    // Initial fetch
    this.fetchAllPrices();
  }

  private async fetchAllPrices() {
    try {
      // Method 1: Binance API (Free, no API key needed)
      await this.fetchBinancePrices();
      
      // Method 2: CoinGecko API (Backup)
      // await this.fetchCoinGeckoPrices();
      
    } catch (error) {
      console.error('Price fetch failed:', error);
    }
  }

  private async fetchBinancePrices() {
    try {
      // Binance 24hr ticker endpoint - FREE
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      
      const importantPairs = [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
        'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT', 'LTCUSDT'
      ];

      response.data
        .filter((ticker: any) => importantPairs.includes(ticker.symbol))
        .forEach((ticker: any) => {
          const price: CryptoPrice = {
            symbol: ticker.symbol,
            price: parseFloat(ticker.lastPrice) * this.USD_TO_INR, // Convert to INR
            change24h: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.volume),
            lastUpdate: Date.now()
          };
          
          this.priceCache.set(ticker.symbol, price);
        });

      console.log(`✅ Updated ${importantPairs.length} real prices from Binance`);
    } catch (error) {
      console.error('Binance API error:', error);
      throw error;
    }
  }

  private async fetchCoinGeckoPrices() {
    try {
      // CoinGecko API - FREE tier
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,binancecoin,cardano,solana,ripple,polkadot,polygon,chainlink,litecoin',
          vs_currencies: 'inr,usd',
          include_24hr_change: true,
          include_24hr_vol: true
        }
      });

      const coinMapping: { [key: string]: string } = {
        'bitcoin': 'BTCUSDT',
        'ethereum': 'ETHUSDT',
        'binancecoin': 'BNBUSDT',
        'cardano': 'ADAUSDT',
        'solana': 'SOLUSDT',
        'ripple': 'XRPUSDT',
        'polkadot': 'DOTUSDT',
        'polygon': 'MATICUSDT',
        'chainlink': 'LINKUSDT',
        'litecoin': 'LTCUSDT'
      };

      Object.entries(response.data).forEach(([coinId, data]: [string, any]) => {
        const symbol = coinMapping[coinId];
        if (symbol) {
          const price: CryptoPrice = {
            symbol,
            price: data.inr, // Already in INR
            change24h: data.inr_24h_change || 0,
            volume: data.inr_24h_vol || 0,
            lastUpdate: Date.now()
          };
          
          this.priceCache.set(symbol, price);
        }
      });

      console.log('✅ Updated real prices from CoinGecko');
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  }

  // Public methods
  public getRealPrice(symbol: string): CryptoPrice | null {
    return this.priceCache.get(symbol) || null;
  }

  public getAllRealPrices(): CryptoPrice[] {
    return Array.from(this.priceCache.values());
  }

  public isDataFresh(maxAge: number = 60000): boolean { // 1 minute default
    const prices = Array.from(this.priceCache.values());
    if (prices.length === 0) return false;
    
    const oldestUpdate = Math.min(...prices.map(p => p.lastUpdate));
    return (Date.now() - oldestUpdate) < maxAge;
  }

  public getConnectionStatus(): 'connected' | 'degraded' | 'disconnected' {
    if (this.priceCache.size === 0) return 'disconnected';
    if (this.isDataFresh(60000)) return 'connected'; // Fresh within 1 minute
    if (this.isDataFresh(300000)) return 'degraded'; // Fresh within 5 minutes
    return 'disconnected';
  }

  // Format price for display
  public formatINRPrice(price: number): string {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`; // Lakhs
    } else if (price >= 1000) {
      return `₹${price.toLocaleString('en-IN')}`;
    } else {
      return `₹${price.toFixed(2)}`;
    }
  }
}

export default RealPriceService;