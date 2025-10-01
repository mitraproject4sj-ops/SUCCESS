import { ReportHandler } from 'web-vitals';

const vitalsURL = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator && 
         navigator['connection'] && 
         'effectiveType' in navigator['connection']
    ? (navigator['connection'] as any)['effectiveType']
    : '';
}

export function reportWebVitals(onPerfEntry?: ReportHandler) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

export function sendToAnalytics(metric: any) {
  const body = {
    dsn: process.env.REACT_APP_ANALYTICS_DSN,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
    browser: navigator.userAgent,
    timestamp: new Date().getTime()
  };

  if (process.env.NODE_ENV === 'production') {
    const blob = new Blob([new URLSearchParams(body).toString()], {
      type: 'application/x-www-form-urlencoded',
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsURL, blob);
    } else {
      fetch(vitalsURL, {
        body: blob,
        method: 'POST',
        credentials: 'omit',
        keepalive: true,
      });
    }
  }
}