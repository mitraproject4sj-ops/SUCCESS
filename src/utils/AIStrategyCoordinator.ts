import { Configuration, OpenAIApi } from 'openai';
import { MemoryCache } from './MemoryCache';

interface AIStrategyResponse {
  confidence: number;
  direction: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  suggestedEntry?: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface MarketCondition {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  indicators: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    ema?: { ema20: number; ema50: number; ema200: number };
    atr?: number;
  };
  newsData?: string[];
}

class AIStrategyCoordinator {
  private static instance: AIStrategyCoordinator;
  private openai: OpenAIApi;
  private cache: MemoryCache;
  private sentimentCache: Map<string, { sentiment: number; timestamp: number }>;

  private constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
    this.cache = new MemoryCache(50); // 50MB cache limit
    this.sentimentCache = new Map();
  }

  static getInstance(): AIStrategyCoordinator {
    if (!AIStrategyCoordinator.instance) {
      AIStrategyCoordinator.instance = new AIStrategyCoordinator();
    }
    return AIStrategyCoordinator.instance;
  }

  private async getMarketSentiment(symbol: string, newsData: string[]): Promise<number> {
    const cacheKey = `sentiment_${symbol}`;
    const cached = this.sentimentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 1800000) { // 30 minutes cache
      return cached.sentiment;
    }

    try {
      const prompt = `Analyze the following crypto market news for ${symbol} and provide a sentiment score between -1 (very bearish) and 1 (very bullish):\n${newsData.join('\n')}`;
      
      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 50,
        temperature: 0.3,
      });

      const sentiment = parseFloat(response.data.choices[0].text || "0");
      this.sentimentCache.set(cacheKey, { sentiment, timestamp: Date.now() });
      return sentiment;
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      return 0;
    }
  }

  async getAIStrategySignal(
    condition: MarketCondition,
    timeframe: string
  ): Promise<AIStrategyResponse> {
    const cacheKey = `${condition.symbol}_${timeframe}_${Math.floor(Date.now() / 60000)}`; // 1-minute cache
    const cachedSignal = this.cache.get(cacheKey);
    if (cachedSignal) return cachedSignal;

    try {
      const sentiment = await this.getMarketSentiment(condition.symbol, condition.newsData || []);
      
      const prompt = `Analyze the following market conditions for ${condition.symbol} on ${timeframe} timeframe:
      - Current Price: ${condition.price}
      - RSI: ${condition.indicators.rsi}
      - MACD: ${JSON.stringify(condition.indicators.macd)}
      - EMA: ${JSON.stringify(condition.indicators.ema)}
      - ATR: ${condition.indicators.atr}
      - Market Sentiment: ${sentiment}

      Provide a trading decision with:
      1. Direction (BUY/SELL/HOLD)
      2. Confidence score (0-100)
      3. Brief reasoning
      4. Suggested entry price
      5. Stop loss and take profit levels based on ATR`;

      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 200,
        temperature: 0.2,
      });

      const result = this.parseAIResponse(response.data.choices[0].text || "");
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting AI strategy signal:', error);
      return {
        confidence: 0,
        direction: 'HOLD',
        reasoning: 'Error in AI analysis'
      };
    }
  }

  private parseAIResponse(text: string): AIStrategyResponse {
    // Implement parsing logic for AI response
    // This is a simplified example
    return {
      confidence: 75,
      direction: 'HOLD',
      reasoning: text,
      suggestedEntry: 0,
      stopLoss: 0,
      takeProfit: 0
    };
  }

  // Get consensus from multiple AI models and traditional strategies
  async getConsensusSignal(
    condition: MarketCondition,
    timeframe: string
  ): Promise<AIStrategyResponse> {
    const [aiSignal, traditionalSignal] = await Promise.all([
      this.getAIStrategySignal(condition, timeframe),
      this.getTraditionalSignal(condition)
    ]);

    // Weight the signals (70% AI, 30% Traditional)
    const consensusConfidence = (aiSignal.confidence * 0.7) + (traditionalSignal.confidence * 0.3);
    
    return {
      confidence: consensusConfidence,
      direction: consensusConfidence > 75 ? aiSignal.direction : 'HOLD',
      reasoning: `AI: ${aiSignal.reasoning}\nTraditional: ${traditionalSignal.reasoning}`,
      suggestedEntry: aiSignal.suggestedEntry,
      stopLoss: aiSignal.stopLoss,
      takeProfit: aiSignal.takeProfit
    };
  }

  private async getTraditionalSignal(condition: MarketCondition): Promise<AIStrategyResponse> {
    // Implement traditional technical analysis
    // This is a placeholder for your existing strategy logic
    return {
      confidence: 0,
      direction: 'HOLD',
      reasoning: 'Traditional analysis pending'
    };
  }
}