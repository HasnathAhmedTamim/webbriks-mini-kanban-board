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
import {
  useDeleteColumn,
  useDeleteTask,
  useMoveTask,
  useUpdateColumn,
} from "@/hooks/useBoards";
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

function findColumn(columns: Column[], id: string) {
  return columns.find((column) => column.id === id || column.tasks.some((t) => t.id === id));
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const moveTask = useMoveTask(board.id);
  const updateColumn = useUpdateColumn(board.id);
  const deleteColumn = useDeleteColumn(board.id);
  const deleteTask = useDeleteTask(board.id);
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [renameColumn, setRenameColumn] = useState<Column | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<Column | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);

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
          return { ...column, tasks: column.tasks.filter((t) => t.id !== activeId) };
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
      notify.success("Task moved successfully");
    } catch (error) {
      notify.error(error, "Failed to move task");
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
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onAddTask={setCreateColumnId}
              onOpenTask={setEditingTask}
              onDeleteTask={setDeleteTaskTarget}
              onRename={(col) => {
                setRenameColumn(col);
                setRenameValue(col.name);
              }}
              onDelete={setDeleteColumnTarget}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rounded-lg border border-[var(--accent)] bg-[var(--surface)] p-3 shadow-sm">
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
            <Button variant="secondary" type="button" onClick={() => setRenameColumn(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={updateColumn.isPending}
              loadingText="Saving…"
              onClick={async () => {
                if (!renameColumn) return;
                const parsed = columnNameSchema.safeParse({ name: renameValue });
                if (!parsed.success) {
                  notify.message(parsed.error.issues[0]?.message || "Invalid name");
                  return;
                }
                try {
                  await updateColumn.mutateAsync({
                    columnId: renameColumn.id,
                    name: parsed.data.name,
                  });
                  notify.success("Column renamed successfully");
                  setRenameColumn(null);
                } catch (error) {
                  notify.error(error, "Failed to rename column");
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
            notify.success("Column deleted successfully");
            setDeleteColumnTarget(null);
          } catch (error) {
            notify.error(error, "Failed to delete column");
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
            notify.success("Task deleted successfully");
            setDeleteTaskTarget(null);
          } catch (error) {
            notify.error(error, "Failed to delete task");
          }
        }}
      />
    </>
  );
}
