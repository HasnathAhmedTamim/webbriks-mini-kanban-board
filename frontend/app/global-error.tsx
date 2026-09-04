"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <p className="text-sm font-medium tracking-wide text-[var(--accent)]">Error</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              The app hit an unexpected error. Try again to continue.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
