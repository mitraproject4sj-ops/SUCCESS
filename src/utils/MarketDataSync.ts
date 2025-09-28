import WebSocket from 'ws';

import { LAKSHYA_CONFIG } from '../config/lakshya.config';

interface MarketTick {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
  exchange: string;
}

interface TradeSignal {
  symbol: string;
  action: 'ENTER' | 'EXIT';
  price: number;
  confidence: number;
  strategy: string;
  timestamp: number;
}

class MarketDataSync {
  private static instance: MarketDataSync;
  private ws: WebSocket | null = null;
  private tickBuffer: MarketTick[] = [];
  private readonly BUFFER_SIZE = 100;
  private tradeCallbacks: ((signal: TradeSignal) => void)[] = [];
  
  private constructor() {
    this.initializeWebSocket();
    setInterval(() => this.processBuffer(), 50); // Process buffer every 50ms
  }

  static getInstance(): MarketDataSync {
    if (!MarketDataSync.instance) {
      MarketDataSync.instance = new MarketDataSync();
    }
    return MarketDataSync.instance;
  }

  private initializeWebSocket() {
    // Initialize WebSocket connections for each exchange
    this.initializeBinanceWS();
    this.initializeCoinDCXWS();
    this.initializeDeltaWS();
    
    // Setup reconnection checks
    setInterval(() => this.checkConnections(), 30000);
  }

  private initializeBinanceWS() {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    
    ws.on('open', () => {
      const symbols = Object.keys(LAKSHYA_CONFIG.STRATEGIES);
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: symbols.map(s => `${s.toLowerCase()}@trade`),
        id: 1
      };
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (data: string) => {
      const tick = JSON.parse(data);
      if (tick.e === 'trade') {
        this.addToBuffer({
          symbol: tick.s,
          price: parseFloat(tick.p),
          volume: parseFloat(tick.q),
          timestamp: tick.T
        });
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${exchange}:`, error);
      setTimeout(() => this.initializeExchangeWebSocket(exchange), 5000);
    });
  }

  private getExchangeWSUrl(exchange: string): string {
    // Return appropriate WebSocket URL for each exchange
    const urls = {
      binance: 'wss://stream.binance.com:9443/ws',
      coindcx: 'wss://stream.coindcx.com',
      delta: 'wss://socket.delta.exchange'
    };
    return urls[exchange as keyof typeof urls];
  }

  private addToBuffer(tick: MarketTick) {
    this.tickBuffer.push(tick);
    if (this.tickBuffer.length > this.BUFFER_SIZE) {
      this.tickBuffer.shift();
    }
  }

  private async checkSignals(tick: MarketTick) {
    // Quick signal check for immediate action
    const signal = await this.generateSignal(tick);
    if (signal) {
      this.notifyTradeCallbacks(signal);
    }
  }

  private async generateSignal(tick: MarketTick): Promise<TradeSignal | null> {
    // Implement your signal generation logic here
    // This should be very fast and optimized
    return null;
  }

  private async processBuffer() {
    if (this.tickBuffer.length === 0) return;

    // Process accumulated ticks in batch
    const ticks = [...this.tickBuffer];
    this.tickBuffer = [];

    // Batch process ticks for UI updates
    this.notifyUIUpdate(ticks);
  }

  private notifyUIUpdate(ticks: MarketTick[]) {
    // Emit event for UI update (using custom event system or state management)
    window.dispatchEvent(new CustomEvent('market-update', { 
      detail: { ticks, timestamp: Date.now() } 
    }));
  }

  private notifyTradeCallbacks(signal: TradeSignal) {
    this.tradeCallbacks.forEach(callback => callback(signal));
  }

  public onTrade(callback: (signal: TradeSignal) => void) {
    this.tradeCallbacks.push(callback);
  }

  public getLatestPrice(symbol: string): number | null {
    const tick = this.tickBuffer.findLast(t => t.symbol === symbol);
    return tick ? tick.price : null;
  }
}

export default MarketDataSync;