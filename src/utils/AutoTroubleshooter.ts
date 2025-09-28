import axios from 'axios';
import { logError } from './errorTracking';

interface HealthCheck {
  service: string;
  status: 'up' | 'down' | 'degraded';
  latency: number;
  error?: string;
}

interface TroubleshootingStep {
  id: string;
  description: string;
  action: () => Promise<boolean>;
  resolution?: string;
}

class AutoTroubleshooter {
  private static instance: AutoTroubleshooter;
  private isRunning: boolean = false;
  private healthChecks: HealthCheck[] = [];

  static getInstance(): AutoTroubleshooter {
    if (!AutoTroubleshooter.instance) {
      AutoTroubleshooter.instance = new AutoTroubleshooter();
    }
    return AutoTroubleshooter.instance;
  }

  private constructor() {
    // Initialize automatic health checks
    setInterval(() => this.runHealthChecks(), 60000); // Run every minute
  }

  private async checkBackendConnection(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
      return {
        service: 'backend',
        status: response.data.status === 'ok' ? 'up' : 'degraded',
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        service: 'backend',
        status: 'down',
        latency: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async checkFrontendRoutes(): Promise<HealthCheck> {
    try {
      const routes = [
        '/',
        '/dashboard',
        '/monitoring',
        '/performance'
      ];

      const startTime = Date.now();
      let workingRoutes = 0;

      for (const route of routes) {
        try {
          const response = await fetch(route);
          if (response.ok) workingRoutes++;
        } catch (error) {
          console.warn(`Route ${route} check failed:`, error);
        }
      }

      return {
        service: 'frontend-routes',
        status: workingRoutes === routes.length ? 'up' : 'degraded',
        latency: Date.now() - startTime,
        error: workingRoutes < routes.length ? `${routes.length - workingRoutes} routes failing` : undefined
      };
    } catch (error) {
      return {
        service: 'frontend-routes',
        status: 'down',
        latency: 0,
        error: error.message
      };
    }
  }

  private async checkLocalStorage(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return {
        service: 'local-storage',
        status: 'up',
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        service: 'local-storage',
        status: 'down',
        latency: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private getTroubleshootingSteps(): TroubleshootingStep[] {
    return [
      {
        id: 'check-env',
        description: 'Verifying environment configuration...',
        action: async () => {
          const requiredVars = [
            'REACT_APP_BACKEND_URL',
            'REACT_APP_WS_URL'
          ];
          const missing = requiredVars.filter(v => !process.env[v]);
          if (missing.length > 0) {
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
          }
          return true;
        },
        resolution: 'Create .env file with required variables'
      },
      {
        id: 'check-network',
        description: 'Checking network connectivity...',
        action: async () => {
          try {
            await fetch('https://api.github.com');
            return true;
          } catch (error) {
            throw new Error('Network connectivity issues detected');
          }
        },
        resolution: 'Check your internet connection and firewall settings'
      },
      {
        id: 'check-backend',
        description: 'Verifying backend connection...',
        action: async () => {
          const check = await this.checkBackendConnection();
          if (check.status === 'down') {
            throw new Error(`Backend is unreachable: ${check.error}`);
          }
          return true;
        },
        resolution: 'Ensure backend server is running and accessible'
      },
      {
        id: 'check-routes',
        description: 'Checking application routes...',
        action: async () => {
          const check = await this.checkFrontendRoutes();
          if (check.status === 'down') {
            throw new Error('Route checking failed');
          }
          return true;
        },
        resolution: 'Check React Router configuration and component loading'
      },
      {
        id: 'check-storage',
        description: 'Verifying local storage...',
        action: async () => {
          const check = await this.checkLocalStorage();
          if (check.status === 'down') {
            throw new Error('Local storage is not accessible');
          }
          return true;
        },
        resolution: 'Clear browser cache and check storage permissions'
      }
    ];
  }

  public async runHealthChecks() {
    this.healthChecks = await Promise.all([
      this.checkBackendConnection(),
      this.checkFrontendRoutes(),
      this.checkLocalStorage()
    ]);

    // Log issues if found
    const issues = this.healthChecks.filter(check => check.status !== 'up');
    if (issues.length > 0) {
      logError(new Error('Health check issues detected'), { issues });
    }

    return this.healthChecks;
  }

  public async troubleshoot(onProgress?: (step: string, success: boolean) => void): Promise<string[]> {
    if (this.isRunning) {
      return ['Troubleshooter is already running'];
    }

    this.isRunning = true;
    const issues: string[] = [];
    const steps = this.getTroubleshootingSteps();

    try {
      for (const step of steps) {
        try {
          await step.action();
          onProgress?.(step.description, true);
        } catch (error) {
          onProgress?.(step.description, false);
          issues.push(`${step.description} Failed: ${error.message}`);
          if (step.resolution) {
            issues.push(`Resolution: ${step.resolution}`);
          }
        }
      }
    } finally {
      this.isRunning = false;
    }

    return issues;
  }

  public getLastHealthChecks(): HealthCheck[] {
    return this.healthChecks;
  }
}

export default AutoTroubleshooter;