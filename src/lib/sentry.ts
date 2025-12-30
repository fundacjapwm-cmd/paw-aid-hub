import * as Sentry from "@sentry/react";
import { logErrorToDatabase } from "@/hooks/useErrorLogger";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("Sentry DSN not configured. Error monitoring disabled.");
  }

  // Initialize Sentry if DSN is available
  if (dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions (reduce in production if needed)
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Filter out known non-critical errors and log to database
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // Ignore ResizeObserver errors (common but harmless)
        if (error instanceof Error && error.message.includes('ResizeObserver')) {
          return null;
        }
        
        // Log error to database for admin monitoring
        if (error instanceof Error) {
          logErrorToDatabase({
            error_message: error.message,
            error_stack: error.stack,
            error_type: error.name,
            severity: 'error',
            metadata: {
              sentry_event_id: event.event_id,
              tags: event.tags,
            },
          });
        }
        
        return event;
      },
    });
  }

  // Set up global error handler for non-Sentry errors
  window.addEventListener('error', (event) => {
    logErrorToDatabase({
      error_message: event.message,
      error_stack: event.error?.stack,
      error_type: 'UncaughtError',
      url: event.filename,
      severity: 'error',
      metadata: {
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logErrorToDatabase({
      error_message: error?.message || String(error),
      error_stack: error?.stack,
      error_type: 'UnhandledRejection',
      severity: 'error',
      metadata: {
        reason: String(error),
      },
    });
  });
}

export { Sentry };
