export class RateLimiter {
  private readonly limit: number;
  private readonly interval: number = 60000; // 1 minute
  private requests: number[];

  constructor(requestsPerMinute: number) {
    this.limit = requestsPerMinute;
    this.requests = [];
  }

  canProcess(): boolean {
    const now = Date.now();
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < this.interval);
    
    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }
    return false;
  }

  getStats() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.interval);
    return {
      currentRequests: this.requests.length,
      limit: this.limit,
      remainingRequests: Math.max(0, this.limit - this.requests.length)
    };
  }
}