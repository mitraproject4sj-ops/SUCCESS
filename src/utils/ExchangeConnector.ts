import { Spot } from '@binance/connector';
import axios from 'axios';
import crypto from 'crypto';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';

interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopLoss: number;
  takeProfit: number;
}

class ExchangeConnector {
  private binanceClient: any;
  private coindcxHeaders: any;
  private deltaHeaders: any;

  constructor() {
    // Initialize Binance
    this.binanceClient = new Spot(
      process.env.BINANCE_API_KEY!,
      process.env.BINANCE_API_SECRET!
    );

    // Initialize CoinDCX headers
    this.coindcxHeaders = {
      'X-AUTH-APIKEY': process.env.COINDCX_API_KEY,
      'X-AUTH-SIGNATURE': '',
      'Content-Type': 'application/json'
    };

    // Initialize Delta Exchange headers
    this.deltaHeaders = {
      'api-key': process.env.DELTA_API_KEY,
      'timestamp': '',
      'signature': '',
      'Content-Type': 'application/json'
    };
  }

  // Binance Methods
  async placeBinanceOrder(params: OrderParams) {
    try {
      // Place main order
      const mainOrder = await this.binanceClient.newOrder(
        params.symbol,
        params.side,
        'LIMIT',
        {
          quantity: params.quantity,
          price: params.price,
          timeInForce: 'GTC'
        }
      );

      if (mainOrder.data.orderId) {
        // Place stop loss
        await this.binanceClient.newOrder(
          params.symbol,
          params.side === 'BUY' ? 'SELL' : 'BUY',
          'STOP_LOSS_LIMIT',
          {
            quantity: params.quantity,
            stopPrice: params.stopLoss,
            price: params.stopLoss,
            timeInForce: 'GTC'
          }
        );

        // Place take profit
        await this.binanceClient.newOrder(
          params.symbol,
          params.side === 'BUY' ? 'SELL' : 'BUY',
          'LIMIT',
          {
            quantity: params.quantity,
            price: params.takeProfit,
            timeInForce: 'GTC'
          }
        );

        return { success: true, orderId: mainOrder.data.orderId };
      }
    } catch (error) {
      console.error('Binance order error:', error);
      throw error;
    }
  }

  // CoinDCX Methods
  async placeCoinDCXOrder(params: OrderParams) {
    try {
      const timestamp = new Date().getTime();
      const body = {
        side: params.side.toLowerCase(),
        order_type: 'limit',
        market: params.symbol,
        price_per_unit: params.price,
        total_quantity: params.quantity,
        timestamp
      };

      // Generate signature
      const signature = crypto
        .createHmac('sha256', process.env.COINDCX_API_SECRET!)
        .update(JSON.stringify(body))
        .digest('hex');

      this.coindcxHeaders['X-AUTH-SIGNATURE'] = signature;

      // Place main order
      const response = await axios.post(
        'https://api.coindcx.com/exchange/v1/orders/create',
        body,
        { headers: this.coindcxHeaders }
      );

      if (response.data.order_id) {
        // Place stop loss
        await this.placeCoinDCXStopLoss(params);
        
        // Place take profit
        await this.placeCoinDCXTakeProfit(params);

        return { success: true, orderId: response.data.order_id };
      }
    } catch (error) {
      console.error('CoinDCX order error:', error);
      throw error;
    }
  }

  private async placeCoinDCXStopLoss(params: OrderParams) {
    // Implement stop loss logic for CoinDCX
  }

  private async placeCoinDCXTakeProfit(params: OrderParams) {
    // Implement take profit logic for CoinDCX
  }

  // Delta Exchange Methods
  async placeDeltaOrder(params: OrderParams) {
    try {
      const timestamp = new Date().getTime();
      const body = {
        symbol: params.symbol,
        side: params.side.toLowerCase(),
        type: 'limit',
        size: params.quantity,
        price: params.price,
        time_in_force: 'gtc',
        timestamp
      };

      // Generate signature
      const signature = crypto
        .createHmac('sha256', process.env.DELTA_API_SECRET!)
        .update(JSON.stringify(body))
        .digest('hex');

      this.deltaHeaders.timestamp = timestamp.toString();
      this.deltaHeaders.signature = signature;

      // Place main order
      const response = await axios.post(
        'https://api.delta.exchange/v2/orders',
        body,
        { headers: this.deltaHeaders }
      );

      if (response.data.id) {
        // Place stop loss
        await this.placeDeltaStopLoss(params);
        
        // Place take profit
        await this.placeDeltaTakeProfit(params);

        return { success: true, orderId: response.data.id };
      }
    } catch (error) {
      console.error('Delta Exchange order error:', error);
      throw error;
    }
  }

  private async placeDeltaStopLoss(params: OrderParams) {
    // Implement stop loss logic for Delta Exchange
  }

  private async placeDeltaTakeProfit(params: OrderParams) {
    // Implement take profit logic for Delta Exchange
  }

  // Unified Methods
  async getBalance(exchange: string) {
    switch (exchange.toLowerCase()) {
      case 'binance':
        const binanceBalance = await this.binanceClient.account();
        return binanceBalance.data.balances;

      case 'coindcx':
        const coindcxBalance = await axios.get(
          'https://api.coindcx.com/exchange/v1/users/balances',
          { headers: this.coindcxHeaders }
        );
        return coindcxBalance.data;

      case 'delta':
        const deltaBalance = await axios.get(
          'https://api.delta.exchange/v2/wallet/balances',
          { headers: this.deltaHeaders }
        );
        return deltaBalance.data;

      default:
        throw new Error('Unsupported exchange');
    }
  }

  async cancelOrder(exchange: string, orderId: string, symbol: string) {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return await this.binanceClient.cancelOrder(symbol, orderId);

      case 'coindcx':
        return await axios.post(
          'https://api.coindcx.com/exchange/v1/orders/cancel',
          { id: orderId },
          { headers: this.coindcxHeaders }
        );

      case 'delta':
        return await axios.delete(
          `https://api.delta.exchange/v2/orders/${orderId}`,
          { headers: this.deltaHeaders }
        );

      default:
        throw new Error('Unsupported exchange');
    }
  }

  async getOrderStatus(exchange: string, orderId: string, symbol: string) {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return await this.binanceClient.getOrder(symbol, { orderId });

      case 'coindcx':
        return await axios.post(
          'https://api.coindcx.com/exchange/v1/orders/status',
          { id: orderId },
          { headers: this.coindcxHeaders }
        );

      case 'delta':
        return await axios.get(
          `https://api.delta.exchange/v2/orders/${orderId}`,
          { headers: this.deltaHeaders }
        );

      default:
        throw new Error('Unsupported exchange');
    }
  }
}

export default ExchangeConnector;