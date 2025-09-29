import * as Sentry from "@sentry/react";

export const initializeErrorTracking = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.5,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Clean sensitive data
        if (event.request?.headers?.Authorization) {
          delete event.request.headers.Authorization;
        }
        return event;
      },
    });
  }
};

export const logError = (error: Error, context: Record<string, any> = {}) => {
  console.error(error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

export const logEvent = (name: string, data: Record<string, any> = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(name, {
      level: 'info',
      extra: data,
    });
  }
};

export const startTransaction = (name: string, data: Record<string, any> = {}) => {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startSpan({
      name,
      data,
    }, () => {});
  }
  return null;
};