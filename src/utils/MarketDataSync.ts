import WebSocket from 'ws';

interface MarketTick {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
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
    // Initialize separate websockets for each exchange
    this.initializeExchangeWebSocket('binance');
    this.initializeExchangeWebSocket('coindcx');
    this.initializeExchangeWebSocket('delta');
  }

  private initializeExchangeWebSocket(exchange: string) {
    const ws = new WebSocket(this.getExchangeWSUrl(exchange));
    
    ws.on('message', (data: string) => {
      const tick = JSON.parse(data) as MarketTick;
      this.addToBuffer(tick);
      this.checkSignals(tick);
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