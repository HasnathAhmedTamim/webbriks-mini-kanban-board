"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  useDeleteColumn,
  useDeleteTask,
  useMoveTask,
  useUpdateColumn,
} from "@/hooks/useBoards";
import { findTaskPlacement, reindexColumns } from "@/lib/boardMove";
import { notify } from "@/lib/notify";
import type { BoardDetail, Column, Task } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskModal } from "./TaskModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { columnNameSchema } from "@/lib/validation";

type KanbanBoardProps = {
  board: BoardDetail;
};

type Placement = { columnId: string; position: number };

function findColumn(columns: Column[], id: string) {
  return columns.find((column) => column.id === id || column.tasks.some((t) => t.id === id));
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const moveTask = useMoveTask(board.id);
  const updateColumn = useUpdateColumn(board.id);
  const deleteColumn = useDeleteColumn(board.id);
  const deleteTask = useDeleteTask(board.id);

  const [columns, setColumns] = useState<Column[]>(board.columns);
  const columnsRef = useRef(columns);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef<Placement | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [renameColumn, setRenameColumn] = useState<Column | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<Column | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    if (draggingRef.current) return;
    setColumns(board.columns);
    columnsRef.current = board.columns;
  }, [board.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columnHandlers = {
    onAddTask: setCreateColumnId,
    onOpenTask: setEditingTask,
    onDeleteTask: setDeleteTaskTarget,
    onRename: (col: Column) => {
      setRenameColumn(col);
      setRenameValue(col.name);
    },
    onDelete: setDeleteColumnTarget,
  };

  const onDragStart = (event: DragStartEvent) => {
    draggingRef.current = true;
    const task = event.active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
      const origin = findTaskPlacement({ columns: columnsRef.current }, task.id);
      dragOriginRef.current = origin
        ? { columnId: origin.columnId, position: origin.position }
        : null;
    }
  };

  /** Cross-column preview only — same-column order is finalized on drop. */
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const prev = columnsRef.current;
    const activeColumn = findColumn(prev, activeId);
    const overColumn = findColumn(prev, overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    if (activeTaskIndex < 0) return;

    const moving = activeColumn.tasks[activeTaskIndex];
    const overIsColumn = over.data.current?.type === "column";
    const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);
    const insertIndex = overIsColumn
      ? overColumn.tasks.length
      : overTaskIndex >= 0
        ? overTaskIndex
        : overColumn.tasks.length;

    const next = prev.map((column) => {
      if (column.id === activeColumn.id) {
        return { ...column, tasks: column.tasks.filter((t) => t.id !== activeId) };
      }
      if (column.id === overColumn.id) {
        const nextTasks = column.tasks.filter((t) => t.id !== activeId);
        nextTasks.splice(
          Math.min(insertIndex, nextTasks.length),
          0,
          { ...moving, columnId: column.id }
        );
        return { ...column, tasks: nextTasks };
      }
      return column;
    });

    columnsRef.current = next;
    setColumns(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    draggingRef.current = false;

    const origin = dragOriginRef.current;
    dragOriginRef.current = null;

    if (!over) {
      setColumns(board.columns);
      columnsRef.current = board.columns;
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    let nextColumns = columnsRef.current;

    const activeColumn = findColumn(nextColumns, activeId);
    const overColumn = findColumn(nextColumns, overId);

    if (!activeColumn || !overColumn) {
      setColumns(board.columns);
      columnsRef.current = board.columns;
      return;
    }

    // Same-column reorder on drop (not during dragOver — more reliable).
    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      const newIndex =
        over.data.current?.type === "column"
          ? activeColumn.tasks.length - 1
          : activeColumn.tasks.findIndex((t) => t.id === overId);

      if (oldIndex < 0 || newIndex < 0) {
        setColumns(board.columns);
        columnsRef.current = board.columns;
        return;
      }

      if (oldIndex !== newIndex) {
        nextColumns = nextColumns.map((column) => {
          if (column.id !== activeColumn.id) return column;
          return { ...column, tasks: arrayMove(column.tasks, oldIndex, newIndex) };
        });
      }
    }

    nextColumns = reindexColumns(nextColumns);
    columnsRef.current = nextColumns;
    setColumns(nextColumns);

    const targetColumn = findColumn(nextColumns, activeId);
    if (!targetColumn) {
      setColumns(board.columns);
      columnsRef.current = board.columns;
      return;
    }

    const targetPosition = targetColumn.tasks.findIndex((t) => t.id === activeId);
    if (targetPosition < 0) return;

    // Compare against where the drag started — not the live React Query cache.
    if (
      origin &&
      origin.columnId === targetColumn.id &&
      origin.position === targetPosition
    ) {
      return;
    }

    moveTask.mutate(
      {
        taskId: activeId,
        targetColumnId: targetColumn.id,
        targetPosition,
      },
      {
        onError: (error) => {
          notify.error(error, "Failed to move task. Changes have been reverted.");
        },
      }
    );
  };

  const onDragCancel = () => {
    setActiveTask(null);
    draggingRef.current = false;
    dragOriginRef.current = null;
    setColumns(board.columns);
    columnsRef.current = board.columns;
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-start lg:overflow-x-auto">
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              {...columnHandlers}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-72 cursor-grabbing rounded-lg border border-[var(--accent)] bg-[var(--surface)] p-3 shadow-md">
              <p className="text-sm font-medium">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={Boolean(createColumnId)}
        boardId={board.id}
        columns={board.columns}
        columnId={createColumnId}
        onClose={() => setCreateColumnId(null)}
      />
      <TaskModal
        open={Boolean(editingTask)}
        boardId={board.id}
        columns={board.columns}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onRequestDelete={(task) => {
          setEditingTask(null);
          setDeleteTaskTarget(task);
        }}
      />

      <Modal
        open={Boolean(renameColumn)}
        title="Rename Column"
        onClose={() => setRenameColumn(null)}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setRenameColumn(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              loading={updateColumn.isPending}
              loadingText="Saving…"
              onClick={async () => {
                if (!renameColumn) return;
                const parsed = columnNameSchema.safeParse({ name: renameValue });
                if (!parsed.success) {
                  notify.message(parsed.error.issues[0]?.message || "Please enter a name");
                  return;
                }
                try {
                  await updateColumn.mutateAsync({
                    columnId: renameColumn.id,
                    name: parsed.data.name,
                  });
                  notify.success("Column renamed", {
                    description: `It’s now called “${parsed.data.name}”.`,
                  });
                  setRenameColumn(null);
                } catch (error) {
                  notify.error(error, "We couldn’t rename that column.");
                }
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Input
          label="Column Name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteColumnTarget)}
        title="Delete Column?"
        description={`Delete "${deleteColumnTarget?.name}" and all of its tasks? This cannot be undone.`}
        loading={deleteColumn.isPending}
        onClose={() => setDeleteColumnTarget(null)}
        onConfirm={async () => {
          if (!deleteColumnTarget) return;
          try {
            await deleteColumn.mutateAsync(deleteColumnTarget.id);
            notify.success("Column removed", {
              description: `“${deleteColumnTarget.name}” and its cards are gone.`,
            });
            setDeleteColumnTarget(null);
          } catch (error) {
            notify.error(error, "We couldn’t remove that column.");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTaskTarget)}
        title="Delete Task?"
        description={`Delete "${deleteTaskTarget?.title}"? This cannot be undone.`}
        loading={deleteTask.isPending}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={async () => {
          if (!deleteTaskTarget) return;
          try {
            await deleteTask.mutateAsync(deleteTaskTarget.id);
            notify.success("Card removed", {
              description: `“${deleteTaskTarget.title}” is gone.`,
            });
            setDeleteTaskTarget(null);
          } catch (error) {
            notify.error(error, "We couldn’t remove that card.");
          }
        }}
      />
    </>
  );
}
