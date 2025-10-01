// Frontend stub for analytics (web-vitals is optional)
// Provides basic analytics without web-vitals dependency

export function sendToAnalytics(metric: any) {
  console.log('📊 Analytics metric (stub):', metric);
  // In production, send to your analytics endpoint
}

export function reportWebVitals(onPerfEntry?: any) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Stub implementation - web-vitals package not available
    console.log('ℹ️ Web vitals reporting (stub mode)');
  }
}

export default reportWebVitals;
