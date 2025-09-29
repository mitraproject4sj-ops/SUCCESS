import { google } from 'googleapis';
import RealPriceService from './RealPriceService';

interface TradeData {
  timestamp: string;
  strategy: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  volume: number;
  reasoning: string;
  pnl?: number;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
}

interface DailyAnalysis {
  date: string;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  bestStrategy: string;
  worstStrategy: string;
  totalVolume: number;
  avgConfidence: number;
}

class GoogleSheetsIntegration {
  private static instance: GoogleSheetsIntegration;
  private sheets: any;
  private spreadsheetId: string;
  private realPriceService: RealPriceService;

  private constructor() {
    this.initializeSheets();
    this.realPriceService = RealPriceService.getInstance();
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || 'your-sheet-id';
  }

  static getInstance(): GoogleSheetsIntegration {
    if (!GoogleSheetsIntegration.instance) {
      GoogleSheetsIntegration.instance = new GoogleSheetsIntegration();
    }
    return GoogleSheetsIntegration.instance;
  }

  private async initializeSheets() {
    try {
      // Method 1: Service Account (Recommended for production)
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './lakshya-service-account.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      
      // Test connection
      await this.setupWorksheets();
      console.log('✅ Google Sheets connected successfully');
      
    } catch (error) {
      console.error('Google Sheets initialization failed:', error);
      
      // Fallback: Manual setup instructions
      this.logManualSetupInstructions();
    }
  }

  private async setupWorksheets() {
    const worksheets = [
      'Trades', 'Daily_Analysis', 'Performance', 'Real_Prices', 'Strategies'
    ];

    for (const worksheet of worksheets) {
      try {
        await this.createWorksheetIfNotExists(worksheet);
      } catch (error) {
        console.error(`Failed to setup worksheet ${worksheet}:`, error);
      }
    }
  }

