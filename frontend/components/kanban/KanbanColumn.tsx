"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column, Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  column: Column;
  index: number;
  onAddTask: (columnId: string) => void;
  onOpenTask: (task: Task) => void;
};

const HEADER_COLORS = [
  "bg-[var(--col-blue)]",
  "bg-[var(--col-sky)]",
  "bg-[var(--col-peach)]",
  "bg-[var(--col-green)]",
];

export function KanbanColumn({ column, index, onAddTask, onOpenTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];

  return (
    <section
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-[var(--surface)] ${
        isOver ? "border-[var(--accent)]" : "border-[var(--line)]"
      }`}
    >
      <header
        className={`flex items-center justify-between gap-2 rounded-t-xl px-3 py-2.5 ${headerColor}`}
      >
        <h3 className="text-sm font-semibold text-[var(--ink)]">{column.name}</h3>
        <span className="rounded-md bg-white/70 px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
          {column.tasks.length}
        </span>
      </header>

      <div ref={setNodeRef} className="flex min-h-[160px] flex-1 flex-col gap-2 p-3">
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>
        {isOver && column.tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--accent)] px-3 py-8 text-center text-xs text-[var(--accent)]">
            Drop here
          </div>
        ) : null}
      </div>

      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start px-2 text-[var(--muted)]"
          onClick={() => onAddTask(column.id)}
        >
          + Add Task
        </Button>
      </div>
    </section>
  );
}
