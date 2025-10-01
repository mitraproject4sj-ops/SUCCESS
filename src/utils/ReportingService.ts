// Frontend stub for ReportingService
// Note: Reporting requires backend service with googleapis, nodemailer, telegram-bot-api
// This is a client-side stub that provides the same interface

class ReportingService {
  private static instance: ReportingService;

  private constructor() {
    console.log('ℹ️ Reporting service stub loaded (requires backend API)');
  }

  static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  async sendDailyReport(data: any): Promise<void> {
    console.log('📧 Daily report sent (stub):', data);
    // In production, this would call backend API endpoint
  }

  async sendTradeAlert(trade: any): Promise<void> {
    console.log('🔔 Trade alert sent (stub):', trade);
    // In production, this would call backend API endpoint
  }

  async sendTelegramMessage(message: string): Promise<void> {
    console.log('📱 Telegram message sent (stub):', message);
    // In production, this would call backend API endpoint
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log('📧 Email sent (stub):', { to, subject, body });
    // In production, this would call backend API endpoint
  }
}

export default ReportingService;
