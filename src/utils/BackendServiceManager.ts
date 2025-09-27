import { MemoryCache } from './MemoryCache';
import { RateLimiter } from './RateLimiter';

interface ServiceConfig {
  maxMemoryUsage: number;  // in MB
  requestsPerMinute: number;
  wsConnectionLimit: number;
  processingBatchSize: number;
}

class BackendServiceManager {
  private static instance: BackendServiceManager;
  private cache: MemoryCache;
  private rateLimiter: RateLimiter;
  private wsClients: Set<WebSocket>;
  private isProcessing: boolean = false;
  private dataQueue: any[] = [];
  
  // Free tier optimization settings
  private readonly config: ServiceConfig = {
    maxMemoryUsage: 450,      // Stay under 512MB Render free tier limit
    requestsPerMinute: 50,    // Prevent rate limiting
    wsConnectionLimit: 100,   // Limit concurrent WebSocket connections
    processingBatchSize: 100  // Process data in small batches
  };

  private constructor() {
    this.cache = new MemoryCache(this.config.maxMemoryUsage);
    this.rateLimiter = new RateLimiter(this.config.requestsPerMinute);
    this.wsClients = new Set();
    this.startMemoryMonitor();
    this.startQueueProcessor();
  }

  static getInstance(): BackendServiceManager {
    if (!BackendServiceManager.instance) {
      BackendServiceManager.instance = new BackendServiceManager();
    }
    return BackendServiceManager.instance;
  }

  private startMemoryMonitor() {
    setInterval(() => {
      const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      if (usedMemory > this.config.maxMemoryUsage * 0.9) {
        this.handleHighMemoryUsage();
      }
    }, 30000); // Check every 30 seconds
  }

  private handleHighMemoryUsage() {
    // Clear non-essential caches
    this.cache.clearOldEntries();
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  private startQueueProcessor() {
    setInterval(() => {
      this.processQueue();
    }, 100); // Process queue every 100ms
  }

  private async processQueue() {
    if (this.isProcessing || this.dataQueue.length === 0) return;

    this.isProcessing = true;
    try {
      // Process data in batches to prevent memory spikes
      const batch = this.dataQueue.splice(0, this.config.processingBatchSize);
      const processedData = await this.processDataBatch(batch);
      this.broadcastUpdate(processedData);
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processDataBatch(batch: any[]) {
    // Process market data and generate signals
    const processedData = {
      marketUpdates: [],
      signals: [],
      trades: []
    };

    for (const data of batch) {
      if (this.rateLimiter.canProcess()) {
        // Process each item within rate limits
        const result = await this.processItem(data);
        this.categorizeResult(result, processedData);
      } else {
        // Re-queue items if rate limit reached
        this.dataQueue.push(data);
      }
    }

    return processedData;
  }

  private async processItem(data: any) {
    // Implement lightweight processing logic
    // Return processed result
    return data;
  }

  private categorizeResult(result: any, processedData: any) {
    // Categorize processed data into updates, signals, and trades
    // Add to appropriate array in processedData
  }

  private broadcastUpdate(data: any) {
    const message = JSON.stringify(data);
    for (const client of this.wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  public addClient(ws: WebSocket) {
    if (this.wsClients.size < this.config.wsConnectionLimit) {
      this.wsClients.add(ws);
      ws.on('close', () => this.wsClients.delete(ws));
    } else {
      ws.close(1013, 'Maximum connection limit reached');
    }
  }

  public addToQueue(data: any) {
    if (this.dataQueue.length < 10000) { // Prevent queue from growing too large
      this.dataQueue.push(data);
    }
  }

  public getMetrics() {
    return {
      activeConnections: this.wsClients.size,
      queueLength: this.dataQueue.length,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      isProcessing: this.isProcessing
    };
  }
}

export default BackendServiceManager;