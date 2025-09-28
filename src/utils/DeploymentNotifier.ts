import axios from 'axios';
import { logError } from './errorTracking';

interface NotificationConfig {
  telegram?: {
    botToken: string;
    chatId: string;
  };
  slack?: {
    webhookUrl: string;
    channel: string;
  };
  email?: {
    to: string[];
    from: string;
  };
}

interface DeploymentInfo {
  version: string;
  environment: 'production' | 'staging';
  changes: string[];
  deployedBy: string;
  timestamp: number;
}

interface HealthStatus {
  frontend: boolean;
  backend: boolean;
  database: boolean;
  websocket: boolean;
}

class DeploymentNotifier {
  private static instance: DeploymentNotifier;
  private config: NotificationConfig;

  private constructor() {
    this.config = {
      telegram: {
        botToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.REACT_APP_TELEGRAM_CHAT_ID || ''
      },
      slack: {
        webhookUrl: process.env.REACT_APP_SLACK_WEBHOOK_URL || '',
        channel: process.env.REACT_APP_SLACK_CHANNEL || '#deployments'
      },
      email: {
        to: (process.env.REACT_APP_ALERT_EMAILS || '').split(','),
        from: process.env.REACT_APP_ALERT_FROM_EMAIL || ''
      }
    };
  }

  static getInstance(): DeploymentNotifier {
    if (!DeploymentNotifier.instance) {
      DeploymentNotifier.instance = new DeploymentNotifier();
    }
    return DeploymentNotifier.instance;
  }

  private async sendTelegramNotification(message: string): Promise<void> {
    if (!this.config.telegram?.botToken || !this.config.telegram?.chatId) {
      return;
    }

    try {
      await axios.post(`https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`, {
        chat_id: this.config.telegram.chatId,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (error) {
      logError(new Error('Failed to send Telegram notification'), { error });
    }
  }

  private async sendSlackNotification(message: string): Promise<void> {
    if (!this.config.slack?.webhookUrl) {
      return;
    }

    try {
      await axios.post(this.config.slack.webhookUrl, {
        channel: this.config.slack.channel,
        text: message
      });
    } catch (error) {
      logError(new Error('Failed to send Slack notification'), { error });
    }
  }

  private formatDeploymentMessage(info: DeploymentInfo, status: HealthStatus): string {
    const emoji = Object.values(status).every(s => s) ? '✅' : '⚠️';
    const timestamp = new Date(info.timestamp).toLocaleString();

    return `
${emoji} <b>Deployment Update</b>

🚀 Version: ${info.version}
🌍 Environment: ${info.environment}
👤 Deployed by: ${info.deployedBy}
🕒 Time: ${timestamp}

📝 Changes:
${info.changes.map(c => `• ${c}`).join('\n')}

🏥 System Status:
• Frontend: ${status.frontend ? '✅' : '❌'}
• Backend: ${status.backend ? '✅' : '❌'}
• Database: ${status.database ? '✅' : '❌'}
• WebSocket: ${status.websocket ? '✅' : '❌'}

#deployment #${info.environment}
    `.trim();
  }

  public async notifyDeployment(info: DeploymentInfo, status: HealthStatus): Promise<void> {
    const message = this.formatDeploymentMessage(info, status);

    // Send notifications in parallel
    await Promise.all([
      this.sendTelegramNotification(message),
      this.sendSlackNotification(message)
    ]);
  }

  public async notifyError(error: Error, context: Record<string, any> = {}): Promise<void> {
    const message = `
❌ <b>Deployment Error</b>

🔍 Error: ${error.message}
📊 Context: ${JSON.stringify(context, null, 2)}
⏰ Time: ${new Date().toLocaleString()}

#error #deployment
    `.trim();

    await Promise.all([
      this.sendTelegramNotification(message),
      this.sendSlackNotification(message)
    ]);
  }
}

export default DeploymentNotifier;