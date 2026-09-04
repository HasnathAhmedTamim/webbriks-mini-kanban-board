"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column, Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  column: Column;
  index: number;
  onAddTask: (columnId: string) => void;
  onOpenTask: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onRename?: (column: Column) => void;
  onDelete?: (column: Column) => void;
};

const HEADER_COLORS = [
  "bg-[var(--col-blue)]",
  "bg-[var(--col-sky)]",
  "bg-[var(--col-peach)]",
  "bg-[var(--col-green)]",
];

export function KanbanColumn({
  column,
  index,
  onAddTask,
  onOpenTask,
  onDeleteTask,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <section
      className={`flex w-full flex-col rounded-lg border bg-[var(--surface)] shadow-sm lg:max-h-[calc(100dvh-11rem)] lg:w-72 lg:shrink-0 ${
        isOver ? "border-[var(--accent)]" : "border-[var(--line)]"
      }`}
    >
      <header
        className={`flex shrink-0 items-center justify-between gap-2 rounded-t-lg px-3 py-2.5 ${HEADER_COLORS[index % HEADER_COLORS.length]}`}
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--ink)]">{column.name}</h3>
          <p className="text-xs text-[var(--muted)]">
            {column.tasks.length} task{column.tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <Dropdown
          label={`Column actions for ${column.name}`}
          items={[
            ...(onRename ? [{ label: "Rename", onClick: () => onRename(column) }] : []),
            ...(onDelete ? [{ label: "Delete", onClick: () => onDelete(column), danger: true }] : []),
          ]}
        />
      </header>

      <div ref={setNodeRef} className="flex min-h-[120px] flex-1 flex-col gap-2 p-3 lg:overflow-y-auto">
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpenTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        {column.tasks.length === 0 && !isOver ? (
          <p className="px-1 py-6 text-center text-xs text-[var(--muted)]">No tasks in this column</p>
        ) : null}
        {isOver && column.tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--accent)] px-3 py-8 text-center text-xs text-[var(--accent)]">
            Drop here
          </div>
        ) : null}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start px-2"
          onClick={() => onAddTask(column.id)}
        >
          + Add Task
        </Button>
      </div>
    </section>
  );
}