  private async createWorksheetIfNotExists(title: string) {
    try {
      // Check if worksheet exists
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      const worksheetExists = spreadsheet.data.sheets.some(
        (sheet: any) => sheet.properties.title === title
      );

      if (!worksheetExists) {
        // Create worksheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: { title }
              }
            }]
          }
        });

        // Add headers based on worksheet type
        await this.addWorksheetHeaders(title);
        console.log(`✅ Created worksheet: ${title}`);
      }
    } catch (error) {
      console.error(`Error setting up worksheet ${title}:`, error);
    }
  }

  private async addWorksheetHeaders(worksheetName: string) {
    let headers: string[] = [];

    switch (worksheetName) {
      case 'Trades':
        headers = [
          'Timestamp', 'Strategy', 'Symbol', 'Direction', 'Entry Price (INR)', 
          'Stop Loss (INR)', 'Take Profit (INR)', 'Confidence (%)', 'Volume', 
          'Reasoning', 'Risk (%)', 'Reward (%)', 'R:R Ratio', 'PnL (INR)', 'Status'
        ];
        break;
      case 'Daily_Analysis':
        headers = [
          'Date', 'Total PnL (INR)', 'Total Trades', 'Win Rate (%)', 
          'Best Strategy', 'Worst Strategy', 'Total Volume', 'Avg Confidence (%)'
        ];
        break;
      case 'Performance':
        headers = [
          'Strategy', 'Total Trades', 'Wins', 'Losses', 'Win Rate (%)', 
          'Total PnL (INR)', 'Avg PnL per Trade', 'Best Trade', 'Worst Trade'
        ];
        break;
      case 'Real_Prices':
        headers = [
          'Symbol', 'Price (INR)', 'Change 24h (%)', 'Volume', 'Last Update'
        ];
        break;
      case 'Strategies':
        headers = [
          'Strategy Name', 'Description', 'Min Confidence', 'Risk Level', 
          'Success Rate (%)', 'Last Used', 'Status'
        ];
        break;
    }

    if (headers.length > 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${worksheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [headers] }
      });
    }
  }

  // Main methods for data logging
  public async logTrade(trade: TradeData): Promise<boolean> {
    try {
      const row = [
        trade.timestamp,
        trade.strategy,
        trade.symbol,
        trade.direction,
        trade.entryPrice,
        trade.stopLoss,
        trade.takeProfit,
        trade.confidence,
        trade.volume,
        trade.reasoning,
        this.calculateRiskPercent(trade.entryPrice, trade.stopLoss),
        this.calculateRewardPercent(trade.entryPrice, trade.takeProfit),
        this.calculateRRRatio(trade.entryPrice, trade.stopLoss, trade.takeProfit),
        trade.pnl || 0,
        trade.status
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Trades!A:O',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] }
      });

      console.log(`✅ Trade logged to Google Sheets: ${trade.symbol} ${trade.direction}`);
      return true;

    } catch (error) {
      console.error('Failed to log trade to Google Sheets:', error);
      return false;
    }
  }

  public async logDailyAnalysis(analysis: DailyAnalysis): Promise<boolean> {
    try {
      const row = [
        analysis.date,
        analysis.totalPnL,
        analysis.totalTrades,
        analysis.winRate,
        analysis.bestStrategy,
        analysis.worstStrategy,
        analysis.totalVolume,
        analysis.avgConfidence
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Daily_Analysis!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] }
      });

      console.log(`✅ Daily analysis logged: ${analysis.date}`);
      return true;

    } catch (error) {
      console.error('Failed to log daily analysis:', error);
      return false;
    }
  }

  public async updateRealPrices(): Promise<boolean> {
    try {
      const realPrices = this.realPriceService.getAllRealPrices();
      
      if (realPrices.length === 0) {
        console.warn('No real prices available to update');
        return false;
      }

      // Clear existing data (keep headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: 'Real_Prices!A2:E'
      });

      // Prepare new data
      const rows = realPrices.map(price => [
        price.symbol,
        price.price,
        price.change24h,
        price.volume,
        new Date(price.lastUpdate).toLocaleString('en-IN')
      ]);

      // Update with new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Real_Prices!A2:E${rows.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: rows }
      });

      console.log(`✅ Updated ${realPrices.length} real prices in Google Sheets`);
      return true;

    } catch (error) {
      console.error('Failed to update real prices:', error);
      return false;
    }
  }

  // Utility methods
  private calculateRiskPercent(entry: number, stopLoss: number): string {
    const risk = Math.abs((entry - stopLoss) / entry * 100);
    return `${risk.toFixed(2)}%`;
  }

  private calculateRewardPercent(entry: number, takeProfit: number): string {
    const reward = Math.abs((takeProfit - entry) / entry * 100);
    return `${reward.toFixed(2)}%`;
  }

  private calculateRRRatio(entry: number, stopLoss: number, takeProfit: number): string {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    const ratio = reward / risk;
    return `1:${ratio.toFixed(2)}`;
  }

  // Setup methods for new users
  public async createNewSpreadsheet(title: string = 'LAKSHYA Trading Dashboard'): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.create({
        resource: {
          properties: { title },
          sheets: [
            { properties: { title: 'Trades' } },
            { properties: { title: 'Daily_Analysis' } },
            { properties: { title: 'Performance' } },
            { properties: { title: 'Real_Prices' } },
            { properties: { title: 'Strategies' } }
          ]
        }
      });

      const spreadsheetId = response.data.spreadsheetId;
      console.log(`✅ Created new spreadsheet: ${spreadsheetId}`);
      
      // Setup headers for all worksheets
      this.spreadsheetId = spreadsheetId;
      await this.setupWorksheets();
      
      return spreadsheetId;

    } catch (error) {
      console.error('Failed to create new spreadsheet:', error);
      throw error;
    }
  }

  private logManualSetupInstructions() {
    console.log(`
🔧 GOOGLE SHEETS MANUAL SETUP REQUIRED:

1. Create Google Service Account:
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Google Sheets API
   - Create Service Account
   - Download JSON key file

2. Environment Variables:
   GOOGLE_SERVICE_ACCOUNT_PATH=./lakshya-service-account.json
   GOOGLE_SHEET_ID=your-spreadsheet-id

3. Share Spreadsheet:
   - Create new Google Sheet
   - Share with service account email
   - Give Editor permissions

4. Worksheet Setup:
   - Create worksheets: Trades, Daily_Analysis, Performance, Real_Prices, Strategies
   - Copy sheet ID from URL

📝 Alternative: Use demo mode with local CSV export
    `);
  }

  // Auto-update methods
  public startAutoUpdates() {
    // Update real prices every 5 minutes
    setInterval(() => {
      this.updateRealPrices();
    }, 5 * 60 * 1000);

    console.log('✅ Started auto-updates for Google Sheets');
  }
}

export default GoogleSheetsIntegration;
export type { TradeData, DailyAnalysis };