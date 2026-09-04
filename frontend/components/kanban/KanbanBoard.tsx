"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMoveTask } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import type { BoardDetail, Column, Task } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskModal } from "./TaskModal";

type KanbanBoardProps = {
  board: BoardDetail;
};

function findColumn(columns: Column[], id: string) {
  return columns.find((column) => column.id === id || column.tasks.some((t) => t.id === id));
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const moveTask = useMoveTask(board.id);
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setColumns(board.columns);
  }, [board.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setColumns((prev) => {
      const activeColumn = findColumn(prev, activeId);
      const overColumn = findColumn(prev, overId);
      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return prev;
      }

      const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      if (activeTaskIndex < 0) return prev;

      const moving = activeColumn.tasks[activeTaskIndex];
      const overIsColumn = over.data.current?.type === "column";
      const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      const insertIndex = overIsColumn
        ? overColumn.tasks.length
        : overTaskIndex >= 0
          ? overTaskIndex
          : overColumn.tasks.length;

      return prev.map((column) => {
        if (column.id === activeColumn.id) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== activeId),
          };
        }
        if (column.id === overColumn.id) {
          const nextTasks = [...column.tasks];
          nextTasks.splice(insertIndex, 0, { ...moving, columnId: column.id });
          return { ...column, tasks: nextTasks };
        }
        return column;
      });
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      setColumns(board.columns);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    let nextColumns = columns;
    const activeColumn = findColumn(nextColumns, activeId);
    const overColumn = findColumn(nextColumns, overId);

    if (!activeColumn || !overColumn) {
      setColumns(board.columns);
      return;
    }

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      const newIndex =
        over.data.current?.type === "column"
          ? activeColumn.tasks.length - 1
          : activeColumn.tasks.findIndex((t) => t.id === overId);

      if (oldIndex < 0 || newIndex < 0) {
        setColumns(board.columns);
        return;
      }

      nextColumns = nextColumns.map((column) => {
        if (column.id !== activeColumn.id) return column;
        return {
          ...column,
          tasks: arrayMove(column.tasks, oldIndex, newIndex).map((task, index) => ({
            ...task,
            position: index,
          })),
        };
      });
      setColumns(nextColumns);
    }

    const targetColumn = findColumn(nextColumns, activeId);
    if (!targetColumn) {
      setColumns(board.columns);
      return;
    }

    const targetPosition = targetColumn.tasks.findIndex((t) => t.id === activeId);

    try {
      await moveTask.mutateAsync({
        taskId: activeId,
        targetColumnId: targetColumn.id,
        targetPosition: Math.max(0, targetPosition),
      });
    } catch (error) {
      notify.error(error, "We couldn’t move that task. It’s back where it was.");
      setColumns(board.columns);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={setCreateColumnId}
              onOpenTask={setEditingTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-80 rounded-lg border border-[var(--accent)] bg-[var(--surface)] p-3 shadow-md">
              <p className="font-medium text-[var(--ink)]">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={Boolean(createColumnId)}
        boardId={board.id}
        columnId={createColumnId}
        onClose={() => setCreateColumnId(null)}
      />
      <TaskModal
        open={Boolean(editingTask)}
        boardId={board.id}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  );
}
