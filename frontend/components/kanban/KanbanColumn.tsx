"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column, Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  column: Column;
  onAddTask: (columnId: string) => void;
  onOpenTask: (task: Task) => void;
};

export function KanbanColumn({ column, onAddTask, onOpenTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <section
      className={`flex w-80 shrink-0 flex-col rounded-xl border p-3 ${
        isOver
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--line)] bg-[var(--surface)]"
      }`}
    >
      <header className="mb-3 flex items-center justify-between gap-2 px-1">
        <div>
          <h3 className="font-semibold text-[var(--ink)]">{column.name}</h3>
          <p className="text-xs text-[var(--muted)]">
            {column.tasks.length === 0
              ? "No tasks yet"
              : `${column.tasks.length} task${column.tasks.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      <div ref={setNodeRef} className="flex min-h-[180px] flex-1 flex-col gap-2">
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>
        {isOver && column.tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--accent)] px-3 py-8 text-center text-xs text-[var(--accent)]">
            Drop the task here
          </div>
        ) : null}
      </div>

      <div className="mt-3 border-t border-[var(--line)] pt-3">
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start px-2"
          onClick={() => onAddTask(column.id)}
        >
          + Add a task
        </Button>
      </div>
    </section>
  );
}
