import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoadingTimeoutProps {
  timeout?: number;
  loading: boolean;
}

export function LoadingTimeout({ timeout = 30000, loading }: LoadingTimeoutProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowTimeout(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [loading, timeout]);

  if (!showTimeout) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>
        Loading is taking longer than expected. Please check your connection and try refreshing the page.
      </AlertDescription>
    </Alert>
  );
}
