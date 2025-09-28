import { sendToAnalytics } from './analytics';
import { logError } from './errorTracking';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface ResourceMetric {
  name: string;
  initiatorType: string;
  duration: number;
  size: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]>;
  private resourceMetrics: ResourceMetric[];

  private constructor() {
    this.metrics = new Map();
    this.resourceMetrics = [];
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Performance Observer for Long Tasks
    if ('PerformanceObserver' in window) {
      // Long Tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('longTask', {
              name: 'Long Task',
              value: entry.duration,
              rating: this.getRating(entry.duration, [50, 100])
            });
            sendToAnalytics({
              name: 'longTask',
              value: entry.duration,
              path: window.location.pathname
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        logError(new Error('Long task observer failed to initialize'));
      }

      // Resource Timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const resource = entry as PerformanceResourceTiming;
            this.resourceMetrics.push({
              name: resource.name,
              initiatorType: resource.initiatorType,
              duration: resource.duration,
              size: resource.transferSize || 0
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        logError(new Error('Resource observer failed to initialize'));
      }

      // Navigation Timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const navTiming = entry as PerformanceNavigationTiming;
            this.recordMetric('navigation', {
              name: 'Page Load',
              value: navTiming.loadEventEnd - navTiming.fetchStart,
              rating: this.getRating(navTiming.loadEventEnd - navTiming.fetchStart, [2000, 4000])
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        logError(new Error('Navigation observer failed to initialize'));
      }

      // First Paint & First Contentful Paint
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('paint', {
              name: entry.name,
              value: entry.startTime,
              rating: this.getRating(entry.startTime, [1000, 2000])
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        logError(new Error('Paint observer failed to initialize'));
      }
    }

    // Memory Usage (where supported)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory', {
          name: 'Heap Size',
          value: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
          rating: this.getRating(memory.usedJSHeapSize / memory.jsHeapSizeLimit, [0.5, 0.8])
        });
      }, 10000);
    }
  }

  private getRating(value: number, [warning, critical]: number[]): 'good' | 'needs-improvement' | 'poor' {
    if (value <= warning) return 'good';
    if (value <= critical) return 'needs-improvement';
    return 'poor';
  }

  private recordMetric(category: string, metric: PerformanceMetric) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }
    this.metrics.get(category)!.push(metric);

    // Keep only last 100 metrics per category
    if (this.metrics.get(category)!.length > 100) {
      this.metrics.get(category)!.shift();
    }
  }

  public getMetrics(category?: string) {
    if (category) {
      return this.metrics.get(category) || [];
    }
    const allMetrics: { [key: string]: PerformanceMetric[] } = {};
    this.metrics.forEach((value, key) => {
      allMetrics[key] = value;
    });
    return allMetrics;
  }

  public getResourceMetrics() {
    return this.resourceMetrics;
  }

  public getPerformanceScore(): number {
    let totalScore = 0;
    let totalMetrics = 0;

    this.metrics.forEach((categoryMetrics) => {
      categoryMetrics.forEach((metric) => {
        switch (metric.rating) {
          case 'good':
            totalScore += 100;
            break;
          case 'needs-improvement':
            totalScore += 50;
            break;
          case 'poor':
            totalScore += 0;
            break;
        }
        totalMetrics++;
      });
    });

    return totalMetrics > 0 ? Math.round(totalScore / totalMetrics) : 100;
  }

  public clearMetrics() {
    this.metrics.clear();
    this.resourceMetrics = [];
  }
}

export default PerformanceMonitor;