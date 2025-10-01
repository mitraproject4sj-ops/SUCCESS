import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { LAKSHYA_CONFIG } from '../config/lakshya.config';
import TelegramBot from 'node-telegram-bot-api';

interface DailyReport {
  date: string;
  totalPnL: number;
  tradesExecuted: number;
  winRate: number;
  exchangeMetrics: {
    [exchange: string]: {
      pnl: number;
      trades: number;
      winRate: number;
    }
  };
  strategyPerformance: {
    [strategy: string]: {
      pnl: number;
      trades: number;
      winRate: number;
    }
  };
}

class ReportingService {
  private static instance: ReportingService;
  private telegramBot: TelegramBot;
  private sheets: any;
  private emailTransporter: any;
  private chatIds: string[];

  private constructor() {
    // Initialize Telegram Bot
    this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
    this.chatIds = (process.env.TELEGRAM_CHAT_IDS || '').split(',');

    // Initialize Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: 'lakshya-service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });

    // Initialize Email
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  async sendDailyReport(report: DailyReport) {
    await Promise.all([
      this.updateGoogleSheet(report),
      this.sendEmailReport(report),
      this.sendTelegramSummary(report),
    ]);
  }

  private async updateGoogleSheet(report: DailyReport) {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const range = 'Daily Reports!A:Z';

      // Format data for sheet
      const values = [
        [
          report.date,
          report.totalPnL,
          report.tradesExecuted,
          report.winRate,
          ...Object.entries(report.exchangeMetrics).flatMap(([_, metrics]) => [
            metrics.pnl,
            metrics.trades,
            metrics.winRate,
          ]),
          ...Object.entries(report.strategyPerformance).flatMap(([_, metrics]) => [
            metrics.pnl,
            metrics.trades,
            metrics.winRate,
          ]),
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });
    } catch (error) {
      console.error('Google Sheets update failed:', error);
      await this.sendAlert('ERROR: Google Sheets update failed');
    }
  }

  private async sendEmailReport(report: DailyReport) {
    const emailHtml = this.generateEmailHtml(report);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.REPORT_RECIPIENTS,
      subject: `LAKSHYA Trading Report - ${report.date} (PnL: ₹${report.totalPnL.toLocaleString()})`,
      html: emailHtml,
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      await this.sendAlert('ERROR: Daily email report failed');
    }
  }

  private generateEmailHtml(report: DailyReport): string {
    return `
      <h2>LAKSHYA Trading System - Daily Report</h2>
      <h3>Date: ${report.date}</h3>
      
      <div style="margin: 20px 0; padding: 15px; background: ${report.totalPnL >= 0 ? '#e6ffe6' : '#ffe6e6'};">
        <h3>Daily Summary</h3>
        <p>Total P&L: ₹${report.totalPnL.toLocaleString()}</p>
        <p>Trades Executed: ${report.tradesExecuted}</p>
        <p>Win Rate: ${report.winRate}%</p>
      </div>

      <div style="margin: 20px 0;">
        <h3>Exchange Performance</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Exchange</th>
            <th style="border: 1px solid #ddd; padding: 8px;">P&L</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Trades</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Win Rate</th>
          </tr>
          ${Object.entries(report.exchangeMetrics)
            .map(([exchange, metrics]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${exchange}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${metrics.pnl.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${metrics.trades}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${metrics.winRate}%</td>
              </tr>
            `).join('')}
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h3>Strategy Performance</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Strategy</th>
            <th style="border: 1px solid #ddd; padding: 8px;">P&L</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Trades</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Win Rate</th>
          </tr>
          ${Object.entries(report.strategyPerformance)
            .map(([strategy, metrics]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${strategy}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${metrics.pnl.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${metrics.trades}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${metrics.winRate}%</td>
              </tr>
            `).join('')}
        </table>
      </div>
    `;
  }

  private async sendTelegramSummary(report: DailyReport) {
    const message = `
🎯 LAKSHYA Daily Summary - ${report.date}

💰 Total P&L: ₹${report.totalPnL.toLocaleString()}
📊 Trades: ${report.tradesExecuted}
✅ Win Rate: ${report.winRate}%

Exchange Performance:
${Object.entries(report.exchangeMetrics)
  .map(([exchange, metrics]) => 
    `${exchange}: ₹${metrics.pnl.toLocaleString()} (${metrics.trades} trades)`
  ).join('\n')}

Best Strategy: ${this.getBestStrategy(report.strategyPerformance)}
    `;

    try {
      await Promise.all(
        this.chatIds.map(chatId => 
          this.telegramBot.sendMessage(chatId, message)
        )
      );
    } catch (error) {
      console.error('Telegram message failed:', error);
    }
  }

  private getBestStrategy(strategies: DailyReport['strategyPerformance']): string {
    return Object.entries(strategies)
      .sort(([,a], [,b]) => b.pnl - a.pnl)[0][0];
  }

  async sendAlert(message: string, priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM') {
    const emoji = {
      HIGH: '🚨',
      MEDIUM: '⚠️',
      LOW: 'ℹ️'
    };

    const telegramMessage = `${emoji[priority]} LAKSHYA Alert:\n${message}`;

    try {
      await Promise.all(
        this.chatIds.map(chatId => 
          this.telegramBot.sendMessage(chatId, telegramMessage)
        )
      );
    } catch (error) {
      console.error('Alert sending failed:', error);
    }
  }

  async sendTradeNotification(trade: any) {
    const message = `
🔄 New Trade Executed

Symbol: ${trade.symbol}
Direction: ${trade.direction}
Entry: ₹${trade.price.toLocaleString()}
Quantity: ${trade.quantity}
Strategy: ${trade.strategy}
Exchange: ${trade.exchange}

Stop Loss: ₹${trade.stopLoss.toLocaleString()}
Take Profit: ₹${trade.takeProfit.toLocaleString()}
    `;

    try {
      await Promise.all(
        this.chatIds.map(chatId => 
          this.telegramBot.sendMessage(chatId, message)
        )
      );
    } catch (error) {
      console.error('Trade notification failed:', error);
    }
  }
}

export default ReportingService;