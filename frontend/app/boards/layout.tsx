"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  BoardsChromeProvider,
  useBoardsChrome,
} from "@/components/layout/BoardsChrome";

function BoardsShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { headerActions, createBoardHandler } = useBoardsChrome();

  return (
    <AppShell
      headerActions={headerActions}
      onCreateBoard={() => {
        if (createBoardHandler) {
          createBoardHandler();
          return;
        }
        router.replace("/boards?view=owned", { scroll: false });
      }}
    >
      {children}
    </AppShell>
  );
}

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoardsChromeProvider>
      <BoardsShell>{children}</BoardsShell>
    </BoardsChromeProvider>
  );
}
