import type { BoardDetail, Column, Task } from "@/types";

export type MoveTaskPayload = {
  taskId: string;
  targetColumnId: string;
  targetPosition: number;
};

/** Find a task's current column + position on the board. */
export function findTaskPlacement(board: BoardDetail | { columns: Column[] }, taskId: string) {
  for (const column of board.columns) {
    const index = column.tasks.findIndex((t) => t.id === taskId);
    if (index >= 0) {
      return { columnId: column.id, position: index, task: column.tasks[index] };
    }
  }
  return null;
}

export function reindexColumns(columns: Column[]): Column[] {
  return columns.map((column) => ({
    ...column,
    tasks: column.tasks.map((task, position) => ({
      ...task,
      columnId: column.id,
      position,
    })),
  }));
}

/**
 * Pure helper: move a task in board detail (same-column reorder or cross-column).
 * Used for optimistic React Query cache updates.
 */
export function applyBoardTaskMove(board: BoardDetail, payload: MoveTaskPayload): BoardDetail {
  const { taskId, targetColumnId, targetPosition } = payload;

  let moving: Task | undefined;

  const stripped = board.columns.map((column) => {
    const index = column.tasks.findIndex((t) => t.id === taskId);
    if (index < 0) return column;
    moving = column.tasks[index];
    return {
      ...column,
      tasks: column.tasks.filter((t) => t.id !== taskId),
    };
  });

  if (!moving) return board;

  const columns = stripped.map((column) => {
    if (column.id !== targetColumnId) {
      return {
        ...column,
        tasks: column.tasks.map((task, position) => ({
          ...task,
          columnId: column.id,
          position,
        })),
      };
    }

    const tasks = [...column.tasks];
    const insertAt = Math.max(0, Math.min(targetPosition, tasks.length));
    tasks.splice(insertAt, 0, { ...moving!, columnId: column.id });

    return {
      ...column,
      tasks: tasks.map((task, position) => ({
        ...task,
        columnId: column.id,
        position,
      })),
    };
  });

  return { ...board, columns };
}
