"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/ui/StatusPage";

export default function Error({
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
    <StatusPage
      code="Error"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or go back to your boards."
      primaryLabel="Try again"
      onPrimary={reset}
      secondaryHref="/boards"
      secondaryLabel="Back to boards"
    />
  );
}
