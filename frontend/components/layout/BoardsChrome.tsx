"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BoardsChromeValue = {
  headerActions: React.ReactNode;
  setHeaderActions: (node: React.ReactNode) => void;
  createBoardHandler: (() => void) | null;
  setCreateBoardHandler: (handler: (() => void) | null) => void;
};

const BoardsChromeContext = createContext<BoardsChromeValue | null>(null);

export function BoardsChromeProvider({ children }: { children: React.ReactNode }) {
  const [headerActions, setHeaderActionsState] = useState<React.ReactNode>(null);
  const [createBoardHandler, setCreateBoardHandlerState] = useState<(() => void) | null>(
    null
  );

  const setHeaderActions = useCallback((node: React.ReactNode) => {
    setHeaderActionsState(node);
  }, []);

  const setCreateBoardHandler = useCallback((handler: (() => void) | null) => {
    setCreateBoardHandlerState(() => handler);
  }, []);

  const value = useMemo(
    () => ({
      headerActions,
      setHeaderActions,
      createBoardHandler,
      setCreateBoardHandler,
    }),
    [headerActions, setHeaderActions, createBoardHandler, setCreateBoardHandler]
  );

  return (
    <BoardsChromeContext.Provider value={value}>{children}</BoardsChromeContext.Provider>
  );
}

export function useBoardsChrome() {
  const ctx = useContext(BoardsChromeContext);
  if (!ctx) {
    throw new Error("useBoardsChrome must be used within BoardsChromeProvider");
  }
  return ctx;
}

/** Register header actions for the shared boards shell; clears on unmount. */
export function useBoardHeaderActions(actions: React.ReactNode) {
  const { setHeaderActions } = useBoardsChrome();

  useEffect(() => {
    setHeaderActions(actions);
    return () => setHeaderActions(null);
  }, [actions, setHeaderActions]);
}

/** Register Create Board handler for the sidebar button; clears on unmount. */
export function useBoardCreateHandler(handler: () => void) {
  const { setCreateBoardHandler } = useBoardsChrome();

  useEffect(() => {
    setCreateBoardHandler(handler);
    return () => setCreateBoardHandler(null);
  }, [handler, setCreateBoardHandler]);
}
