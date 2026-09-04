"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          className: "text-sm !shadow-md",
          style: {
            borderRadius: "12px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
