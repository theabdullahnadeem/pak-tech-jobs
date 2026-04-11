"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-3xl font-black text-foreground mb-3">Something went wrong</h1>
        <p className="text-muted mb-8">
          We hit an unexpected error. Our team has been notified. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Try Again
          </button>
          <Link href="/"
            className="px-6 py-3 rounded-xl border border-border dark:border-border-dark text-foreground font-semibold hover:bg-surface dark:hover:bg-surface-dark transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
