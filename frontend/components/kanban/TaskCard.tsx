"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Dropdown } from "@/components/ui/Dropdown";

type TaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskCard({ task, onOpen, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-sm ${
        isDragging ? "border-[var(--accent)]" : "hover:border-[var(--accent)]/40"
      }`}
    >
      <div className="flex items-start gap-1 p-3">
        <button
          type="button"
          className="min-w-0 flex-1 cursor-grab touch-none text-left active:cursor-grabbing"
          onClick={() => onOpen(task)}
          {...attributes}
          {...listeners}
        >
          <p className="truncate text-sm font-medium text-[var(--ink)]">{task.title}</p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{task.description}</p>
          ) : null}
        </button>
        <Dropdown
          label={`Actions for ${task.title}`}
          items={[
            { label: "Edit", onClick: () => onOpen(task) },
            ...(onDelete ? [{ label: "Delete", onClick: () => onDelete(task), danger: true }] : []),
          ]}
        />
      </div>
    </div>
  );
}
