import { Suspense } from "react";
import BoardsPageClient from "./BoardsPageClient";
import { Loading } from "@/components/ui/Loading";

export default function BoardsPage() {
  return (
    <Suspense fallback={<Loading label="Loading boards…" />}>
      <BoardsPageClient />
    </Suspense>
  );
}
