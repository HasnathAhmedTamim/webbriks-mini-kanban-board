import { Suspense } from "react";
import BoardsPageClient from "./BoardsPageClient";
import { BoardSkeleton } from "@/components/ui/Loading";

export default function BoardsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-5 sm:px-6 sm:py-6">
          <BoardSkeleton />
        </main>
      }
    >
      <BoardsPageClient />
    </Suspense>
  );
}
