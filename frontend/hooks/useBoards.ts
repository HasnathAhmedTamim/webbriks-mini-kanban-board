"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BoardDetail, BoardSummary } from "@/types";

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
  return useQuery({
    queryKey: ["boards", boardId],
    queryFn: async () => {
      const { data } = await api.get<{ data: BoardDetail }>(`/boards/${boardId}`);
      return data.data;
    },
    enabled: Boolean(boardId),
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<{ data: BoardDetail }>("/boards", { name });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useShareBoard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post(`/boards/${boardId}/members`, { email });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useRemoveMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/boards/${boardId}/members/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
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
    mutationFn: async (payload: {
      taskId: string;
      targetColumnId: string;
      targetPosition: number;
    }) => {
      const { data } = await api.patch(`/tasks/${payload.taskId}/move`, {
        targetColumnId: payload.targetColumnId,
        targetPosition: payload.targetPosition,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}
