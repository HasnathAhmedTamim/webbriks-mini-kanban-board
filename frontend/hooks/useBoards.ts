"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { applyBoardTaskMove } from "@/lib/boardMove";
import type { BoardDetail, BoardSummary, Task } from "@/types";

export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data } = await api.get<{ data: BoardSummary[] }>("/boards");
      return data.data;
    },
  });
}

export function useBoard(boardId: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["boards", boardId],
    queryFn: async () => {
      const { data } = await api.get<{ data: BoardDetail }>(`/boards/${boardId}`);
      return data.data;
    },
    enabled: Boolean(boardId),
    // Instant paint when returning to a board you already opened.
    placeholderData: () => qc.getQueryData<BoardDetail>(["boards", boardId]),
  });
}

/** Warm the board detail cache on hover / focus before navigation. */
export function prefetchBoard(qc: ReturnType<typeof useQueryClient>, boardId: string) {
  return qc.prefetchQuery({
    queryKey: ["boards", boardId],
    queryFn: async () => {
      const { data } = await api.get<{ data: BoardDetail }>(`/boards/${boardId}`);
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<{ data: BoardDetail }>("/boards", { name });
      return data.data;
    },
    onSuccess: (board) => {
      qc.setQueryData<BoardDetail>(["boards", board.id], board);
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useUpdateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { boardId: string; name: string }) => {
      const { data } = await api.patch<{ data: BoardDetail }>(`/boards/${payload.boardId}`, {
        name: payload.name,
      });
      return data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["boards", vars.boardId] });
    },
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: (_data, boardId) => {
      qc.removeQueries({ queryKey: ["boards", boardId] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useShareBoard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post(`/boards/${boardId}/members`, { email });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards", boardId] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useRemoveMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/boards/${boardId}/members/${userId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards", boardId] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useCreateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post(`/boards/${boardId}/columns`, { name });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useUpdateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { columnId: string; name: string }) => {
      const { data } = await api.patch(`/columns/${payload.columnId}`, { name: payload.name });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useDeleteColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (columnId: string) => {
      await api.delete(`/columns/${columnId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useCreateTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { columnId: string; title: string; description?: string }) => {
      const { data } = await api.post(`/columns/${payload.columnId}/tasks`, {
        title: payload.title,
        description: payload.description,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useUpdateTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      title?: string;
      description?: string | null;
    }) => {
      const { data } = await api.patch(`/tasks/${payload.taskId}`, {
        title: payload.title,
        description: payload.description,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useDeleteTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useMoveTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["move-task", boardId],
    mutationFn: async (payload: {
      taskId: string;
      targetColumnId: string;
      targetPosition: number;
    }) => {
      const { data } = await api.patch<{ data: Task }>(`/tasks/${payload.taskId}/move`, {
        targetColumnId: payload.targetColumnId,
        targetPosition: payload.targetPosition,
      });
      return data.data;
    },
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["boards", boardId] });
      const previous = qc.getQueryData<BoardDetail>(["boards", boardId]);

      if (previous) {
        qc.setQueryData<BoardDetail>(["boards", boardId], applyBoardTaskMove(previous, payload));
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        qc.setQueryData(["boards", boardId], context.previous);
      }
    },
    onSuccess: async () => {
      // Confirm DB order after save so reload matches what you see.
      await qc.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}
