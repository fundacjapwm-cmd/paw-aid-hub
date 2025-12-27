import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface FallbackProps {
  error: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Ups! Coś poszło nie tak
          </h1>
          <p className="text-muted-foreground">
            Przepraszamy za niedogodności. Nasz zespół został powiadomiony o problemie.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="bg-muted p-4 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetError} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Spróbuj ponownie
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Strona główna
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Jeśli problem się powtarza, skontaktuj się z nami przez{" "}
          <a href="/kontakt" className="text-primary hover:underline">
            formularz kontaktowy
          </a>
        </p>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error as Error} resetError={resetError} />
      )}
      onError={(error) => {
        console.error("Error caught by boundary:", error);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
